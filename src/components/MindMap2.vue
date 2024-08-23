<template>
    <div @click="deselectNode">
        <svg ref="svg" width="800" height="600"></svg>
    </div>
</template>

<script>
import * as d3 from 'd3';

export default {
    data() {
        return {
            data: {
                name: "Root",
                children: [
                    {
                        name: "Child 1",
                        children: [
                            {
                                name: "Grandchild 1.1",
                                children: [
                                    { name: "Great-Grandchild 1.1.1" },
                                    { name: "Great-Grandchild 1.1.2" }
                                ]
                            },
                            { name: "Grandchild 1.2" }
                        ]
                    },
                    { name: "Child 2" },
                    {
                        name: "Child 3",
                        children: [
                            { name: "Grandchild 3.1" },
                            { name: "Grandchild 3.2" }
                        ]
                    }
                ]
            },
            selectedNode: null,
            editingNode: null,
            colors: [
                '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1',
                '#955251', '#B565A7', '#009B77', '#DD4124', '#D65076',
                '#45B8AC', '#EFC050', '#5B5EA6', '#9B2335', '#BC243C',
                '#C3447A', '#98B4D4', '#FF6F61', '#6B5B95', '#88B04B',
            ],
        };
    },
    mounted() {
        this.drawMindMap();
    },
    methods: {
        drawMindMap() {
            const svg = d3.select(this.$refs.svg);
            svg.selectAll("*").remove(); // Clear previous drawings

            const g = svg.append("g")
                .attr("transform", "translate(40,40)");

            const tree = d3.tree().size([760, 560]);
            const root = d3.hierarchy(this.data);
            tree(root);

            // Add links (paths) between nodes using smooth curves with dynamic colors
            g.selectAll(".link")
                .data(root.links())
                .enter().append("path")
                .attr("class", "link")
                .attr("d", d3.linkHorizontal()
                    .x(d => d.y)
                    .y(d => d.x))
                .attr("stroke", (d, i) => this.colors[i % this.colors.length])
                .attr("fill", "none")
                .attr("stroke-width", 2);

            // Add nodes (groups containing circles and text)
            const node = g.selectAll(".node")
                .data(root.descendants())
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${d.y},${d.x})`)
                .on("click", (event, d) => {
                    event.stopPropagation();
                    this.selectNode(d);
                });

            node.append("circle")
                .attr("r", 10)
                .attr("class", d => d === this.selectedNode ? "selected" : "")
                .attr("style", d => d === this.selectedNode ? "stroke: red; stroke-width: 3px;" : "");

            // Add text (labels) to nodes
            node.append("text")
                .attr("dy", 3)
                .attr("x", d => d.children ? -12 : 12)
                .style("text-anchor", d => d.children ? "end" : "start")
                .text(d => d.data.name)
                .on("click", (event, d) => {
                    event.stopPropagation();
                    this.editNode(d);
                })
                .each((d, i, nodes) => {
                    if (this.editingNode === d) {
                        d3.select(nodes[i]).select('text').remove(); // Remove existing text element
                        d3.select(nodes[i])
                            .append("foreignObject")
                            .attr("width", 100)
                            .attr("height", 30)
                            .append("xhtml:input")
                            .attr("value", d.data.name)
                            .on("input", function () {
                                d.data.name = this.value;
                            })
                            .on("blur", () => {
                                this.editingNode = null;
                                this.drawMindMap();
                            })
                            .on("keydown", (event) => {
                                if (event.key === "Enter") {
                                    this.editingNode = null;
                                    this.drawMindMap();
                                }
                            })
                            .node().focus();
                    }
                });

            if (this.selectedNode) {
                node.filter(d => d === this.selectedNode)
                    .append("text")
                    .attr("dy", -20)
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text("+")
                    .attr("class", "plus-icon")
                    .on("click", (event) => {
                        event.stopPropagation();
                        this.addChild(this.selectedNode.data);
                    });
            }
        },
        selectNode(node) {
            this.selectedNode = node;
            this.editingNode = null;
            this.drawMindMap();
        },
        deselectNode() {
            this.selectedNode = null;
            this.editingNode = null;
            this.drawMindMap();
        },
        editNode(node) {
            this.editingNode = node;
            this.drawMindMap();
        },
        addChild(node) {
            if (!node.children) {
                node.children = [];
            }
            node.children.push({ name: "New Node", children: [] });
            this.selectedNode = null;
            this.drawMindMap();
        },
    }
};
</script>

<style>
.link {
    fill: none;
    stroke-width: 2px;
}

.node text {
    font: 12px sans-serif;
}

.node circle {
    fill: #fff;
    stroke: steelblue;
    stroke-width: 3px;
}

.node circle.selected {
    stroke: red;
}

.plus-icon {
    cursor: pointer;
    fill: green;
}
</style>

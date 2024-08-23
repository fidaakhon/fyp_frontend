<template>
    <div class="mindmap-container">
        <svg class="mindmap-svg" width="100vw" height="800">
            <g transform="translate(50, 50)">
                <g class="links">
                    <path v-for="(link, index) in links" :key="index" :d="bezierLinkPath(link)" :stroke="link.color"
                        fill="none" stroke-width="4" stroke-linecap="round" />
                </g>
                <g class="nodes">
                    <g v-for="node in flattenedNodes" :key="node.id" :transform="`translate(${node.x},${node.y})`">
                        <foreignObject :x="-nodeWidth / 2" @click="onNodeClick(node)" :y="0"
                            style="background-color: white;" :width="nodeWidth" :height="nodeHeight">
                            <div v-if="node.editing" class="node-edit">
                                <input :ref="(el) => inputRef[node.id] = el" type="text" v-model="node.label" />
                                <span class="add-icon" @click="showAddChild(node)">+</span>
                            </div>
                            <div v-else class="node-label">
                                {{ node.label }}
                            </div>
                        </foreignObject>
                    </g>
                </g>
            </g>
        </svg>
    </div>
</template>



<script setup>
import * as d3 from 'd3';
import { ref, watch, onUnmounted, nextTick } from 'vue';

// Node and layout configuration
const nodeWidth = ref(160);
const nodeHeight = ref(40);
const horizontalSeparation = ref(200);
const verticalSeparation = ref(100);
const nodeDistance = ref(10);
const nodeVerticalOffset = ref(-20);  // Offset to push nodes 20px above their calculated position

// Sample nodes data structure
const nodes = ref({
    id: 1,
    label: 'Root Node',
    color: 'white',
    editing: false,
    children: [
        {
            id: 2,
            label: 'Child Node 1',
            color: 'white',
            editing: false,
            children: [
                {
                    id: 4,
                    label: 'Child Node 1.1',
                    color: 'white',
                    editing: false,
                    children: [],
                },
                {
                    id: 5,
                    label: 'Child Node 1.2',
                    color: 'white',
                    editing: false,
                    children: [],
                },
            ],
        },
        {
            id: 3,
            label: 'Child Node 2',
            color: 'white',
            editing: false,
            children: [
                {
                    id: 6,
                    label: 'Child Node 2.1',
                    color: 'white',
                    editing: false,
                    children: [],
                },
                {
                    id: 7,
                    label: 'Child Node 2.2',
                    color: 'white',
                    editing: false,
                    children: [],
                },
            ],
        },
    ],
});

const flattenedNodes = ref([]);
const links = ref([]);
const selectedNode = ref(null);
const inputRef = ref({});

// Function to calculate layout and generate links
const calculateTreeLayout = () => {
    const root = d3.hierarchy(nodes.value);
    const treeLayout = d3.tree().nodeSize([horizontalSeparation.value, verticalSeparation.value]);

    // Apply layout algorithm
    treeLayout(root);

    // Flatten nodes with adjusted positions
    flattenedNodes.value = root.descendants().map((node) => ({
        ...node.data,
        x: node.x,
        y: node.depth * (verticalSeparation.value + nodeHeight.value) + nodeHeight.value + nodeVerticalOffset.value,  // Adjust y position
    }));

    // Generate links with original positions
    links.value = root.links().map((link, index) => ({
        source: {
            x: link.source.x,
            y: link.source.depth * (verticalSeparation.value + nodeHeight.value) + nodeHeight.value, // Original y position for source
        },
        target: {
            x: link.target.x,
            y: link.target.depth * (verticalSeparation.value + nodeHeight.value), // Original y position for target
        },
        color: generateColor(index),
    }));
};

// Function to generate a color for links
const generateColor = (index) => {
    const hue = (index * 137.5) % 360;
    const saturation = 85 + Math.random() * 20;
    const lightness = 60 + Math.random() * 10;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Function to generate a Bezier path for connectors
const bezierLinkPath = (link) => {
    const { source, target } = link;
    const controlX = (source.x + target.x) / 2;
    const controlY1 = source.y + nodeHeight.value / 2 + nodeDistance.value;
    const controlY2 = target.y - nodeHeight.value / 2 - nodeDistance.value;

    return `M${source.x},${source.y} C${controlX},${controlY1} ${controlX},${controlY2} ${target.x},${target.y}`;
};

// Function to handle node click for editing
const onNodeClick = (node) => {
    if (!node.editing) {
        selectedNode.value = node;
        node.editing = true;
        nextTick(() => {
            if (inputRef.value[node.id]) {
                inputRef.value[node.id].focus();
            }
        });
    }
};

// Function to add a new child to a node
const showAddChild = (parentNode) => {
    const newNode = {
        id: getNextNodeId(),
        label: 'New Child Node',
        color: 'white',
        editing: true,
        children: [],
    };

    if (!parentNode.children) {
        parentNode.children = [];
    }

    parentNode.children.push(newNode);
    calculateTreeLayout();
};

// Function to handle click outside of nodes for stopping editing
const handleClickOutside = (event) => {
    const isOutsideNode = !event.target.closest('.node-label');
    if (isOutsideNode) {
        flattenedNodes.value.forEach((node) => {
            if (node.editing) {
                node.editing = false;
            }
        });
        selectedNode.value = null;
    }
};

// Function to get the next node ID
const getNextNodeId = () => {
    const maxId = Math.max(...flattenedNodes.value.map((node) => node.id), 0);
    return maxId + 1;
};

// Watch for changes in nodes and recalculate layout
watch(nodes, () => {
    calculateTreeLayout();
}, { deep: true });

// Set up event listeners for clicks outside nodes
document.addEventListener('click', handleClickOutside);
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Initial layout calculation
calculateTreeLayout();
</script>



<style scoped>
.mindmap-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.mindmap-svg {
    overflow: visible;
}

.node-label {
    font-size: 14px;
    text-align: center;
    padding-top: 8px;
    margin-bottom: 8px;
}

.node-edit {
    display: flex;
    justify-content: center;
    align-items: center;
}

.node-edit input {
    width: 80%;
    padding: 4px;
    margin-bottom: 8px;
    font-size: 14px;
}

.add-icon {
    cursor: pointer;
    font-size: 24px;
    color: #555;
}

.links path {
    pointer-events: none;
}
</style>

<template>
    <div class="mindmap-container">
        <svg class="mindmap-svg" width="100vw" height="800">
            <g transform="translate(50, 50)">
                <!-- Render links -->
                <g class="links">
                    <path v-for="(link, index) in links" :key="index" :d="bezierLinkPath(link)" :stroke="link.color"
                        fill="none" stroke-width="4" stroke-linecap="round" />
                </g>

                <!-- Render nodes -->
                <g class="nodes">
                    <g v-for="node in flattenedNodes" :key="node.id" :transform="`translate(${node.x},${node.y})`">
                        <foreignObject :x="-nodeWidth / 2" :y="node.editing ? -nodeHeight : 0"
                            style="background-color: white;" :width="nodeWidth" :height="nodeHeight">
                            <div v-if="node.editing" class="node-edit">
                                <input :ref="(el) => inputRef[node.id] = el" type="text"
                                    @keyup.enter="showAddChild(node)" v-model="node.label" autofocus
                                    @blur="handleInputBlur(node)" />
                                <span class="add-icon" @click="showAddChild(node)">+</span>
                            </div>
                            <div v-else class="node-label" @click="onNodeClick(node)">
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

const nodeWidth = ref(160);
const nodeHeight = ref(40);
const horizontalSeparation = ref(200);
const verticalSeparation = ref(100);
const nodeDistance = ref(10);
const nodeVerticalOffset = ref(-20);

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
            children: [],
        },
        {
            id: 3,
            label: 'Child Node 2',
            color: 'white',
            editing: false,
            children: [],
        },
    ],
});

const flattenedNodes = ref([]);
const links = ref([]);
const selectedNode = ref(null);
const inputRef = ref({});

const calculateTreeLayout = () => {
    const root = d3.hierarchy(nodes.value);
    const treeLayout = d3.tree().nodeSize([horizontalSeparation.value, verticalSeparation.value]);

    treeLayout(root);

    flattenedNodes.value = root.descendants().map((node) => ({
        ...node.data,
        x: node.x,
        y: node.depth * (verticalSeparation.value + nodeHeight.value) + nodeHeight.value + nodeVerticalOffset.value,
    }));

    links.value = root.links().map((link, index) => ({
        source: {
            x: link.source.x,
            y: link.source.depth * (verticalSeparation.value + nodeHeight.value) + nodeHeight.value,
        },
        target: {
            x: link.target.x,
            y: link.target.depth * (verticalSeparation.value + nodeHeight.value),
        },
        color: generateColor(index),
    }));
};

const generateColor = (index) => {
    const hue = (index * 137.5) % 360;
    const saturation = 85 + Math.random() * 20;
    const lightness = 60 + Math.random() * 10;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const bezierLinkPath = (link) => {
    const { source, target } = link;
    const controlX = (source.x + target.x) / 2;
    const controlY1 = source.y + nodeHeight.value / 2 + nodeDistance.value;
    const controlY2 = target.y - nodeHeight.value / 2 - nodeDistance.value;

    return `M${source.x},${source.y} C${controlX},${controlY1} ${controlX},${controlY2} ${target.x},${target.y}`;
};

const onNodeClick = (node) => {
    if (!node.editing) {
        deselectAllNodes();
        selectedNode.value = node;
        node.editing = true;
        nextTick(() => {
            if (inputRef.value[node.id]) {
                inputRef.value[node.id].focus();
            }
        });
    }
};

const showAddChild = (parentNode) => {
    deselectAllNodes();

    const newNode = {
        id: getNextNodeId(),
        label: '',  // Start with an empty label
        color: 'white',
        editing: true,
        children: [],
    };

    parentNode.children.push(newNode);
    calculateTreeLayout();

    nextTick(() => {
        if (inputRef.value[newNode.id]) {
            inputRef.value[newNode.id].focus();
        }
    });
};

const deselectAllNodes = () => {
    flattenedNodes.value.forEach((node) => {
        node.editing = false;

    });
};

const handleInputBlur = (node) => {
    console.log(node, 'node');
    const parentNode = findParentNode(node.id, nodes.value);
    if (node.label.trim() === '') {
        if (parentNode) {
            console.log(parentNode.children, 'parent node');
            parentNode.children = parentNode.children.filter(child => child.label !== '');
            calculateTreeLayout();
        }
    } else {
        if (parentNode) {
            const newNode = {
                id: node.id,
                editing: false,
                label: node.label,
                color: node.color,
                children: node.children
            }
            const index = parentNode.children.findIndex((item) => item.id == node.id)
            console.log(index, '>>');
            parentNode.children.splice(index, 1);
            parentNode.children.push(newNode);

        }
    }
};

const findParentNode = (nodeId, currentNode) => {
    if (currentNode.children) {
        for (const child of currentNode.children) {
            if (child.id === nodeId) {
                return currentNode;
            } else {
                const parentNode = findParentNode(nodeId, child);
                if (parentNode) {
                    return parentNode;
                }
            }
        }
    }
    return null;
};

const handleClickOutside = (event) => {
    const isOutsideNode = !event.target.closest('.node-label');
    const isOutsideNode2 = !event.target.closest('.node-edit');
    if (isOutsideNode && isOutsideNode2) {
        deselectAllNodes();
        selectedNode.value = null;
    }
};

const getNextNodeId = () => {
    const maxId = Math.max(...flattenedNodes.value.map((node) => node.id), 0);
    return maxId + 1;
};

watch(nodes, () => {
    calculateTreeLayout();
}, { deep: true });

document.addEventListener('click', handleClickOutside);
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

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
    cursor: pointer;
    /* Add cursor pointer to indicate clickable */
}

.node-edit {
    display: flex;
    justify-content: center;
    align-items: center;
}

.node-edit input {
    width: 80%;
    padding: 4px;
    /* margin-bottom: 8px; */
    font-size: 14px;
    text-align: center;
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

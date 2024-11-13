<template>

    <div class="mindmap-container">

        <!-- <h1 class="mindmap-name">Name : {{ MindmapName }} </h1> -->

        <svg class="mindmap-svg" width="100vw" height="800">
            <g transform="translate(500, 400)">
                <!-- Render links -->
                <g class="links">
                    <path v-for="(link, index) in links" :key="index" :d="bezierLinkPath(link)" stroke="black"
                        fill="none" stroke-width="1" stroke-linecap="round" />
                    <!-- Render suggestion link -->
                    <path v-if="suggestionLink" :d="bezierLinkPath(suggestionLink)" stroke="grey" fill="none"
                        stroke-width="4" stroke-linecap="round" stroke-dasharray="5,5" />
                </g>

                <!-- Render nodes -->
                <g class="nodes">
                    <g v-for="node in flattenedNodes" :key="node.id" @mousedown="startDrag(node, $event)"
                        @touchstart="startDrag(node, $event)" class="node"
                        :transform="`translate(${node.x},${node.y})`">
                        <foreignObject @contextmenu.prevent="showContextMenu(node, $event)" @click="onNodeClick(node)"
                            :x="-nodeWidth / 2" :y="0"
                            :style="(selectedNode?.id === node?.id || node.editing == true || selectedNodes.some((el) => el.id == node.id)) ? { outline: `4px ${node.borderStyle} #3CC553`, padding: '10px', border: 'none', backgroundColor: getBackgroundColor(node.type), color: node.textColor } : { border: `1px ${node.borderStyle} black`, backgroundColor: getBackgroundColor(node.type), padding: '10px', borderRadius: '10px'  }"
                            :width="nodeWidth" :height="nodeHeight" style="overflow: visible;display: flex; ">
                            <div style="display: flex; justify-content: start;align-items: center; gap: 2px;">
                                <!-- <img src="../assets/Ellipse4.png" alt="dev"> -->

                                <span class="label-input" style="text-transform: capitalize;"
                                    v-if="node.type != 'root'">{{ ` ${node.type
                                        }: ` }}</span>
                                <div v-if="node.editing == true" class="node-edit">
                                    <input v-validate="'required|min:3|max:250'" :ref="(el) => inputRef[node.id] = el"
                                        type="text" style="background-color: transparent; outline: none; border: none;"
                                        v-model="node.label" autofocus @change.stop="handleInputBlur(node)"
                                        @blur="handleInputBlur(node);"
                                        @keydown.enter="() => { handleInputBlur(node); deselectAllNodes() }" />
                                </div>
                                <div v-else class="node-label" style="text-overflow: ellipsis;">
                                    <div v-if="showMenu && selectedNode?.id == node.id" class="menu-container">
                                        <div class="menu-content">
                                            <input autofocus ref="suggestionInputRef" type="text"
                                                v-model="suggestionInput" @input="fetchSuggestions"
                                                placeholder="Type for suggestions..." tabindex="0" @click.stop
                                                @focus.stop />
                                            <ul>
                                                <li v-for="(suggestion, index) in suggestions" :key="index"
                                                    @click="addSuggestionAsChild(suggestion)">
                                                    {{ suggestion.label }}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <abbr :title="node.label"> <input class="label-input" @keydown="(event) => {
                                        console.log('hello >>>');

                                        console.log(event.key, 'key');

                                        if (event.key == 'Backspace') {
                                            handleKeyDown(event)
                                        }
                                    }" @blur="() => {
                                        console.log('i am bluring');

                                    }" @focus="() => {
                                        console.log('i am focusing input>>>');

                                    }" :ref="(el) => inputRef2[node.id] = el" @dblclick="EditModHandler(node)"
                                            @keydown.enter="showAddChild(node)" @keydown.tab.prevent="() => {
                                                if (node.id !== 1) {
                                                    showAddSibling(node);
                                                }
                                            }" :value="node.label" readonly /></abbr>
                                    <abbr title="Menu" class="menu-icon" v-if="selectedNode?.id === node.id" @click="(e) => {
                                        e.stopPropagation();
                                        openMenu(node);
                                    }"><img src="../assets/file.png" alt=""></abbr>
                                    <abbr title="Add Child" class="add-icon" v-if="selectedNode?.id === node.id" @click="(e) => {
                                        e.stopPropagation();
                                        showAddChild(node);
                                    }">+</abbr>
                                    <abbr :title="`Add ${node.type}`" class="add-icon2"
                                        v-if="node.id !== 1 && selectedNode?.id === node.id" @click="(e) => {
                                            e.stopPropagation();
                                            showAddSibling(node);
                                        }">+</abbr>
                                </div>
                            </div>

                        </foreignObject>

                        <h1 color="black" :style="getNodeStyle(node)"> {{ node.color }}</h1>
                    </g>

                    <!-- Ghost Node Rendering -->
                    <g v-if="ghostNode" class="ghost-node" :transform="`translate(${ghostNode.x},${ghostNode.y})`">
                        <foreignObject :x="-nodeWidth / 2" :y="ghostNode.editing ? -nodeHeight : 0"
                            style="background-color: #6bf58a;opacity: 0.5;overflow: visible;" :width="nodeWidth"
                            :height="nodeHeight">
                            <div class="node-label">
                                <input :value="ghostNode.label" readonly
                                    style="border: none; outline: none; text-align: center; width: 100%; background-color: #6bf58a;" />
                            </div>
                        </foreignObject>
                    </g>
                </g>

            </g>
        </svg>
        <ContextMenu ref="contextMenu" @action="handleContextMenuAction" />
    </div>

</template>


<script setup>
import * as d3 from 'd3';
import { useRouter } from 'vue-router';
import { ref, watch, onUnmounted, nextTick, onMounted, defineEmits, defineProps } from 'vue';
import ContextMenu from './CustomContaxtMenu.vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';


const router = useRouter();
const id = ref(1);
const currentUser = ref("")
const mindmapTitle = ref(`Mind Map ${id.value + 1}`)


id.value = router.currentRoute.value.params.id

onMounted(() => {
    fetch('http://localhost:8000/api/v1/users/current-user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        // body: JSON.stringify({
        //     userId: currentUser.value
        // })
    })

        .then((response) => response.json())
        .then((data) => {
            currentUser.value = data.data._id;
            console.log("current userrrr", currentUser.value)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});


async function createMindmap() {
    const mindmap = {
        id: mindmaps.value.length + 1,
        title: mindmapTitle.value,
        nodes: nodes?.value,
        userId: currentUser.value
    }
    fetch('http://localhost:8000/api/v1/mindmaps/create-mindmap', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(mindmap),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            toast("mindmap created successfully", {
                autoClose: 3000
            })
        })
        .catch((error) => {
            console.error('Error:', error);
            toast("mindmap creation failed", {
                autoClose: 3000
            });

        });
}

async function deleteMindMap() {
    fetch(`http://localhost:8000/api/v1/mindmaps/delete-mindmap/${id.value}`,
        {
            method: "Delete",
        }
    )
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            toast("mindmap deleted successfully", {
                autoClose: 3000
            })
        })
        .catch((error) => {
            console.error('Error:', error);
            toast("mindmap deletion failed", {
                autoClose: 3000
            });
        })
        .then(router.push("/"))
}




const nodeWidth = ref(160);
const nodeHeight = ref(40);
const horizontalSeparation = ref(200);
const verticalSeparation = ref(60);
const nodeDistance = ref(30);
const nodeVerticalOffset = ref(-40);
const ghostNode = ref(null);
const suggestionLink = ref(null);
const flattenedNodes = ref([]);
const links = ref([]);
const selectedNode = ref(null);
const inputRef = ref({});
const inputRef2 = ref({});
const showMenu = ref(false);
const suggestionInput = ref(null);
const suggestions = ref([]);
const selectedNodes = ref([]);
const contextMenu = ref(null)
const MindmapName = ref("")



const props = defineProps({
    NodeBgColor: {
        type: Object,
        required: true
    },
    layout: {
        type: String,
        required: true
    },
    mapId: {
        type: Number,
        required: true
    },
    handleSave: {
        type: Boolean,
        required: true
    },
    handleDelete: {
        type: Boolean,
        required: true
    },
    handleUpdate: {
        type: Boolean,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})


watch(() => props.handleSave, (newValue) => {
    if (newValue) {
        createMindmap();
    }
});


watch(() => props.handleDelete, (newValue) => {
    if (newValue) {
        deleteMindMap();
    }
});

watch(() => props.handleUpdate, (newValue) => {
    if (newValue) {
        updateMindMap();
    }
});

watch(() => props.name, (newValue) => {
    if (newValue) {
        mindmapTitle.value = newValue
    }
});


const updateMindMap = () => {
    console.log("nodes", nodes.value);
    const mindmap = {
        id: id.value,
        title: mindmapTitle.value,
        nodes: nodes?.value
    }
    fetch(`http://localhost:8000/api/v1/mindmaps/update-mindmap/${id.value}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(mindmap),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            toast("updated successfully", {
                autoClose: 3000
            })
        })
        .catch((error) => {
            console.error('Error:', error);
            toast("update failed", {
                autoClose: 3000
            });
        });
}



watch(props.mapId, () => {

    renderNodes()
    calculateTreeLayout()
})
function showContextMenu(node, event) {

    selectedNode.value = node;
    contextMenu.value.show(event.clientX, event.clientY);
}
// function hideContextMenu() {
//     contextMenu.value.hide();
// }

function handleContextMenuAction(action) {
    if (action === 'edit') {
        // editNode(selectedNode);
    } else if (action === 'delete') {
        // Implement delete logic here
    }
    else if (action === 'create-map') {
        createMapHandler();

    }
}
function createMapHandler() {
    copySelectedNodeAndSubtree(selectedNode.value);
    const mindmaps = JSON.parse(localStorage.getItem('mindMapList'))

    const newMindMap = {
        id: mindmaps.length + 1,
        title: mindmapTitle.value,
        nodes: selectedNode.value
    };

    mindmaps.push(newMindMap);
    localStorage.setItem('mindMapList', JSON.stringify(mindmaps));
    // Navigate to the new mind map's route
    router.push(`/mindmap/${newMindMap.id}`);
}
const nodes = ref(
    {
        id: 1,
        label: 'Root Node',
        color: '#6BF58A',
        textColor: 'black',
        editing: false,
        borderShape: '',
        borderStyle: "solid",
        type: 'root',
        history: [],
        children: []
    });
const mindmaps = ref([]);

//get all mindmaps
watch(currentUser,() => {
    fetch(`http://localhost:8000/api/v1/mindmaps/get-all-mindmaps/${currentUser.value}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(data => {
            // console.log(data, '>>> data');
            mindmaps.value = data.message;
            //   console.log(mindmaps.value, '>>>>>>>> mindmaps');
        })
        .then(() => {
            renderNodes()
            calculateTreeLayout();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
})
function renderNodes() {
    const mapdata = mindmaps.value.filter((el) => el.id == id.value)
    if (mapdata) {
        nodes.value = mapdata[0].nodes
        MindmapName.value = mapdata[0].title
    } else {
        nodes.value = {
            id: 1,
            label: 'Root Node',
            color: '#6BF58A',
            textColor: 'black',
            editing: false,
            borderShape: '',
            borderStyle: "solid",
            type: 'root',
            history: [],
            children: []
        }
    }

}
// onMounted(() => {
//     renderNodes()
//     calculateTreeLayout();
// })

function getBackgroundColor(type) {

    if (type == 'module') {
        return '#FC4D4280'
    } else if (type == 'root') {
        return '#6BF58A80'
    } else if (type == 'milestone') {
        return '#F6B67B80'
    } else if (type == 'feature') {
        return '#A5D5EF80'
    } else if (type == 'story') {
        return '#E283FA80'
    }
}

const deleteNode = (node) => {
    if (node.id === 1) return; // Prevent deleting the root node

    const parentNode = findParentNode(node.id, nodes.value);
    if (parentNode) {
        parentNode.children = parentNode.children.filter(child => child.id !== node.id);
        calculateTreeLayout();
        deselectAllNodes();
        selectedNode.value = null;
    }
};

function selectSibling(direction, multiSelect = false) {
    const parentNode = findParentNode(selectedNode.value.id, nodes.value);
    if (parentNode) {
        const siblings = parentNode.children;
        const currentIndex = siblings.findIndex(node => node.id === selectedNode.value.id);
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = siblings.length - 1;
        if (newIndex >= siblings.length) newIndex = 0;
        if (multiSelect) {

            if (!selectedNodes.value.includes(selectedNode.value)) {
                selectedNodes.value.push(selectedNode.value);
            }
            if (!selectedNodes.value.includes(siblings[newIndex])) {
                selectedNodes.value.push(siblings[newIndex]);
                selectedNode.value = siblings[newIndex]
            }
        } else {
            selectedNode.value = siblings[newIndex];

        }
    }

}

function selectParent(multiSelect = false) {
    const currentNode = findParentNode(selectedNode.value.id, nodes.value);
    if (currentNode) {
        if (multiSelect) {

            if (!selectedNodes.value.includes(currentNode)) {
                // selectedNodes.value.pop(currentNode);
            }
        } else {
            selectedNode.value = currentNode;
        }
    }
}

function selectChild(multiSelect = false) {
    const currentNode = findNodeById(selectedNode.value.id);
    if (currentNode.children && currentNode.children.length > 0) {
        if (multiSelect) {
            if (!selectedNodes.value.includes(selectedNode.value)) {
                selectedNodes.value.push(selectedNode.value);
            }
            if (!selectedNodes.value?.includes(currentNode.children[0])) {
                selectedNodes.value.push(currentNode.children[0]);
            }
            selectedNode.value = currentNode.children[0];
        } else {
            selectedNode.value = currentNode.children[0];
        }
    }
}
function findNodeById(id, nodes = flattenedNodes.value) {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const childNode = findNodeById(id, node.children);
            if (childNode) return childNode;
        }
    }
    return null;
}
const fetchSuggestions = () => {
    const input = suggestionInput.value.toLowerCase();
    // Replace this with an API call or other logic to get suggestions
    const allSuggestions = [
        {
            id: 4, label: 'Authentication', color: 'white', textColor: 'black', editing: false, type: 'Module', borderShape: '', history: [],
            borderStyle: "solid", children: [
                {
                    id: 22,
                    label: 'Login',
                    color: '#6BF58A',
                    textColor: 'black',
                    borderShape: '',
                    borderStyle: "solid",
                    editing: false,
                    type: 'feature',
                    history: [],
                    children: [],
                },
                {
                    id: 33,
                    label: 'Sign in',
                    color: '#6BF58A',
                    textColor: 'black',
                    editing: false,
                    children: [],
                    type: 'feature',
                    borderShape: '',
                    borderStyle: "solid",
                    history: [],
                },
            ]
        },
        {
            id: 5, label: 'Suggestion 2', color: '#6BF58A', textColor: 'black', editing: false, type: 'module', borderShape: '', history: [],
            borderStyle: "solid", children: [
                {
                    id: 21,
                    label: 'Child Node 1',
                    color: '#6BF58A',
                    textColor: 'black',
                    editing: false,
                    type: 'feature', history: [],
                    borderShape: '',
                    borderStyle: "solid",
                    children: [],
                },
                {
                    id: 31,
                    label: 'Child Node 2',
                    color: '#6BF58A',
                    textColor: 'black', history: [],
                    editing: false,
                    children: [],
                    borderShape: '',
                    borderStyle: "solid",
                    type: 'feature',
                },
            ],
        },
        {
            id: 6, label: 'Suggestion 3', color: '#6BF58A', textColor: 'black', editing: false, type: 'feature', borderShape: '', history: [],
            borderStyle: "solid", children: []
        },
    ];
    suggestions.value = allSuggestions.filter(s => s.label.toLowerCase().includes(input));
};
const addSuggestionAsChild = (suggestion) => {
    const newNode = { ...suggestion, id: getNextNodeId() };
    selectedNode.value.children.push(newNode);
    calculateTreeLayout();
    showMenu.value = false; // Close menu after adding
};

function getNodeStyle(node) {
    const foundNode = findNodeById(node.id);

    if (props.NodeBgColor.value != {} && props.NodeBgColor.value != undefined) {
        if (node.id == props.NodeBgColor.value.id) {
            node.type = props.NodeBgColor.value.type;
            foundNode.type = props.NodeBgColor.value.type;
            node.textColor = props.NodeBgColor.value.textColor;
            foundNode.textColor = props.NodeBgColor.value.textColor;
            node.borderStyle = props.NodeBgColor.value.borderStyle;
            foundNode.borderStyle = props.NodeBgColor.value.borderStyle;
            node.borderShape = props.NodeBgColor.value.borderShape;
            foundNode.borderShape = props.NodeBgColor.value.borderShape;
        }

    }
}

watch(() => props.layout, () => {
    calculateTreeLayout();
});


const calculateTreeLayout = () => {
    if (props.layout == 'RTL') {

        const root = d3.hierarchy(nodes.value);
        const treeLayout = d3.tree().nodeSize([verticalSeparation.value, horizontalSeparation.value]);
        treeLayout(root);

        flattenedNodes.value = root.descendants().map((node) => ({
            ...node.data,
            x: node.depth * (horizontalSeparation.value + nodeWidth.value) + nodeWidth.value,
            y: node.x + nodeVerticalOffset.value,  // Adjust vertical position
        }));

        links.value = root.links().map((link, index) => ({
            source: {
                x: link.source.depth * (horizontalSeparation.value + nodeWidth.value) + nodeWidth.value,
                y: link.source.x + nodeVerticalOffset.value,
            },
            target: {
                x: link.target.depth * (horizontalSeparation.value + nodeWidth.value) + nodeWidth.value,
                y: link.target.x + nodeVerticalOffset.value,
            },
            color: generateColor(index),
        }));
    } else {

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
    }
};

const generateColor = (index) => {
    const hue = (index * 137.5) % 360;
    const saturation = 85 + Math.random() * 20;
    const lightness = 60 + Math.random() * 10;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


// edgesss 
const bezierLinkPath = (link) => {
    const { source, target } = link;
    const controlY = (source.y + target.y) / 2;
    const controlX1 = source.x + nodeWidth.value / 2 + nodeDistance.value;
    const controlX2 = target.x - nodeWidth.value / 2 - nodeDistance.value;
    const controlX = (source.x + target.x) / 2;
    const controlY1 = source.y + nodeHeight.value / 2 + nodeDistance.value;
    const controlY2 = target.y - nodeHeight.value / 2 - nodeDistance.value;

    if (props.layout == 'RTL') {
        const sourceX = source.x + nodeWidth.value / 2; // Start from the center right side of the source node
        const targetX = target.x - nodeWidth.value / 2; // End at the center left side of the target node
        const sourceY = source.y + nodeHeight.value / 2; // Center height of the source node
        const targetY = target.y + nodeHeight.value / 2; // Center height of the target node

        return `M${sourceX},${sourceY} C${controlX1},${controlY} ${controlX2},${controlY} ${targetX},${targetY}`;
    } else {
        return `M${source.x},${source.y} C${controlX},${controlY1} ${controlX},${controlY2} ${target.x},${target.y}`;
    }
};


const onNodeClick = (node) => {
    if (!node.editing) {
        deselectAllNodes();
        selectedNode.value = node;
    }
};
const EditModHandler = (node) => {
    if (!node.editing) {
        node.editing = true;
        nextTick(() => {
            if (inputRef.value[node.id]) {
                inputRef.value[node.id].focus();
            }
        });
    }
}
const showAddChild = (parentNode) => {
    deselectAllNodes();
    const newNode = {
        id: getNextNodeId(),
        label: '',  // Start with an empty label
        color: '#6BF58A',
        textColor: 'black',
        editing: true,
        borderShape: '',
        borderStyle: "solid",
        type: 'feature',
        children: [],
        history: [],
    };

    parentNode?.children.push(newNode);


    calculateTreeLayout();
    selectedNode.value = newNode
    nextTick(() => {
        if (inputRef.value[newNode.id]) {
            inputRef.value[newNode.id].focus();
        }
    });
};
const showAddSibling = (node) => {
    deselectAllNodes();
    const parentNode = findParentNode(node.id, nodes.value);
    const newNode = {
        id: getNextNodeId(),
        label: '',  // Start with an empty label
        color: '#6BF58A ',
        textColor: 'black',
        editing: true,
        borderShape: '',
        borderStyle: "solid",
        type: 'feature',
        children: [],
        history: [],
    };

    parentNode?.children.push(newNode);
    calculateTreeLayout();
    selectedNode.value = newNode
    nextTick(() => {
        if (inputRef.value[newNode.id]) {
            inputRef.value[newNode.id].focus();
        }
    });
};
const deselectAllNodes = () => {
    flattenedNodes.value.forEach(node => {
        node.editing = false;
    });
};
const handleInputBlur = (node) => {
    const parentNode = findParentNode(node.id, nodes.value);
    if (node.label === '') {
        if (parentNode) {
            parentNode.children = parentNode.children.filter(child => child.id !== node.id);
            calculateTreeLayout();
            selectedNode.value = parentNode;
        }
    } else {
        node.editing = false;
        if (parentNode) {
            const index = parentNode?.children.findIndex(child => child.id === node.id);
            parentNode.children[index] = node; // Update the node in the parent's children
            calculateTreeLayout();
            selectedNode.value = node;
        } else {
            nodes.value = node; // Update the root node if no parent
        }
    }
};
const handleClickOutside = (event) => {
    const targetClass = ['menu-content']
    const isOut = !targetClass.some(cls => event.target.closest(`.${cls}`))
    if (isOut) {
        showMenu.value = false
    }
    const targetClasses = ['node-label', 'node-edit', 'add-icon', 'add-icon2', 'information-container'];
    const isOutside = !targetClasses.some(cls => event.target.closest(`.${cls}`));

    if (isOutside) {
        deselectAllNodes();
        selectedNode.value = null;
        selectedNodes.value = []
    }
};
const getNextNodeId = () => {
    const maxId = Math.max(...flattenedNodes.value.map((node) => node.id), 0);
    return maxId + 1;
};
watch(nodes, () => {
    calculateTreeLayout();

}, { deep: true });
const emit = defineEmits(['sendData']);
watch(selectedNode, (newValue) => {
    nextTick(() => {
        if (newValue)
            if (newValue?.editing == true) {
                inputRef.value[newValue.id].focus();
            } else if (newValue?.editing == false) {

                inputRef2.value[newValue.id].focus();

            }
        emit('sendData', selectedNode.value);
    })
})
document.addEventListener('dblclick', handleClickOutside);
onUnmounted(() => {
    document.removeEventListener('dblclick', handleClickOutside);
});


onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
});
function multiNodesCopy() {
    navigator.clipboard.writeText(JSON.stringify(selectedNodes.value))
    const xlsx = require('xlsx');
    // Create a new workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([['Title'], selectedNodes.value.map(el => [el.label])]);
    // Append the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Labels');

    // Write to file
    xlsx.writeFile(workbook, 'labels.xlsx');
}
const handleKeyDown = (event) => {
    console.log("i am calling ");
    event.preventDefault()
    if ((event.key === 'Delete') || (event.ctrlKey && event.key == 'Backspace')) {
        if (selectedNode.value) {
            deleteNode(selectedNode.value);
        }
    } else if (event.ctrlKey && event.key === 'c') {
        if (selectedNodes.value.length > 1) {
            multiNodesCopy()
        } else if (selectedNode.value) {
            copySelectedNodeAndSubtree(selectedNode.value);
        }
    } else if (event.ctrlKey && event.key === 'v') {
        if (selectedNode.value) {
            pasteSelectedNodeAndSubtree(selectedNode.value);
        }
    } else if (event.key == 'Backspace' && showMenu.value == false) {
        ClearLabelHandler(selectedNode.value);
    } else if (event.ctrlKey && event.key === 'a') {
        selectedNode.value = nodes.value;
        selectedNodes.value = flattenedNodes.value
    }

    if (event.shiftKey) {
        switch (event.key) {
            case 'ArrowUp':
                deselectCurrentSibling();
                break;
            case 'ArrowDown':
                selectSibling(1, true);
                break;
            case 'ArrowLeft':
                deselectChildren();
                break;
            case 'ArrowRight':
                selectChild(true);
                break;
        }
    } else {
        switch (event.key) {
            case 'ArrowUp':
                selectSibling(-1);
                break;
            case 'ArrowDown':
                selectSibling(1);
                break;
            case 'ArrowLeft':
                selectParent();
                break;
            case 'ArrowRight':
                selectChild();
                break;
        }
    }
};
function removeSubtreeNodes(node, first = true) {
    // Remove the node itself if it is in the selectedNodes
    if (first != true) {
        selectedNodes.value = selectedNodes.value.filter(n => n.id != node.id);
    }
    // Recursively remove all children of the node
    if (node?.children && node?.children.length > 0) {
        node?.children.forEach(child => {
            removeSubtreeNodes(child, selectedNodes.value, false);
        });
    }
}

function deselectChildren() {
    const currentNode = findParentNode(selectedNode.value.id, nodes.value);
    if (currentNode) {
        removeSubtreeNodes(currentNode);
        selectedNode.value = currentNode;
    }
}
function deselectCurrentSibling() {
    selectedNodes.value = selectedNodes.value.filter(el => el.id != selectedNode.value.id);
    const parentNode = findParentNode(selectedNode.value.id, nodes.value);
    if (parentNode) {
        if (parentNode?.children && parentNode?.children.length > 0) {

            const currentIndex = parentNode?.children.findIndex(node => node.id === selectedNode.value.id);
            if (currentIndex == 0) {
                selectedNode.value = parentNode
            }
            else {
                selectedNode.value = parentNode?.children[currentIndex - 1];
            }
        }
    }
}

const ClearLabelHandler = (node) => {
    node.label = ""
    node.editing = true;
    nextTick(() => {
        if (inputRef.value[node.id]) {
            inputRef.value[node.id].focus();
        }
    });

}
// to paste copied tree
const pasteSelectedNodeAndSubtree = async () => {

    try {
        const data = await navigator.clipboard.readText();
        const parsedData = JSON.parse(data);

        // Collect existing IDs to ensure new IDs are unique
        const existingIds = new Set(flattenedNodes.value.map(node => node.id));

        if (parsedData?.length > 1) {
            parsedData.forEach(element => {
                updateNodeIds(element, existingIds);
                if (selectedNode.value) {
                    selectedNode.value?.children.push(element);
                    calculateTreeLayout();
                }
            });
        }
        else {   // Update the IDs of the copied subtree
            updateNodeIds(parsedData, existingIds);
            // Add the copied subtree to the selected node
            if (selectedNode.value) {

                selectedNode.value?.children.push(parsedData);
                calculateTreeLayout();
            }
        }
    } catch (err) {
        console.error('Failed to paste: ', err);
    }
};


// Function to get the subtree from a selected node
const getSubtree = (node) => {
    const subtree = {
        id: node.id,
        label: node.label,
        color: node.color,
        type: node.type,
        textColor: node.textColor,
        borderShape: node.borderShape,
        borderStyle: node.borderStyle,
        children: []
    };

    if (node?.children) {
        node?.children.forEach(child => {
            subtree?.children.push(getSubtree(child));
        });
    }

    return subtree;
};

// Function to copy the selected node and its subtree to the clipboard
const copySelectedNodeAndSubtree = (node) => {
    const subtree = getSubtree(node);
    const subtreeJson = JSON.stringify(subtree, null, 2);
    navigator.clipboard.writeText(subtreeJson)
        .then(() => {
            alert('Node and subtree copied to clipboard!', subtreeJson);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
};

const updateNodeIds = (node, existingIds) => {
    // Generate a unique ID for the current node
    const newId = generateUniqueId(existingIds);
    existingIds.add(newId);

    // Update the node's ID
    node.id = newId;

    // Recursively update the IDs of the children nodes
    node?.children.forEach(child => {
        updateNodeIds(child, existingIds);
    });
};

const generateUniqueId = (existingIds) => {
    let newId = Math.max(...existingIds) + 1;
    while (existingIds.has(newId)) {
        newId += 1;
    }
    return newId;
};

calculateTreeLayout();
const draggedNode = ref(null);
// const dragging = ref(false);
let isDragging = false;
let startX = 0;
let startY = 0;
const dragThreshold = 10; // Distance in pixels
const dragOffset = ref({ x: 0, y: 0 });
const startDrag = (node, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (node.id != 1) {

        draggedNode.value = node;
        const [initialX, initialY] = getMousePosition(event);
        startX = initialX;
        startY = initialY;

        dragOffset.value = {
            x: initialX - node.x,
            y: initialY - node.y
        };

        // Create a ghost node


        isDragging = false;
        // document.addEventListener('mousemove', () => {
        //     ghostNode.value = { ...node, isG host: true };
        // });
        // document.addEventListener('touchmove', () => {
        //     ghostNode.value = { ...node, isGhost: true };
        // })
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', onDrag);
        document.addEventListener('touchend', endDrag);
    }

};

const onDrag = (event) => {
    const [currentX, currentY] = getMousePosition(event);

    const distanceMoved = Math.sqrt(
        Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
    );

    if (distanceMoved > dragThreshold) {
        isDragging = true;

        draggedNode.value.x = currentX - dragOffset.value.x;
        draggedNode.value.y = currentY - dragOffset.value.y;

        d3.select(`#node-${draggedNode.value.id}`)
            .attr("transform", `translate(${draggedNode.value.x},${draggedNode.value.y})`);

        const nearestNode = findNearestNode(draggedNode.value);

        if (
            nearestNode &&
            isWithinDropDistance(draggedNode.value, nearestNode) &&
            !isParentOrSelf(nearestNode, draggedNode.value) &&
            !isInSubTree(draggedNode.value, nearestNode)
        ) {
            suggestionLink.value = {
                source: nearestNode,
                target: draggedNode.value
            };
        } else {
            suggestionLink.value = null;
        }
    }
};

const isInSubTree = (draggedNode, targetNode) => {
    // Helper function to traverse the tree
    const traverse = (node) => {
        if (node.id === targetNode.id) {
            return true;
        }
        if (node?.children && node?.children.length > 0) {
            return node?.children.some(child => traverse(child));
        }
        return false;
    };
    return traverse(draggedNode);
};
const endDrag = () => {
    if (isDragging && draggedNode.value) {
        const nearestNode = findNearestNode(draggedNode.value);
        const validDrop = nearestNode && isWithinDropDistance(draggedNode.value, nearestNode) && !isParentOrSelf(nearestNode, draggedNode.value) && !isInSubTree(draggedNode.value, nearestNode);

        if (validDrop) {
            moveNode(draggedNode.value, nearestNode);
        } else {
            // Revert the dragged node to its original position
            revertNodePosition(draggedNode.value);
        }

        ghostNode.value = null; // Remove the ghost node
        draggedNode.value = null;
        isDragging = false;
        calculateTreeLayout();
        suggestionLink.value = null; // Clear the suggestion link
    }

    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
};
// Function to check if the node is within a valid drop distance from the target node
const isWithinDropDistance = (draggedNode, targetNode) => {
    const distance = Math.sqrt(
        Math.pow(targetNode.x - draggedNode.x, 2) +
        Math.pow(targetNode.y - draggedNode.y, 2)
    );
    const thresholdDistance = 100; // Set a threshold for valid drop distance
    return distance <= thresholdDistance;
};

// Function to check if the target node is a parent or self of the dragged node
const isParentOrSelf = (targetNode, draggedNode) => {
    if (targetNode.id === draggedNode.id) {
        return true; // A node cannot be moved onto itself
    }
    let currentNode = findParentNode(draggedNode.id, nodes.value);
    if (currentNode.id === targetNode.id) {
        return true; // The target node is a descendant of the dragged node
    }
    return false;
};

// Function to revert the dragged node to its original position if drop is invalid
const revertNodePosition = (node) => {
    const originalNode = flattenedNodes.value.find(n => n.id === node.id);
    if (originalNode) {
        node.x = originalNode.x;
        node.y = originalNode.y;
    }
    calculateTreeLayout();
};

// Function to find the nearest node to the dragged node
const findNearestNode = (draggedNode) => {
    let minDistance = Infinity;
    let nearestNode = null;

    flattenedNodes.value.forEach(node => {
        if (node.id !== draggedNode.id) {
            const distance = Math.sqrt(
                Math.pow(node.x - draggedNode.x, 2) +
                Math.pow(node.y - draggedNode.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestNode = node;
            }
        }
    });

    return nearestNode;
};
// Function to move the node to a new parent
const moveNode = (draggedNode, newParentNode) => {
    const parentNode = findParentNode(draggedNode.id, nodes.value);
    if (parentNode) {
        // Remove the node from its current parent
        parentNode.children = parentNode?.children.filter(child => child.id !== draggedNode.id);
        // Add the node to the new parent
        newParentNode.children.push(draggedNode);
        // Update positions and recalculate layout
        calculateTreeLayout();
    }
};
// Function to find the parent node of a given node
const findParentNode = (nodeId, currentNode) => {
    if (currentNode?.children) {
        for (const child of currentNode?.children) {
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


const getMousePosition = (event) => {
    const svg = document.querySelector('.mindmap-svg');
    const point = svg.createSVGPoint();

    point.x = event.clientX || event.touches[0].clientX;
    point.y = event.clientY || event.touches[0].clientY;

    const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());
    return [transformedPoint.x, transformedPoint.y];
};

const blurPreviousInput = () => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'INPUT') {
        activeElement.blur(); // Blur the previously focused input
    }
};
const suggestionInputRef = ref(null);
const openMenu = (node) => {
    blurPreviousInput(); // Blur the previous input
    showMenu.value = true;
    selectedNode.value = node;
    nextTick(() => {
        if (suggestionInputRef.value) {

            suggestionInputRef.value[0].focus(); // Focus the new input
        }
    });
};
</script>

<style scoped>
.menu-container {
    position: absolute;
    top: 60%;
    left: 20%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    padding: 10px;
    z-index: 200;
}

.menu-content {
    display: flex;
    flex-direction: column;
}

.mindmap-name {
    position: absolute;
    top: 0;
    margin: 0 auto;
}

.menu-content input {
    padding: 5px;
    margin-bottom: 10px;
    border: 2px solid #ddd;
    border-radius: 3px;
    z-index: 300;
}

.menu-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu-content ul li {
    padding: 5px;
    cursor: pointer;
    border: 1px solid white;
}

.menu-content ul li:hover {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
}

.menu-icon {
    cursor: pointer;
    font-size: 20px;
    height: 20px;
    width: 20px;
    color: rgb(161, 161, 161);
    text-align: center;
    position: absolute;
    top: -80%;
    left: 110%;
    box-shadow: 5px 5px 20px #ccc;
    z-index: 100;
    background-color: #ffffff;
    box-sizing: border-box;
    border-radius: 50%;
    display: flex;
    aspect-ratio: 1;
    overflow: hidden;

}


.mindmap-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.mindmap-svg {
    overflow: visible;
    display: flex;
    justify-content: center;
    align-items: center;
}

.node-label {
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    position: relative;
    /* margin-top: -12px; */
    max-width: 100px;
    width: 100%;

    /* Add cursor pointer to indicate clickable */
}

* {
    user-select: none;
    box-sizing: border-box;
}

.node-label .label-input,
.label-input {
    text-align: center;
    cursor: pointer;
    border: none;
    outline: none;
    font-size: 14px;
    width: 100%;
    background-color: transparent;
    /* padding: 4px; */
}

.node-edit {
    background-color: transparent;
    display: flex;
    justify-content: center;

}

.node-edit input {
    width: 80%;
    padding: 4px;
    font-size: 14px;
    text-align: center;
}

.add-icon {
    cursor: pointer;
    font-size: 16px;
    height: 20px;
    width: 20px;
    color: white;
    text-align: center;
    position: absolute;
    top: 0%;
    background-color: #101010;
    box-sizing: border-box;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1;
    left: 132%;
}

abbr[title] {
    text-decoration: none;

}

.add-icon2 {
    cursor: pointer;
    font-size: 16px;
    height: 20px;
    width: 20px;
    color: white;
    text-align: center;
    position: absolute;
    top: 155%;
    left: 40%;
    z-index: 100;
    background-color: #101010;
    box-sizing: border-box;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1;
}

.links path {
    pointer-events: none;
}

.ghost-node {
    opacity: 0.5;
    /* Semi-white */
    pointer-events: none;
    /* Ignore pointer events */
}

.ghost-node .node-label {
    font-style: italic;

    /* Optional: different font style */
}

.suggestion-node {
    opacity: 0.5;
    /* Semi-white */
    pointer-events: none;
    /* Ignore pointer events */
}

.suggestion-node .node-label {
    font-style: italic;
    /* Optional: different font style */
}

/* .savebutton {
    position: absolute;
    top: 0;
    right: 0;
    padding: 10px;
    background-color: #101010;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    z-index: 10000;
} */
</style>

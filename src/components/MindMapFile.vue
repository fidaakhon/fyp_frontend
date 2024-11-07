<template>
    <div id="app" @mousedown="startDrag" @mouseup="endDrag" @mouseleave="endDrag" @mousemove="onDrag" @mousewheel="(e) => {
        e.preventDefault()
        ZoomOnScroll(e)
    }">

        <MindMap :mapId="route.params.id" @sendData="receiveData" :NodeBgColor="childData" :layout="layout"
            :style="{ transform: `scale(${transformStyle}) translateX(${contentX}px) translateY(${contentY}px)`, contentStyle }"
            :handleSave="saveMap" :handleDelete="deleteMap" :handleUpdate="updateMap" />
        <div :style="{ right: data ? '0%' : '-100%' }" class="information-container">
            <div class="tab-container">
                <div @click="() => {
                    tab = 'format'
                }" :style="tab == 'format' ? { backgroundColor: 'black', color: 'white' } : {}">Format</div>
                <div :style="tab == 'info' ? { backgroundColor: 'black', color: 'white' } : {}" @click="() => {
                    tab = 'info'
                }">Info</div>
                <div :style="tab == 'log' ? { backgroundColor: 'black', color: 'white' } : {}" @click="() => {
                    tab = 'log'
                }">Log</div>
            </div>
            <!-- <div v-if="tab == 'info'">

                <h1>{{ data.label }}</h1>
                <h4>Description</h4>
                <p> Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugit iusto ab possimus, impedit iste
                    facilis
                    voluptatibus
                    sapiente incidunt eum quod quas qui.
                </p>
                <label for="">Type : &nbsp; </label>
                <span>{{ data?.type }}</span> <br> <br>
                <label for="">Developers engaged : &nbsp; </label>
                <ul>
                    <li>Iman</li>
                    <li>Fida</li>
                </ul> <br>
            </div> -->
            <div v-if="tab == 'format'">
                <br> <br>
                <label for="bg-color">Type:</label>
                <select v-model="bgColor" name="bgColor" id="bgColor">
                    <option value="module">Module</option>
                    <option value="milestone">milestone</option>
                    <option value="feature">feature</option>
                    <option value="story">Story</option>
                </select>
                <br>
                <label for="bg-color">Text color:</label> <input v-model="textColor" id="bg-color" type="color">
                <br><br>
                <label for="bg-color">Border Style:</label>

                <select v-model="borderStyle" name="borderStyle" id="borderStyle">
                    <option value="dotted">Dotted</option>
                    <option value="dashed">Dashed</option>
                    <option value="groove">Groove</option>
                    <option default value="solid ">Solid</option>
                    <option value="none ">none</option>
                </select> <br><br>
                <div class="radius">
                    <label for="">border shape: </label>
                    <select v-model="borderShape" multiple name="borderShape" id="borderShape">
                        <option value="tlr">top left round </option>
                        <option value="trr">top right round</option>
                        <option default value="brr">bottom right round</option>
                        <option value="blr">bottom left round</option>
                    </select>
                </div>
            </div>
            <div v-if="tab == 'log'">
                <ul>


                    <li v-for="history in historyArr" :key="history">
                        {{ history }}</li>

                </ul>
            </div>

        </div>
        <div class="zoom-controls">
            <button @click="updateMindmap">update</button>
            <button @click="saveMindmap">Save</button>
            <button @click="deleteMindmap">Delete</button>
            <RouterLink to="/"> <button>back</button></RouterLink>
            <button @click="() => {


                if (layout == 'RTL') {
                    layout = 'TTB'
                } else if (layout == 'TTB') {
                    layout = 'RTL'
                }
            }"><img width="30px" src="../assets/download-removebg-preview.png" alt="suffle"></button>
            <button @click="zoomIn">+</button>
            <button @click="zoomOut">-</button>
        </div>
    </div>

</template>


<script setup>
import { computed, reactive, ref, watch } from 'vue';
import MindMap from './MindMap.vue';
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute();

const layout = ref('RTL');
const contentX = ref(0); // Track the horizontal position of the content
const contentY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const data = ref(null)
const bgColor = ref('story')
const textColor = ref('black')
const childData = reactive({})
const tab = ref('format')
const borderStyle = ref('solid');
const borderShape = ref(['trr', 'tlr', 'brr', 'blr']);

const contentStyle = computed(() => ({
    transform: `translateX(${contentX.value}px)`
}));
const historyArr = ref([])
watch(bgColor, (newColor, oldColor) => {

    historyArr.value.push(`the bg color has changed from ${oldColor} to ${newColor} `)
    childData.value = {
        ...data.value,
        type: newColor,
        borderStyle: borderStyle.value,
        textColor: textColor.value,
        borderShape: borderShape.value,
        history: [...historyArr.value],

    }

})
watch(textColor, (newValue, oldValue) => {
    historyArr.value.push(`the text color has changed from ${oldValue} to ${newValue} `)

    childData.value = {
        ...data.value,
        type: bgColor.value,
        textColor: newValue,
        borderShape: borderShape.value,
        borderStyle: borderStyle.value,
        history: [...historyArr.value],
    }
})
watch(borderStyle, (newValue, oldValue) => {
    historyArr.value.push(`the border style has changed from ${oldValue} to ${newValue} `)

    childData.value = {
        ...data.value,
        type: bgColor.value,
        textColor: textColor.value,
        borderStyle: newValue,
        borderShape: borderShape.value,
        history: [...historyArr.value],

    }
})
watch(borderShape, (newValue, oldValue) => {
    historyArr.value.push(`the border shape has changed from ${oldValue} to ${newValue} `)

    childData.value = {
        ...data.value,
        type: bgColor.value,
        textColor: textColor.value,
        borderStyle: borderStyle.value,
        borderShape: newValue,
        history: [...historyArr.value],

    }
})
const transformStyle = ref(1)
function ZoomOnScroll(e) {
    if (e.wheelDeltaY > 0) {
        transformStyle.value += 0.01;
    }
    else if (e.wheelDeltaY < 0) {
        transformStyle.value -= 0.01;
    }
    if (transformStyle.value < 0) {
        transformStyle.value = 0.4
    }

}
function receiveData(param) {

    data.value = param
}
// Start dragging
const startDrag = (event) => {
    isDragging.value = true;
    startX.value = event.clientX; // Record the initial mouse position
    startY.value = event.clientY; // Record the initial mouse position
};

// Stop dragging
const endDrag = () => {
    isDragging.value = false;
};

// Handle the dragging motion
const onDrag = (event) => {
    if (!isDragging.value) return;

    const deltaX = event.clientX - startX.value;
    const deltaY = event.clientY - startY.value;
    contentX.value += deltaX;
    contentY.value += deltaY;
    startX.value = event.clientX; // Update the starting X for the next move
    startY.value = event.clientY; // Update the starting X for the next move

    // Ensure content doesn't move too far left (e.g., beyond the graph boundary)
    // if (contentX.value < 0) {
    //   contentX.value = 0;
    // }

};

const zoomIn = () => {
    transformStyle.value += 0.1;
};

const zoomOut = () => {
    transformStyle.value -= 0.1;
    if (transformStyle.value < 0.4) {
        transformStyle.value = 0.4;
    }
};
const saveMap = ref(false)
const deleteMap = ref(false)
const updateMap = ref(false)
const saveMindmap = () => {
    saveMap.value = !saveMap.value;
}
const deleteMindmap = () => {
    // console.log("mindmap deleted")
    deleteMap.value = !deleteMap.value
}
const updateMindmap = () => {
    updateMap.value = !updateMap.value
}

</script>

<style>
#id {

    width: 100%;
    height: 100%;
    overflow: hidden;
}

.tab-container {
    width: 100%;
    display: flex;
    background: white;
    border-radius: 10px;
}

.tab-container div {
    color: #6b6b6b;
    max-width: 100px;
    width: 100%;
    text-align: center;
    padding: 10px;
    cursor: pointer;
    border-radius: 10px;
}

body {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
    user-select: none;
}

.information-container {
    height: 100vh;
    width: 200px;
    background: #3CC553;
    position: absolute;
    top: 0%;
    right: 0%;
    transition: all 0.5s linear;
    color: white;
    padding: 10px;
}

.zoom-controls {
    position: fixed;
    bottom: 40px;
    left: 10px;
    display: flex;
    flex-direction: column;
}

.zoom-controls button {
    background-color: #6b6b6b;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 100%;
    margin: 5px 0;
    cursor: pointer;
    font-size: 20px;
    aspect-ratio: 1;
    width: 60px;
}

.zoom-controls button:hover {
    background-color: #3a59d1;
}
</style>
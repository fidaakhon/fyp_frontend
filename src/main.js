import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createRouter, createWebHistory } from 'vue-router'
import MindMapFile from "./components/MindMapFile.vue";
import FolderStructureComp from "./components/FolderStructureComp.vue";
import { createPinia } from 'pinia';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/mindMap/:id', component: MindMapFile },
        { path: '/', component: FolderStructureComp },
      
    ]
});
const pinia = createPinia();
createApp(App).use(router).use(pinia).mount("#app");

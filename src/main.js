import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createRouter, createWebHistory } from 'vue-router'
import MindMapFile from "./components/MindMapFile.vue";
import FolderStructureComp from "./components/FolderStructureComp.vue";
import { createPinia } from 'pinia';
import SignupPage from "./pages/signup/SignupPage.vue";
import SigninPage from "./pages/signin/SigninPage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/mindMap/:id', component: MindMapFile },
        { path: '/', component: FolderStructureComp },
        { path: '/signup', component: SignupPage },
        { path: '/signin', component: SigninPage }
    ]
});
const pinia = createPinia();
createApp(App).use(router).use(pinia).mount("#app");

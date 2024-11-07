// router.js
import { createRouter, createWebHistory } from 'vue-router';
import MindMapFile from "../components/MindMapFile.vue";
import FolderStructureComp from "../components/FolderStructureComp.vue";
// import api from '../utils/axiosConfig';
import SignupPage from "../pages/signup/SignupPage.vue";
import SigninPage from "../pages/signin/SigninPage.vue";
// import axios from 'axios';

const routes = [
    { path: '/', component: FolderStructureComp, meta: { requiresAuth: true } },
    { path: '/signup', component: SignupPage },
    { path: '/signin', component: SigninPage },
    { path: '/mindMap/:id', component: MindMapFile, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
        try {
            const res = await fetch('http://localhost:8000/api/v1/users/current-user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }); 
            const user = await res.json();
            if (user) {
                next();
            } else {
                next('/signin');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            next('/signin'); 
        }
    } else {
        next();
    }
});

export default router;

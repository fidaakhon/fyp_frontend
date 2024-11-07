import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createPinia } from 'pinia';
import router from './router/router'; // Import the router configuration

const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.use(router); // Register the router with the app
app.mount("#app");

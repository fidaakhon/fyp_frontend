// axiosConfig.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'localhost:8000/api/v1/', // Your API base URL
    withCredentials: true, // Include cookies with requests
});

export default api;

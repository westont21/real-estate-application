import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://localhost:5001',  // Your API base URL
    withCredentials: true               // Ensure credentials are sent with each request
});

export default axiosInstance;

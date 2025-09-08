// src/api.js
import axios from "axios";

// Create an axios instance pointing to Vite proxy (/api → http://localhost:5000)
const api = axios.create({
  baseURL: "/api",
});

export default api;

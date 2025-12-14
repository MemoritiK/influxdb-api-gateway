import axios from "axios";

const api = axios.create({
  baseURL: "http://0.0.0.0:8000/", // FastAPI backend
});

export default api;

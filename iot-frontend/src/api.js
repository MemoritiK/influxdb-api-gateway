import axios from "axios";

const api = axios.create({
  baseURL: "/api", // FastAPI backend
});

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.7.138:8000", // adjust if your FastAPI runs elsewhere
});

export default api;

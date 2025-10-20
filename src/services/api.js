import axios from "axios";

const API = axios.create({
  baseURL: "https://lmsmbu-backend1728.onrender.com/api",
});

export default API;

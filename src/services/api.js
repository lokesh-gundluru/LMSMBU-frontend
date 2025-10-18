import axios from "axios";

const API = axios.create({
  baseURL: "https://366ae278aff7.ngrok-free.app/api",
});

export default API;

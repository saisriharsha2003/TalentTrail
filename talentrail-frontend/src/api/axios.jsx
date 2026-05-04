import axios from "axios";
import { BASE_URL } from "./config";

export default axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
    }
});
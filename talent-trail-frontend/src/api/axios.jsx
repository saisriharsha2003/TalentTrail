import axios from "axios";

export default axios.create({
    // baseURL: 'https://final-year-project-server.vercel.app/',
    baseURL: 'http://localhost:3500/',
    withCredentials: true
});

export const axiosPrivate = axios.create({
    // baseURL: 'https://final-year-project-server.vercel.app/',
    baseURL: 'http://localhost:3500/',
    headers:{ 
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS" 
            },
    withCredentials: true
});

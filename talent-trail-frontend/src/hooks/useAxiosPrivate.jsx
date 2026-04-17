import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();

    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                const token = localStorage.getItem('accessToken');

                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }

                return config;
            },
            err => Promise.reject(err)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (err) => {
                const prevRequest = err?.config;

                if (err?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true;

                    const newAccessToken = await refresh();

                    localStorage.setItem("accessToken", newAccessToken);

                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    return axiosPrivate(prevRequest);
                }

                return Promise.reject(err);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }

    }, [refresh]);

    return axiosPrivate;
};

export default useAxiosPrivate;
import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefershToken from "./useRefershToken";
import { useNavigate } from "react-router-dom";

const useAxiosPrivate = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refresh = useRefershToken();
    const navigate = useNavigate();

    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${accessToken}`;
                }
                return config;
            }, (err) => Promise.reject(err)
        )

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (err) => {
                const prevRequest = err?.config;
                if (err?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest)
                        .then(res => Promise.resolve(res))
                        .catch(err => {
                            // localStorage.removeItem('accessToken');
                            // navigate('/login');
                            return Promise.reject(err)
                        });
                }
                return Promise.reject(err);
            }
        );

        return () => {
            axiosPrivate.interceptors.response.eject(responseIntercept);
            axiosPrivate.interceptors.request.eject(requestIntercept);
        }
    }, [accessToken, refresh, navigate])

    return axiosPrivate
}

export default useAxiosPrivate;
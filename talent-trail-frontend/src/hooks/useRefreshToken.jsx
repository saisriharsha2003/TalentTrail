import axios from '../api/axios';
import { jwtDecode } from "jwt-decode";

const useRefershToken = () => {
    const refresh = async () => {
        const accessToken = localStorage.getItem('accessToken');
        const decoded = jwtDecode(accessToken);
        const response = await axios.get(`/refresh/${decoded.userInfo.role}`, {
            withCredentials: true
        });
        localStorage.setItem('accessToken', response?.data?.accessToken);

        return response?.data?.accessToken;
    }
    return refresh;
}

export default useRefershToken;
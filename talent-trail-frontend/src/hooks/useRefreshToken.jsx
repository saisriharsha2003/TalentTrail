import axios from '../api/axios';

const useRefreshToken = () => {
    const refresh = async () => {
        try {
            const response = await axios.get('/refresh', {
                withCredentials: true
            });

            const newAccessToken = response?.data?.accessToken;

            localStorage.setItem('accessToken', newAccessToken);

            return newAccessToken;

        } catch (err) {
            console.error("Refresh failed", err);
            throw err;
        }
    };

    return refresh;
};

export default useRefreshToken;
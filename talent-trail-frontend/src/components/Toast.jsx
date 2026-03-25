import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const notify = (status, message) => {
    if (message === '' || message === 'Forbidden')
        return

    if (status === 'success') {
        toast.success(message, { autoClose: 2000 });
    } else {
        toast.error(message, { autoClose: 4000 });
    }
};

const Toast = () => {
    return (
        <ToastContainer hideProgressBar={true} />
    );
}
export default Toast;

import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';



const UploadResume = () => {

    const axios = useAxiosPrivate();
    const navigate = useNavigate();


    const handleResume = async (e) => {
    
        e.preventDefault();
        // try {
        //     const resume = document.getElementById("resume");
        //     const fd = new FormData();
        //     fd.append("resume", resume.files[0]);
        //     if (!fd) return;
    
        //     const response = await axios.post("/student/resume", fd, {
        //         headers: { "Content-Type": "multipart/form-data" },
        //     });
    
        //     const success = response?.data?.success;
        //     if (success) notify("success", success);
        // } catch (err) {
        //     notify("failed", err?.response?.data?.message);
        // }

        try {
            const resume = document.getElementById("resume");
            const fd = new FormData();
            fd.append("resume", resume.files[0]);
            if (!fd) return;
    
            const response = await axios.post("/student/parseResume", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            const success = response?.data?.success;
            // const data = ÷
            const parsedOutput = response?.data?.parsedOutput; // Get the parsedOutput from the response

            if (success) {
                notify("success", success);
                console.log("Parsed output:", parsedOutput);
                localStorage.setItem("parsedOutput", JSON.stringify(parsedOutput));

            }
            navigate('/studentRegister');
        
        } 
        catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    return (
        <>
            <div className='d-flex justify-content-center m-3'>
                <div
                    className="card container p-4 h-100 shadow-2-strong shadow-sm"
                    style={{ backgroundColor: "#fff" }}
                >
                    <div className='card-body'>
                        <form>
                        <div className="form-row row mb-4">
                                <div className="form-group col-md-9">
                                    <label htmlFor="resume" className="form-label">
                                        <b>Resumè</b>
                                        (File should be less than 2 mb and
                                        only pdf's are allowed)
                                    </label>
                                    <input
                                        className="form-control mt-lg-4"
                                        type="file"
                                        id="resume"
                                        name="resume"
                                    />
                                </div>
                                <div className="form-group col-md-2 mt-4 mt-md-5">
                                <button
                                        className="btn btn-primary m-2"
                                        onClick={handleResume}
                                    >
                                        upload
                                    </button>
                                </div>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </>
    )
}

export default UploadResume;

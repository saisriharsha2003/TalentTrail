import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const UploadJD = () => {

    const axios = useAxiosPrivate();
    const navigate = useNavigate();

    const [process, setProcess] = useState(false);

    const handleJD = async (e) => {
    
        e.preventDefault();

        try {
            setProcess(true)
            const jd = document.getElementById("jd");
            const fd = new FormData();
            fd.append("jd", jd.files[0]);
            if (!fd) return;
            
            const response = await axios.post("/recruiter/parseJD", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            const success = response?.data?.success;
            // const data = ÷
            const jdOutput = response?.data?.jdOutput; // Get the parsedOutput from the response

            if (success) {
                notify("success", success);
                console.log("Parsed output:", jdOutput);
                localStorage.setItem("jdOutput", JSON.stringify(jdOutput));

            }
            navigate('/user/recruiter/new');
        
        } 
        catch (err) {
            notify("failed", err?.response?.data?.message);
        }
        setProcess(false);
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
                                    <label htmlFor="jd" className="form-label">
                                        <b>Job Description</b>
                                        (File should be less than 2 mb and
                                        only pdf's are allowed)
                                    </label>
                                    <input
                                        className="form-control mt-lg-4"
                                        type="file"
                                        id="jd"
                                        name="jd"
                                    />
                                </div>
                                <div className="form-group col-md-2 mt-4 mt-md-5">
                                <button
                                    className="btn btn-primary m-2"
                                    style={{ minWidth: "100px" }}
                                    onClick={process ? null : handleJD} // Disable click event when in process
                                    disabled={process} // Disable button when in process
                                >
                                    {process ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        "Upload"
                                    )}
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

export default UploadJD;

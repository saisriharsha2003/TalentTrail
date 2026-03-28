import React, { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const UploadJD = () => {

    const axios = useAxiosPrivate();
    const navigate = useNavigate();

    const [process, setProcess] = useState(false);

    const handleJD = async (e) => {
        e.preventDefault();
        setProcess(true);

        try {
            const jd = document.getElementById("jd");

            if (!jd.files[0]) {
                notify("failed", "Please upload a file");
                return;
            }

            const fd = new FormData();
            fd.append("file", jd.files[0]); // ✅ correct key

            const response = await axios.post("/recruiter/parseJD", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("FULL RESPONSE:", response.data);

            const success = response?.data?.success;
            const jobData = response?.data?.job_data;

            if (success && jobData) {
                notify("success", "JD parsed successfully");

                console.log("Parsed output:", jobData);

                // ✅ store FULL response (required for next page)
                localStorage.setItem("jdOutput", JSON.stringify(response.data));

                navigate('/user/recruiter/new');
            } else {
                notify("failed", "Parsing failed");
            }

        } catch (err) {
            console.error("Upload Error:", err);
            notify("failed", err?.response?.data?.message || "Parsing failed");
        } finally {
            setProcess(false); // ✅ always stop loader
        }
    };

    return (
        <div className='d-flex justify-content-center m-3'>
            <div
                className="card container p-4 h-100 shadow-2-strong shadow-sm"
                style={{ backgroundColor: "#fff" }}
            >
                <div className='card-body'>
                    <form onSubmit={handleJD}>
                        <div className="form-row row mb-4">

                            <div className="form-group col-md-9">
                                <label htmlFor="jd" className="form-label">
                                    <b>Job Description</b>
                                    (File should be less than 2 mb and only PDFs are allowed)
                                </label>

                                <input
                                    className="form-control mt-lg-4"
                                    type="file"
                                    id="jd"
                                    name="jd"
                                    accept=".pdf"
                                />
                            </div>

                            <div className="form-group col-md-2 mt-4 mt-md-5">
                                <button
                                    type="submit"
                                    className="btn btn-primary m-2"
                                    style={{ minWidth: "100px" }}
                                    disabled={process}
                                >
                                    {process ? (
                                        <span
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
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
    );
};

export default UploadJD;
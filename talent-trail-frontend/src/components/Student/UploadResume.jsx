import React, { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const UploadResume = () => {
    const axios = useAxiosPrivate();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleResume = async (e) => {
        e.preventDefault();
        const resumeFile = document.getElementById("resume").files[0];
        if (!resumeFile) {
            notify("failed", "Please select a resume file");
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("resume", resumeFile);
    
            const response = await axios.post("/student/parseResume", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            const success = response?.data?.success;
            const parsedOutput = response?.data?.parsedOutput;

            if (success) {
                notify("success", "Resume parsed successfully!");
                localStorage.setItem("parsedOutput", JSON.stringify(parsedOutput));
                navigate('/studentRegister');
            }
        } catch (err) {
            notify("failed", err?.response?.data?.message || "Failed to parse resume");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 min-vh-100 d-flex flex-column align-items-center justify-content-center">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '600px', width: '100%' }}>
                <div className="bg-primary p-4 text-white text-center">
                    <h2 className="fw-bold mb-0">Step 1: Smart Profile Setup</h2>
                    <p className="mb-0 opacity-75">Upload your resume to pre-fill your details</p>
                </div>

                <div className="card-body p-4 p-md-5 text-center">
                    <div className="mb-5">
                        <div className="upload-container mx-auto mb-4 border-2 border-dashed rounded-4 p-5 bg-light position-relative overflow-hidden shadow-sm" 
                             style={{ cursor: 'pointer' }}
                             onClick={() => document.getElementById('resume').click()}
                        >
                            <input type="file" id="resume" className="d-none" accept=".pdf" />
                            <div className="text-muted">
                                <i className="bi bi-file-earmark-pdf fs-1 text-primary mb-3 d-block"></i>
                                <p className="mb-0 fw-medium">Click to upload your Resume (PDF)</p>
                                <small className="opacity-75">File should be less than 2MB</small>
                            </div>
                        </div>
                    </div>

                    <div className="d-grid gap-3">
                        <button className="btn btn-primary py-3 rounded-3 fw-bold shadow-sm" onClick={handleResume} disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Analyzing Resume...
                                </>
                            ) : 'Analyze & Continue 🚀'}
                        </button>
                        <button className="btn btn-outline-secondary py-2 border-0" onClick={() => navigate('/studentRegister')}>
                            Skip and fill manually
                        </button>
                    </div>

                    <div className="mt-4 p-3 bg-light rounded-3 text-start">
                        <small className="text-muted d-block mb-1 fw-bold">How it works:</small>
                        <small className="text-muted">Our AI will extract your education, skills, and experience from your resume to save you time during registration.</small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadResume;

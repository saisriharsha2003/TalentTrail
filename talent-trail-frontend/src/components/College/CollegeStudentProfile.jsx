import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";

const RESUMES_URL = `${BASE_URL}resumes`;

const CollegeStudentProfile = () => {
    const { studentId } = useParams();
    const axios = useAxiosPrivate();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const res = await axios.get(`/college/student/${studentId}`);
                setStudent(res.data);
            } catch (err) {
                notify("failed", err?.response?.data?.message || "Failed to fetch student profile");
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [axios, studentId]);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (!student) return <div className="text-center py-5">Student not found.</div>;

    const { personal, academic, contact, certifications, projects, workExperiences, resume } = student;

    const Section = ({ title, icon, children }) => (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
                <i className={`bi ${icon} text-primary me-2`}></i>
                {title}
            </h5>
            {children}
        </div>
    );

    const InfoField = ({ label, value }) => (
        <div className="mb-3">
            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{label}</small>
            <span className="text-dark fw-medium">{value || 'N/A'}</span>
        </div>
    );

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-5 mx-4">
                <div>
                    <h2 className="fw-bold mb-1">Student Profile</h2>
                    <p className="text-muted mb-0">Full professional and academic record of {personal?.fullName}.</p>
                </div>
                <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>Back
                </button>
            </div>

            <div className="row mx-2">
                {/* Left Column: Header and Personal/Contact */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 text-center p-5 bg-white">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-4" 
                             style={{ width: '120px', height: '120px' }}>
                            <span className="display-4 fw-bold text-primary">{personal?.fullName?.charAt(0)}</span>
                        </div>
                        <h3 className="fw-bold mb-1">{personal?.fullName}</h3>
                        <p className="text-primary fw-medium mb-4">{student.rollNo}</p>
                        
                        {resume && (
                            <a href={`${RESUMES_URL}/${resume}`} target="_blank" rel="noreferrer" 
                               className="btn btn-primary w-100 rounded-pill py-2 shadow-sm">
                                <i className="bi bi-file-earmark-pdf me-2"></i>View Resume
                            </a>
                        )}
                    </div>

                    <Section title="Personal Information" icon="bi-person">
                        <div className="row g-3">
                            <div className="col-6"><InfoField label="Gender" value={personal?.gender} /></div>
                            <div className="col-6"><InfoField label="Date of Birth" value={personal?.dateOfBirth} /></div>
                            <div className="col-12"><InfoField label="Father's Name" value={personal?.fatherName} /></div>
                            <div className="col-12"><InfoField label="Mother's Name" value={personal?.motherName} /></div>
                        </div>
                    </Section>

                    <Section title="Contact Details" icon="bi-telephone">
                        <InfoField label="Personal Email" value={contact?.email} />
                        <InfoField label="College Email" value={contact?.collegeEmail} />
                        <InfoField label="Mobile" value={contact?.mobile} />
                        <InfoField label="Current Address" value={contact?.currentAddress} />
                    </Section>
                </div>

                {/* Right Column: Academic and Professional */}
                <div className="col-lg-8">
                    <Section title="Academic Records" icon="bi-mortarboard">
                        <div className="row g-4 mb-4">
                            <div className="col-md-6 p-4 bg-light rounded-4">
                                <h6 className="fw-bold text-primary mb-3">Current Education</h6>
                                <InfoField label="Course" value={academic?.currentEducation?.course} />
                                <InfoField label="Specialization" value={academic?.currentEducation?.specialization} />
                                <InfoField label="Current CGPA" value={academic?.currentEducation?.cgpa} />
                                <InfoField label="Passing Year" value={academic?.currentEducation?.graduatingYear} />
                            </div>
                            <div className="col-md-6 p-4 bg-light rounded-4">
                                <h6 className="fw-bold text-secondary mb-3">Previous Education</h6>
                                <InfoField label="Institution" value={academic?.previousEducation?.college} />
                                <InfoField label="Board/University" value={academic?.previousEducation?.board} />
                                <InfoField label="Percentage/CGPA" value={academic?.previousEducation?.percentage} />
                                <InfoField label="Passing Year" value={academic?.previousEducation?.passingYear} />
                            </div>
                        </div>
                        
                        {academic?.currentEducation?.skills?.length > 0 && (
                            <div>
                                <h6 className="fw-bold mb-3">Technical Skills</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {academic.currentEducation.skills.map((skill, i) => (
                                        <span key={i} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Section>

                    <Section title="Projects & Experience" icon="bi-briefcase">
                        <div className="mb-5">
                            <h6 className="fw-bold text-muted text-uppercase mb-4" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Projects</h6>
                            {projects?.length > 0 ? projects.map((p, i) => (
                                <div key={i} className="mb-4 p-3 border-start border-4 border-primary bg-light rounded-end-4">
                                    <h6 className="fw-bold mb-1">{p.name}</h6>
                                    <p className="small text-muted mb-0">{p.description}</p>
                                </div>
                            )) : <p className="text-muted small">No projects listed.</p>}
                        </div>

                        <div>
                            <h6 className="fw-bold text-muted text-uppercase mb-4" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Work Experience</h6>
                            {workExperiences?.length > 0 ? workExperiences.map((w, i) => (
                                <div key={i} className="mb-4 p-3 border-start border-4 border-success bg-light rounded-end-4">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="fw-bold mb-1">{w.organization}</h6>
                                        <span className="badge bg-white text-success border border-success border-opacity-25 rounded-pill">{w.duration}</span>
                                    </div>
                                    <p className="small fw-medium text-dark mb-1">{w.role}</p>
                                    <p className="small text-muted mb-0">{w.description}</p>
                                </div>
                            )) : <p className="text-muted small">No work experience listed.</p>}
                        </div>
                    </Section>

                    {certifications?.length > 0 && (
                        <Section title="Certifications" icon="bi-patch-check">
                            <div className="row g-3">
                                {certifications.map((c, i) => (
                                    <div key={i} className="col-md-6">
                                        <div className="d-flex align-items-center p-3 border rounded-4 bg-white shadow-sm h-100">
                                            <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-3">
                                                <i className="bi bi-award fs-4"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-0">{c.name}</h6>
                                                <small className="text-muted">{c.organization}</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollegeStudentProfile;
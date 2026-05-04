import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useParams, useNavigate } from "react-router-dom";

const CollegeDriveProfile = () => {
  const jobDefault = {
    companyName: "",
    jobTitle: "",
    jobRole: "",
    cgpa: "",
    jobDescription: "",
    description: "",
    experienceRequired: "",
    experience: "",
    numberOfOpenings: "",
    seats: "",
    salaryRange: "",
    package: "",
    location: "",
    employmentType: "",
    skills: [],
  };

  const { id } = useParams();
  const [job, setJob] = useState(jobDefault);
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriveProfile = async () => {
      try {
        const response = await axios.get("/college/job/" + id);
        setJob(response?.data || jobDefault);
        console.log(response?.data || jobDefault);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchDriveProfile();
  }, [axios, id]);

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-5 mx-4">
        <div>
          <h2 className="fw-bold mb-1">Drive Details</h2>
          <p className="text-muted mb-0">
            Detailed overview of the recruitment drive.
          </p>
        </div>
        <button
          className="btn btn-outline-primary rounded-pill px-4"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
      </div>

      <div className="row justify-content-center mx-2">
        <div className="col-12 px-md-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="bg-primary p-4 text-white d-flex justify-content-between align-items-center">
              <div>
                <h3 className="fw-bold mb-1">{job.jobTitle || job.jobRole}</h3>
                <p className="mb-0 opacity-75">{job.companyName}</p>
              </div>
              <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2 text-center">
                <span className="d-block small text-uppercase fw-bold">
                  Package
                </span>
                <span className="fs-5 fw-bold">
                  {job.salaryRange || job.package || "N/A"}
                </span>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <div className="row g-4">
                <div className="col-md-8">
                  <h5 className="fw-bold mb-3">Job Description</h5>
                  <div
                    className="p-4 bg-light rounded-4 text-muted"
                    style={{ lineHeight: "1.8" }}
                  >
                    {job.jobDescription ||
                      job.description ||
                      "No description provided."}
                  </div>
                  {job.responsibilities && (
                    <div className="mt-4">
                      <h5 className="fw-bold mb-3">Roles & Responsibilities</h5>

                      <div className="p-4 bg-light rounded-4">
                        <ul className="mb-0 ps-3" style={{ lineHeight: "1.8" }}>
                          {job.responsibilities
                            .split(/(?<=\.)\s+(?=[A-Z])/)
                            .map((item) => item.trim())
                            .filter((item) => item.length > 0)
                            .map((item, index) => (
                              <li
                                key={index}
                                className="mb-2 d-flex align-items-start text-muted"
                              >
                                <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                                <span>{item}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4">
                      <h5 className="fw-bold mb-3">Required Skills</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 border border-primary border-opacity-25"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-md-4">
                  <div className="card bg-light border-0 rounded-4">
                    <div className="card-body p-4">
                      <h5 className="fw-bold mb-4">Quick Information</h5>

                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-white rounded-3 p-2 me-3 shadow-sm text-primary">
                          <i className="bi bi-geo-alt fs-5"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block">Location</small>
                          <span className="fw-bold text-dark">
                            {job.location || "Remote"}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-white rounded-3 p-2 me-3 shadow-sm text-success">
                          <i className="bi bi-briefcase fs-5"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block">
                            Experience
                          </small>
                          <span className="fw-bold text-dark">
                            {job.experienceRequired ||
                              job.experience ||
                              "Fresher"}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-white rounded-3 p-2 me-3 shadow-sm text-warning">
                          <i className="bi bi-mortarboard fs-5"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block">
                            Min. CGPA
                          </small>
                          <span className="fw-bold text-dark">
                            {job.cgpa || "No criteria"}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-0">
                        <div className="bg-white rounded-3 p-2 me-3 shadow-sm text-info">
                          <i className="bi bi-people fs-5"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block">Openings</small>
                          <span className="fw-bold text-dark">
                            {job.numberOfOpenings || job.seats || "N/A"}{" "}
                            Positions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDriveProfile;

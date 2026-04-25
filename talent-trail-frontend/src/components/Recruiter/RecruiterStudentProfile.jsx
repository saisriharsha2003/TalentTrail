import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../assets/config.jsx";

const RESUMES_URL = `${BASE_URL}resumes`;

const RecruiterStudentProfile = () => {
  const { id } = useParams();
  const axios = useAxiosPrivate();

  const [activeTab, setActiveTab] = useState("profile");
  const [student, setStudent] = useState({});
  const [applications, setApplications] = useState([]);
  const bufferToBase64 = (bufferArray) => {
    const chunkSize = 100000;
    let base64String = "";

    for (let i = 0; i < bufferArray.length; i += chunkSize) {
      const chunk = bufferArray.slice(i, i + chunkSize);
      base64String += String.fromCharCode.apply(null, chunk);
    }

    return btoa(base64String);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/recruiter/studentProfile/${id}`);

        let studentData = res.data.student || {};
        console.log(studentData);
        console.log("RESUME:", res.data.student.resume);

        if (studentData?.profile?.data) {
          const base64 = bufferToBase64(studentData.profile.data);
          studentData.profileBase64 = `data:image/jpeg;base64,${base64}`;
        }

        setStudent(studentData);
        setApplications(res.data.applications || []);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };

    fetchData();
  }, [axios, id]);

  const handleSelect = async (appId) => {
    await axios.post("/recruiter/application", {
      applicationId: appId,
      status: "selected",
    });
    notify("success", "Selected");
    navigate("/user/recruiter/applications");
  };

  const handleReject = async (appId) => {
    await axios.post("/recruiter/application", {
      applicationId: appId,
      status: "rejected",
    });
    notify("success", "Rejected");
    navigate("/user/recruiter/applications");
   };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-12 px-md-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="bg-primary p-4 text-white d-flex align-items-center gap-3">
              {student?.profileBase64 ? (
                <img
                  src={student.profileBase64}
                  alt="profile"
                  className="rounded-circle border border-3 border-white shadow-sm"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    imageRendering: "auto",
                  }}
                />
              ) : (
                <div
                  className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "70px", height: "70px" }}
                >
                  <i className="bi bi-person fs-2"></i>
                </div>
              )}

              <div>
                <h3 className="fw-bold mb-0">
                  {student?.personal?.fullName || "Student"}
                </h3>
                <small className="opacity-75">{student?.contact?.email}</small>
              </div>
            </div>

            <div className="card-header bg-white border-bottom-0 p-0">
              <ul className="nav nav-tabs nav-fill border-0">
                {[
                  { id: "profile", label: "Profile", icon: "bi-person" },
                  { id: "contact", label: "Contact", icon: "bi-geo" },
                  { id: "academic", label: "Academic", icon: "bi-mortarboard" },
                  { id: "skills", label: "Skills", icon: "bi-lightning" },
                  {
                    id: "experience",
                    label: "Experience",
                    icon: "bi-briefcase",
                  },
                  { id: "projects", label: "Projects", icon: "bi-kanban" },
                  {
                    id: "certifications",
                    label: "Certifications",
                    icon: "bi-award",
                  },
                  {
                    id: "applications",
                    label: "Applications",
                    icon: "bi-graph-up",
                  },
                ].map((tab) => (
                  <li key={tab.id} className="nav-item">
                    <button
                      className={`nav-link py-3 border-0 d-flex align-items-center justify-content-center gap-2 
                      ${
                        activeTab === tab.id
                          ? "active border-bottom border-primary border-3 text-primary fw-bold"
                          : "text-muted"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`bi ${tab.icon}`}></i>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-body p-4 p-md-5 bg-white">
              {activeTab === "profile" && (
                <>
                  <SectionTitle title="Basic Information" />

                  <div className="row g-4">
                    <Field
                      label="Full Name"
                      value={student?.personal?.fullName}
                    />
                    <Field
                      label="Father Name"
                      value={student?.personal?.fatherName}
                    />
                    <Field
                      label="Mother Name"
                      value={student?.personal?.motherName}
                    />
                    <Field
                      label="Gender"
                      value={student?.personal?.gender.toUpperCase()}
                    />

                    <Field
                      label="Date of Birth"
                      value={student?.personal?.dateOfBirth?.split("T")[0]}
                    />
                  </div>

                  <div className="mt-5">
                    <SectionTitle title="Resume" />

                    <div className="d-flex justify-content-between align-items-center p-4 border rounded-4 bg-light">
                      <div>
                        <h6 className="fw-bold mb-1">Candidate Resume</h6>
                        <small className="text-muted">
                          Download or preview
                        </small>
                      </div>

                      <a
                        href={`${RESUMES_URL}/${student?.resume}`}
                        target="_blank"
                        className="btn btn-dark rounded-pill px-4"
                      >
                        View Resume
                      </a>
                    </div>
                  </div>
                </>
              )}
              {activeTab === "contact" && (
                <>
                  <SectionTitle title="Contact Information" />

                  <div className="row g-4">
                    <Field label="Email" value={student?.contact?.email} />
                    <Field label="Mobile" value={student?.contact?.mobile} />
                    <Field
                      label="CurrentAddress"
                      value={student?.contact?.currentAddress}
                    />
                    <Field
                      label="Permanent Address"
                      value={student?.contact?.permanentAddress}
                    />
                    <Field
                      label="College Email"
                      value={student?.contact?.collegeEmail}
                    />
                  </div>
                </>
              )}

              {activeTab === "academic" && (
                <>
                  <SectionTitle title="Current Education" />

                  <div className="row g-4">
                    <Field
                      label="College"
                      value={student?.academic?.currentEducation?.college}
                    />
                    <Field
                      label="Course"
                      value={student?.academic?.currentEducation?.course}
                    />
                    <Field
                      label="Major"
                      value={student?.academic?.currentEducation?.major}
                    />
                    <Field
                      label="Study Year"
                      value={student?.academic?.currentEducation?.studyYear}
                    />
                    <Field
                      label="CGPA"
                      value={student?.academic?.currentEducation?.cgpa}
                    />
                    <Field label="Roll No" value={student?.rollNo} />
                    <Field
                      label="Join Date"
                      value={
                        student?.academic?.currentEducation?.joinDate?.split(
                          "T",
                        )[0]
                      }
                    />
                    <Field
                      label="City"
                      value={student?.academic?.currentEducation?.city}
                    />
                  </div>

                  <div className="mt-5">
                    <SectionTitle title="Previous Education" />

                    <div className="row g-4">
                      <Field
                        label="Institution"
                        value={student?.academic?.previousEducation?.college}
                      />
                      <Field
                        label="Major"
                        value={student?.academic?.previousEducation?.major}
                      />
                      <Field
                        label="Percentage"
                        value={student?.academic?.previousEducation?.percentage}
                      />
                    </div>
                  </div>
                </>
              )}
              {activeTab === "skills" && (
                <>
                  <SectionTitle title="Skills & Technologies" />

                  <div className="d-flex flex-wrap gap-3">
                    {(student?.academic?.currentEducation?.skills || []).map(
                      (s, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 rounded-pill border bg-white shadow-sm fw-semibold"
                        >
                          {s}
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}

              {activeTab === "experience" && (
                <>
                  <SectionTitle title="Work Experience" />

                  {(student?.workExperiences || []).map((w, i) => (
                    <div key={i} className="p-4 border rounded-4 bg-light mb-3">
                      <h6 className="fw-bold">
                        {w.role} — {w.organization}
                      </h6>

                      <div className="small text-muted mb-2">
                        {w.startDate?.split("T")[0]} -{" "}
                        {w.endDate ? w.endDate.split("T")[0] : "Present"}
                      </div>

                      <p className="small text-muted mb-0">{w.description}</p>
                    </div>
                  ))}
                </>
              )}

              {activeTab === "projects" && (
                <>
                  <SectionTitle title="Projects" />

                  {(student?.projects || []).map((p, i) => (
                    <div key={i} className="p-4 border rounded-4 bg-light mb-3">
                      <h6 className="fw-bold">{p.name}</h6>

                      <div className="small text-muted mb-2">
                        {p.startDate} - {p.endDate || "Present"}
                      </div>

                      <p className="small text-muted">{p.description}</p>

                      {p.githubLink && (
                        <a
                          href={p.githubLink}
                          target="_blank"
                          className="btn btn-sm btn-dark rounded-pill"
                        >
                          View Code
                        </a>
                      )}
                    </div>
                  ))}
                </>
              )}
              {activeTab === "certifications" && (
                <>
                  <SectionTitle title="Certifications" />

                  {(student?.certifications || []).length === 0 ? (
                    <p className="text-muted">No certifications</p>
                  ) : (
                    <div className="row g-3">
                      {student.certifications.map((cert, i) => (
                        <div key={i} className="col-md-4">
                          <div className="p-4 border rounded-4 bg-light h-100">
                            <h6 className="fw-bold">{cert.name}</h6>
                            <div className="text-muted small">
                              {cert.organization}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {activeTab === "applications" && (
                <>
                  <SectionTitle title="Applications" />

                  {applications.length === 0 && (
                    <p className="text-muted">No applications</p>
                  )}

                  <div className="d-flex flex-column gap-4">
                    {applications.map((app, i) => (
                      <div
                        key={i}
                        className="p-4 border rounded-4 bg-white shadow-sm d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <h5 className="fw-bold mb-1">
                            {app.jobId?.jobTitle}
                          </h5>

                          <div className="text-muted mb-2">
                            {app.jobId?.companyName}
                          </div>

                          <div className="small text-secondary mb-3">
                            {app.jobId?.location} • {app.jobId?.employmentType}
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm px-3 rounded-pill"
                              onClick={() => handleSelect(app._id)}
                            >
                              Select
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm px-3 rounded-pill"
                              onClick={() => handleReject(app._id)}
                            >
                              Reject
                            </button>
                          </div>
                        </div>

                        <div>
                          <span
                            className={`px-3 py-2 rounded-pill fw-semibold text-uppercase small ${
                              app.status === "selected"
                                ? "bg-success-subtle text-success"
                                : app.status === "rejected"
                                  ? "bg-danger-subtle text-danger"
                                  : "bg-warning-subtle text-warning"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* COMPONENTS */

const SectionTitle = ({ title }) => (
  <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
    <span
      className="bg-primary rounded-pill"
      style={{ width: "6px", height: "24px" }}
    ></span>
    {title}
  </h5>
);

const Field = ({ label, value }) => (
  <div className="col-md-6">
    <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
      <div className="fw-bold text-dark">{label}</div>
      <div className="text-muted mt-1">{value || "—"}</div>
    </div>
  </div>
);

const CardItem = ({ title, desc }) => (
  <div className="mb-3 p-3 border rounded-4 bg-light">
    <div className="fw-semibold">{title}</div>
    <div className="text-muted small">{desc}</div>
  </div>
);

export default RecruiterStudentProfile;

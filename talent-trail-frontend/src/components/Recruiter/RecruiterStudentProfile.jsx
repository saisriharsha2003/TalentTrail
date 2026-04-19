import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useParams } from "react-router-dom";

const RESUMES_URL = "http://localhost:3500/resumes";

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
  };

  const handleReject = async (appId) => {
    await axios.post("/recruiter/application", {
      applicationId: appId,
      status: "rejected",
    });
    notify("success", "Rejected");
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
                  imageRendering: "auto"
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
                  { id: "academic", label: "Academic", icon: "bi-mortarboard" },
                  { id: "skills", label: "Skills", icon: "bi-lightning" },
                  {
                    id: "experience",
                    label: "Experience",
                    icon: "bi-briefcase",
                  },
                  { id: "projects", label: "Projects", icon: "bi-kanban" },
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
                    <Field label="Email" value={student?.contact?.email} />
                    <Field label="Gender" value={student?.personal?.gender} />
                    <Field label="Mobile" value={student?.contact?.mobile} />
                    <Field
                      label="Date of Birth"
                      value={student?.personal?.dateOfBirth?.split("T")[0]}
                    />
                    <Field
                      label="Address"
                      value={student?.contact?.currentAddress}
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

              {activeTab === "academic" && (
                <>
                  <SectionTitle title="Academic Details" />

                  <p>
                    <b>College:</b>{" "}
                    {student?.academic?.currentEducation?.college}
                  </p>
                  <p>
                    <b>Course:</b> {student?.academic?.currentEducation?.course}
                  </p>
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
                    <CardItem
                      key={i}
                      title={`${w.organization} — ${w.role}`}
                      desc={w.description}
                    />
                  ))}
                </>
              )}

              {activeTab === "projects" && (
                <>
                  <SectionTitle title="Projects" />

                  {(student?.projects || []).map((p, i) => (
                    <CardItem key={i} title={p.name} desc={p.description} />
                  ))}
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

import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useParams, useLocation } from "react-router-dom";
import StudentProfile from "../Student/StudentProfile";

const RecruiterStudentProfile = () => {
  const { id } = useParams();
  const axios = useAxiosPrivate();

  const [studentData, setStudentData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterStatus = queryParams.get("status"); // 🔥 key line

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/recruiter/studentProfile/${id}`);

      setStudentData(res.data.student);
      const apps = res.data.applications || [];

      setApplications(
        filterStatus ? apps.filter((app) => app.status === filterStatus) : apps,
      );
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, filterStatus]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!studentData) {
    return <div className="text-center mt-5">Student not found</div>;
  }

  return (
    <>
      <StudentProfile isReadOnly={true} externalData={studentData} />

      <div className="container mt-4">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <h5 className="fw-bold mb-4 text-primary">
            <i className="bi bi-graph-up me-2"></i>Applications
          </h5>

          {applications.length === 0 && (
            <div className="text-center text-muted py-4">
              No {filterStatus || ""} applications found
            </div>
          )}

          <div className="d-flex flex-column gap-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-3 border rounded-4 bg-white d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 className="fw-bold mb-1">{app.jobId?.jobTitle}</h6>
                  <div className="text-muted small">
                    {app.jobId?.companyName}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  {app.status === "pending" ? (
                    <>
                      <button
                        className="btn btn-success btn-sm rounded-pill px-3"
                        onClick={async () => {
                          await axios.post("/recruiter/application", {
                            applicationId: app._id,
                            status: "selected",
                          });
                          fetchData(); // 🔥 refresh UI
                        }}
                      >
                        Select
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        onClick={async () => {
                          await axios.post("/recruiter/application", {
                            applicationId: app._id,
                            status: "rejected",
                          });
                          fetchData(); // 🔥 refresh UI
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`badge px-3 py-2 rounded-pill ${
                        app.status === "selected" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {app.status === "selected" ? "Selected" : "Rejected"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecruiterStudentProfile;

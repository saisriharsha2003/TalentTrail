import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useParams } from "react-router-dom";
import StudentProfile from "../Student/StudentProfile";

const RecruiterStudentProfile = () => {
  const { id } = useParams();
  const axios = useAxiosPrivate();

  const [studentData, setStudentData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/recruiter/studentProfile/${id}`);

      setStudentData(res.data.student);
      setApplications(res.data.applications || []);
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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
      {/* ✅ REUSED PROFILE */}
      <StudentProfile
        isReadOnly={true}
        externalData={studentData}
      />

      {/* ✅ RECRUITER ONLY SECTION */}
      <div className="container mt-4">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <h5 className="fw-bold mb-4 text-primary">
            <i className="bi bi-graph-up me-2"></i>Applications
          </h5>

          {applications.length === 0 && (
            <p className="text-muted">No applications</p>
          )}

          <div className="d-flex flex-column gap-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-3 border rounded-4 bg-white d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 className="fw-bold mb-1">
                    {app.jobId?.jobTitle}
                  </h6>
                  <div className="text-muted small">
                    {app.jobId?.companyName}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm rounded-pill px-3"
                    onClick={() =>
                      axios.post("/recruiter/application", {
                        applicationId: app._id,
                        status: "selected",
                      })
                    }
                  >
                    Select
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                    onClick={() =>
                      axios.post("/recruiter/application", {
                        applicationId: app._id,
                        status: "rejected",
                      })
                    }
                  >
                    Reject
                  </button>
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
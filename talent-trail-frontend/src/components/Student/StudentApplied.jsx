import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";

const StudentApplied = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const axios = useAxiosPrivate();

  useEffect(() => {
    const fetchApplied = async () => {
      try {
        const res = await axios.get("/student/applied");
        setAppliedJobs(res?.data || []);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchApplied();
  }, [axios]);

  const filteredJobs = appliedJobs.filter(
    (job) =>
      (job.companyName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (job.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const statusFilteredJobs = filteredJobs.filter(
    (job) => job.status === activeTab,
  );

  const openJobModal = (job) => {
    if (!job) {
      notify("failed", "Job details not available");
      return;
    }
    setSelectedJob(job);
    setShowModal(true);
  };

  const getStatusText = (status) => {
    if (status === "selected") return "🎉 Selected";
    if (status === "rejected") return "❌ Rejected";
    return "⏳ In Progress";
  };

  return (
    <div className="container my-5">
      <div className="mb-4">
        <h2 className="fw-bold">Applied Jobs</h2>
        <p className="text-muted">Track your job applications</p>
      </div>

      <div className="input-group mb-4" style={{ maxWidth: "400px" }}>
        <span className="input-group-text">🔍</span>
        <input
          type="text"
          placeholder="Search by company or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="d-flex gap-3 mb-4">
        <button
          className={`btn ${
            activeTab === "pending" ? "btn-warning" : "btn-outline-warning"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ In Progress
        </button>

        <button
          className={`btn ${
            activeTab === "selected" ? "btn-success" : "btn-outline-success"
          }`}
          onClick={() => setActiveTab("selected")}
        >
          🎉 Selected
        </button>

        <button
          className={`btn ${
            activeTab === "rejected" ? "btn-danger" : "btn-outline-danger"
          }`}
          onClick={() => setActiveTab("rejected")}
        >
          ❌ Rejected
        </button>
      </div>

      <div className="row g-4">
        {statusFilteredJobs.length ? (
          statusFilteredJobs.map((job) => (
            <div key={job._id} className="col-md-6">
              <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                <h5 className="fw-bold">{job.jobTitle}</h5>
                <p className="text-muted mb-2">{job.companyName}</p>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-light text-dark">
                    📍 {job.location || "N/A"}
                  </span>

                  {job.salary && (
                    <span className="badge bg-success">💰 ₹{job.salary}</span>
                  )}

                  <span className="badge bg-light text-dark">
                    📅 {new Date(job.appliedOn).toLocaleDateString()}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">
                    <b>Application ID:</b>
                    <br />
                    {job.applicationId}
                  </small>

                  <span className="text-muted small">
                    {getStatusText(job.status)}
                  </span>
                </div>

                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => openJobModal(job.job)}
                >
                  View Job Details →
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted mt-5">
            <h5>No applications found</h5>
            <p>Try switching tabs or search</p>
          </div>
        )}
      </div>

      {showModal && selectedJob && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1050 }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center border-bottom p-3">
              <h5 className="fw-bold mb-0">{selectedJob.jobTitle}</h5>
              <button
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>

            <div
              style={{
                padding: "20px",
                overflowY: "auto",
                maxHeight: "60vh",
              }}
            >
              <p className="text-muted">{selectedJob.companyName}</p>

              <div className="mb-3">
                <span className="badge bg-light text-dark me-2">
                  📍 {selectedJob.location || "N/A"}
                </span>

                {selectedJob.salaryRange && (
                  <span className="badge bg-success">
                    💰 ₹{selectedJob.salaryRange}
                  </span>
                )}
              </div>

              <h6 className="fw-bold">Job Description</h6>
              <p>{selectedJob.jobDescription}</p>

              {selectedJob.skills?.length > 0 && (
                <>
                  <h6 className="fw-bold mt-3">Skills</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.skills.map((s, i) => (
                      <span key={i} className="badge bg-dark">
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {selectedJob.responsibilities && (
                <>
                  <h6 className="fw-bold mt-3">Responsibilities</h6>
                  <p>{selectedJob.responsibilities}</p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-top p-3 text-end">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplied;

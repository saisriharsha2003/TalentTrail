import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";

const StudentApplied = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredJobs = appliedJobs.filter((job) =>
    (job.companyName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (job.jobTitle || job.jobRole || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "selected":
        return "bg-success";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-warning text-dark";
    }
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

      <div className="row g-4">

        {filteredJobs.length ? (
          filteredJobs.map((job) => (
            <div key={job._id} className="col-md-6">

              <div className="card shadow-sm border-0 rounded-4 p-4 h-100">

                <h5 className="fw-bold">
                  {job.jobTitle || job.jobRole}
                </h5>
                <p className="text-muted mb-2">
                  {job.companyName}
                </p>

                <div className="d-flex flex-wrap gap-2 mb-3">

                  {job.salary && (
                    <span className="badge bg-success">
                      💰 ₹{job.salary}
                    </span>
                  )}

                  <span className={`badge ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>

                  <span className="badge bg-light text-dark">
                    📅 {new Date(job.appliedOn).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center">

                  <small className="text-muted">
                    <p className="fw-bold">Application ID:</p> {job._id?.slice(-6)}
                  </small>

                  <span className="text-muted small">
                    {job.status === "pending"
                      ? "⏳ In Progress"
                      : job.status === "selected"
                      ? "🎉 Selected"
                      : "❌ Rejected"}
                  </span>

                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted mt-5">
            <h5>No applications found</h5>
            <p>Start applying to jobs 🚀</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentApplied;
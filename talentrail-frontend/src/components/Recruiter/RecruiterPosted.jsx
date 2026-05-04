import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { Link } from "react-router-dom";

const RecruiterPosted = () => {
  const [posted, setPosted] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const axios = useAxiosPrivate();

  useEffect(() => {
    const fetchPosted = async () => {
      try {
        const res = await axios.get("/recruiter/jobs");
        setPosted(res?.data || []);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchPosted();
  }, [axios]);

  const filteredJobs = posted.filter((job) =>
    job?.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container my-5">

      <div className="mb-4">
        <h2 className="fw-bold">Posted Jobs</h2>
        <p className="text-muted mb-0">
          Manage and track all your job postings
        </p>
      </div>

      <div className="input-group mb-4" style={{ maxWidth: "500px" }}>
        <span className="input-group-text">🔍</span>
        <input
          type="text"
          placeholder="Search by job title..."
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

                <h5 className="fw-bold">{job.jobTitle}</h5>
                <p className="text-muted mb-2">{job.companyName}</p>

                <div className="d-flex flex-wrap gap-2 mb-3">

                  {job.location && (
                    <span className="badge bg-light text-dark">
                      📍 {job.location}
                    </span>
                  )}

                  {job.salaryRange && (
                    <span className="badge bg-success">
                      💰 ₹{job.salaryRange}
                    </span>
                  )}

                  {job.numberOfOpenings && (
                    <span className="badge bg-info text-dark">
                      🔢 {job.numberOfOpenings}
                    </span>
                  )}

                  {job.experienceRequired && (
                    <span className="badge bg-light text-dark">
                      🧠 {job.experienceRequired}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  {job.skills?.slice(0, 5).map((s, i) => (
                    <span
                      key={i}
                      className="badge bg-dark me-2 mb-2 px-3 py-1 rounded-pill"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center">

                  <small className="text-muted">
                    {job.department || "General"}
                  </small>

                  <Link
                    className="btn btn-outline-primary btn-sm"
                    to={job._id}
                  >
                    View →
                  </Link>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted mt-5">
            <h5>No jobs found</h5>
            <p>Try a different search or post a new job</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecruiterPosted;
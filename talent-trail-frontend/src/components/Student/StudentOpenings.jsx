import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { Link } from "react-router-dom";

const StudentOpenings = () => {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scores, setScores] = useState({});
  const axios = useAxiosPrivate();

  useEffect(() => {
    const fetchOpenings = async () => {
      try {
        const res = await axios.get("/student/jobs");
        console.log(res.data);
        setJobs(res?.data || []);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchOpenings();
  }, [axios]);

  const filteredJobs = jobs.filter((job) =>
    job?.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job?.jobDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchStudent = async () => {
    try {
      const res = await axios.get("/student/details");
      const student = res?.data;

      let profile = "skills:\n";
      profile += student?.academic?.currentEducation?.skills.join(",") + "\n";

      profile += "certifications:\n";
      student?.certifications?.forEach((c) => {
        profile += `${c.name} ${c.organization},`;
      });

      return profile;
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const computeCapability = async (jobId, desc) => {
    try {
      const profile = await fetchStudent();

      const res = await axios.post("/student/capabilityCal", {
        sent1: profile,
        sent2: desc,
      });

      const score = res?.data?.score?.similarity_matrix;

      setScores((prev) => ({ ...prev, [jobId]: score }));
      notify("success", "Capability calculated");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const getColor = (score) => {
    if (score >= 70) return "bg-success";
    if (score >= 50) return "bg-info";
    if (score >= 30) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="container my-5">

      <div className="mb-4">
        <h2 className="fw-bold">Job Openings</h2>
        <p className="text-muted">Find jobs that match your profile</p>
      </div>

      <div className="input-group mb-4" style={{ maxWidth: "400px" }}>
        <span className="input-group-text">🔍</span>
        <input
          type="text"
          placeholder="Search jobs..."
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

                <p className="text-muted small">
                  {job.jobDescription?.slice(0, 120)}...
                </p>

                <div className="mt-auto d-flex justify-content-between align-items-center">

                  <small className="text-muted">
                    {job.department || "General"}
                  </small>

                  <div className="d-flex gap-2">
                    <Link
                      className="btn btn-outline-primary btn-sm"
                      to={job._id}
                    >
                      View →
                    </Link>

                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() =>
                        computeCapability(job._id, job.jobDescription)
                      }
                    >
                      Match ⚡
                    </button>
                  </div>
                </div>

                {scores[job._id] && (
                  <div className="progress mt-3">
                    <div
                      className={`progress-bar ${getColor(scores[job._id])}`}
                      style={{ width: `${scores[job._id]}%` }}
                    >
                      {scores[job._id]}%
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted mt-5">
            <h5>No jobs found</h5>
            <p>Try a different search</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentOpenings;
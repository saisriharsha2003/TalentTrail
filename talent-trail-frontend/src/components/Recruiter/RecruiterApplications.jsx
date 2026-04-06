import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { Link } from "react-router-dom";

const RecruiterApplications = () => {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const axios = useAxiosPrivate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get("/recruiter/applications");
        setApplications(res?.data || []);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchApplications();
  }, [axios]);

  const filteredApplications = (applications || []).filter((app) =>
    (app?.userId?.personal?.fullName || "")
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
        <h2 className="fw-bold">Applications</h2>
        <p className="text-muted">
          Review and manage student applications
        </p>
      </div>

      <div className="input-group mb-4" style={{ maxWidth: "400px" }}>
        <span className="input-group-text">🔍</span>
        <input
          type="text"
          placeholder="Search by student name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="row g-4">

        {filteredApplications.length ? (
          filteredApplications.map((app) => (
            <div key={app._id} className="col-md-6">

              <div className="card shadow-sm border-0 rounded-4 p-4 h-100">

                <h5 className="fw-bold">
                  {app?.userId?.personal?.fullName || "N/A"}
                </h5>

                <div className="mb-3 text-muted small">
                  <div>
                    📅 Applied on:{" "}
                    {new Date(app.appliedOn).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-3">
                  <span className={`badge ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center">

                  <small className="text-muted">
                    ID: {app._id?.slice(-6)}
                  </small>

                  <Link
                    className="btn btn-outline-primary btn-sm"
                    to={app?.userId?._id}
                  >
                    View →
                  </Link>

                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted mt-5">
            <h5>No applications found</h5>
            <p>Try a different search</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecruiterApplications;
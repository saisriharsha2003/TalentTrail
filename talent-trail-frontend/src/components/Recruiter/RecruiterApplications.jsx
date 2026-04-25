import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { Link } from "react-router-dom";

const RecruiterApplications = () => {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const axios = useAxiosPrivate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get("/recruiter/applications");
        console.log(res?.data || []);
        setApplications(res?.data || []);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchApplications();
  }, [axios]);

  const filteredApplications = (applications || [])
    .filter((app) => app.status === activeTab)
    .filter((app) =>
      (app?.userId?.personal?.fullName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
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

  const getCount = (status) =>
    applications.filter((a) => a.status === status).length;

  return (
    <div className="container my-5">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">Applications</h2>
        <p className="text-muted">Review and manage student applications</p>
      </div>

      {/* 🔥 TABS */}
      <div className="mb-4">
        <ul className="nav nav-tabs border-0">
          {[
            { key: "pending", label: "In Progress", color: "warning" },
            { key: "selected", label: "Selected", color: "success" },
            { key: "rejected", label: "Rejected", color: "danger" },
          ].map((tab) => (
            <li key={tab.key} className="nav-item">
              <button
                className={`nav-link border-0 px-4 py-2 fw-semibold ${
                  activeTab === tab.key
                    ? `text-${tab.color} border-bottom border-3 border-${tab.color}`
                    : "text-muted"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}{" "}
                <span className="badge bg-light text-dark ms-1">
                  {getCount(tab.key)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* SEARCH */}
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

      {/* CARDS */}
      <div className="row g-4">
        {filteredApplications.length ? (
          filteredApplications.map((app) => (
            <div key={app._id} className="col-md-6">
              <div className="card shadow-sm border-0 rounded-4 p-4 h-100 application-card">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold mb-0">
                    {app?.userId?.personal?.fullName || "N/A"}
                  </h5>

                  <span className={`badge ${getStatusBadge(app.status)}`}>
                    <span>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </span>
                </div>

                <div className="mb-3 text-muted small">
                  <i className="bi bi-calendar me-1"></i>
                  Applied on {new Date(app.appliedOn).toLocaleDateString()}
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <small className="text-muted">ID: {app.applicationId}</small>

                  <Link
                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
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

      {/* 🔥 HOVER EFFECT */}
      <style>{`
        .application-card {
          transition: all 0.25s ease;
        }

        .application-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
};

export default RecruiterApplications;

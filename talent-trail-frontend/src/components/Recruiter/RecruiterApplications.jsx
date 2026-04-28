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
        setApplications(res?.data || []);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchApplications();
  }, [axios]);

  // ✅ GROUP BY STUDENT
  const groupedApplications = Object.values(
    applications.reduce((acc, app) => {
      const studentId = app?.userId?._id;

      if (!acc[studentId]) {
        acc[studentId] = {
          student: app.userId,
          applications: [],
        };
      }

      acc[studentId].applications.push(app);

      return acc;
    }, {}),
  );

  // ✅ FILTER
  const filteredApplications = groupedApplications
    .map((group) => {
      const filteredApps = group.applications.filter(
        (app) => app.status === activeTab,
      );

      return {
        ...group,
        applications: filteredApps,
      };
    })
    .filter(
      (group) =>
        group.applications.length > 0 &&
        (group?.student?.personal?.fullName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );

  const getCount = (status) =>
    applications.filter((a) => a.status === status).length;

  return (
    <div className="container my-5">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">Applications</h2>
        <p className="text-muted">Review and manage student applications</p>
      </div>

      {/* TABS */}
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
          filteredApplications.map((group) => {
            // ✅ latest application date
            const latestDate = new Date(
              Math.max(
                ...group.applications.map((a) =>
                  new Date(a.appliedOn).getTime(),
                ),
              ),
            );

            return (
              <div key={group.student?._id} className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-4 h-100 application-card">
                  {/* HEADER */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0">
                      {group.student?.personal?.fullName || "N/A"}
                    </h5>

                    {/* ✅ ONLY CHANGE: APPLICATION COUNT BADGE */}
                    <span className="badge bg-primary">
                      {group.applications.length} Applications
                    </span>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {group.applications.length} roles
                    </small>

                    <Link
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      to={`/user/recruiter/applications/${group.student?._id}?status=${activeTab}`}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted mt-5">
            <h5>No applications found</h5>
            <p>Try a different search</p>
          </div>
        )}
      </div>

      {/* HOVER EFFECT */}
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

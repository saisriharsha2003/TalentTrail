import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import "../../assets/styles/dash.css";
import { notify } from "../Toast";
import { Link } from "react-router-dom";
import { Chart as ChartJs, defaults } from "chart.js/auto";
import { Bar, Doughnut, Line, PolarArea } from "react-chartjs-2";
import { useNavigate, useLocation } from "react-router-dom";

const StudentDashboard = () => {
  const [jobsApplied, setJobsApplied] = useState();
  const [jobsSelected, setJobsSelected] = useState(0);
  const [jobsRejected, setJobsRejected] = useState(0);
  const [openings, setOpenings] = useState();
  const [username, setUsername] = useState();
  const [name, setName] = useState();
  const [profile, setProfile] = useState("");
  const [jobs, setJobs] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const axios = useAxiosPrivate();

  useEffect(() => {
    if (errorMsg) {
      notify("failed", errorMsg);
    }
  }, [errorMsg]);

  defaults.responsive = true;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentRes, jobsRes, appliedRes] = await Promise.all([
          axios.get("/student"),
          axios.get("/student/jobs"),
          axios.get("/student/applied"),
        ]);

        // 🔹 Student Data
        const student = studentRes?.data;
        console.log("STUDENT:", student);

        setUsername(student?.username || "");
        setName(student?.personal?.fullName || "");

        if (student?.profile) {
          setProfile(`data:image/jpeg;base64,${student.profile}`);
        }

        // 🔹 Jobs (Openings)
        const jobs = jobsRes?.data || [];
        setOpenings(jobs.length);
        setJobs(jobs);

        // 🔹 Applied Jobs
        const appliedJobs = appliedRes?.data || [];
        setJobsApplied(appliedJobs.length);

        const selectedJobs = appliedJobs.filter((job) =>
          job.status?.toLowerCase().includes("selected")
        );

        const rejectedJobs = appliedJobs.filter((job) =>
          job.status?.toLowerCase().includes("rejected")
        );

        setJobsSelected(selectedJobs.length);
        setJobsRejected(rejectedJobs.length);

      } catch (err) {
        notify("failed", err?.response?.data?.message || "Something went wrong");
      }
    };

    fetchDashboardData();
  }, [axios]);

  const barChartData = {
    labels: ["Openings", "Applied", "Selected", "Rejected"],
    datasets: [
      {
        label: "Count",
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        hoverBorderColor: "#000",
        data: [openings, jobsApplied, jobsSelected, jobsRejected],
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Selected", "Rejected"],
    datasets: [
      {
        label: "Count",
        backgroundColor: [
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        hoverBorderColor: "#000",
        data: [jobsSelected, jobsRejected],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    aspectRatio: 1.3,
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    aspectRatio: 1.3,
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            }}
          >
            <div className="card-body p-4 d-flex align-items-center text-white">
              <div
                    style={{
                    width: "130px",
                    height: "140px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "4px solid rgba(255,255,255,0.5)",
                    boxShadow:
                        "0 0 0 4px rgba(255,255,255,0.2), 0 8px 30px rgba(0,0,0,0.3)",
                    backgroundColor: "#fff",
                    marginRight: "20px",
                    }}
                >
                    {profile ? (
                    <img
                        src={profile}
                        alt="Profile"
                        style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center top",
                        }}
                    />
                    ) : (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <i className="bi bi-person-circle text-secondary fs-1"></i>
                    </div>
                    )}
                </div>
              <div>
                <h2 className="fw-bold mb-1">Welcome back, {name}! 👋</h2>
                <p className="mb-0 opacity-75">
                  Your career journey starts here. Explore new opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-4">
        {[
          {
            label: "Job Openings",
            value: openings,
            color: "#4f46e5",
            icon: "bi-briefcase",
            path: "/user/student/jobOpenings",
          },
          {
            label: "Applied Jobs",
            value: jobsApplied,
            color: "#10b981",
            icon: "bi-check-circle",
            path: "/user/student/applied",
          },
          {
            label: "Shortlisted",
            value: jobsSelected,
            color: "#f59e0b",
            icon: "bi-patch-check",
            path: "/user/student/applied",
          },
          {
            label: "Rejected",
            value: jobsRejected,
            color: "#ef4444",
            icon: "bi-x-circle",
            path: "/user/student/applied",
          },
        ].map((stat, i) => (
          <div key={i} className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm rounded-4 h-100 stat-card"
              onClick={() => navigate(stat.path)}
              style={{ cursor: "pointer", transition: "0.3s" }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="rounded-3 p-3"
                    style={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    <i className={`bi ${stat.icon} fs-4`}></i>
                  </div>
                  <span className="text-muted small fw-medium">View</span>
                </div>
                <h3 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                  {stat.value}
                </h3>
                <p className="text-muted mb-0 fw-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                <i className="bi bi-bar-chart-fill text-primary me-2"></i>
                Application Overview
              </h5>
              <div style={{ height: "350px" }}>
                <Bar
                  data={barChartData}
                  options={{ ...barChartOptions, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4 text-center">
              <h5 className="fw-bold mb-4 text-start d-flex align-items-center">
                <i className="bi bi-pie-chart-fill text-warning me-2"></i>
                Selection Status
              </h5>
              <div
                style={{
                  height: "350px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Doughnut
                  data={doughnutChartData}
                  options={{
                    ...doughnutChartOptions,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

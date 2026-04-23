import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import "../../assets/styles/dash.css";
import { notify } from "../Toast";
import { Chart as ChartJs, defaults } from "chart.js/auto";
import { Bar, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

const RecruiterDashboard = () => {
  const [posted, setPosted] = useState(0);
  const [applicantsSelected, setApplicantsSelected] = useState(0);
  const [applicantsRejected, setApplicantsRejected] = useState(0);
  const [applicants, setApplicants] = useState(0);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState("");

  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  defaults.responsive = true;

  useEffect(() => {
    const fetchRecruiter = async () => {
      try {
        const response = await axios.get("/recruiter");
        const recruiter = response?.data;

        setPosted(recruiter?.posted || 0);
        setApplicants(recruiter?.applicants || 0);
        setApplicantsSelected(recruiter?.selected || 0);
        setApplicantsRejected(recruiter?.rejected || 0);
        setUsername(recruiter?.username || "");
        setName(recruiter?.name || "");

        if (recruiter?.profile) {
          setProfile(`data:image/jpeg;base64,${recruiter.profile}`);
        }
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };

    fetchRecruiter();
  }, [axios]);

  const barChartData = {
    labels: ["Posted", "Applicants", "Selected", "Rejected"],
    datasets: [
      {
        label: "Count",
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 1,
        data: [posted, applicants, applicantsSelected, applicantsRejected],
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Selected", "Rejected"],
    datasets: [
      {
        label: "Count",
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 1,
        data: [applicantsSelected, applicantsRejected],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    aspectRatio: 1.3,
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

        {/* 🔷 HEADER */}
        <div className="row mb-4">
            <div className="col-12">
            <div
                className="card border-0 rounded-4 overflow-hidden"
                style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                boxShadow: "0 10px 40px rgba(37, 99, 235, 0.4)",
                backdropFilter: "blur(10px)",
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

                {/* Text */}
                <div>
                    <h2 className="fw-bold mb-1">
                    Welcome back, {name}! 👋
                    </h2>
                    <p className="mb-0 opacity-75">
                    Manage your hiring and track applicants efficiently.
                    </p>
                </div>
                </div>
            </div>
            </div>
        </div>

      {/* 🔷 STATS */}
      <div className="row g-4 mb-4">
        {[
          {
            label: "Jobs Posted",
            value: posted,
            color: "#4f46e5",
            icon: "bi-briefcase",
            path: "/user/recruiter/posted",
          },
          {
            label: "Total Applicants",
            value: applicants,
            color: "#3b82f6",
            icon: "bi-people",
            path: "/user/recruiter/applications",
          },
          {
            label: "Selected",
            value: applicantsSelected,
            color: "#10b981",
            icon: "bi-check-circle",
          },
          {
            label: "Rejected",
            value: applicantsRejected,
            color: "#ef4444",
            icon: "bi-x-circle",
          },
        ].map((stat, i) => (
          <div key={i} className="col-md-6 col-lg-3">
            <div
              className="card border-0 rounded-4 h-100"
              onClick={() => stat.path && navigate(stat.path)}
              style={{
                cursor: stat.path ? "pointer" : "default",
                transition: "all 0.3s ease",
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div
                    className="rounded-3 p-3"
                    style={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    <i className={`bi ${stat.icon} fs-4`}></i>
                  </div>
                </div>
                <h3 className="fw-bold">{stat.value}</h3>
                <p className="text-muted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔷 CHARTS */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div
            className="card border-0 rounded-4 h-100"
            style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-bar-chart-fill text-primary me-2"></i>
                Hiring Overview
              </h5>
              <div style={{ height: "350px" }}>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div
            className="card border-0 rounded-4 h-100"
            style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-pie-chart-fill text-warning me-2"></i>
                Selection Status
              </h5>
              <div style={{ height: "350px" }}>
                <Doughnut data={doughnutChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RecruiterDashboard;
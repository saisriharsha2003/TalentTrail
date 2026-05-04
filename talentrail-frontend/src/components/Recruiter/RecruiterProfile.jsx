import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useNavigate } from "react-router-dom";

const RecruiterProfile = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("company");

  const [disabled, setDisabled] = useState({
    company: true,
    recruiter: true,
    account: true,
  });

  const [company, setCompany] = useState({});
  const [recruiter, setRecruiter] = useState({});
  const [profile, setProfile] = useState("");
  const [username, setUsername] = useState("");
  const [prevPassword, setPrevPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const bufferToBase64 = (buffer) => {
    const chunkSize = 100000;
    let base64 = "";
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      base64 += String.fromCharCode.apply(null, chunk);
    }
    return btoa(base64);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/recruiter/details");
        const data = res.data;

        if (!data?.company || !data?.recruiterDetail)
          return navigate("/recruiterRegister");

        setCompany(data.company);
        setRecruiter(data.recruiterDetail);
        setUsername(data.username);

        if (data.company?.logo?.data) {
          setProfile(
            `data:image/jpeg;base64,${bufferToBase64(data.company.logo.data)}`,
          );
        }
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };

    fetchData();
  }, [axios, navigate]);

  const handleCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/recruiter/company", company);
      notify("success", "Company updated");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleRecruiter = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/recruiter/recruiterDetails", recruiter);
      notify("success", "Recruiter updated");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleLogo = async (e) => {
    e.preventDefault();
    try {
      const file = document.getElementById("profile").files[0];
      if (!file) return;

      const fd = new FormData();
      fd.append("profile", file);

      await axios.post("/recruiter/profile", fd);
      notify("success", "Logo updated");
      window.location.reload();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleUsername = async (e) => {
    e.preventDefault();
    await axios.put("/username", { newUsername: username });
    notify("success", "Username updated");
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    await axios.put("/password", { prevPassword, newPassword });
    notify("success", "Password updated");
    setPrevPassword("");
    setNewPassword("");
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="mx-auto" style={{ width: "95%" }}>
        {/* 🔷 HEADER CARD */}
        <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
          <div className="bg-primary p-4 text-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="position-relative me-4">
                <img
                  src={profile || "https://via.placeholder.com/100"}
                  alt="Company Logo"
                  className="rounded-circle border border-3 border-white shadow"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div>
                <h3 className="fw-bold mb-1">{company?.name || "Company"}</h3>
                <p className="mb-0 opacity-75">{recruiter?.fullName}</p>
                <span className="badge bg-white text-primary rounded-pill mt-2">
                  {company?.industry}
                </span>
              </div>
            </div>
          </div>

          {/* 🔷 TABS */}
          <div className="card-body p-0 bg-white">
            <ul className="nav nav-tabs border-0 px-4">
              {["company", "recruiter", "account"].map((tab) => (
                <li className="nav-item" key={tab}>
                  <button
                    className={`nav-link border-0 px-4 py-3 fw-semibold text-capitalize ${
                      activeTab === tab
                        ? "text-primary border-bottom border-primary border-3 active"
                        : "text-muted"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 🔷 CONTENT */}
        <div className="animate__animated animate__fadeIn">
          {/* ================= COMPANY ================= */}
          {activeTab === "company" && (
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h5 className="fw-bold mb-4 text-primary">
                <i className="bi bi-building me-2"></i>Company Details
              </h5>

              <form onSubmit={handleCompany} className="row g-3">
                <div className="col-md-6 form-floating">
                  <input
                    className="form-control"
                    value={company.name}
                    onChange={(e) =>
                      setCompany({ ...company, name: e.target.value })
                    }
                    required
                  />
                  <label className="ms-2">Company Name</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input
                    className="form-control"
                    value={company.industry}
                    onChange={(e) =>
                      setCompany({ ...company, industry: e.target.value })
                    }
                    required
                  />
                  <label className="ms-2">Industry</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input
                    className="form-control"
                    value={company.size}
                    onChange={(e) =>
                      setCompany({ ...company, size: e.target.value })
                    }
                  />
                  <label className="ms-2">Company Size</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input
                    className="form-control"
                    value={company.website}
                    onChange={(e) =>
                      setCompany({ ...company, website: e.target.value })
                    }
                  />
                  <label className="ms-2">Website</label>
                </div>

                <div className="col-12 form-floating">
                  <textarea
                    className="form-control"
                    style={{ height: "100px" }}
                    value={company.overview}
                    onChange={(e) =>
                      setCompany({ ...company, overview: e.target.value })
                    }
                  />
                  <label className="ms-2">Overview</label>
                </div>

                <div className="text-end mt-3">
                  <button className="btn btn-primary px-5 rounded-pill fw-bold">
                    Save Company
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= RECRUITER ================= */}
          {activeTab === "recruiter" && (
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h5 className="fw-bold mb-4 text-success">
                <i className="bi bi-person-badge-fill me-2"></i>Recruiter
                Details
              </h5>

              <form onSubmit={handleRecruiter} className="row g-3">
                <div className="col-md-6 form-floating">
                  <input
                    className="form-control"
                    value={recruiter.fullName}
                    onChange={(e) =>
                      setRecruiter({ ...recruiter, fullName: e.target.value })
                    }
                    required
                  />
                  <label className="ms-2">Full Name</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input
                    className="form-control"
                    value={recruiter.position}
                    onChange={(e) =>
                      setRecruiter({ ...recruiter, position: e.target.value })
                    }
                  />
                  <label className="ms-2">Position</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input
                    className="form-control"
                    value={recruiter.email}
                    onChange={(e) =>
                      setRecruiter({ ...recruiter, email: e.target.value })
                    }
                  />
                  <label className="ms-2">Email</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input
                    className="form-control"
                    value={recruiter.mobile}
                    onChange={(e) =>
                      setRecruiter({ ...recruiter, mobile: e.target.value })
                    }
                  />
                  <label className="ms-2">Mobile</label>
                </div>

                <div className="text-end mt-3">
                  <button className="btn btn-success px-5 rounded-pill fw-bold">
                    Save Recruiter
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= ACCOUNT ================= */}
          {activeTab === "account" && (
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-primary">Username</h5>

                  <form onSubmit={handleUsername}>
                    <div className="form-floating mb-3">
                      <input
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <label>Username</label>
                    </div>

                    <button className="btn btn-primary w-100 rounded-pill fw-bold">
                      Update Username
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-danger">Password</h5>

                  <form onSubmit={handlePassword}>
                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className="form-control"
                        value={prevPassword}
                        onChange={(e) => setPrevPassword(e.target.value)}
                      />
                      <label>Old Password</label>
                    </div>

                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <label>New Password</label>
                    </div>

                    <button className="btn btn-danger w-100 rounded-pill fw-bold">
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text" }) => (
  <div className="col-md-6 form-floating">
    <input
      className="form-control"
      value={value || ""}
      type={type}
      onChange={(e) => onChange(e.target.value)}
    />
    <label className="ms-2">{label}</label>
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div className="col-12 form-floating">
    <textarea
      className="form-control"
      style={{ height: "100px" }}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
    <label className="ms-2">{label}</label>
  </div>
);

export default RecruiterProfile;

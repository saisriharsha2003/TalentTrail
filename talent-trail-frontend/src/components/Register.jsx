import React, { useState } from "react";
import axios from "../api/axios";
import { notify } from "./Toast";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [matchPassword, setMatchPassword] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== matchPassword) {
      notify("failed", "Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("/register", { username, password, role });

      notify("success", res?.data?.success);

      const login = await axios.post("/login", { username, password, role });
      localStorage.setItem("accessToken", login?.data?.accessToken);

      if (role.toLowerCase() === "student") {
        navigate("/uploadResume");
      } else {
        navigate("/" + role + "Register");
      }

    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0">
      <div className="row g-0 min-vh-100">

        <div className="col-lg-6 d-flex justify-content-center align-items-center bg-light">

          <div
            className="p-4 rounded-4"
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
              transition: "0.3s"
            }}
          >
            <div className="text-center mb-4">
              <h2 className="fw-bold">Talentrail</h2>
              <p className="text-muted">Create your account</p>
            </div>

            <form onSubmit={handleSubmit}>

              <Input label="Username" value={username} onChange={setUsername} />
              <Input label="Password" type="password" value={password} onChange={setPassword} />
              <Input label="Confirm Password" type="password" value={matchPassword} onChange={setMatchPassword} />

              <div className="mb-3">
                <label className="form-label">Role</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} required>
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="college">College</option>
                </select>
              </div>

              <button className="btn btn-primary w-100 mt-2 fw-semibold">
                Sign Up
              </button>

            </form>
          </div>
        </div>

        <div
          className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center text-white"
          style={{
            background: "radial-gradient(circle at 20% 20%, #3b82f6, #1e3a8a 60%)"
          }}
        >
          <div className="px-5" style={{ maxWidth: "500px" }}>
            <h1 className="fw-bold mb-3">Welcome to Talentrail 🚀</h1>
            <p className="mb-4">Discover opportunities and connect with recruiters.</p>

            <div>
              <p className="fw-semibold">✨ Smart job matching</p>
              <p className="fw-semibold">📊 Recruiter insights</p>
              <p className="fw-semibold">🚀 Faster hiring</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text" }) => (
  <div className="mb-3">
    <label className="form-label fw-medium">{label}</label>
    <input
      type={type}
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      style={{
        background: "#fff",
        color: "#111827",        // 🔥 dark text
        border: "1px solid #d1d5db", // 🔥 visible border
      }}
    />
  </div>
);

export default Register;
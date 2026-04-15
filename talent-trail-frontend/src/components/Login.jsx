import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { notify } from "./Toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname;

  useEffect(() => {
    const stored = localStorage.getItem("acctype");
    if (stored) {
      localStorage.removeItem("acctype");
      setRole(stored);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/login", { username, password, role });

      login(res?.data?.accessToken); // ✅ IMPORTANT FIX

      if (res?.data?.success) notify("success", res.data.success);

      navigate(from || "/user/" + role, { replace: true });

    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0">
      <div className="row g-0 min-vh-100">

        <div
          className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center text-white"
          style={{
            background: "radial-gradient(circle at 20% 20%, #3b82f6, #1e3a8a 60%)"
          }}
        >
          <div className="px-5" style={{ maxWidth: "500px" }}>
            <h1 className="fw-bold mb-3">Welcome Back 👋</h1>
            <p className="mb-4">Continue your journey with Talentrail.</p>

            <div>
              <p className="fw-semibold">✔ Track applications</p>
              <p className="fw-semibold">✔ Connect with recruiters</p>
              <p className="fw-semibold">✔ Discover opportunities</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 d-flex justify-content-center align-items-center bg-light">

          <div
            className="p-4 rounded-4"
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
            }}
          >

            <div className="text-center mb-4">
              <h2 className="fw-bold">Talentrail</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit}>

              <Input label="Username" value={username} onChange={setUsername} />
              <Input label="Password" type="password" value={password} onChange={setPassword} />

              <div className="mb-3">
                <label className="form-label">Role</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} required>
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="college">College</option>
                </select>
              </div>

              <button className="btn btn-primary w-100 mt-2 fw-semibold">
                Sign In
              </button>

              <p className="text-center mt-3 mb-0">
                Don’t have an account? <a href="/register">Sign Up</a>
              </p>

            </form>
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
        color: "#111827",        
        border: "1px solid #d1d5db", 
      }}
    />
  </div>
);

export default Login;
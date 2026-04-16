import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { notify } from "./Toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/login", { username, password, role });

      login(res?.data?.accessToken); // ✅ IMPORTANT FIX

      if (res?.data?.success) notify("success", res.data.success);

      navigate(from || "/user/" + role, { replace: true });

    } catch (err) {
      notify("failed", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden bg-white">
      <div className="row g-0 min-vh-100">
        {/* Left Side: Visual Content */}
        <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center bg-primary text-white p-5 position-relative">
          <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25" 
               style={{ background: 'radial-gradient(circle at 20% 30%, #ffffff 0%, transparent 50%)' }}></div>
          
          <div className="text-center z-1 animate__animated animate__fadeInLeft">
            <div className="mb-4">
              <i className="bi bi-rocket-takeoff display-1"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">TalentTrail</h1>
            <p className="fs-4 opacity-75 mb-5">Where top talent meets <br/>world-class opportunities.</p>
            
            <div className="row g-4 text-start mt-4 px-5">
              <div className="col-12 d-flex align-items-center gap-3">
                <div className="rounded-circle bg-white bg-opacity-20 p-2"><i className="bi bi-check2"></i></div>
                <span>AI-Powered Resume Analysis</span>
              </div>
              <div className="col-12 d-flex align-items-center gap-3">
                <div className="rounded-circle bg-white bg-opacity-20 p-2"><i className="bi bi-check2"></i></div>
                <span>Verified Campus Placements</span>
              </div>
              <div className="col-12 d-flex align-items-center gap-3">
                <div className="rounded-circle bg-white bg-opacity-20 p-2"><i className="bi bi-check2"></i></div>
                <span>Direct Recruiter Interaction</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div className="w-100 animate__animated animate__fadeInRight" style={{ maxWidth: '450px' }}>
            <div className="mb-5 text-center text-lg-start">
              <h2 className="fw-bold text-dark display-6 mb-2">Welcome Back</h2>
              <p className="text-muted">Sign in to your professional trail</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-floating mb-3 shadow-sm">
                <input
                  type="text"
                  className="form-control border-0 rounded-3 bg-light"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <label htmlFor="username">Username</label>
              </div>
              <div className="form-floating mb-3 shadow-sm">
                <input
                  type="password"
                  className="form-control border-0 rounded-3 bg-light"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="password">Password</label>
              </div>
              <div className="form-floating mb-4 shadow-sm">
                <select 
                  className="form-select border-0 rounded-3 bg-light" 
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)} 
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="college">College</option>
                </select>
                <label htmlFor="role">Role</label>
              </div>

              <div className="d-grid mb-4">
                <button className="btn btn-primary btn-lg rounded-3 fw-bold shadow-sm py-3" type="submit" disabled={loading}>
                  {loading ? (
                    <div className="spinner-border spinner-border-sm me-2"></div>
                  ) : 'Sign In Now'}
                </button>
              </div>

              <div className="text-center">
                <span className="text-muted">New to TalentTrail? </span>
                <Link to="/register" className="text-primary fw-bold text-decoration-none border-bottom border-primary">Create Account</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
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
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (errorMsg) {
      notify("failed", errorMsg);
    }
  }, [errorMsg]);

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
      // 🔥 Clear old session (important for role switching)
      await axios.post("/logout", {}, { withCredentials: true });

      localStorage.removeItem("accessToken");

      const res = await axios.post(
        "/login",
        { username, password, role },
        { withCredentials: true }
      );

      const token = res?.data?.accessToken;
      if (!token) throw new Error("No token received");

      login(token);

      notify("success", res?.data?.success || "Login successful");

      navigate("/user/" + role, { replace: true });
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden bg-white">
      <div className="row g-0 min-vh-100">

        {/* LEFT SIDE */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center position-relative modern-login-left">
          <div className="overlay-bg"></div>

          <div className="content-wrapper text-white">
            <h1 className="fw-bold display-5 mb-3">
              Welcome to TalenTrail 🚀
            </h1>

            <p className="lead opacity-75 mb-5">
              Smart hiring. Faster placements. Better careers.
            </p>

            <div className="login-feature-grid">
              <div className="login-feature-card">
                <i className="bi bi-robot"></i>
                <div>
                  <h5>Resume Parsing</h5>
                  <p>Extract key details instantly from resumes</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-people"></i>
                <div>
                  <h5>Compatibility Score</h5>
                  <p>Match candidates with the right opportunities</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-bar-chart"></i>
                <div>
                  <h5>Analytics</h5>
                  <p>Track placements and performance insights</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-shield-lock"></i>
                <div>
                  <h5>Secure Profiles</h5>
                  <p>Safe and verified user data protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div
            className="w-100 animate__animated animate__fadeInRight"
            style={{ maxWidth: "450px" }}
          >
            <div className="mb-5 text-center text-lg-start">
              <h2 className="fw-bold text-dark display-6 mb-2">
                Welcome Back
              </h2>
              <p className="text-muted">
                Login to your professional trail
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Username */}
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

              {/* Password */}
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

              {/* Role */}
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

              {/* Button */}
              <div className="d-grid mb-4">
                <button
                  className="btn btn-primary btn-lg rounded-3 fw-bold shadow-sm py-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm me-2"></div>
                  ) : (
                    "Login Now"
                  )}
                </button>
              </div>

              {/* Links */}
              <div className="text-center d-flex flex-column gap-2">
                <div>
                  <span className="text-muted">New to TalenTrail? </span>
                  <Link
                    to="/register"
                    className="text-primary fw-bold text-decoration-underline"
                  >
                    Create Account
                  </Link>
                </div>

                <Link
                  to="/forgotPassword"
                  className="text-danger fw-bold text-decoration-underline"
                >
                  Forgot Password?
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
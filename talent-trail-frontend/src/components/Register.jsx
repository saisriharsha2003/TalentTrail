import React, { useState } from "react";
import axios from "../api/axios";
import { notify } from "./Toast";
import { useNavigate, Link } from "react-router-dom";

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
    <div className="container-fluid min-vh-100 p-0 overflow-hidden bg-white">
      <div className="row g-0 min-vh-100">
        {/* Left Side: Register Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div className="w-100 animate__animated animate__fadeInLeft" style={{ maxWidth: '450px' }}>
            <div className="mb-5 text-center text-lg-start">
              <h2 className="fw-bold text-dark display-6 mb-2">Create Account</h2>
              <p className="text-muted">Join the next generation of campus recruitment</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3 shadow-sm">
                <input
                  type="text"
                  className="form-control border-0 rounded-3 bg-light"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={8}
                  maxLength={30}
                  required
                />
                <label htmlFor="username">Username (min 8 chars)</label>
              </div>
              <div className="form-floating mb-3 shadow-sm">
                <input
                  type="password"
                  className="form-control border-0 rounded-3 bg-light"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <label htmlFor="password">Password (min 8 chars)</label>
              </div>
              <div className="form-floating mb-3 shadow-sm">
                <input
                  type="password"
                  className="form-control border-0 rounded-3 bg-light"
                  id="matchPassword"
                  placeholder="Confirm Password"
                  value={matchPassword}
                  onChange={(e) => setMatchPassword(e.target.value)}
                  required
                />
                <label htmlFor="matchPassword">Confirm Password</label>
              </div>
              <div className="form-floating mb-4 shadow-sm">
                <select
                  className="form-select border-0 rounded-3 bg-light"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">I am a...</option>
                  <option value="student">Student</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="college">College</option>
                </select>
                <label htmlFor="role">Select Role</label>
              </div>

              <div className="d-grid mb-4">
                <button className="btn btn-primary btn-lg rounded-3 fw-bold shadow-sm py-3" type="submit">
                  Get Started 🚀
                </button>
              </div>

              <div className="text-center">
                                <span className="text-muted">Already have an account? </span>
                                <Link to="/login" className="text-primary fw-bold text-decoration-none border-bottom border-primary">Sign In</Link>
                            </div>
            </form>
          </div>
        </div>

        {/* Right Side: Visual Content */}
        <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center bg-primary text-white p-5 position-relative">
          <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
            style={{ background: 'radial-gradient(circle at 80% 70%, #ffffff 0%, transparent 50%)' }}></div>

          <div className="text-center z-1 animate__animated animate__fadeInRight">
            <div className="mb-4">
              <i className="bi bi-people display-1"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">Join the Community</h1>
            <p className="fs-4 opacity-75 mb-5">Build your career profile and <br />start your journey today.</p>

            <div className="row g-4 text-start mt-4 px-5">
              <div className="col-12 d-flex align-items-center gap-3">
                <div className="rounded-circle bg-white bg-opacity-20 p-2"><i className="bi bi-star"></i></div>
                <span>Get noticed by top companies</span>
              </div>
              <div className="col-12 d-flex align-items-center gap-3">
                <div className="rounded-circle bg-white bg-opacity-20 p-2"><i className="bi bi-shield-check"></i></div>
                <span>Secure and verified data</span>
              </div>
              <div className="col-12 d-flex align-items-center gap-3">
                <div className="rounded-circle bg-white bg-opacity-20 p-2"><i className="bi bi-lightning"></i></div>
                <span>Fast and easy registration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
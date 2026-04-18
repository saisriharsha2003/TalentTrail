import React, { useState } from "react";
import axios from "../api/axios";
import { notify } from "./Toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/forgot-password", { email });

      notify("success", "OTP sent to your email");

      navigate("/resetPassword", { state: { email } });
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden bg-white">
      <div className="row g-0 min-vh-100">
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div
            className="w-100 animate__animated animate__fadeInRight"
            style={{ maxWidth: "450px" }}
          >
            <div className="mb-5 text-center text-lg-start">
              <h2 className="fw-bold text-dark display-6 mb-2">
                Forgot Password
              </h2>
              <p className="text-muted">
                Enter your email to receive an OTP
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-4 shadow-sm">
                <input
                  type="email"
                  className="form-control border-0 rounded-3 bg-light"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="email">Email Address</label>
              </div>

              <div className="d-grid mb-4">
                <button
                  className="btn btn-primary btn-lg rounded-3 fw-bold shadow-sm py-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm me-2"></div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center position-relative modern-login-left">
          <div className="overlay-bg"></div>

          <div className="content-wrapper text-white">
            <h1 className="fw-bold display-5 mb-3">
              Reset Your Password 🔐
            </h1>

            <p className="lead opacity-75 mb-5">
              Don’t worry. We’ll help you get back on track quickly.
            </p>

            <div className="login-feature-grid">
              <div className="login-feature-card">
                <i className="bi bi-shield-lock"></i>
                <div>
                  <h5>Secure Reset</h5>
                  <p>Your data is protected during password reset</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-envelope"></i>
                <div>
                  <h5>Email Verification</h5>
                  <p>OTP will be sent securely to your email</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-clock-history"></i>
                <div>
                  <h5>Quick Process</h5>
                  <p>Reset your password in just a few seconds</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-check-circle"></i>
                <div>
                  <h5>Easy Access</h5>
                  <p>Regain access to your account instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
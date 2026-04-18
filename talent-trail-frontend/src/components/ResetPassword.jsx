import React, { useState } from "react";
import axios from "../api/axios";
import { notify } from "./Toast";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/reset-password", {
        email,
        otp,
        newPassword
      });

      notify("success", "Password reset successful");

      navigate("/login");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden bg-white">
      <div className="row g-0 min-vh-100">

        {/* LEFT SIDE SAME STYLE */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center position-relative modern-login-left">
          <div className="overlay-bg"></div>

          <div className="content-wrapper text-white">
            <h1 className="fw-bold display-5 mb-3">
              Complete Your Reset 🔐
            </h1>

            <p className="lead opacity-75 mb-5">
              Enter your OTP and set a new password securely.
            </p>

            <div className="login-feature-grid">
              <div className="login-feature-card">
                <i className="bi bi-shield-check"></i>
                <div>
                  <h5>Secure Verification</h5>
                  <p>OTP ensures your identity is protected</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-lock"></i>
                <div>
                  <h5>Strong Protection</h5>
                  <p>Update your password safely</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-lightning"></i>
                <div>
                  <h5>Quick Process</h5>
                  <p>Reset your password instantly</p>
                </div>
              </div>

              <div className="login-feature-card">
                <i className="bi bi-check-circle"></i>
                <div>
                  <h5>Access Restored</h5>
                  <p>Get back to your account immediately</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div
            className="w-100 animate__animated animate__fadeInRight"
            style={{ maxWidth: "450px" }}
          >
            <div className="mb-5 text-center text-lg-start">
              <h2 className="fw-bold text-dark display-6 mb-2">
                Reset Password
              </h2>
              <p className="text-muted">
                Enter OTP and your new password
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="form-floating mb-3 shadow-sm">
                <input
                  type="email"
                  className="form-control border-0 rounded-3 bg-light"
                  value={email}
                  disabled
                />
                <label>Email</label>
              </div>

              {/* OTP */}
              <div className="form-floating mb-3 shadow-sm">
                <input
                  type="text"
                  className="form-control border-0 rounded-3 bg-light"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <label>Enter OTP</label>
              </div>

              {/* New Password */}
              <div className="form-floating mb-4 shadow-sm">
                <input
                  type="password"
                  className="form-control border-0 rounded-3 bg-light"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <label>New Password</label>
              </div>

              {/* Button */}
              <div className="d-grid mb-4">
                <button
                  className="btn btn-success btn-lg rounded-3 fw-bold shadow-sm py-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm me-2"></div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>

              {/* Back */}
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

      </div>
    </div>
  );
};

export default ResetPassword;
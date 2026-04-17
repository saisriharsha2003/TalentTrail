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
      <div className="row justify-content-center">
        <div className="col-12 px-md-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            {/* HEADER (same as college) */}
            <div className="bg-primary p-4 text-white d-flex align-items-center">
              <div className="me-4">
                {profile ? (
                  <img
                    src={profile}
                    className="rounded-circle border border-3 border-white-50"
                    height="80"
                    width="80"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="bg-white-50 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-building fs-1"></i>
                  </div>
                )}
              </div>
              <div>
                <h3 className="fw-bold mb-1">
                  {company.name || "Recruiter Profile"}
                </h3>
                <p className="mb-0 opacity-75">{username}</p>
              </div>
            </div>

            {/* TABS (same structure) */}
            <div className="card-header bg-white border-bottom-0 p-0">
              <ul className="nav nav-tabs nav-fill border-0">
                {[
                  { id: "company", label: "Company", icon: "bi-building" },
                  { id: "recruiter", label: "Recruiter", icon: "bi-person" },
                  { id: "profile", label: "Profile", icon: "bi-image" },
                  { id: "account", label: "Account", icon: "bi-shield-lock" },
                ].map((tab) => (
                  <li key={tab.id} className="nav-item">
                    <button
                      className={`nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-2 
                      ${activeTab === tab.id ? "active border-bottom border-primary border-3 text-primary fw-bold" : "text-muted"}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`bi ${tab.icon}`}></i>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* BODY */}
            <div className="card-body p-4 p-md-5 bg-white">
              {/* COMPANY */}
              {activeTab === "company" && (
                <form>
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="fw-bold mb-0">Company Details</h5>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() =>
                        setDisabled({ ...disabled, company: !disabled.company })
                      }
                    >
                      {disabled.company ? "Edit" : "Cancel"}
                    </button>
                  </div>

                  <fieldset disabled={disabled.company}>
                    <div className="row g-3">
                      <Input
                        label="Name"
                        value={company.name}
                        onChange={(v) => setCompany({ ...company, name: v })}
                      />
                      <Input
                        label="Industry"
                        value={company.industry}
                        onChange={(v) =>
                          setCompany({ ...company, industry: v })
                        }
                      />
                      <Input
                        label="Website"
                        value={company.website}
                        onChange={(v) => setCompany({ ...company, website: v })}
                      />
                      <Input
                        label="Mobile"
                        value={company.mobile}
                        onChange={(v) => setCompany({ ...company, mobile: v })}
                      />
                      <Textarea
                        label="Address"
                        value={company.address}
                        onChange={(v) => setCompany({ ...company, address: v })}
                      />
                    </div>
                    {!disabled.company && (
                      <button
                        className="btn btn-primary mt-4"
                        onClick={handleCompany}
                      >
                        Save Changes
                      </button>
                    )}
                  </fieldset>
                </form>
              )}

              {/* RECRUITER */}
              {activeTab === "recruiter" && (
                <form>
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="fw-bold mb-0">Recruiter Details</h5>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() =>
                        setDisabled({
                          ...disabled,
                          recruiter: !disabled.recruiter,
                        })
                      }
                    >
                      {disabled.recruiter ? "Edit" : "Cancel"}
                    </button>
                  </div>

                  <fieldset disabled={disabled.recruiter}>
                    <div className="row g-3">
                      <Input
                        label="Full Name"
                        value={recruiter.fullName}
                        onChange={(v) =>
                          setRecruiter({ ...recruiter, fullName: v })
                        }
                      />
                      <Input
                        label="Position"
                        value={recruiter.position}
                        onChange={(v) =>
                          setRecruiter({ ...recruiter, position: v })
                        }
                      />
                      <Input
                        label="Email"
                        value={recruiter.email}
                        onChange={(v) =>
                          setRecruiter({ ...recruiter, email: v })
                        }
                      />
                      <Input
                        label="Mobile"
                        value={recruiter.mobile}
                        onChange={(v) =>
                          setRecruiter({ ...recruiter, mobile: v })
                        }
                      />
                    </div>
                    {!disabled.recruiter && (
                      <button
                        className="btn btn-primary mt-4"
                        onClick={handleRecruiter}
                      >
                        Save Changes
                      </button>
                    )}
                  </fieldset>
                </form>
              )}

              {/* PROFILE */}
              {activeTab === "profile" && (
                <div>
                  <h5 className="fw-bold mb-4">Company Logo</h5>
                  <div className="d-flex align-items-center gap-4 p-3 bg-light rounded-4">
                    {profile && (
                      <img
                        src={profile}
                        className="rounded-circle"
                        height="80"
                      />
                    )}
                    <div>
                      <input
                        type="file"
                        id="profile"
                        className="form-control mb-2"
                      />
                      <button
                        className="btn btn-dark btn-sm rounded-pill px-4"
                        onClick={handleLogo}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ACCOUNT */}
              {activeTab === "account" && (
                <div className="container" style={{ maxWidth: "600px" }}>
                  <h5 className="fw-bold mb-4 text-center">Account Security</h5>

                  <div className="row g-3">
                    <div className="col-12 form-floating">
                      <input
                        className="form-control"
                        value={username || ""}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <label>Username</label>
                    </div>

                    <div className="col-12 form-floating">
                      <input
                        type="password"
                        className="form-control"
                        value={prevPassword || ""}
                        onChange={(e) => setPrevPassword(e.target.value)}
                      />
                      <label>Current Password</label>
                    </div>

                    <div className="col-12 form-floating">
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword || ""}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <label>New Password</label>
                    </div>
                  </div>

                  <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                    <button
                      className="btn btn-primary px-4"
                      onClick={handleUsername}
                    >
                      Update Username
                    </button>

                    <button
                      className="btn btn-success px-4"
                      onClick={handlePassword}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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

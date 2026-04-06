import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useNavigate } from "react-router-dom";

const RecruiterProfile = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

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
    return btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/recruiter/details");
        const data = res.data;

        if (!data?.company || !data?.recruiterDetail)
          return navigate("/recruiterRegister");

        setCompany({ ...data.company, logo: null });
        setRecruiter(data.recruiterDetail);
        setUsername(data.username);

        if (data.company?.logo?.data) {
          setProfile(
            `data:image/jpeg;base64,${bufferToBase64(
              data.company.logo.data
            )}`
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
      await axios.put("/recruiter/company", {
        ...company,
        size: parseInt(company.size),
        mobile: parseInt(company.mobile) || company.mobile,
      });
      notify("success", "Company updated");
      setDisabled((p) => ({ ...p, company: true }));
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleRecruiter = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/recruiter/recruiterDetails", {
        ...recruiter,
        mobile: parseInt(recruiter.mobile) || recruiter.mobile,
      });
      notify("success", "Details updated");
      setDisabled((p) => ({ ...p, recruiter: true }));
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleUsername = async () => {
    try {
      await axios.put("/username", { newUsername: username });
      notify("success", "Username updated");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handlePassword = async () => {
    try {
      await axios.put("/password", { prevPassword, newPassword });
      notify("success", "Password updated");
      setPrevPassword("");
      setNewPassword("");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleLogo = async () => {
    try {
      const file = document.getElementById("profile").files[0];
      if (!file) return;

      const fd = new FormData();
      fd.append("profile", file);

      await axios.post("/recruiter/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      notify("success", "Profile updated");
      window.location.reload();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };


  return (
    <div className="container my-5" style={{ maxWidth: "1000px" }}>

      <SectionCard
        title="🏢 Company"
        editable={disabled.company}
        onEdit={() => setDisabled((p) => ({ ...p, company: false }))}
        onSave={handleCompany}
      >
        <Row>
          <Input label="Name" value={company.name}
            onChange={(v) => setCompany({ ...company, name: v })} disabled={disabled.company} />

          <Input label="Industry" value={company.industry}
            onChange={(v) => setCompany({ ...company, industry: v })} disabled={disabled.company} />

          <Input label="Size" value={company.size}
            onChange={(v) => setCompany({ ...company, size: v })} disabled={disabled.company} />

          <Input label="Website" value={company.website}
            onChange={(v) => setCompany({ ...company, website: v })} disabled={disabled.company} />

          <Input label="Mobile" value={company.mobile}
            onChange={(v) => setCompany({ ...company, mobile: v })} disabled={disabled.company} />

          <Textarea label="Address" value={company.address}
            onChange={(v) => setCompany({ ...company, address: v })} disabled={disabled.company} />

          <Textarea label="Overview" value={company.overview}
            onChange={(v) => setCompany({ ...company, overview: v })} disabled={disabled.company} />
        </Row>
      </SectionCard>

      <SectionCard
        title="👤 Recruiter"
        editable={disabled.recruiter}
        onEdit={() => setDisabled((p) => ({ ...p, recruiter: false }))}
        onSave={handleRecruiter}
      >
        <Row>
          <Input label="Full Name" value={recruiter.fullName}
            onChange={(v) => setRecruiter({ ...recruiter, fullName: v })} disabled={disabled.recruiter} />

          <Input label="Position" value={recruiter.position}
            onChange={(v) => setRecruiter({ ...recruiter, position: v })} disabled={disabled.recruiter} />

          <Input label="Mobile" value={recruiter.mobile}
            onChange={(v) => setRecruiter({ ...recruiter, mobile: v })} disabled={disabled.recruiter} />

          <Input label="Email" value={recruiter.email}
            onChange={(v) => setRecruiter({ ...recruiter, email: v })} disabled={disabled.recruiter} />

          <Input label="LinkedIn" value={recruiter.linkedIn}
            onChange={(v) => setRecruiter({ ...recruiter, linkedIn: v })} disabled={disabled.recruiter} />
        </Row>
      </SectionCard>

      <SectionCard title="🖼 Profile">
        <div className="d-flex align-items-center gap-4">
          {profile && (
            <img src={profile} className="rounded-circle" height="100" alt="profile" />
          )}

          <div>
            <input type="file" id="profile" className="form-control mb-2" />
            <button onClick={handleLogo} className="btn btn-primary">
              Upload
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="🔐 Account"
        editable={disabled.account}
        onEdit={() => setDisabled((p) => ({ ...p, account: false }))}
      >
        <Row>
          <Input label="Username" value={username}
            onChange={setUsername} disabled={disabled.account} />

          <Input label="Previous Password" value={prevPassword}
            onChange={setPrevPassword} type="password" disabled={disabled.account} />

          <Input label="New Password" value={newPassword}
            onChange={setNewPassword} type="password" disabled={disabled.account} />
        </Row>

        <div className="mt-3 d-flex gap-3">
          <button onClick={handleUsername} className="btn btn-primary">
            Update Username
          </button>
          <button onClick={handlePassword} className="btn btn-warning">
            Change Password
          </button>
        </div>
      </SectionCard>

    </div>
  );
};

/* 🔥 REUSABLE COMPONENTS */

const SectionCard = ({ title, children, editable, onEdit, onSave }) => (
  <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
    <div className="d-flex justify-content-between mb-3">
      <h5 className="fw-semibold">{title}</h5>
      {editable && <button onClick={onEdit} className="btn btn-outline-dark btn-sm">Edit</button>}
      {!editable && onSave && <button onClick={onSave} className="btn btn-primary btn-sm">Save</button>}
    </div>
    {children}
  </div>
);

const Row = ({ children }) => <div className="row g-3">{children}</div>;

const Input = ({ label, value, onChange, disabled, type = "text" }) => (
  <div className="col-md-6">
    <label className="form-label">{label}</label>
    <input
      type={type}
      className="form-control"
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Textarea = ({ label, value, onChange, disabled }) => (
  <div className="col-md-12">
    <label className="form-label">{label}</label>
    <textarea
      className="form-control"
      rows="3"
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default RecruiterProfile;
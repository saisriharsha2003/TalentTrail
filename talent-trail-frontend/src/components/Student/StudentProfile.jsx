import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axiosBase from "../../api/axios";
import { notify } from "../Toast";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../assets/config.jsx";

const StudentProfile = ({ isReadOnly = false, externalData = null }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [emailOTP, setEmailOTP] = useState("");
  const [disableEmailOTP, setDisableEmailOTP] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editingCertId, setEditingCertId] = useState(null);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const bufferToBase64 = (bufferArray) => {
    const chunkSize = 100000;
    let base64String = "";
    for (let i = 0; i < bufferArray.length; i += chunkSize) {
      const chunk = bufferArray.slice(i, i + chunkSize);
      base64String += String.fromCharCode.apply(null, chunk);
    }
    return btoa(base64String);
  };
  const formatMonthYear = (date) => {
    if (!date || date === "Present") {
      const now = new Date();
      return now.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      const now = new Date();
      return now.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    return d.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const currentDefault = {
    college: "",
    collegeId: "",
    course: "",
    joinDate: "",
    graduatingYear: "",
    city: "",
    state: "",
    rollNo: "",
    studyYear: "",
    major: "",
    skills: [],
    interests: [],
    cgpa: "",
  };
  const previousDefault = {
    college: "",
    state: "",
    city: "",
    major: "",
    percentage: "",
  };
  const contactDefault = {
    email: "",
    collegeEmail: "",
    mobile: "",
    currentAddress: "",
    permanentAddress: "",
  };
  const personalDefault = {
    fullName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    gender: "",
  };
  const certificationDefault = { name: "", organization: "" };
  const projectDefault = {
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    githubLink: "",
    liveLink: "",
    associated: "",
  };
  const workDefault = {
    organization: "",
    role: "",
    description: "",
    startDate: "",
    endDate: "",
  };

  const [profile, setProfile] = useState("");
  const [resume, setResume] = useState("");
  const [currentEducation, setCurrentEducation] = useState(currentDefault);
  const [previousEducation, setPreviousEducation] = useState(previousDefault);
  const [contact, setContact] = useState(contactDefault);
  const [personal, setPersonal] = useState(personalDefault);
  const [certifications, setCertifications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [works, setWorks] = useState([]);
  const [username, setUsername] = useState("");
  const [prevPassword, setPrevPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [newCert, setNewCert] = useState(certificationDefault);
  const [newProj, setNewProj] = useState(projectDefault);
  const [newWork, setNewWork] = useState(workDefault);
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeCourses, setSelectedCollegeCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const sortedWorks = [...works].sort((a, b) => {
    const getTime = (item) => {
      if (!item.endDate || item.endDate === "Present") {
        return Number.MAX_SAFE_INTEGER;
      }

      return new Date(item.endDate).getTime();
    };

    return getTime(b) - getTime(a);
  });
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axiosBase.get("/public/colleges");
        setColleges(response.data);
      } catch (err) {
        console.error("Error fetching colleges", err);
      }
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    if (currentEducation.collegeId) {
      const selected = colleges.find(
        (c) => c.id === currentEducation.collegeId,
      );
      setSelectedCollegeCourses(selected ? selected.courses || [] : []);
    }
  }, [currentEducation.collegeId, colleges]);

  const fetchStudent = async () => {
    try {
      let student;

      if (externalData) {
        student = externalData;
      } else {
        const response = await axios.get("/student/details");
        student = response?.data;
      }
      console.log(student);
      if (!student?.academic || !student?.contact || !student?.personal)
        return navigate("/studentRegister");

      setCurrentEducation({
        ...student?.academic?.currentEducation,
        academicId: student?.academic?._id,
        rollNo: student?.rollNo,
      });

      setPreviousEducation(student?.academic?.previousEducation);
      setContact(student?.contact);

      setPersonal({
        ...student?.personal,
        dateOfBirth: student?.personal?.dateOfBirth
          ? student.personal.dateOfBirth.split("T")[0]
          : "",
      });

      setCertifications(student?.certifications || []);
      setProjects(student?.projects || []);
      setWorks(student?.workExperiences || []);
      setUsername(student?.username);
      setResume(student?.resume);
      setSkills(student?.skills || []);
      setInterests(student?.interests || []);

      // profile image
      if (student?.profile?.data?.length) {
        setProfile(
          `data:image/jpeg;base64,${bufferToBase64(student?.profile?.data)}`,
        );
      }
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [externalData]);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/student/personal", {
        ...personal,
        personalId: personal._id,
      });
      notify("success", "Personal details updated");
      fetchStudent();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/student/contact", {
        ...contact,
        contactId: contact._id,
      });
      notify("success", "Contact details updated");
      fetchStudent();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleSaveAcademic = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/student/academic", {
        currentEducation: {
          ...currentEducation,
          graduatingYear: parseInt(currentEducation.graduatingYear),
          studyYear: parseInt(currentEducation.studyYear),
          cgpa: parseFloat(currentEducation.cgpa),
          skills:
            typeof currentEducation.skills === "string"
              ? currentEducation.skills.split(",").map((s) => s.trim())
              : currentEducation.skills,
          interests:
            typeof currentEducation.interests === "string"
              ? currentEducation.interests.split(",").map((s) => s.trim())
              : currentEducation.interests,
        },
        previousEducation: {
          ...previousEducation,
          percentage: parseFloat(previousEducation.percentage),
        },
        rollNo: currentEducation.rollNo,
        academicId: currentEducation.academicId,
      });
      notify("success", "Academic details updated");
      fetchStudent();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      if (editingCertId) {
        await axios.put("/student/certification", {
          ...newCert,
          cId: editingCertId,
        });
        notify("success", "Certification updated");
      } else {
        await axios.post("/student/certification", newCert);
        notify("success", "Certification added");
      }

      // reset
      setNewCert({ name: "", organization: "" });
      setEditingCertId(null);
      fetchStudent();

      // close modal
      const modalEl = document.getElementById("certModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleDeleteCert = async (id) => {
    try {
      await axios.delete(`/student/certification/${id}`);
      notify("success", "Certification removed");
      fetchStudent();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toISOString().split("T")[0];
    };

    const payload = {
      name: newProj.name,
      description: newProj.description,
      associated: newProj.associated?.toLowerCase(), // 🔥 CRITICAL FIX
      startDate: formatDate(newProj.startDate),
      endDate: newProj.endDate ? formatDate(newProj.endDate) : null,
      githubLink: newProj.githubLink || null,
      liveLink: newProj.liveLink || null,
    };

    try {
      if (editingProjectId) {
        await axios.put("/student/project", {
          ...payload,
          pId: editingProjectId,
        });
        notify("success", "Project updated");
      } else {
        await axios.post("/student/project", payload);
        notify("success", "Project added");
      }

      const modalEl = document.getElementById("projectModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();

      setNewProj(projectDefault);
      setEditingProjectId(null);
      fetchStudent();
    } catch (err) {
      console.log("ERROR:", err.response?.data); // 👈 VERY IMPORTANT
      notify("failed", err?.response?.data?.message);
    }
  };
  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`/student/project/${id}`);
      notify("success", "Project removed");
      fetchStudent();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };
  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const value = skillInput.trim();

      if (!skills.includes(value)) {
        setSkills([...skills, value]);
      }

      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addInterest = (e) => {
    if (e.key === "Enter" && interestInput.trim()) {
      e.preventDefault();
      const value = interestInput.trim();

      if (!interests.includes(value)) {
        setInterests([...interests, value]);
      }

      setInterestInput("");
    }
  };

  const removeInterest = (interest) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleAddWork = async (e) => {
    e.preventDefault();

    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toISOString().split("T")[0];
    };

    const payload = {
      organization: newWork.organization,
      role: newWork.role,
      description: newWork.description,
      startDate: formatDate(newWork.startDate),
      endDate: newWork.endDate ? formatDate(newWork.endDate) : null,
    };

    try {
      if (editingWorkId) {
        await axios.put("/student/work", {
          ...payload,
          wId: editingWorkId,
        });
        notify("success", "Work updated");
      } else {
        await axios.post("/student/work", payload);
        notify("success", "Work added");
      }

      // ✅ CLOSE MODAL
      const modalEl = document.getElementById("workModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      modal.hide();

      setNewWork(workDefault);
      setEditingWorkId(null);
      fetchStudent();
    } catch (err) {
      console.log(err.response?.data);
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleDeleteWork = async (id) => {
    try {
      await axios.delete(`/student/work/${id}`);
      notify("success", "Work experience removed");
      fetchStudent();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append(type, file);
    try {
      setLoading(true);
      const url = type === "profile" ? "/student/profile" : "/student/resume";
      const method = type === "profile" ? "post" : "put";
      await axios[method](url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify(
        "success",
        `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
      );
      fetchStudent();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountUpdate = async (e, type) => {
    e.preventDefault();
    try {
      if (type === "username") {
        await axios.put("/username", { newUsername: username });
        notify("success", "Username updated");
      } else {
        await axios.put("/password", { prevPassword, newPassword });
        notify("success", "Password updated");
        setPrevPassword("");
        setNewPassword("");
      }
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };
  const handleSaveSkills = async () => {
    try {
      await axios.post("/student/skills", {
        skills,
        interests,
      });

      notify("success", "Skills & Interests updated");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };
  const getEmailOTP = async () => {
    try {
      await axios.post("/student/sendMail", { email: contact.email });
      notify("success", "OTP sent to email");
      setEmailOTPSent(true);
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const verifyEmailOTP = async () => {
    try {
      await axios.post("/student/verifyMail", { otp: emailOTP });
      notify("success", "Email verified");
      setEmailOTP("");
      setDisableEmailOTP(true);
      fetchStudent();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const formatToInputDate = (date) => {
    if (!date) return new Date().toISOString().split("T")[0];

    const d = new Date(date);

    if (isNaN(d)) return new Date().toISOString().split("T")[0];

    return d.toISOString().split("T")[0];
  };
  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="mx-auto" style={{ width: "95%" }}>
        {/* Header Card */}
        <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
          <div className="bg-primary p-4 text-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="position-relative me-4">
                <img
                  src={profile || "https://via.placeholder.com/100"}
                  alt="Profile"
                  className="rounded-circle border border-3 border-white shadow"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                {!isReadOnly && (
                  <label
                    htmlFor="profile-upload"
                    className="position-absolute bottom-0 end-0 bg-white text-primary rounded-circle p-1 shadow-sm cursor-pointer"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <i className="bi bi-camera-fill d-flex align-items-center justify-content-center h-100"></i>
                    <input
                      type="file"
                      id="profile-upload"
                      className="d-none"
                      accept="image/*"
                      onChange={(e) =>
                        !isReadOnly && handleFileUpload(e, "profile")
                      }
                      disabled={isReadOnly}
                    />
                  </label>
                )}
              </div>
              <div>
                <h3 className="fw-bold mb-1">{personal.fullName}</h3>
                <p className="mb-0 opacity-75">
                  {currentEducation.course} - {currentEducation.major}
                </p>
                <span className="badge bg-white text-primary rounded-pill mt-2">
                  Roll No: {currentEducation.rollNo}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="card-body p-0 bg-white">
            <ul className="nav nav-tabs border-0 px-4">
              {[
                "personal",
                "work",
                "academic",
                "skills",
                "projects",
                "resume",
                "certifications",
                ...(isReadOnly ? [] : ["account"]),
              ].map((tab) => (
                <li className="nav-item" key={tab}>
                  <button
                    className={`nav-link border-0 px-4 py-3 fw-semibold text-capitalize ${activeTab === tab ? "text-primary border-bottom border-primary border-3 active" : "text-muted"}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate__animated animate__fadeIn">
          {activeTab === "personal" && (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                  <h5 className="fw-bold mb-4 text-primary">
                    <i className="bi bi-person-fill me-2"></i>Personal Details
                  </h5>
                  <form
                    onSubmit={
                      isReadOnly
                        ? (e) => e.preventDefault()
                        : handleSavePersonal
                    }
                    className="row g-3"
                  >
                    <div className="col-md-6 form-floating">
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Full Name"
                        value={personal.fullName}
                        onChange={(e) =>
                          setPersonal({ ...personal, fullName: e.target.value })
                        }
                        disabled={isReadOnly}
                        required
                      />
                      <label className="ms-2">Full Name</label>
                    </div>
                    <div className="col-md-6 form-floating">
                      <input
                        type="date"
                        disabled={isReadOnly}
                        className="form-control rounded-3"
                        value={personal.dateOfBirth}
                        onChange={(e) =>
                          setPersonal({
                            ...personal,
                            dateOfBirth: e.target.value,
                          })
                        }
                        required
                      />
                      <label className="ms-2">Date of Birth</label>
                    </div>
                    <div className="col-md-6 form-floating">
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Father's Name"
                        disabled={isReadOnly}
                        value={personal.fatherName}
                        onChange={(e) =>
                          setPersonal({
                            ...personal,
                            fatherName: e.target.value,
                          })
                        }
                        required
                      />
                      <label className="ms-2">Father's Name</label>
                    </div>
                    <div className="col-md-6 form-floating">
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Mother's Name"
                        value={personal.motherName}
                        onChange={(e) =>
                          setPersonal({
                            ...personal,
                            motherName: e.target.value,
                          })
                        }
                        disabled={isReadOnly}
                        required
                      />
                      <label className="ms-2">Mother's Name</label>
                    </div>
                    <div className="col-md-6 form-floating">
                      <select
                        className="form-select rounded-3"
                        value={personal.gender}
                        disabled={isReadOnly}
                        onChange={(e) =>
                          setPersonal({ ...personal, gender: e.target.value })
                        }
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <label className="ms-2">Gender</label>
                    </div>
                    <div className="col-12 mt-4 text-end">
                      <button
                        type="submit"
                        className="btn btn-primary px-5 rounded-pill fw-bold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                  <h5 className="fw-bold mb-4 text-primary">
                    <i className="bi bi-telephone-fill me-2"></i>Contact Info
                  </h5>
                  <form
                    onSubmit={
                      isReadOnly ? (e) => e.preventDefault() : handleSaveContact
                    }
                    className="row g-3"
                  >
                    <div className="col-12 form-floating">
                      <input
                        type="email"
                        className="form-control rounded-3"
                        placeholder="Email"
                        disabled={isReadOnly}
                        value={contact.email}
                        onChange={(e) =>
                          setContact({ ...contact, email: e.target.value })
                        }
                        required
                      />
                      <label className="ms-2">Email</label>
                      {!isReadOnly &&
                        !disableEmailOTP &&
                        !contact.emailVerified && (
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-primary position-absolute top-50 end-0 translate-middle-y me-2"
                            onClick={getEmailOTP}
                          >
                            Verify
                          </button>
                        )}
                    </div>
                    {emailOTPSent && !disableEmailOTP && (
                      <div className="col-12 d-flex gap-2">
                        <input
                          type="text"
                          className="form-control rounded-3"
                          placeholder="OTP"
                          disabled={isReadOnly}
                          value={emailOTP}
                          onChange={(e) => setEmailOTP(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-success rounded-3"
                          onClick={verifyEmailOTP}
                        >
                          Verify
                        </button>
                      </div>
                    )}
                    <div className="col-12 form-floating">
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Mobile"
                        disabled={isReadOnly}
                        value={contact.mobile}
                        onChange={(e) =>
                          setContact({ ...contact, mobile: e.target.value })
                        }
                        required
                      />
                      <label className="ms-2">Mobile</label>
                    </div>
                    <div className="col-12 form-floating">
                      <textarea
                        className="form-control rounded-3"
                        style={{ height: "80px" }}
                        disabled={isReadOnly}
                        value={contact.currentAddress}
                        onChange={(e) =>
                          setContact({
                            ...contact,
                            currentAddress: e.target.value,
                          })
                        }
                        required
                      ></textarea>
                      <label className="ms-2">Address</label>
                    </div>
                    <div className="col-12 mt-4">
                      <button
                        type="submit"
                        className="btn btn-outline-primary w-100 rounded-pill fw-bold"
                      >
                        Update Contact
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {activeTab === "skills" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-warning d-flex align-items-center gap-2">
                    <i className="bi bi-lightning-charge-fill"></i>
                    Skills & Interests
                  </h5>

                  {/* SKILLS */}
                  <div className="mb-4">
                    <label className="form-label fw-bold text-muted small">
                      Skills (Press Enter to add)
                    </label>

                    <div className="p-3 bg-white border rounded-4 shadow-sm">
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {skills.map((skill, i) => (
                          <span
                            key={i}
                            className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2"
                          >
                            {skill}
                            {!isReadOnly && (
                              <i
                                className="bi bi-x-circle ms-1 cursor-pointer"
                                onClick={() => removeSkill(skill)}
                              ></i>
                            )}
                          </span>
                        ))}
                      </div>

                      {!isReadOnly && (
                        <input
                          type="text"
                          className="form-control border-0 p-0 shadow-none"
                          placeholder="Type a skill..."
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={addSkill}
                        />
                      )}
                    </div>
                  </div>

                  {/* INTERESTS */}
                  <div className="mb-4">
                    <label className="form-label fw-bold text-muted small">
                      Interests (Press Enter to add)
                    </label>

                    <div className="p-3 bg-white border rounded-4 shadow-sm">
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {interests.map((interest, i) => (
                          <span
                            key={i}
                            className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2"
                          >
                            {interest}
                            {!isReadOnly && (
                              <i
                                className="bi bi-x-circle ms-1 cursor-pointer"
                                onClick={() => removeInterest(interest)}
                              ></i>
                            )}
                          </span>
                        ))}
                      </div>

                      {!isReadOnly && (
                        <input
                          type="text"
                          className="form-control border-0 p-0 shadow-none"
                          placeholder="Type an interest..."
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          onKeyDown={addInterest}
                        />
                      )}
                    </div>
                  </div>

                  {/* SAVE BUTTON */}
                  {!isReadOnly && (
                    <div className="text-end mt-4">
                      <button
                        className="btn btn-warning rounded-pill px-5 fw-bold"
                        onClick={handleSaveSkills}
                      >
                        Save Skills & Interests
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "academic" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <form
                    onSubmit={
                      isReadOnly
                        ? (e) => e.preventDefault()
                        : handleSaveAcademic
                    }
                  >
                    <h5 className="fw-bold mb-4 text-primary border-bottom pb-2">
                      Current Education
                    </h5>
                    <div className="row g-3 mb-5">
                      <div className="col-md-6 form-floating">
                        <select
                          className="form-select rounded-3"
                          value={currentEducation.collegeId}
                          disabled={isReadOnly}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              collegeId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select College</option>
                          {colleges.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <label className="ms-2">College</label>
                      </div>
                      <div className="col-md-3 form-floating">
                        <select
                          className="form-select rounded-3"
                          disabled={isReadOnly}
                          value={currentEducation.courseId}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              courseId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Course</option>
                          {[
                            ...new Set(
                              selectedCollegeCourses.map((c) => c.name),
                            ),
                          ].map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <label className="ms-2">Course</label>
                      </div>
                      <div className="col-md-3 form-floating">
                        <select
                          className="form-select rounded-3"
                          disabled={isReadOnly}
                          value={currentEducation.major}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              major: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Major</option>
                          {selectedCollegeCourses
                            .filter((c) => c.name === currentEducation.course)
                            .map((c) => (
                              <option
                                key={c.id}
                                value={c.specialization || "General"}
                              >
                                {c.specialization || "General"}
                              </option>
                            ))}
                        </select>
                        <label className="ms-2">Major</label>
                      </div>
                      <div className="col-md-3 form-floating">
                        <select
                          className="form-select rounded-3"
                          disabled={isReadOnly}
                          value={currentEducation.studyYear}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              studyYear: e.target.value,
                            })
                          }
                          required
                        >
                          {[1, 2, 3, 4, 5].map((y) => (
                            <option key={y} value={y}>
                              {y}
                              {y === 1
                                ? "st"
                                : y === 2
                                  ? "nd"
                                  : y === 3
                                    ? "rd"
                                    : "th"}{" "}
                              Year
                            </option>
                          ))}
                        </select>
                        <label className="ms-2">Study Year</label>
                      </div>
                      <div className="col-md-3 form-floating">
                        <input
                          type="text"
                          className="form-control rounded-3"
                          disabled={isReadOnly}
                          value={currentEducation.cgpa}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              cgpa: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">CGPA</label>
                      </div>
                      <div className="col-md-3 form-floating">
                        <input
                          type="text"
                          className="form-control rounded-3"
                          disabled={isReadOnly}
                          value={currentEducation.rollNo}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              rollNo: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Roll Number</label>
                      </div>
                    </div>

                    <h5 className="fw-bold mb-4 text-primary border-bottom pb-2">
                      Previous Education
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6 form-floating">
                        <input
                          type="text"
                          className="form-control rounded-3"
                          disabled={isReadOnly}
                          value={previousEducation.college}
                          onChange={(e) =>
                            setPreviousEducation({
                              ...previousEducation,
                              college: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">School/College</label>
                      </div>
                      <div className="col-md-3 form-floating">
                        <input
                          type="text"
                          className="form-control rounded-3"
                          disabled={isReadOnly}
                          value={previousEducation.major}
                          onChange={(e) =>
                            setPreviousEducation({
                              ...previousEducation,
                              major: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Board/Major</label>
                      </div>
                      <div className="col-md-3 form-floating">
                        <input
                          type="text"
                          className="form-control rounded-3"
                          disabled={isReadOnly}
                          value={previousEducation.percentage}
                          onChange={(e) =>
                            setPreviousEducation({
                              ...previousEducation,
                              percentage: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Percentage</label>
                      </div>
                    </div>
                    <div className="text-end mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary px-5 rounded-pill fw-bold"
                      >
                        Save Academic Details
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {activeTab === "work" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-success d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-briefcase-fill me-2"></i>Work
                      Experience
                    </span>
                    {!isReadOnly && (
                      <button
                        className="btn btn-sm btn-success rounded-pill px-3 fw-semibold"
                        data-bs-toggle="modal"
                        data-bs-target="#workModal"
                        onClick={() => {
                          setNewWork(workDefault);
                          setEditingWorkId(null);
                        }}
                      >
                        + Add Work
                      </button>
                    )}
                  </h5>

                  {works.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-briefcase fs-1 d-block mb-2"></i>
                      No work experience added yet
                    </div>
                  ) : (
                    <div className="row g-3">
                      {sortedWorks.map((work, idx) => (
                        <div key={work._id} className="col-12">
                          <div className="card border-0 shadow-sm rounded-4 p-3 position-relative work-card h-100">
                            {!isReadOnly && (
                              <button
                                className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                                onClick={() => {
                                  setNewWork({
                                    ...work,
                                    startDate: formatToInputDate(
                                      work.startDate,
                                    ),
                                    endDate: formatToInputDate(work.endDate),
                                  });

                                  setEditingWorkId(work._id);

                                  const modal = new window.bootstrap.Modal(
                                    document.getElementById("workModal"),
                                  );
                                  modal.show();
                                }}
                              >
                                ✏️
                              </button>
                            )}
                            {!isReadOnly && (
                              <button
                                className="btn btn-sm btn-light position-absolute top-0 end-0 me-5 mt-2 rounded-circle shadow-sm"
                                onClick={() => handleDeleteWork(work._id)}
                              >
                                <i className="bi bi-trash text-danger"></i>
                              </button>
                            )}

                            <div className="mt-2">
                              <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                                <i className="bi bi-briefcase-fill text-success"></i>
                                {work.role}
                              </h6>

                              <div className="small text-primary fw-semibold mb-2 d-flex align-items-center gap-1">
                                <i className="bi bi-building"></i>
                                {work.organization}
                              </div>

                              <div className="small text-secondary mb-2 d-flex align-items-center gap-2">
                                <i className="fa-solid fa-calendar-days text-primary"></i>
                                {formatMonthYear(work.startDate)} -{" "}
                                {work.endDate
                                  ? formatMonthYear(work.endDate)
                                  : "Present"}
                              </div>

                              {work.description && (
                                <p className="small text-muted mt-2 mb-0">
                                  {work.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <style>{`
      .work-card {
        transition: all 0.25s ease;
      }

      .work-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      }
    `}</style>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  {/* Header */}
                  <h5 className="fw-bold mb-4 text-primary d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-kanban-fill me-2"></i>Projects
                    </span>
                    {!isReadOnly && (
                      <button
                        className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                        data-bs-toggle="modal"
                        data-bs-target="#projectModal"
                        onClick={() => {
                          setNewProj(projectDefault);
                          setEditingProjectId(null);
                        }}
                      >
                        + Add Project
                      </button>
                    )}
                  </h5>

                  {/* Projects List */}
                  {projects.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-folder2-open fs-1 d-block mb-2"></i>
                      No projects added yet
                    </div>
                  ) : (
                    <div className="row g-3">
                      {projects.map((proj, idx) => (
                        <div key={proj._id} className="col-6">
                          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 position-relative project-card">
                            {!isReadOnly && (
                              <button
                                className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                                onClick={() => {
                                  setNewProj(proj);
                                  setEditingProjectId(proj._id);
                                  const modal = new window.bootstrap.Modal(
                                    document.getElementById("projectModal"),
                                  );
                                  modal.show();
                                }}
                              >
                                ✏️
                              </button>
                            )}
                            {!isReadOnly && (
                              <button
                                className="btn btn-sm btn-light position-absolute top-0 end-0 me-5 mt-2 rounded-circle shadow-sm"
                                onClick={() => handleDeleteProject(proj._id)}
                              >
                                <i className="bi bi-trash text-danger"></i>
                              </button>
                            )}

                            <div className="mt-2">
                              <h6 className="fw-bold mb-2">{proj.name}</h6>

                              <p className="small text-muted mb-3">
                                {proj.description}
                              </p>
                              {proj.associated && (
                                <div className="small text-primary fw-semibold mb-2">
                                  <i className="bi bi-building me-1"></i>
                                  {proj.associated}
                                </div>
                              )}

                              <div className="small text-secondary mb-3">
                                <i className="bi bi-clock-history text-success me-1"></i>
                                {proj.startDate
                                  ? formatMonthYear(proj.startDate)
                                  : "N/A"}{" "}
                                -
                                {proj.endDate
                                  ? formatMonthYear(proj.endDate)
                                  : "Present"}
                              </div>

                              <div className="d-flex gap-2 flex-wrap">
                                {proj.githubLink && (
                                  <a
                                    href={proj.githubLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm btn-dark rounded-pill px-3"
                                  >
                                    <i className="bi bi-github me-1"></i>
                                    View Code
                                  </a>
                                )}
                                {proj.liveLink && (
                                  <a
                                    href={
                                      proj.liveLink?.startsWith("http")
                                        ? proj.liveLink
                                        : `https://${proj.liveLink}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm btn-primary rounded-pill px-3"
                                  >
                                    <i className="bi bi-globe me-1"></i>
                                    View Live
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Styling */}
              <style>{`
      .project-card {
        transition: all 0.25s ease;
      }

      .project-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      }
    `}</style>
            </div>
          )}
          {activeTab === "certifications" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  {/* HEADER */}
                  <h5 className="fw-bold mb-4 text-info d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-patch-check-fill me-2"></i>
                      Certifications
                    </span>
                    {!isReadOnly && (
                      <button
                        className="btn btn-sm btn-outline-info rounded-pill px-3 fw-semibold"
                        data-bs-toggle="modal"
                        data-bs-target="#certModal"
                        onClick={() => {
                          setNewCert({ name: "", organization: "" });
                          setEditingCertId(null);
                        }}
                      >
                        + Add Certification
                      </button>
                    )}
                  </h5>

                  {certifications.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-patch-check fs-1 d-block mb-2"></i>
                      No certifications added yet
                    </div>
                  ) : (
                    <div className="row g-3">
                      {certifications.map((cert) => (
                        <div key={cert._id} className="col-md-4">
                          <div className="card border-0 shadow-sm rounded-4 p-3 cert-card h-100">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="me-2" style={{ flex: 1 }}>
                                <h6
                                  className="fw-bold mb-1 d-flex align-items-center gap-2"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  <i className="bi bi-award-fill text-info"></i>
                                  {cert.name}
                                </h6>

                                <div className="small text-secondary d-flex align-items-center gap-2">
                                  <i className="bi bi-building text-primary"></i>
                                  {cert.organization}
                                </div>
                              </div>

                              <div className="d-flex gap-2">
                                {!isReadOnly && (
                                  <button
                                    className="btn btn-sm btn-light rounded-circle shadow-sm"
                                    onClick={() => handleDeleteCert(cert._id)}
                                  >
                                    <i className="bi bi-trash text-danger"></i>
                                  </button>
                                )}
                                {!isReadOnly && (
                                  <button
                                    className="btn btn-sm btn-light rounded-circle shadow-sm"
                                    onClick={() => {
                                      setNewCert({
                                        name: cert.name,
                                        organization: cert.organization,
                                      });
                                      setEditingCertId(cert._id);

                                      const modal = new window.bootstrap.Modal(
                                        document.getElementById("certModal"),
                                      );
                                      modal.show();
                                    }}
                                  >
                                    ✏️
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <style>{`
      .cert-card {
        transition: all 0.25s ease;
      }

      .cert-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      }
    `}</style>
            </div>
          )}
          {activeTab === "resume" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-danger d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-file-earmark-pdf-fill me-2"></i>Resume
                    </span>
                    {!isReadOnly && (
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={() =>
                          document.getElementById("resume-upload").click()
                        }
                      >
                        {resume ? "Replace" : "+ Upload"}
                      </button>
                    )}
                  </h5>

                  <div className="bg-light rounded-4 p-3 d-flex justify-content-between align-items-center">
                    {resume ? (
                      <>
                        <div>
                          <h6 className="fw-bold mb-1">{resume}</h6>
                          <small className="text-muted">PDF Document</small>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-dark btn-sm rounded-pill px-3"
                            onClick={() =>
                              window.open(`${BASE_URL}/${resume}`, "_blank")
                            }
                          >
                            📄 View
                          </button>

                          <a
                            href={`${BASE_URL}/${resume}`}
                            download
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                          >
                            ⬇ Download
                          </a>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted">No resume uploaded</span>
                    )}

                    <input
                      type="file"
                      id="resume-upload"
                      disabled={isReadOnly}
                      className="d-none"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, "resume")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && !isReadOnly && (
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-primary">
                    <i className="bi bi-person-badge-fill me-2"></i>Username
                  </h5>
                  <form onSubmit={(e) => handleAccountUpdate(e, "username")}>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        disabled={isReadOnly}
                        className="form-control rounded-3"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                      <label>Current Username</label>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 rounded-pill fw-bold"
                    >
                      Update Username
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i>Change
                    Password
                  </h5>
                  <form onSubmit={(e) => handleAccountUpdate(e, "password")}>
                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        disabled={isReadOnly}
                        className="form-control rounded-3"
                        value={prevPassword}
                        onChange={(e) => setPrevPassword(e.target.value)}
                        required
                      />
                      <label>Old Password</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className="form-control rounded-3"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <label>New Password</label>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-danger w-100 rounded-pill fw-bold"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="modal fade" id="projectModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-0 p-4">
              <h5 className="modal-title fw-bold text-primary">
                {editingProjectId ? "Edit Project" : "Add New Project"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <form
              onSubmit={
                isReadOnly ? (e) => e.preventDefault() : handleAddProject
              }
            >
              <div className="modal-body p-4 pt-0">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={newProj.name || ""}
                    onChange={(e) =>
                      setNewProj({ ...newProj, name: e.target.value })
                    }
                    required
                  />
                  <label>Project Name</label>
                </div>

                {/* Description */}
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control rounded-3"
                    style={{ height: "100px" }}
                    value={newProj.description || ""}
                    onChange={(e) =>
                      setNewProj({ ...newProj, description: e.target.value })
                    }
                    required
                  ></textarea>
                  <label>Description</label>
                </div>

                <div className="form-floating mb-3">
                  <select
                    className="form-select rounded-3"
                    disabled={isReadOnly}
                    value={newProj.associated || ""}
                    onChange={(e) =>
                      setNewProj({ ...newProj, associated: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled hidden></option>
                    <option value="self">Self</option>
                    <option value="college">College</option>
                    <option value="work">Work / Internship</option>
                  </select>
                  <label>Associated With</label>
                </div>

                {/* Dates */}
                <div className="row g-2 mb-3">
                  <div className="col-6 form-floating">
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={newProj.startDate || ""}
                      onChange={(e) =>
                        setNewProj({ ...newProj, startDate: e.target.value })
                      }
                      required
                    />
                    <label>Start Date</label>
                  </div>

                  <div className="col-6 form-floating">
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={newProj.endDate || ""}
                      onChange={(e) =>
                        setNewProj({ ...newProj, endDate: e.target.value })
                      }
                    />
                    <label>End Date</label>
                  </div>
                </div>

                {/* GitHub Link */}
                <div className="form-floating mb-3">
                  <input
                    type="url"
                    className="form-control rounded-3"
                    value={newProj.githubLink || ""}
                    onChange={(e) =>
                      setNewProj({ ...newProj, githubLink: e.target.value })
                    }
                  />
                  <label>GitHub Link</label>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 p-4 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    setNewProj(projectDefault);
                    setEditingProjectId(null);
                  }}
                >
                  Cancel
                </button>
                {!isReadOnly && (
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                  >
                    {editingProjectId ? "Update" : "Add Project"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal fade" id="workModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-0 p-4">
              <h5 className="modal-title fw-bold text-success">
                {editingWorkId ? "Edit Work Experience" : "Add Work Experience"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form
              onSubmit={isReadOnly ? (e) => e.preventDefault() : handleAddWork}
            >
              <div className="modal-body p-4 pt-0">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={newWork.role}
                    onChange={(e) =>
                      setNewWork({ ...newWork, role: e.target.value })
                    }
                    required
                  />
                  <label>Job Role</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={newWork.organization}
                    onChange={(e) =>
                      setNewWork({ ...newWork, organization: e.target.value })
                    }
                    required
                  />
                  <label>Organization</label>
                </div>
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control rounded-3"
                    style={{ height: "100px" }}
                    value={newWork.description}
                    onChange={(e) =>
                      setNewWork({ ...newWork, description: e.target.value })
                    }
                    required
                  ></textarea>
                  <label>Description</label>
                </div>
                <div className="row g-2">
                  <div className="col-6 form-floating">
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={newWork.startDate}
                      onChange={(e) =>
                        setNewWork({ ...newWork, startDate: e.target.value })
                      }
                      required
                    />
                    <label>Start Date</label>
                  </div>
                  <div className="col-6 form-floating">
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={newWork.endDate}
                      onChange={(e) =>
                        setNewWork({ ...newWork, endDate: e.target.value })
                      }
                    />
                    <label>End Date</label>
                  </div>
                </div>
              </div>
              {!isReadOnly && (
                <div className="modal-footer border-0 p-4 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 fw-bold"
                  >
                    {editingWorkId ? "Update" : "Add Work"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="certModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-0 p-4">
              <h5 className="modal-title fw-bold text-info">
                {editingCertId ? "Edit Certification" : "Add Certification"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <form
              onSubmit={isReadOnly ? (e) => e.preventDefault() : handleAddCert}
            >
              <div className="modal-body p-4 pt-0">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={newCert.name}
                    onChange={(e) =>
                      setNewCert({ ...newCert, name: e.target.value })
                    }
                    required
                  />
                  <label>Certification Name</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={newCert.organization}
                    onChange={(e) =>
                      setNewCert({ ...newCert, organization: e.target.value })
                    }
                    required
                  />
                  <label>Issuing Organization</label>
                </div>
              </div>
              {!isReadOnly && (
                <div className="modal-footer border-0 p-4 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    data-bs-dismiss="modal"
                    onClick={() => {
                      setNewCert({ name: "", organization: "" });
                      setEditingCertId(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-info text-white rounded-pill px-4 fw-bold"
                  >
                    {editingCertId ? "Update" : "Add"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style>{`
                .hover-border-primary:hover { border-color: var(--bs-primary) !important; }
                .hover-border-success:hover { border-color: var(--bs-success) !important; }
                .hover-border-info:hover { border-color: var(--bs-info) !important; }
                .group:hover .opacity-0 { opacity: 1 !important; }
                .transition-all { transition: all 0.3s ease; }
                .cursor-pointer { cursor: pointer; }
                .nav-link:hover { color: var(--bs-primary) !important; }
            `}</style>
    </div>
  );
};

export default StudentProfile;

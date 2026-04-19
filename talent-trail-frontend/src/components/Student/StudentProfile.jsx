import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axiosBase from "../../api/axios";
import { notify } from "../Toast";
import { useNavigate } from "react-router-dom";

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [mobileOTPSent, setMobileOTPSent] = useState(false);
  const [emailOTP, setEmailOTP] = useState("");
  const [mobileOTP, setMobileOTP] = useState("");
  const [disableEmailOTP, setDisableEmailOTP] = useState(false);
  const [disableMobileOTP, setDisableMobileOTP] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editingCertId, setEditingCertId] = useState(null);

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
      const response = await axios.get("/student/details");
      const student = response?.data;
      if (!student?.academic || !student?.contact || !student?.personal)
        return navigate("/studentRegister");
      console.log(student);

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
      if (student?.profile?.data?.length)
        setProfile(
          `data:image/jpeg;base64,${bufferToBase64(student?.profile?.data)}`,
        );
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

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
      await axios.post("/student/certification", newCert);
      notify("success", "Certification added");
      setNewCert(certificationDefault);
      fetchStudent();
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
    try {
      if (editingProjectId) {
        await axios.put("/student/project", {
          ...newProj,
          pId: editingProjectId,
        });
        notify("success", "Project updated");
      } else {
        await axios.post("/student/project", newProj);
        notify("success", "Project added");
      }

      setNewProj(projectDefault);
      setEditingProjectId(null);
      fetchStudent();
    } catch (err) {
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

  const handleAddWork = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/student/work", newWork);
      notify("success", "Work experience added");
      setNewWork(workDefault);
      fetchStudent();
    } catch (err) {
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
                    onChange={(e) => handleFileUpload(e, "profile")}
                  />
                </label>
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
                "projects",
                "resume",
                "certifications",
                "account",
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
                  <form onSubmit={handleSavePersonal} className="row g-3">
                    <div className="col-md-6 form-floating">
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Full Name"
                        value={personal.fullName}
                        onChange={(e) =>
                          setPersonal({ ...personal, fullName: e.target.value })
                        }
                        required
                      />
                      <label className="ms-2">Full Name</label>
                    </div>
                    <div className="col-md-6 form-floating">
                      <input
                        type="date"
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
                        required
                      />
                      <label className="ms-2">Mother's Name</label>
                    </div>
                    <div className="col-md-6 form-floating">
                      <select
                        className="form-select rounded-3"
                        value={personal.gender}
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
                  <form onSubmit={handleSaveContact} className="row g-3">
                    <div className="col-12 form-floating">
                      <input
                        type="email"
                        className="form-control rounded-3"
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) =>
                          setContact({ ...contact, email: e.target.value })
                        }
                        required
                      />
                      <label className="ms-2">Email</label>
                      {!disableEmailOTP && !contact.emailVerified && (
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

          {activeTab === "academic" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <form onSubmit={handleSaveAcademic}>
                    <h5 className="fw-bold mb-4 text-primary border-bottom pb-2">
                      Current Education
                    </h5>
                    <div className="row g-3 mb-5">
                      <div className="col-md-6 form-floating">
                        <select
                          className="form-select rounded-3"
                          value={currentEducation.collegeId}
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
                          value={currentEducation.course}
                          onChange={(e) =>
                            setCurrentEducation({
                              ...currentEducation,
                              course: e.target.value,
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
                  <h5 className="fw-bold mb-4 text-success d-flex justify-content-between">
                    <span>
                      <i className="bi bi-briefcase-fill me-2"></i>Work
                      Experience
                    </span>
                    <button
                      className="btn btn-sm btn-outline-success rounded-pill"
                      data-bs-toggle="modal"
                      data-bs-target="#workModal"
                    >
                      + Add
                    </button>
                  </h5>

                  {works.map((work, idx) => (
                    <div
                      key={idx}
                      className="bg-light rounded-4 p-3 mb-3 position-relative"
                    >
                      <button
                        className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 m-2"
                        onClick={() => handleDeleteWork(work._id)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                      <h6 className="fw-bold">{work.role}</h6>
                      <p className="small text-muted">{work.organization}</p>
                      <small className="text-success">
                        {work.startDate} - {work.endDate || "Present"}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-primary d-flex justify-content-between">
                    <span>
                      <i className="bi bi-kanban-fill me-2"></i>Projects
                    </span>
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill"
                      data-bs-toggle="modal"
                      data-bs-target="#projectModal"
                    >
                      + Add
                    </button>
                  </h5>

                  {projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="bg-light rounded-4 p-3 mb-3 position-relative"
                    >
                      <button
                        className="btn btn-sm btn-outline-secondary border-0 position-absolute top-0 end-0 me-5 mt-2"
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

                      <button
                        className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 m-2"
                        onClick={() => handleDeleteProject(proj._id)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                      <h6 className="fw-bold">{proj.name}</h6>
                      <p className="small text-muted">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "certifications" && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4 text-info d-flex justify-content-between">
                    <span>
                      <i className="bi bi-patch-check-fill me-2"></i>
                      Certifications
                    </span>
                    <button
                      className="btn btn-sm btn-outline-info rounded-pill"
                      data-bs-toggle="modal"
                      data-bs-target="#certModal"
                    >
                      + Add
                    </button>
                  </h5>

                  <div className="row g-3">
                    {certifications.map((cert, idx) => (
                      <div key={idx} className="col-md-4">
                        <div className="bg-light rounded-4 p-3 position-relative">
                          <button
                            className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 m-2"
                            onClick={() => handleDeleteCert(cert._id)}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                          <h6 className="fw-bold">{cert.name}</h6>
                          <small className="text-muted">
                            {cert.organization}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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

                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill"
                      onClick={() =>
                        document.getElementById("resume-upload").click()
                      }
                    >
                      {resume ? "Replace" : "+ Upload"}
                    </button>
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
                              window.open(
                                `http://localhost:3500/resumes/${resume}`,
                                "_blank",
                              )
                            }
                          >
                            📄 View
                          </button>

                          <a
                            href={`http://localhost:3500/resumes/${resume}`}
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
                      className="d-none"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, "resume")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "account" && (
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

      {/* Modals for Adding Content */}
      {/* Project Modal */}
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
            <form onSubmit={handleAddProject}>
              <div className="modal-body p-4 pt-0">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={newProj.name}
                    onChange={(e) =>
                      setNewProj({ ...newProj, name: e.target.value })
                    }
                    required
                  />
                  <label>Project Name</label>
                </div>
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control rounded-3"
                    style={{ height: "100px" }}
                    value={newProj.description}
                    onChange={(e) =>
                      setNewProj({ ...newProj, description: e.target.value })
                    }
                    required
                  ></textarea>
                  <label>Description</label>
                </div>
                
                
              </div>
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
                  className="btn btn-primary rounded-pill px-4 fw-bold"
                >
                  {editingProjectId ? "Update" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Work Modal */}
      <div className="modal fade" id="workModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-0 p-4">
              <h5 className="modal-title fw-bold text-success">
                Add Work Experience
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form onSubmit={handleAddWork}>
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
                  data-bs-dismiss="modal"
                >
                  Add Work
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Cert Modal */}
      <div className="modal fade" id="certModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-0 p-4">
              <h5 className="modal-title fw-bold text-info">
                Add Certification
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form onSubmit={handleAddCert}>
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
                  className="btn btn-info text-white rounded-pill px-4 fw-bold"
                  data-bs-dismiss="modal"
                >
                  Add Certification
                </button>
              </div>
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

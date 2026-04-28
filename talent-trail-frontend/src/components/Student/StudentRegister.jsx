import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axiosBase from "../../api/axios";
import { notify } from "../Toast";
import { useNavigate } from "react-router-dom";

const StudentRegister = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [colleges, setColleges] = useState([]);
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [editingProjIndex, setEditingProjIndex] = useState(null);
  const [editingExpIndex, setEditingExpIndex] = useState(null);
  const [editingCertIndex, setEditingCertIndex] = useState(null);

  const [selectedCollegeCourses, setSelectedCollegeCourses] = useState([]);
  const saveDraft = (data) => {
    localStorage.setItem("studentDraft", JSON.stringify(data));
  };

  const loadDraft = () => {
    const draft = localStorage.getItem("studentDraft");
    return draft ? JSON.parse(draft) : null;
  };
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

  const parsedOutputString = localStorage.getItem("parsedOutput");
  const parsedOutput = parsedOutputString
    ? JSON.parse(parsedOutputString)
    : null;
  const r = parsedOutput?.resume_data || {};
  const draft = loadDraft();
  console.log(r);
  const [skills, setSkills] = useState(
    draft?.skills || (Array.isArray(r?.skills) ? r.skills : []),
  );
  const [interests, setInterests] = useState(
    draft?.interests || (Array.isArray(r?.interests) ? r.interests : []),
  );
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      // Check if it's already in YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

      // Check for YYYY-MM and append -01
      if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`;

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const currentDefault = {
    college: r?.current_education?.college_name || "",
    collegeId: "",
    course: r?.current_education?.course || "",
    joinDate: formatDate(r?.current_education?.join_date),
    graduatingYear: r?.current_education?.graduating_year || "",
    city: r?.current_education?.city || "",
    state: r?.current_education?.state || "",
    rollNo: r?.current_education?.roll_no || "",
    studyYear: r?.current_education?.study_year || "",
    major: r?.current_education?.major || "",
    cgpa: r?.current_education?.cgpa || "",
  };

  const previousDefault = {
    college: r?.previous_education?.college || "",
    state: r?.previous_education?.state || "",
    city: r?.previous_education?.city || "",
    major: r?.previous_education?.major || "",
    percentage: r?.previous_education?.percentage || "",
  };

  const contactDefault = {
    email: r?.contact?.email || "",
    collegeEmail: r?.contact?.college_email || "",
    mobile: r?.contact?.mobile || "",
    currentAddress: r?.contact?.current_address || "",
    permanentAddress: r?.contact?.permanent_address || "",
  };

  const personalDefault = {
    fullName: r?.personal?.full_name || "",
    fatherName: r?.personal?.father_name || "",
    motherName: r?.personal?.mother_name || "",
    dateOfBirth: formatDate(r?.personal?.date_of_birth),
    gender: r?.personal?.gender || "",
  };

  const [currentEducation, setCurrentEducation] = useState(
    draft?.currentEducation || currentDefault,
  );
  const [previousEducation, setPreviousEducation] = useState(
    draft?.previousEducation || previousDefault,
  );
  const [contact, setContact] = useState(draft?.contact || contactDefault);
  const [personal, setPersonal] = useState(draft?.personal || personalDefault);
  const normalizeProjects = (projects = []) =>
    projects.map((p) => ({
      name: p.name || "",
      description: p.description || "",
      associated: p.associated || "self",

      // ✅ FIXED FIELD MAPPING
      githubLink: p.githubLink || p.github_link || "",
      liveLink: p.liveLink || p.live_link || "",

      startDate: p.startDate || p.start_date || "",
      endDate: p.endDate || p.end_date || "",

      currentlyWorking:
        p.currentlyWorking ??
        p.currently_working ??
        (!p.end_date && !p.endDate),
    }));

  const [projects, setProjects] = useState(
    draft?.projects || normalizeProjects(r?.projects),
  );
  const [experiences, setExperiences] = useState(
    draft?.experiences || r?.experience || [],
  );
  const [certifications, setCertifications] = useState(
    draft?.certifications || r?.certifications || [],
  );
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // New item inputs
  const [newCert, setNewCert] = useState({ name: "", organization: "" });
  const [newProj, setNewProj] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    associated: "self",
    githubLink: "",
    liveLink: "",
    currentlyWorking: false,
  });
  const [newExp, setNewExp] = useState({
    company: "",
    role: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  // Helpers to add items
  const addItem = (list, setter, newItem, resetItem) => {
    if (Object.values(newItem).some((v) => v !== "")) {
      setter([...list, newItem]);
      resetItem();
    }
  };

  const removeItem = (list, setter, index) => {
    setter(list.filter((_, i) => i !== index));
  };

  // Effect to update available courses when college changes
  useEffect(() => {
    if (currentEducation.collegeId) {
      const selected = colleges.find(
        (c) => c.id === currentEducation.collegeId,
      );
      if (selected) {
        const courses = selected.courses || [];
        setSelectedCollegeCourses(courses);

        // Auto-select course if only one exists
        const uniqueCourseNames = [...new Set(courses.map((c) => c.name))];
        if (uniqueCourseNames.length === 1 && !currentEducation.course) {
          setCurrentEducation((prev) => ({
            ...prev,
            course: uniqueCourseNames[0],
          }));
        }
      }
    } else {
      setSelectedCollegeCourses([]);
    }
  }, [currentEducation.collegeId, colleges, currentEducation.course]);

  // Auto-select major if only one option exists for the selected course
  useEffect(() => {
    if (currentEducation.course && selectedCollegeCourses.length > 0) {
      const availableMajors = selectedCollegeCourses.filter(
        (c) => c.name === currentEducation.course,
      );
      if (availableMajors.length === 1 && !currentEducation.major) {
        setCurrentEducation((prev) => ({
          ...prev,
          major: availableMajors[0].specialization || "General",
        }));
      }
    }
  }, [currentEducation.course, selectedCollegeCourses, currentEducation.major]);

  // Sync resume data with fetched colleges/courses
  useEffect(() => {
    if (
      colleges.length > 0 &&
      r?.current_education?.college_name &&
      !currentEducation.collegeId
    ) {
      const collegeName = r.current_education.college_name.toLowerCase();
      const matchedCollege = colleges.find(
        (c) =>
          c.name.toLowerCase().includes(collegeName) ||
          collegeName.includes(c.name.toLowerCase()),
      );

      if (matchedCollege) {
        const courses = matchedCollege.courses || [];
        let matchedCourse = "";
        let matchedMajor = "";

        if (r.current_education.course) {
          const resCourse = r.current_education.course.toLowerCase();
          const courseMatch = courses.find(
            (c) =>
              c.name.toLowerCase().includes(resCourse) ||
              resCourse.includes(c.name.toLowerCase()),
          );
          if (courseMatch) {
            matchedCourse = courseMatch.name;
            if (r.current_education.major) {
              const resMajor = r.current_education.major.toLowerCase();
              const majorMatch = courses.find(
                (c) =>
                  c.name === matchedCourse &&
                  (c.specialization?.toLowerCase().includes(resMajor) ||
                    resMajor.includes(c.specialization?.toLowerCase())),
              );
              if (majorMatch) matchedMajor = majorMatch.specialization;
            }
          }
        }

        setCurrentEducation((prev) => ({
          ...prev,
          collegeId: matchedCollege.id,
          college: matchedCollege.name,
          course: matchedCourse || prev.course,
          major: matchedMajor || prev.major,
        }));
      }
    }
  }, [colleges, r?.current_education, currentEducation.collegeId]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // Profile Picture
      if (profileFile) {
        const fd = new FormData();
        fd.append("profile", profileFile);
        await axios.post("/student/profile", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Personal
      await axios.post("/student/personal", {
        ...personal,
        gender: personal.gender || "other", // Fallback
      });

      // Contact
      await axios.post("/student/contact", {
        ...contact,
        mobile: parseInt(contact.mobile) || contact.mobile,
      });

      // Academic
      await axios.post("/student/academic", {
        currentEducation: {
          ...currentEducation,
          graduatingYear: parseInt(currentEducation.graduatingYear),
          studyYear: parseInt(currentEducation.studyYear),
          cgpa: parseFloat(currentEducation.cgpa),
        },
        previousEducation: {
          ...previousEducation,
          percentage: parseFloat(previousEducation.percentage),
        },
        rollNo: currentEducation.rollNo,
        collegeId: currentEducation.collegeId,
      });
      await axios.post("/student/skills", {
        skills: skills,
        interests: interests,
      });
      for (let proj of projects) {
        if (proj.name) {
          await axios.post("/student/project", {
            name: proj.name,
            description: proj.description || "N/A",
            startDate:
              formatDate(proj.startDate || proj.start_date) ||
              new Date().toISOString().split("T")[0], // Ensure startDate is sent
            endDate: proj.currentlyWorking
              ? "Present"
              : formatDate(proj.endDate || proj.end_date) || null,
            associated: proj.associated || "self",
            githubLink: proj.githubLink || null,
            liveLink: proj.liveLink || null,
            currentlyWorking: !(proj.endDate || proj.end_date),
          });
        }
      }

      // Work
      for (let exp of experiences) {
        if (exp.company || exp.organization) {
          await axios.post("/student/work", {
            organization: exp.company || exp.organization,
            role: exp.role || "N/A",
            description: exp.description || "N/A",
            startDate: formatDate(exp.start_date || exp.startDate),
            endDate: formatDate(exp.end_date || exp.endDate) || "Present",
          });
        }
      }
      for (let cert of certifications) {
        if (cert.name) {
          await axios.post("/student/certification", {
            name: cert.name,
            organization: cert.organization || cert.issuer || "N/A",
          });
        }
      }

      notify("success", "Registration completed successfully!");
      localStorage.removeItem("studentDraft");
      navigate("/user/student");
    } catch (err) {
      console.error("Submission error:", err);
      notify(
        "failed",
        err?.response?.data?.message ||
          "Something went wrong during registration",
      );
    } finally {
      setLoading(false);
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
  // ✅ AUTO SAVE DRAFT
  useEffect(() => {
    saveDraft({
      personal,
      contact,
      currentEducation,
      previousEducation,
      projects,
      experiences,
      certifications,
      skills,
      interests,
    });
  }, [
    personal,
    contact,
    currentEducation,
    previousEducation,
    projects,
    experiences,
    certifications,
    skills,
    interests,
  ]);

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

  const tabs = [
    { key: "personal", label: "Personal", icon: "bi-person" },
    { key: "contact", label: "Contact", icon: "bi-envelope" },
    { key: "academic", label: "Academic", icon: "bi-mortarboard" },
    { key: "skills", label: "Skills", icon: "bi-lightning" },
    { key: "projects", label: "Projects", icon: "bi-kanban" },
    { key: "certifications", label: "Certifications", icon: "bi-award" },
    { key: "final", label: "Finish", icon: "bi-check-circle" },
  ];
  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div
        className="card shadow-sm border-0 rounded-4 overflow-hidden mx-auto"
        style={{ width: "95%", maxWidth: "1000px" }}
      >
        <div className="bg-primary p-4 text-white text-center">
          <h2 className="fw-bold mb-0">Student Registration</h2>
          <p className="mb-0 opacity-75">
            Tell us about yourself to get started
          </p>
        </div>

        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`btn rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 ${
                  activeTab === tab.key
                    ? "btn-primary text-white"
                    : "btn-light border"
                }`}
              >
                <i className={`bi ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "personal" && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="animate__animated animate__fadeIn"
            >
              <h4 className="mb-4 fw-semibold text-primary">
                Personal Details
              </h4>
              <div className="row g-3">
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
                      setPersonal({ ...personal, dateOfBirth: e.target.value })
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
                      setPersonal({ ...personal, fatherName: e.target.value })
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
                      setPersonal({ ...personal, motherName: e.target.value })
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
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <label className="ms-2">Gender</label>
                </div>
              </div>
              <div className="d-flex justify-content-end mt-4">
                <button
                  type="button"
                  className="btn btn-primary px-5 py-2 rounded-3 fw-semibold"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx < tabs.length - 1) {
                      setActiveTab(tabs[idx + 1].key);
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </form>
          )}

          {activeTab === "contact" && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="animate__animated animate__fadeIn"
            >
              <h4 className="mb-4 fw-semibold text-primary">Contact Details</h4>
              <div className="row g-3">
                <div className="col-md-6 form-floating">
                  <input
                    type="email"
                    className="form-control rounded-3"
                    placeholder="Personal Email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                    required
                  />
                  <label className="ms-2">Personal Email</label>
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    type="email"
                    className="form-control rounded-3"
                    placeholder="College Email"
                    value={contact.collegeEmail}
                    onChange={(e) =>
                      setContact({ ...contact, collegeEmail: e.target.value })
                    }
                    required
                  />
                  <label className="ms-2">College Email</label>
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Mobile Number"
                    value={contact.mobile}
                    onChange={(e) =>
                      setContact({ ...contact, mobile: e.target.value })
                    }
                    required
                  />
                  <label className="ms-2">Mobile Number</label>
                </div>
                <div className="col-md-12 form-floating">
                  <textarea
                    className="form-control rounded-3"
                    placeholder="Current Address"
                    style={{ height: "80px" }}
                    value={contact.currentAddress}
                    onChange={(e) =>
                      setContact({ ...contact, currentAddress: e.target.value })
                    }
                    required
                  />
                  <label className="ms-2">Current Address</label>
                </div>
                <div className="col-md-12 form-floating">
                  <textarea
                    className="form-control rounded-3"
                    placeholder="Permanent Address"
                    style={{ height: "80px" }}
                    value={contact.permanentAddress}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        permanentAddress: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">Permanent Address</label>
                </div>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx > 0) {
                      setActiveTab(tabs[idx - 1].key);
                    }
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-5 py-2 rounded-3 fw-semibold"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx < tabs.length - 1) {
                      setActiveTab(tabs[idx + 1].key);
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </form>
          )}

          {activeTab === "academic" && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="animate__animated animate__fadeIn"
            >
              <h4 className="mb-4 fw-semibold text-primary">
                Academic Information
              </h4>

              <h5 className="text-muted mb-3 border-bottom pb-2">
                Current Education
              </h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6 form-floating">
                  <select
                    className="form-select rounded-3"
                    value={currentEducation.collegeId}
                    onChange={(e) => {
                      const selectedCollege = colleges.find(
                        (c) => c.id === e.target.value,
                      );
                      setCurrentEducation({
                        ...currentEducation,
                        collegeId: e.target.value,
                        college: selectedCollege ? selectedCollege.name : "",
                        course: "", // Reset course when college changes
                        major: "", // Reset major when college changes
                      });
                    }}
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
                <div className="col-md-6 form-floating">
                  <select
                    className="form-select rounded-3"
                    value={currentEducation.course}
                    onChange={(e) => {
                      setCurrentEducation({
                        ...currentEducation,
                        course: e.target.value,
                        major: "", // Reset major when course changes
                      });
                    }}
                    required
                    disabled={!currentEducation.collegeId}
                  >
                    <option value="">Select Course</option>
                    {[
                      ...new Set(selectedCollegeCourses.map((c) => c.name)),
                    ].map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <label className="ms-2">Course</label>
                </div>
                <div className="col-md-6 form-floating">
                  <select
                    className="form-select rounded-3"
                    value={currentEducation.major}
                    onChange={(e) => {
                      setCurrentEducation({
                        ...currentEducation,
                        major: e.target.value,
                      });
                    }}
                    required
                    disabled={!currentEducation.course}
                  >
                    <option value="">Select Major/Specialization</option>
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
                  <label className="ms-2">Major/Specialization</label>
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
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                  <label className="ms-2">Study Year</label>
                </div>
                <div className="col-md-3 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="CGPA"
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
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Roll No"
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
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Graduating Year"
                    value={currentEducation.graduatingYear}
                    onChange={(e) =>
                      setCurrentEducation({
                        ...currentEducation,
                        graduatingYear: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">Graduating Year</label>
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    type="date"
                    className="form-control rounded-3"
                    value={currentEducation.joinDate}
                    onChange={(e) =>
                      setCurrentEducation({
                        ...currentEducation,
                        joinDate: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">Joining Date</label>
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="City"
                    value={currentEducation.city}
                    onChange={(e) =>
                      setCurrentEducation({
                        ...currentEducation,
                        city: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">City</label>
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="State"
                    value={currentEducation.state}
                    onChange={(e) =>
                      setCurrentEducation({
                        ...currentEducation,
                        state: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">State</label>
                </div>
              </div>

              <h5 className="text-muted mb-3 border-bottom pb-2">
                Previous Education
              </h5>
              <div className="row g-3">
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="School/College"
                    value={previousEducation.college}
                    onChange={(e) =>
                      setPreviousEducation({
                        ...previousEducation,
                        college: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">School/College Name</label>
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Board"
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
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="City"
                    value={previousEducation.city}
                    onChange={(e) =>
                      setPreviousEducation({
                        ...previousEducation,
                        city: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">City</label>
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="State"
                    value={previousEducation.state}
                    onChange={(e) =>
                      setPreviousEducation({
                        ...previousEducation,
                        state: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">State</label>
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Percentage"
                    value={previousEducation.percentage}
                    onChange={(e) =>
                      setPreviousEducation({
                        ...previousEducation,
                        percentage: e.target.value,
                      })
                    }
                    required
                  />
                  <label className="ms-2">Percentage/CGPA</label>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-5">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx > 0) {
                      setActiveTab(tabs[idx - 1].key);
                    }
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-5 py-2 rounded-3 fw-semibold"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx < tabs.length - 1) {
                      setActiveTab(tabs[idx + 1].key);
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </form>
          )}

          {activeTab === "skills" && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="animate__animated animate__fadeIn"
            >
              <h4 className="mb-4 fw-semibold text-primary">
                Skills & Interests
              </h4>

              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">
                  Technical Skills (Press Enter to add)
                </label>
                <div className="p-3 bg-white border rounded-4 shadow-sm mb-2">
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2"
                      >
                        {skill}{" "}
                        <i
                          className="bi bi-x-circle ms-1 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        ></i>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="form-control border-0 p-0 shadow-none"
                    placeholder="Type a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">
                  Interests (Press Enter to add)
                </label>
                <div className="p-3 bg-white border rounded-4 shadow-sm mb-2">
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {interests.map((interest, i) => (
                      <span
                        key={i}
                        className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2"
                      >
                        {interest}{" "}
                        <i
                          className="bi bi-x-circle ms-1 cursor-pointer"
                          onClick={() => removeInterest(interest)}
                        ></i>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="form-control border-0 p-0 shadow-none"
                    placeholder="Type an interest..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={addInterest}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between mt-5">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx > 0) {
                      setActiveTab(tabs[idx - 1].key);
                    }
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-5 py-2 rounded-3 fw-semibold"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx < tabs.length - 1) {
                      setActiveTab(tabs[idx + 1].key);
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </form>
          )}

          {activeTab === "projects" && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="animate__animated animate__fadeIn"
            >
              <h4 className="mb-4 fw-semibold text-primary d-flex align-items-center">
                <span style={{ marginRight: 6 }}>🚀</span> Projects & Work
                Experience
              </h4>

              {/* ================= PROJECTS ================= */}
              <div className="mb-5">
                <h5 className="section-title">🚀 Projects</h5>

                {projects.map((proj, idx) => (
                  <div key={idx} className="project-card-pro">
                    {/* HEADER */}
                    <div className="project-header">
                      <div>
                        <h6 className="project-title">
                          {proj.name || "Untitled Project"}
                        </h6>

                        <div className="project-tags">
                          <span className="badge bg-primary-subtle text-primary fw-semibold">
                            {proj.associated === "self"
                              ? "Self"
                              : proj.associated === "college"
                                ? "College"
                                : "Work"}
                          </span>

                          {(proj.startDate || proj.endDate) && (
                            <span className="badge bg-light border text-muted">
                              📅 {proj.startDate || ""}
                              {proj.startDate &&
                                (proj.endDate || proj.currentlyWorking) &&
                                " — "}
                              {proj.currentlyWorking
                                ? "Present"
                                : proj.endDate || ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          type="button"
                          onClick={() => setEditingProjIndex(idx)}
                          className="icon-btn"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(projects, setProjects, idx)}
                          className="icon-btn delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* EDIT MODE */}
                    {editingProjIndex === idx ? (
                      <>
                        <label className="form-label">Project Name</label>
                        <input
                          className="clean-input"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].name = e.target.value;
                            setProjects(updated);
                          }}
                        />

                        <label className="form-label">Description</label>
                        <textarea
                          className="clean-input"
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].description = e.target.value;
                            setProjects(updated);
                          }}
                        />

                        <div className="row g-2 mt-2">
                          <div className="col-md-6">
                            <label className="form-label">Start Date</label>
                            <input
                              type="date"
                              className="clean-input"
                              value={proj.startDate || ""}
                              onChange={(e) => {
                                const updated = [...projects];
                                updated[idx].startDate = e.target.value;
                                setProjects(updated);
                              }}
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">End Date</label>
                            <input
                              type="date"
                              className="clean-input"
                              disabled={proj.currentlyWorking}
                              value={
                                proj.currentlyWorking ? "" : proj.endDate || ""
                              }
                              onChange={(e) => {
                                const updated = [...projects];
                                updated[idx].endDate = e.target.value;
                                setProjects(updated);
                              }}
                            />
                          </div>
                        </div>

                        <div className="form-check mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={proj.currentlyWorking || false}
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[idx].currentlyWorking = e.target.checked;
                              if (e.target.checked) updated[idx].endDate = "";
                              setProjects(updated);
                            }}
                          />
                          <label className="form-check-label">
                            Currently Working
                          </label>
                        </div>

                        <label className="form-label mt-2">
                          Associated With
                        </label>
                        <select
                          className="clean-input"
                          value={proj.associated || "self"}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].associated = e.target.value;
                            setProjects(updated);
                          }}
                        >
                          <option value="self">Self</option>
                          <option value="college">College</option>
                          <option value="work">Work</option>
                        </select>

                        <label className="form-label mt-2">GitHub Link</label>
                        <input
                          className="clean-input"
                          value={proj.githubLink || ""}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].githubLink = e.target.value;
                            setProjects(updated);
                          }}
                        />
                        <label className="form-label mt-2">Live Link</label>
                        <input
                          className="clean-input"
                          value={proj.liveLink || ""}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].liveLink = e.target.value;
                            setProjects(updated);
                          }}
                        />

                        <div className="d-flex gap-2 mt-3">
                          <button
                            type="button"
                            className="btn-save"
                            onClick={() => setEditingProjIndex(null)}
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => {
                              if (!proj.name && !proj.description) {
                                removeItem(projects, setProjects, idx);
                              }
                              setEditingProjIndex(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* DESCRIPTION */}
                        <p className="project-description">
                          {proj.description}
                        </p>

                        {/* ACTION */}
                        {(proj.githubLink || proj.liveLink) && (
                          <div className="project-footer d-flex gap-2 mt-2">
                            {/* GitHub */}
                            {proj.githubLink && (
                              <a
                                href={
                                  proj.githubLink.startsWith("http")
                                    ? proj.githubLink
                                    : `https://${proj.githubLink}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-decoration-none"
                              >
                                <button className="btn btn-dark rounded-pill px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-github"></i>
                                  View Code
                                </button>
                              </a>
                            )}

                            {proj.liveLink && (
                              <a
                                href={
                                  proj.liveLink.startsWith("http")
                                    ? proj.liveLink
                                    : `https://${proj.liveLink}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-decoration-none"
                              >
                                <button className="btn btn-primary rounded-pill px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-globe"></i>
                                  Live Demo
                                </button>
                              </a>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-add"
                  onClick={() => {
                    const newItem = {
                      name: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                      associated: "self",
                      githubLink: "",
                      currentlyWorking: false,
                    };
                    setProjects([...projects, newItem]);
                    setEditingProjIndex(projects.length);
                  }}
                >
                  + Add Project
                </button>
              </div>
              <div className="mb-4">
                <h5 className="section-title">💼 Work Experience</h5>

                {experiences.map((exp, idx) => (
                  <div key={idx} className="clean-card">
                    <div className="card-header-row">
                      <div>
                        <div>
                          <h6 className="card-title d-flex align-items-center gap-2 mb-1">
                            <i className="bi bi-briefcase-fill text-primary"></i>
                            {exp.role || "New Role"}
                          </h6>

                          {exp.company && (
                            <div className="d-flex align-items-center gap-2 text-muted small">
                              <i className="bi bi-building"></i>
                              <span>{exp.company}</span>
                            </div>
                          )}
                        </div>
                        {/* ✅ ONLY SHOW WHEN EXISTS */}
                        {(exp.start_date || exp.end_date) && (
                          <small className="card-meta">
                            📅 {exp.start_date || ""}
                            {exp.start_date && exp.end_date && " — "}
                            {exp.end_date || "Present"}
                          </small>
                        )}
                      </div>

                      <div className="card-actions">
                        <button
                          type="button"
                          onClick={() => setEditingExpIndex(idx)}
                          className="icon-btn"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(experiences, setExperiences, idx)
                          }
                          className="icon-btn delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {editingExpIndex === idx ? (
                      <>
                        <label className="form-label">💼 Role</label>
                        <input
                          className="clean-input"
                          placeholder="Software Intern"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[idx].role = e.target.value;
                            setExperiences(updated);
                          }}
                        />

                        <label className="form-label">🏢 Company</label>
                        <input
                          className="clean-input"
                          placeholder="Google"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[idx].company = e.target.value;
                            setExperiences(updated);
                          }}
                        />

                        {/* ✅ DATE FIELDS */}
                        <div className="row g-2 mt-1">
                          <div className="col-md-6">
                            <label className="form-label">📅 Start Date</label>
                            <input
                              type="date"
                              className="clean-input"
                              value={formatDate(exp.start_date)}
                              onChange={(e) => {
                                const updated = [...experiences];
                                updated[idx].start_date = e.target.value;
                                setExperiences(updated);
                              }}
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">📅 End Date</label>
                            <input
                              type="date"
                              className="clean-input"
                              value={
                                exp.end_date && exp.end_date !== "Present"
                                  ? formatDate(exp.end_date)
                                  : ""
                              }
                              onChange={(e) => {
                                const updated = [...experiences];
                                updated[idx].end_date =
                                  e.target.value || "Present";
                                setExperiences(updated);
                              }}
                            />
                          </div>
                        </div>

                        <label className="form-label mt-2">
                          📝 Description
                        </label>
                        <textarea
                          className="clean-input"
                          placeholder="Describe your work..."
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[idx].description = e.target.value;
                            setExperiences(updated);
                          }}
                        />

                        <div className="d-flex gap-2 mt-3">
                          <button
                            type="button"
                            className="btn-save"
                            onClick={() => setEditingExpIndex(null)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => {
                              if (
                                !exp.role &&
                                !exp.company &&
                                !exp.description &&
                                !exp.start_date
                              ) {
                                removeItem(experiences, setExperiences, idx);
                              }
                              setEditingExpIndex(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="card-desc">{exp.description}</p>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-add success"
                  onClick={() => {
                    const newItem = {
                      role: "",
                      company: "",
                      description: "",
                      start_date: "",
                      end_date: "",
                    };
                    setExperiences([...experiences, newItem]);
                    setEditingExpIndex(experiences.length);
                  }}
                >
                  + Add Experience
                </button>
              </div>

              {/* NAV */}
              <div className="d-flex justify-content-between mt-5">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx > 0) {
                      setActiveTab(tabs[idx - 1].key);
                    }
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-5 py-2 rounded-3 fw-semibold"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx < tabs.length - 1) {
                      setActiveTab(tabs[idx + 1].key);
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </form>
          )}
          {activeTab === "certifications" && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="animate__animated animate__fadeIn"
            >
              <h4 className="mb-4 fw-semibold text-primary">Certifications</h4>

              {certifications.map((cert, idx) => (
                <div key={idx} className="clean-card">
                  <div className="card-header-row">
                    <div>
                      <h6 className="card-title">
                        {cert.name || "New Certification"}
                      </h6>
                      <span className="card-sub">{cert.organization}</span>
                    </div>

                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => setEditingCertIndex(idx)}
                        className="icon-btn"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(certifications, setCertifications, idx)
                        }
                        className="icon-btn delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {editingCertIndex === idx && (
                    <>
                      <label className="form-label">Certification Name</label>
                      <input
                        className="clean-input"
                        value={cert.name}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[idx].name = e.target.value;
                          setCertifications(updated);
                        }}
                      />

                      <label className="form-label">Organization</label>
                      <input
                        className="clean-input"
                        value={cert.organization}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[idx].organization = e.target.value;
                          setCertifications(updated);
                        }}
                      />

                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="button"
                          className="btn-save"
                          onClick={() => setEditingCertIndex(null)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => {
                            if (!cert.name && !cert.organization) {
                              removeItem(
                                certifications,
                                setCertifications,
                                idx,
                              );
                            }
                            setEditingCertIndex(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn-add info"
                onClick={() => {
                  const newItem = { name: "", organization: "" };
                  setCertifications([...certifications, newItem]);
                  setEditingCertIndex(certifications.length);
                }}
              >
                + Add Certification
              </button>

              <div className="d-flex justify-content-between mt-5">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx > 0) {
                      setActiveTab(tabs[idx - 1].key);
                    }
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-5 py-2 rounded-3 fw-semibold"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx < tabs.length - 1) {
                      setActiveTab(tabs[idx + 1].key);
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </form>
          )}
          {activeTab === "final" && (
            <form
              onSubmit={handleSubmit}
              className="animate__animated animate__fadeIn text-center"
            >
              <h4 className="mb-4 fw-semibold text-primary">
                Final Step: Profile Setup
              </h4>

              <div className="row g-4 mb-5">
                <div className="col-md-12">
                  <div
                    className="upload-container mx-auto border-2 border-dashed rounded-4 p-5 bg-light position-relative overflow-hidden shadow-sm"
                    style={{ maxWidth: "400px", cursor: "pointer" }}
                    onClick={() => document.getElementById("profile").click()}
                  >
                    <input
                      type="file"
                      id="profile"
                      className="d-none"
                      accept="image/*"
                      onChange={(e) => setProfileFile(e.target.files[0])}
                    />
                    <div className="text-muted">
                      {profileFile ? (
                        <>
                          <i className="bi bi-check-circle-fill fs-1 text-success mb-3 d-block"></i>
                          <p className="mb-0 fw-medium text-success">
                            Profile Selected!
                          </p>
                          <small className="opacity-75 text-dark">
                            {profileFile.name}
                          </small>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-bounding-box fs-1 text-primary mb-3 d-block"></i>
                          <p className="mb-0 fw-medium">
                            Upload Profile Picture
                          </p>
                          <small className="opacity-75">
                            JPEG, JPG or PNG (Max 2MB)
                          </small>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3"
                  onClick={() => {
                    const idx = tabs.findIndex((t) => t.key === activeTab);
                    if (idx > 0) {
                      setActiveTab(tabs[idx - 1].key);
                    }
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-success px-5 py-2 rounded-3 fw-bold shadow"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Complete Registration 🚀"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;

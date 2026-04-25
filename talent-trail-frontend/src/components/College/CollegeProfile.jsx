import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useNavigate } from "react-router-dom";

const CollegeProfile = () => {
  const disabledDefault = {
    institution: true,
    principal: true,
    placement: true,
    course: true,
    account: true,
  };
  const institutionDefault = {
    name: "",
    website: "",
    address: "",
    mobile: "",
  };
  const principalDefault = {
    fullName: "",
    position: "",
    mobile: "",
    email: "",
  };
  const placementDefault = {
    fullName: "",
    position: "",
    mobile: "",
    email: "",
  };
  const courseDefault = {
    name: "",
    duration: "",
    specialization: "",
  };

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

  const [disabled, setDisabled] = useState(disabledDefault);

  const [institution, setInstitution] = useState(institutionDefault);
  const [principal, setPrincipal] = useState(principalDefault);
  const [placement, setPlacement] = useState(placementDefault);
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState("");
  const [username, setUsername] = useState("");
  const [prevPassword, setPrevPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCourse, setNewCourse] = useState(courseDefault);
  const [editingCourseId, setEditingCourseId] = useState(null);

  const fetchCollege = async () => {
    try {
      const response = await axios.get("/college/details");

      const college = response?.data;
      setInstitution(college?.institution);
      setPrincipal(college?.principal);
      setPlacement(college?.placement);
      setCourses(college?.programs);
      setUsername(college?.username);
      setProfile(
        `data:image/jpeg;base64,${bufferToBase64(college?.logo?.data)}`,
      );
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await axios.get("/college/details");

        const college = response?.data;
        if (!college?.institution || !college?.principal || !college?.placement)
          return navigate("/collegeRegister");
        setInstitution(college?.institution);
        setPrincipal(college?.principal);
        setPlacement(college?.placement);
        setCourses(college?.programs);
        setUsername(college?.username);
        setProfile(
          `data:image/jpeg;base64,${bufferToBase64(college?.logo?.data)}`,
        );
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchCollege();
  }, [axios, navigate]);

  const handleInstitution = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/college/institution", {
        ...institution,
        mobile: parseInt(institution.mobile) || institution.mobile,
        institutionId: institution._id,
      });
      const success = response?.data?.success;
      if (success) notify("success", success);
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handlePrincipal = async (e) => {
    console.log("first");
    e.preventDefault();
    try {
      const response = await axios.put("/college/principal", {
        ...principal,
        mobile: parseInt(principal.mobile) || principal.mobile,
        principalId: principal._id,
      });
      const success = response?.data?.success;
      if (success) notify("success", success);
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handlePlacement = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/college/placement", {
        ...placement,
        mobile: parseInt(placement.mobile) || placement.mobile,
        placementId: placement._id,
      });
      const success = response?.data?.success;
      if (success) notify("success", success);
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourseId) {
        await axios.put("/college/course", {
          ...newCourse,
          courseId: editingCourseId,
        });
        notify("success", "Course updated");
      } else {
        await axios.post("/college/course", newCourse);
        notify("success", "Course added");
      }

      setNewCourse({ name: "", duration: "", specialization: "" });
      setEditingCourseId(null);
      fetchCollege();

      const modalEl = document.getElementById("courseModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };
  const handleDeleteCourse = async (id) => {
    try {
      await axios.delete(`/college/course/${id}`);
      notify("success", "Course deleted");
      fetchCollege();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleEditCourse = (course) => {
    setNewCourse({
      name: course.name,
      duration: course.duration,
      specialization: course.specialization,
    });

    setEditingCourseId(course._id);

    // ✅ OPEN modal (correct)
    const modal = new window.bootstrap.Modal(
      document.getElementById("courseModal"),
    );
    modal.show();
  };
  const handleLogo = async (e) => {
    e.preventDefault();
    try {
      const profile = document.getElementById("profile");
      const fd = new FormData();
      fd.append("profile", profile.files[0]);
      if (!fd) return;

      const response = await axios.post("/college/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const success = response?.data?.success;
      if (success) notify("success", success);

      fetchCollege();
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleUsername = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/username", { newUsername: username });
      const success = response?.data?.success;
      if (success) notify("success", success);
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/password", {
        prevPassword,
        newPassword,
      });
      const success = response?.data?.success;
      if (success) notify("success", success);

      setPrevPassword("");
      setNewPassword("");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const [activeTab, setActiveTab] = useState("institution");

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-12 px-md-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="bg-primary p-4 text-white d-flex align-items-center">
              <div className="me-4">
                {profile ? (
                  <img
                    src={profile}
                    className="rounded-circle border border-3 border-white-50"
                    height="80"
                    width="80"
                    style={{ objectFit: "cover" }}
                    alt="Logo"
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
                  {institution.name || "College Profile"}
                </h3>
                <p className="mb-0 opacity-75">{username}</p>
              </div>
            </div>

            <div className="card-header bg-white border-bottom-0 p-0">
              <ul className="nav nav-tabs nav-fill border-0">
                {[
                  {
                    id: "institution",
                    label: "Institution",
                    icon: "bi-building",
                  },
                  { id: "contacts", label: "Contacts", icon: "bi-people" },
                  { id: "courses", label: "Courses", icon: "bi-mortarboard" },
                  { id: "account", label: "Account", icon: "bi-shield-lock" },
                ].map((tab) => (
                  <li key={tab.id} className="nav-item">
                    <button
                      className={`nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-2 ${activeTab === tab.id ? "active border-bottom border-primary border-3 text-primary fw-bold" : "text-muted"}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`bi ${tab.icon}`}></i>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-body p-4 p-md-5 bg-white">
              {activeTab === "institution" && (
                <form className="animate__animated animate__fadeIn">
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    {/* HEADER */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold mb-0 text-primary">
                        <i className="bi bi-building me-2"></i>Institution
                        Details
                      </h5>

                      <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 ${
                          disabled.institution
                            ? "btn-outline-primary"
                            : "btn-outline-danger"
                        }`}
                        onClick={() =>
                          setDisabled({
                            ...disabled,
                            institution: !disabled.institution,
                          })
                        }
                      >
                        {disabled.institution ? "Edit" : "Cancel"}
                      </button>
                    </div>

                    {/* FORM */}
                    <fieldset disabled={disabled.institution}>
                      <div className="row g-3">
                        <div className="col-md-6 form-floating">
                          <input
                            className="form-control"
                            value={institution.name}
                            onChange={(e) =>
                              setInstitution({
                                ...institution,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                          <label className="ms-2">College Name</label>
                        </div>

                        <div className="col-md-6 form-floating">
                          <input
                            className="form-control"
                            value={institution.website}
                            onChange={(e) =>
                              setInstitution({
                                ...institution,
                                website: e.target.value,
                              })
                            }
                          />
                          <label className="ms-2">Website</label>
                        </div>

                        <div className="col-12 form-floating">
                          <textarea
                            className="form-control"
                            style={{ height: "100px" }}
                            value={institution.address}
                            onChange={(e) =>
                              setInstitution({
                                ...institution,
                                address: e.target.value,
                              })
                            }
                          />
                          <label className="ms-2">Address</label>
                        </div>

                        <div className="col-md-6 form-floating">
                          <input
                            className="form-control"
                            value={institution.mobile}
                            onChange={(e) =>
                              setInstitution({
                                ...institution,
                                mobile: e.target.value,
                              })
                            }
                          />
                          <label className="ms-2">Contact Number</label>
                        </div>
                      </div>

                      {!disabled.institution && (
                        <div className="text-end mt-4">
                          <button
                            className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
                            onClick={handleInstitution}
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </fieldset>
                  </div>

                  {/* LOGO SECTION */}
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h5 className="fw-bold mb-4 text-secondary">
                      <i className="bi bi-image me-2"></i>Institution Logo
                    </h5>

                    <div className="d-flex align-items-center gap-4">
                      <div className="bg-light p-2 rounded-circle shadow-sm">
                        {profile ? (
                          <img
                            src={profile}
                            className="rounded-circle"
                            height="80"
                            width="80"
                            style={{ objectFit: "cover" }}
                            alt="Logo"
                          />
                        ) : (
                          <div style={{ width: 80, height: 80 }}></div>
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <input
                          className="form-control form-control-sm mb-2"
                          type="file"
                          id="profile"
                        />

                        <button
                          className="btn btn-dark btn-sm rounded-pill px-4"
                          onClick={handleLogo}
                        >
                          Upload Logo
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === "contacts" && (
                <div className="animate__animated animate__fadeIn">
                  {/* PRINCIPAL */}
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h5 className="fw-bold mb-4 text-primary d-flex justify-content-between">
                      <span>
                        <i className="bi bi-person-badge me-2"></i>Principal
                      </span>
                    </h5>

                    <form className="row g-3" onSubmit={handlePrincipal}>
                      <div className="col-md-6 form-floating">
                        <input
                          className="form-control"
                          value={principal.fullName}
                          onChange={(e) =>
                            setPrincipal({
                              ...principal,
                              fullName: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Full Name</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <input
                          className="form-control"
                          value={principal.position}
                          onChange={(e) =>
                            setPrincipal({
                              ...principal,
                              position: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Position</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <input
                          type="email"
                          className="form-control"
                          value={principal.email}
                          onChange={(e) =>
                            setPrincipal({
                              ...principal,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Email</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <input
                          className="form-control"
                          value={principal.mobile}
                          onChange={(e) =>
                            setPrincipal({
                              ...principal,
                              mobile: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Mobile</label>
                      </div>

                      <div className="text-end">
                        <button className="btn btn-primary rounded-pill px-4 fw-semibold">
                          Save Principal
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* PLACEMENT */}
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h5 className="fw-bold mb-4 text-success d-flex justify-content-between">
                      <span>
                        <i className="bi bi-briefcase-fill me-2"></i>Placement
                        Officer
                      </span>
                    </h5>

                    <form className="row g-3" onSubmit={handlePlacement}>
                      <div className="col-md-6 form-floating">
                        <input
                          className="form-control"
                          value={placement.fullName}
                          onChange={(e) =>
                            setPlacement({
                              ...placement,
                              fullName: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Full Name</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <input
                          className="form-control"
                          value={placement.position}
                          onChange={(e) =>
                            setPlacement({
                              ...placement,
                              position: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Position</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <input
                          type="email"
                          className="form-control"
                          value={placement.email}
                          onChange={(e) =>
                            setPlacement({
                              ...placement,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Email</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <input
                          className="form-control"
                          value={placement.mobile}
                          onChange={(e) =>
                            setPlacement({
                              ...placement,
                              mobile: e.target.value,
                            })
                          }
                          required
                        />
                        <label className="ms-2">Mobile</label>
                      </div>

                      <div className="text-end">
                        <button className="btn btn-success rounded-pill px-4 fw-semibold">
                          Save Placement
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "courses" && (
                <div className="animate__animated animate__fadeIn">
                  {/* HEADER */}
                  <h5 className="fw-bold mb-4 d-flex justify-content-between align-items-center">
                    Courses
                    <button
                      className="btn btn-sm btn-outline-dark rounded-pill px-3"
                      data-bs-toggle="modal"
                      data-bs-target="#courseModal"
                      onClick={() => {
                        setNewCourse({
                          name: "",
                          duration: "",
                          specialization: "",
                        });
                        setEditingCourseId(null);
                      }}
                    >
                      + Add Course
                    </button>
                  </h5>

                  {/* EMPTY STATE */}
                  {courses.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-mortarboard fs-1 d-block mb-2"></i>
                      No courses added
                    </div>
                  ) : (
                    /* GRID */
                    <div className="row g-3">
                      {courses.map((course) => (
                        <div key={course._id} className="col-md-4">
                          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 course-card">
                            <div className="d-flex justify-content-between align-items-start">
                              {/* CONTENT */}
                              <div style={{ flex: 1 }}>
                                <h6 className="fw-bold mb-1">{course.name}</h6>

                                <div className="small text-muted">
                                  {course.specialization}
                                </div>

                                <div className="small text-secondary mt-1 d-flex align-items-center gap-2">
                                  <i className="bi bi-calendar3 text-primary"></i>
                                  {course.duration} Years
                                </div>
                              </div>

                              {/* ACTION BUTTONS */}
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm border-0 bg-light rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: "32px", height: "32px" }}
                                  onClick={() => handleEditCourse(course)}
                                >
                                  ✏️
                                </button>

                                <button
                                  className="btn btn-sm border-0 bg-light rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: "32px", height: "32px" }}
                                  onClick={() => handleDeleteCourse(course._id)}
                                >
                                  <i className="bi bi-trash text-danger"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* HOVER EFFECT */}
                  <style>{`
      .course-card {
        transition: all 0.25s ease;
      }
      .course-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      }
    `}</style>
                </div>
              )}
              {activeTab === "account" && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card shadow-sm border-0 rounded-4 p-4">
                      <h5 className="fw-bold mb-4 text-primary">
                        <i className="bi bi-person-badge me-2"></i>Username
                      </h5>

                      <form onSubmit={handleUsername}>
                        <div className="form-floating mb-3">
                          <input
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                          <label>Username</label>
                        </div>

                        <button className="btn btn-primary w-100 rounded-pill fw-bold">
                          Update Username
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card shadow-sm border-0 rounded-4 p-4">
                      <h5 className="fw-bold mb-4 text-danger">
                        <i className="bi bi-shield-lock me-2"></i>Password
                      </h5>

                      <form onSubmit={handlePassword}>
                        <div className="form-floating mb-3">
                          <input
                            type="password"
                            className="form-control"
                            value={prevPassword}
                            onChange={(e) => setPrevPassword(e.target.value)}
                            required
                          />
                          <label>Old Password</label>
                        </div>

                        <div className="form-floating mb-3">
                          <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                          <label>New Password</label>
                        </div>

                        <button className="btn btn-danger w-100 rounded-pill fw-bold">
                          Update Password
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="courseModal" tabIndex="-1">
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content border-0 rounded-4 shadow">

      <div className="modal-header border-0 p-4">
        <h5 className="modal-title fw-bold">
          {editingCourseId ? "Edit Course" : "Add Course"}
        </h5>
        <button className="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <form onSubmit={handleSaveCourse}>
        <div className="modal-body p-4 pt-0">

          <div className="form-floating mb-3">
            <input
              className="form-control"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
              required
            />
            <label>Course Name</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="number"
              className="form-control"
              value={newCourse.duration}
              onChange={(e) =>
                setNewCourse({ ...newCourse, duration: e.target.value })
              }
              required
            />
            <label>Duration</label>
          </div>

          <div className="form-floating mb-3">
            <input
              className="form-control"
              value={newCourse.specialization}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  specialization: e.target.value,
                })
              }
            />
            <label>Specialization</label>
          </div>

        </div>

        <div className="modal-footer border-0 p-4 pt-0">
          <button className="btn btn-light" data-bs-dismiss="modal">
            Cancel
          </button>
          <button className="btn btn-dark">
            {editingCourseId ? "Update" : "Add"}
          </button>
        </div>
      </form>

    </div>
  </div>
</div>
    </div>
    
  );
};

export default CollegeProfile;

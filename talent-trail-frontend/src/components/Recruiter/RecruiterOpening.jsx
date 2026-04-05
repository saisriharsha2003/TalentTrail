import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useNavigate } from "react-router-dom";

const RecruiterOpening = () => {
  const stored = localStorage.getItem("jdOutput");
  let parsed = null;

  try {
    parsed = stored && stored !== "undefined" ? JSON.parse(stored) : null;
  } catch {
    parsed = null;
  }

  const jd = parsed?.job_data || {};

  const initjobDefault = {
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    location: "",
    workType: "",
    employmentType: "",
    experienceRequired: "",
    numberOfOpenings: "",
    salaryRange: "",
    requiredSkills: [],
    preferredSkills: [],
    educationRequired: [],
    minimumCGPA: "",
    applicationDeadline: "",
    responsibilities: "",
    requirements: "",
    companyWebsite: "",
    companyDescription: "",
    jobCategory: "",
    department: "",
    applicationFor: "",
  };

  const jobDefault = { ...initjobDefault, ...jd };

  const [job, setJob] = useState(jobDefault);
  const [colleges, setColleges] = useState([]);

  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get("/recruiter/colleges");
        setColleges(res?.data || []);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchColleges();
  }, [axios]);

  const handleJob = async (e) => {
    e.preventDefault();

    try {
      console.log("Job:", job);
      const payload = {
        ...job,
        numberOfOpenings: job.numberOfOpenings ? parseInt(job.numberOfOpenings) : undefined,
        minimumCGPA: job.minimumCGPA ? parseFloat(job.minimumCGPA) : undefined,
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline) : undefined,
        companyWebsite: job.companyWebsite || undefined,
        department: job.department || undefined,
      };

      const res = await axios.post("/recruiter/job/new", payload);

      if (res?.data?.success) {
        notify("success", res.data.success);
        localStorage.removeItem("jdOutput");
        setJob(initjobDefault);
      }
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  return (
    <div className="d-flex justify-content-center my-4">
      <div className="container" style={{ maxWidth: "1000px" }}>
        <div className="card p-4 shadow-sm rounded-4 border-0">
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold">Post Job</h3>
            <button
              onClick={() => navigate("/uploadJD")}
              className="btn btn-outline-dark"
            >
              Upload JD
            </button>
          </div>

          <form onSubmit={handleJob}>
            {/* ---------------- BASIC INFO ---------------- */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-3 text-primary">Basic Info</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Job Title</label>
                  <input
                    className="form-control"
                    value={job.jobTitle}
                    onChange={(e) =>
                      setJob({ ...job, jobTitle: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Company Name</label>
                  <input
                    className="form-control"
                    value={job.companyName}
                    onChange={(e) =>
                      setJob({ ...job, companyName: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Location</label>
                  <input
                    className="form-control"
                    value={job.location}
                    onChange={(e) =>
                      setJob({ ...job, location: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Experience</label>
                  <input
                    className="form-control"
                    value={job.experienceRequired}
                    onChange={(e) =>
                      setJob({ ...job, experienceRequired: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Openings</label>
                  <input
                    className="form-control"
                    value={job.numberOfOpenings}
                    onChange={(e) =>
                      setJob({ ...job, numberOfOpenings: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Salary Range</label>
                  <input
                    className="form-control"
                    value={job.salaryRange}
                    onChange={(e) =>
                      setJob({ ...job, salaryRange: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ---------------- JOB DETAILS ---------------- */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-3 text-primary">Job Details</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Work Type</label>
                  <input
                    className="form-control"
                    value={job.workType}
                    onChange={(e) =>
                      setJob({ ...job, workType: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Employment Type
                  </label>
                  <input
                    className="form-control"
                    value={job.employmentType}
                    onChange={(e) =>
                      setJob({ ...job, employmentType: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Minimum CGPA</label>
                  <input
                    className="form-control"
                    value={job.minimumCGPA}
                    onChange={(e) =>
                      setJob({ ...job, minimumCGPA: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={job.applicationDeadline}
                    onChange={(e) =>
                      setJob({ ...job, applicationDeadline: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-medium">
                    Application For
                  </label>
                  <select
                    className="form-select"
                    value={job.applicationFor}
                    onChange={(e) =>
                      setJob({ ...job, applicationFor: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="Everyone">Global Pool</option>
                    {colleges.map((c, i) => (
                      <option key={i}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ---------------- DESCRIPTION ---------------- */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-3 text-primary">Description</h5>

              <label className="form-label fw-medium">Job Description</label>
              <textarea
                className="form-control mb-3"
                rows="4"
                value={job.jobDescription}
                onChange={(e) =>
                  setJob({ ...job, jobDescription: e.target.value })
                }
              />

              <label className="form-label fw-medium">Responsibilities</label>
              <textarea
                className="form-control mb-3"
                rows="4"
                value={job.responsibilities}
                onChange={(e) =>
                  setJob({ ...job, responsibilities: e.target.value })
                }
              />

              <label className="form-label fw-medium">Requirements</label>
              <textarea
                className="form-control"
                rows="4"
                value={job.requirements}
                onChange={(e) =>
                  setJob({ ...job, requirements: e.target.value })
                }
              />
            </div>

            {/* ---------------- SKILLS ---------------- */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-3 text-primary">Skills</h5>

              <label className="form-label fw-medium">Required Skills</label>
              <textarea
                className="form-control mb-3"
                value={job.requiredSkills.join(", ")}
                onChange={(e) =>
                  setJob({ ...job, requiredSkills: e.target.value.split(",") })
                }
              />

              <label className="form-label fw-medium">Preferred Skills</label>
              <textarea
                className="form-control"
                value={job.preferredSkills.join(", ")}
                onChange={(e) =>
                  setJob({ ...job, preferredSkills: e.target.value.split(",") })
                }
              />
            </div>

            {/* SUBMIT */}
            <div className="text-end">
              <button className="btn btn-primary px-4 py-2">Submit Job</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecruiterOpening;

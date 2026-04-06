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
    role: "",
    responsibilities: "",
    skills: [],
    eligibleBatch: "",
    jobCategory: "",
    department: "",
    applicationFor: "",
  };

  const jobDefault = { ...initjobDefault, ...jd };

  const [job, setJob] = useState(jobDefault);
  const [colleges, setColleges] = useState([]);
  const [skillsInput, setSkillsInput] = useState("");


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
      const payload = {
        ...job,
        numberOfOpenings: job.numberOfOpenings
          ? parseInt(job.numberOfOpenings)
          : undefined,
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
    <div className="container my-5" style={{ maxWidth: "1000px" }}>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Post Job</h2>
          <p className="text-muted mb-0">
            Fill details or upload JD to auto-fill
          </p>
        </div>

        <button
          onClick={() => navigate("/uploadJD")}
          className="btn btn-outline-dark"
        >
          Upload JD
        </button>
      </div>

      <form onSubmit={handleJob}>

        <Card title="📌 Basic Info">
          <Row>
            <Input label="Job Title" value={job.jobTitle}
              onChange={(v) => setJob({ ...job, jobTitle: v })} />

            <Input label="Company Name" value={job.companyName}
              onChange={(v) => setJob({ ...job, companyName: v })} />

            <Input label="Location" value={job.location}
              onChange={(v) => setJob({ ...job, location: v })} />

            <Input label="Experience" value={job.experienceRequired}
              onChange={(v) => setJob({ ...job, experienceRequired: v })} />

            <Input label="Openings" value={job.numberOfOpenings}
              onChange={(v) => setJob({ ...job, numberOfOpenings: v })} />

            <Input label="Salary Range" value={job.salaryRange}
              onChange={(v) => setJob({ ...job, salaryRange: v })} />
          </Row>
        </Card>

        <Card title="💼 Job Details">
          <Row>
            <Select label="Work Type" value={job.workType}
              options={["Onsite", "Remote", "Hybrid"]}
              onChange={(v) => setJob({ ...job, workType: v })} />

            <Select label="Employment Type" value={job.employmentType}
              options={["Full-time", "Part-time", "Internship", "Contract"]}
              onChange={(v) => setJob({ ...job, employmentType: v })} />

            <Input label="Eligible Batch"
              value={job.eligibleBatch}
              onChange={(v) => setJob({ ...job, eligibleBatch: v })} />

            <Select label="Application For"
              value={job.applicationFor}
              options={["Everyone", ...colleges]}
              onChange={(v) => setJob({ ...job, applicationFor: v })} />
          </Row>
        </Card>

        <Card title="📄 Description">
          <Textarea label="Job Description"
            value={job.jobDescription}
            onChange={(v) => setJob({ ...job, jobDescription: v })} />

          <Textarea label="Role"
            value={job.role}
            onChange={(v) => setJob({ ...job, role: v })} />

          <Textarea label="Responsibilities"
            value={job.responsibilities}
            onChange={(v) => setJob({ ...job, responsibilities: v })} />
        </Card>

        <Card title="🛠 Skills">

          <input
            className="form-control"
            placeholder="Type a skill and press Enter"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && skillsInput.trim()) {
                e.preventDefault();

                if (!job.skills.includes(skillsInput.trim())) {
                  setJob({
                    ...job,
                    skills: [...job.skills, skillsInput.trim()],
                  });
                }

                setSkillsInput("");
              }
            }}
          />

          <div className="mt-3">
            {job.skills.map((skill, i) => (
              <span
                key={i}
                className="badge bg-dark me-2 mb-2 px-3 py-2 rounded-pill"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setJob({
                    ...job,
                    skills: job.skills.filter((_, index) => index !== i),
                  })
                }
              >
                {skill} ❌
              </span>
            ))}
          </div>

        </Card>

        <Card title="📊 Category">
          <Row>
            <Input label="Job Category" value={job.jobCategory}
              onChange={(v) => setJob({ ...job, jobCategory: v })} />

            <Input label="Department" value={job.department}
              onChange={(v) => setJob({ ...job, department: v })} />
          </Row>
        </Card>

        <div className="text-end mt-4">
          <button className="btn btn-primary px-4 py-2">
            Submit Job
          </button>
        </div>

      </form>
    </div>
  );
};

/* 🔥 REUSABLE UI COMPONENTS */

const Card = ({ title, children }) => (
  <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
    <h5 className="fw-semibold mb-3">{title}</h5>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div className="row g-3">{children}</div>
);

const Input = ({ label, value, onChange }) => (
  <div className="col-md-6">
    <label className="form-label">{label}</label>
    <input
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div className="col-md-6">
    <label className="form-label">{label}</label>
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select</option>
      {options.map((o, i) => (
        <option key={i}>{o}</option>
      ))}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <textarea
      className="form-control"
      rows="3"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default RecruiterOpening;
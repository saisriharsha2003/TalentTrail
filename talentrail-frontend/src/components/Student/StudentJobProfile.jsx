import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useNavigate, useParams } from "react-router-dom";

const StudentJobProfile = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const [company, setCompany] = useState({});
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  useEffect(() => {
    const fetchJobProfile = async () => {
      try {
        const res = await axios.get("/student/jobProfile/" + id);
        setJob(res?.data?.job || {});
        setCompany(res?.data?.company || {});
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };
    fetchJobProfile();
  }, [axios, id]);

  const handleJobApplication = async () => {
    try {
      const res = await axios.post("/student/application", { jobId: id });
      if (res?.data?.success) {
        notify("success", res.data.success);
        navigate('/user/student/applied');
      }
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  return (
    <div className="container my-5 style={{ maxWidth: '1200px' }}">

      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
        <h2 className="fw-bold">{job.jobTitle || "Untitled Role"}</h2>
        <h5 className="text-muted">{job.companyName}</h5>

        <div className="d-flex flex-wrap gap-3 mt-3">
          <span className="badge bg-light text-dark">
            📍 {job.location || "N/A"}
          </span>
          <span className="badge bg-light text-dark">
            💼 {job.employmentType || "N/A"}
          </span>
          <span className="badge bg-light text-dark">
            🧠 {job.experienceRequired || "N/A"}
          </span>
          {job.salaryRange && (
            <span className="badge bg-success">
              💰 ₹{job.salaryRange}
            </span>
          )}
          {job.numberOfOpenings && (
            <span className="badge bg-info text-dark">
              🔢 {job.numberOfOpenings} openings
            </span>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={handleJobApplication}
            className="btn btn-primary px-4 py-2"
          >
            Apply Now 🚀
          </button>
        </div>
      </div>

      <div className="row g-4">

        <div className="col-md-7">
          <div className="card shadow-sm border-0 rounded-4 p-4">

            <h4 className="fw-semibold mb-3">📄 Job Details</h4>

            <Section title="Description" value={job.jobDescription} />
            <Section title="Role" value={job.role} />
            <Section title="Responsibilities" value={job.responsibilities} />

            <Field label="Eligible Batch" value={job.eligibleBatch} />

            <div className="mt-3">
              <strong>🛠 Skills:</strong>
              <div className="mt-2">
                {job.skills?.length ? (
                  job.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="badge me-2 mb-2 px-3 py-2"
                      style={{
                        borderRadius: "20px",
                        backgroundColor: "#212529",
                        color: "#fff",
                        fontSize: "0.85rem"
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-muted mt-2">No skills provided</p>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="col-md-5">
          <div className="card shadow-sm border-0 rounded-4 p-4">

            <h4 className="fw-semibold mb-3">🏢 Company Profile</h4>

            <Field label="Name" value={company.name} />
            <Field label="Industry" value={company.industry} />
            <Field label="Size" value={company.size} />

            <Field
              label="Website"
              value={
                company.website ? (
                  <a
                    href={`https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {company.website}
                  </a>
                ) : null
              }
            />

            <Field label="Address" value={company.address} />
            <Field label="Mobile" value={company.mobile} />
            <Section title="Overview" value={company.overview} />

          </div>
        </div>

      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <p className="mb-2">
    <strong>{label}:</strong> {value || "N/A"}
  </p>
);

const Section = ({ title, value }) => (
  <div className="mb-3">
    <strong>{title}:</strong>
    <p className="text-muted mb-0">{value || "Not provided"}
    </p>
  </div>
);

export default StudentJobProfile;
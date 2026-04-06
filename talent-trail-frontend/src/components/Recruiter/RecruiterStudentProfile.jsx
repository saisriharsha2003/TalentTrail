import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useParams } from "react-router-dom";

const RESUMES_URL = "http://localhost:3500/resumes";

const RecruiterStudentProfile = () => {
  const { id } = useParams();
  const axios = useAxiosPrivate();

  const [jobs, setJobs] = useState([]);
  const [resume, setResume] = useState("");

  const [currentEducation, setCurrentEducation] = useState({
    skills: [],
    interests: []
  });

  const [previousEducation, setPreviousEducation] = useState({});
  const [contact, setContact] = useState({});
  const [personal, setPersonal] = useState({});
  const [certifications, setCertifications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [works, setWorks] = useState([]);

  const [scores, setScores] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);

  const [sent1, setSent1] = useState("");
  const [sent2, setSent2] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/recruiter/studentProfile/${id}`);

        const jobs = (res?.data?.jobs || []).map(j => ({
          ...j.jobId,
          applicationId: j._id
        }));

        const student = res?.data?.student || {};

        const skills = student?.academic?.currentEducation?.skills || [];
        const interests = student?.academic?.currentEducation?.interests || [];

        setJobs(jobs);
        setResume(student?.resume || "");

        setCurrentEducation({
          ...student?.academic?.currentEducation,
          skills: Array.isArray(skills) ? skills : skills.split(",") || [],
          interests: Array.isArray(interests) ? interests : interests.split(",") || []
        });

        setPreviousEducation(student?.academic?.previousEducation || {});
        setContact(student?.contact || {});
        setPersonal(student?.personal || {});
        setCertifications(student?.certifications || []);
        setProjects(student?.projects || []);
        setWorks(student?.workExperiences || []);

        setSent1(Array.isArray(skills) ? skills.join(",") : skills || "");

        let certText = "";
        (student?.certifications || []).forEach(c => {
          certText += `${c.name} ${c.organization},`;
        });
        setSent2(certText);

      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };

    fetchData();
  }, [axios, id]);


  const handleSelect = async (i) => {
    try {
      await axios.post("/recruiter/application", {
        applicationId: jobs[i].applicationId,
        status: "selected"
      });
      notify("success", "Selected");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const handleReject = async (i) => {
    try {
      await axios.post("/recruiter/application", {
        applicationId: jobs[i].applicationId,
        status: "rejected"
      });
      notify("success", "Rejected");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const computeCapability = async (job) => {
    try {
      const studentText =
        "skills:\n" + sent1 + "\ncertifications:\n" + sent2;

      const res = await axios.post("/recruiter/capabilityCal", {
        sent1: studentText,
        sent2: job.description
      });

      setScores(prev => ({
        ...prev,
        [job._id]: res.data.score.similarity_matrix
      }));

      notify("success", "Capability calculated");

    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const Field = ({ label, value }) => (
    <p className="mb-2">
      <strong>{label}:</strong> {value || "N/A"}
    </p>
  );

  const Section = ({ title, children }) => (
    <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
      <h5 className="fw-bold mb-3">{title}</h5>
      {children}
    </div>
  );


  return (
    <div className="container my-5">

      <Section title="Student Profile">
        <a href={`${RESUMES_URL}/${resume}`} target="_blank">
          📄 View Resume
        </a>
      </Section>

      <Section title="Academic">
        <div className="row">
          <div className="col-md-6">
            <h6>Current</h6>
            <Field label="College" value={currentEducation.college} />
            <Field label="Course" value={currentEducation.course} />
            <Field label="CGPA" value={currentEducation.cgpa} />

            <div className="mt-2">
              {(currentEducation.skills || []).map((s, i) => (
                <span key={i} className="badge bg-dark me-2 mb-2">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <h6>Previous</h6>
            <Field label="College" value={previousEducation.college} />
            <Field label="Percentage" value={previousEducation.percentage} />
          </div>
        </div>
      </Section>

      <div className="row">
        <div className="col-md-6">
          <Section title="Personal">
            <Field label="Name" value={personal.fullName} />
            <Field label="Father" value={personal.fatherName} />
            <Field label="Mother" value={personal.motherName} />
            <Field label="DOB" value={personal.dateOfBirth} />
            <Field label="Gender" value={personal.gender} />
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Contact">
            <Field label="Email" value={contact.email} />
            <Field label="Mobile" value={contact.mobile} />
            <Field label="Current Address" value={contact.currentAddress} />
            <Field label="Permanent Address" value={contact.permanentAddress} />
          </Section>
        </div>
      </div>

      <Section title="Certifications">
        {(certifications || []).map((c, i) => (
          <div key={i}>
            <strong>{c.name}</strong> — {c.organization}
          </div>
        ))}
      </Section>

      <Section title="Projects">
        {(projects || []).map((p, i) => (
          <div key={i}>
            <strong>{p.name}</strong>
            <p className="text-muted small">{p.description}</p>
          </div>
        ))}
      </Section>

      <Section title="Work Experience">
        {(works || []).map((w, i) => (
          <div key={i}>
            <strong>{w.organization}</strong> — {w.role}
            <p className="text-muted small">{w.description}</p>
          </div>
        ))}
      </Section>

      {jobs.length > 0 && (
        <Section title="Applications">

          <div className="d-flex justify-content-between mb-3">
            <button className="btn btn-dark"
              onClick={() =>
                setActiveIndex(p => (p - 1 + jobs.length) % jobs.length)
              }>
              ←
            </button>

            <button className="btn btn-dark"
              onClick={() =>
                setActiveIndex(p => (p + 1) % jobs.length)
              }>
              →
            </button>
          </div>

          {jobs[activeIndex] && (
            <div className="card p-4">

              <h5>{jobs[activeIndex].jobRole}</h5>
              <p>{jobs[activeIndex].companyName}</p>

              <p className="text-muted">
                {jobs[activeIndex].description}
              </p>

              <div className="d-flex gap-2">
                <button
                  onClick={() => handleSelect(activeIndex)}
                  className="btn btn-success"
                >
                  Select
                </button>

                <button
                  onClick={() => handleReject(activeIndex)}
                  className="btn btn-danger"
                >
                  Reject
                </button>
              </div>

              <button
                className="btn btn-outline-dark mt-3"
                onClick={() => computeCapability(jobs[activeIndex])}
              >
                Match ⚡
              </button>

              {scores[jobs[activeIndex]._id] && (
                <div className="mt-2 fw-bold">
                  Score: {scores[jobs[activeIndex]._id]}%
                </div>
              )}

            </div>
          )}

        </Section>
      )}

    </div>
  );
};

export default RecruiterStudentProfile;
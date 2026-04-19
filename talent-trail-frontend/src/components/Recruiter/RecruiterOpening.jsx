import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useNavigate, useLocation } from "react-router-dom";

const RecruiterOpening = () => {
  const [step, setStep] = useState(1);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const navigate = useNavigate();
  const location = useLocation();
  const axios = useAxiosPrivate();

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

  const [job, setJob] = useState(initjobDefault);
  const [colleges, setColleges] = useState([]);
  const [skillsInput, setSkillsInput] = useState("");

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

  useEffect(() => {
    const stored = localStorage.getItem("jdOutput");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const jd = parsed?.job_data || {};
        setJob((prev) => ({ ...prev, ...jd }));
        if (location.state?.fromJD) {
          notify("success", "JD parsed and filled!");
        }
      } catch {}
    }
  }, [location.state]);

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
        navigate("/user/recruiter/posted");
      }
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }
  };

  const StepIndicator = () => (
    <div className="d-flex justify-content-between mb-5 position-relative">
      <div className="position-absolute top-50 start-0 end-0 border-top"></div>
      {[1, 2, 3, 4].map((num) => (
        <div
          key={num}
          className={`rounded-circle d-flex align-items-center justify-content-center 
          ${step >= num ? "bg-primary text-white" : "bg-light text-muted"}`}
          style={{ width: "40px", height: "40px", zIndex: 1 }}
        >
          {num}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 rounded-4 p-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="fw-bold mb-1">Post Job</h2>
            <p className="text-muted mb-0">Step-by-step job creation</p>
          </div>
          <button
            onClick={() => navigate("/user/recruiter/uploadJD")}
            className="btn btn-outline-dark"
          >
            Upload JD ⚡
          </button>
        </div>

        <StepIndicator />

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
            <h5 className="mb-3">📌 Basic Info</h5>
            <Row>
              <Input label="Job Title" value={job.jobTitle} onChange={(v)=>setJob({...job,jobTitle:v})}/>
              <Input label="Company Name" value={job.companyName} onChange={(v)=>setJob({...job,companyName:v})}/>
              <Input label="Location" value={job.location} onChange={(v)=>setJob({...job,location:v})}/>
              <Input label="Salary Range" value={job.salaryRange} onChange={(v)=>setJob({...job,salaryRange:v})}/>
            </Row>
            <div className="text-end mt-4">
              <button className="btn btn-primary">Next →</button>
            </div>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
            <h5 className="mb-3">💼 Job Details</h5>
            <Row>
              <Select label="Work Type" value={job.workType} options={["Onsite","Remote","Hybrid"]} onChange={(v)=>setJob({...job,workType:v})}/>
              <Select label="Employment Type" value={job.employmentType} options={["Full-time","Part-time","Internship","Contract"]} onChange={(v)=>setJob({...job,employmentType:v})}/>
              <Input label="Experience" value={job.experienceRequired} onChange={(v)=>setJob({...job,experienceRequired:v})}/>
              <Input label="Openings" value={job.numberOfOpenings} onChange={(v)=>setJob({...job,numberOfOpenings:v})}/>
            </Row>
            <div className="d-flex justify-content-between mt-4">
              <button type="button" onClick={prevStep} className="btn btn-outline-secondary">Back</button>
              <button className="btn btn-primary">Next →</button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
            <h5 className="mb-3">🎯 Eligibility & Application</h5>
            <Row>
              <Input label="Eligible Batch" value={job.eligibleBatch} onChange={(v)=>setJob({...job,eligibleBatch:v})}/>
              <Select label="Application For" value={job.applicationFor} options={["Everyone",...colleges]} onChange={(v)=>setJob({...job,applicationFor:v})}/>
              <Input label="Job Category" value={job.jobCategory} onChange={(v)=>setJob({...job,jobCategory:v})}/>
              <Input label="Department" value={job.department} onChange={(v)=>setJob({...job,department:v})}/>
            </Row>
            <div className="d-flex justify-content-between mt-4">
              <button type="button" onClick={prevStep} className="btn btn-outline-secondary">Back</button>
              <button className="btn btn-primary">Next →</button>
            </div>
          </form>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <form onSubmit={handleJob}>
            <h5 className="mb-3">📄 Description & Skills</h5>

            <Textarea label="Job Description" value={job.jobDescription} onChange={(v)=>setJob({...job,jobDescription:v})}/>
            <Textarea label="Role" value={job.role} onChange={(v)=>setJob({...job,role:v})}/>
            <Textarea label="Responsibilities" value={job.responsibilities} onChange={(v)=>setJob({...job,responsibilities:v})}/>

            <input
              className="form-control mt-3"
              placeholder="Type skill and press Enter"
              value={skillsInput}
              onChange={(e)=>setSkillsInput(e.target.value)}
              onKeyDown={(e)=>{
                if(e.key==="Enter" && skillsInput.trim()){
                  e.preventDefault();
                  if(!job.skills.includes(skillsInput.trim())){
                    setJob({...job,skills:[...job.skills,skillsInput.trim()]});
                  }
                  setSkillsInput("");
                }
              }}
            />

            <div className="mt-3 d-flex flex-wrap gap-2">
              {job.skills.map((s,i)=>(
                <span key={i} className="badge bg-dark px-3 py-2 rounded-pill"
                  onClick={()=>setJob({...job,skills:job.skills.filter((_,idx)=>idx!==i)})}>
                  {s} ✖
                </span>
              ))}
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button type="button" onClick={prevStep} className="btn btn-outline-secondary">Back</button>
              <button className="btn btn-success">Submit Job 🚀</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

const Row = ({ children }) => <div className="row g-3">{children}</div>;

const Input = ({ label, value, onChange }) => (
  <div className="col-md-6">
    <label className="form-label">{label}</label>
    <input className="form-control" value={value} onChange={(e)=>onChange(e.target.value)}/>
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div className="col-md-6">
    <label className="form-label">{label}</label>
    <select className="form-select" value={value} onChange={(e)=>onChange(e.target.value)}>
      <option value="">Select</option>
      {options.map((o,i)=><option key={i}>{o}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <textarea className="form-control" rows="3" value={value} onChange={(e)=>onChange(e.target.value)}/>
  </div>
);

export default RecruiterOpening;
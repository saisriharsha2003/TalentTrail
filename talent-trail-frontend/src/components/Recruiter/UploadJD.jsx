import React, { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { useNavigate } from "react-router-dom";

const UploadJD = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const [process, setProcess] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleJD = async (e) => {
    e.preventDefault();
    setProcess(true);

    try {
      const jd = document.getElementById("jd");

      if (!jd.files[0]) {
        notify("failed", "Please upload a file");
        setProcess(false);
        return;
      }

      const fd = new FormData();
      fd.append("file", jd.files[0]);

      const response = await axios.post("/recruiter/parseJD", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const success = response?.data?.success;
      const jobData = response?.data?.job_data;

      if (success && jobData) {
        notify("success", "JD parsed successfully");

        localStorage.setItem("jdOutput", JSON.stringify(response.data));

        // 🔥 send flag to trigger autofill UI
        navigate("/user/recruiter/new", { state: { fromJD: true } });
      } else {
        notify("failed", "Parsing failed");
      }
    } catch (err) {
      console.error(err);
      notify("failed", err?.response?.data?.message || "Parsing failed");
    } finally {
      setProcess(false);
    }
  };

  return (
    <div className="container py-4">

      <div className="mb-4">
        <h2 className="fw-bold">Upload Job Description</h2>
        <p className="text-muted">
          Upload a JD file to auto-fill job details
        </p>
      </div>

      <div className="card shadow-sm border-0 rounded-4 p-5 text-center">

        <form onSubmit={handleJD}>

          <div
            className="border border-2 border-dashed rounded-4 p-5 mb-4"
            style={{ cursor: "pointer", background: "#fafafa" }}
            onClick={() => document.getElementById("jd").click()}
          >
            <input
              type="file"
              id="jd"
              accept=".pdf,.txt,.doc,.docx"
              className="d-none"
              onChange={(e) =>
                setFileName(e.target.files[0]?.name || "")
              }
            />

            {fileName ? (
              <>
                <div className="fs-1 mb-3">✅</div>
                <h5 className="fw-semibold">{fileName}</h5>
                <p className="text-muted small">File selected</p>
              </>
            ) : (
              <>
                <div className="fs-1 mb-3">📄</div>
                <h5 className="fw-semibold">
                  Click to upload JD (PDF, TXT, DOC, DOCX)
                </h5>
                <p className="text-muted small">
                  Max size 2MB
                </p>
              </>
            )}
          </div>

          <div className="d-flex justify-content-center gap-3">

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={process}
            >
              {process ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Upload & Parse ⚡"
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default UploadJD;
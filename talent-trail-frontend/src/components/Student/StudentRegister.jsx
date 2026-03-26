import React, { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { Link } from "react-router-dom";

const StudentRegister = () => {
    const parsedOutputString = localStorage.getItem("parsedOutput");
    const parsedOutput = parsedOutputString ? JSON.parse(parsedOutputString) : null;
    const disabledDefault = {
        academic: false,
        certification: false,
        contact: false,
        personal: false,
        project: false,
        work: false,
    };
    const currentDefault = {
        college: (parsedOutput?.Result?.["17 Candidate_Education"][0]?.["SchoolOrInstitution"]["SchoolName"] != "N/A") ? (parsedOutput?.Result?.["17 Candidate_Education"][0]?.["SchoolOrInstitution"]["SchoolName"].replace(/Of/gi, "of")) : '',
        course: (parsedOutput?.Result?.["17 Candidate_Education"][0]?.["SchoolOrInstitution"]?.Major != "N/A") ? (parsedOutput?.Result?.["17 Candidate_Education"][0]?.["SchoolOrInstitution"]?.Major) : '',
        joinDate: "",
        graduatingYear: "",
        city: "",
        state: "",
        rollNo: "",
        studyYear: "",
        major: (parsedOutput?.Result?.["17 Candidate_Education"][0]?.["SchoolOrInstitution"]["Degree"]?.["DegreeName"] != "N/A") ? (parsedOutput?.Result?.["17 Candidate_Education"][0]?.["SchoolOrInstitution"]["Degree"]?.["DegreeName"]) : '',
        skills: (parsedOutput?.Result?.["23 IT_Skills_with_Keywords_only"]) ? (parsedOutput?.Result?.["23 IT_Skills_with_Keywords_only"]) : [],
        interests: [],
        cgpa: "",
    };
    const previousDefault = {
        college: (parsedOutput?.Result?.["17 Candidate_Education"][1]?.["SchoolOrInstitution"]?.SchoolName != "N/A") ? (parsedOutput?.Result?.["17 Candidate_Education"][1]?.["SchoolOrInstitution"]?.SchoolName) : '',
        state: "",
        city: "",
        major: (parsedOutput?.Result?.["17 Candidate_Education"][1]?.["SchoolOrInstitution"]?.Degree?.DegreeName != "N/A") ? (parsedOutput?.Result?.["17 Candidate_Education"][1]?.["SchoolOrInstitution"]?.Degree?.DegreeName) : '',
        percentage: "",
    };
    const certificationDefault = {
        name: (parsedOutput?.Result?.["18 Candidate_Certifications"][0] != "N/A") ? (parsedOutput?.Result?.["18 Candidate_Certifications"][0]) : "",
        organization: (parsedOutput?.Result?.["18 Candidate_Certifications"][0].split(" ")[0] != "N/A") ? (parsedOutput?.Result?.["18 Candidate_Certifications"][0].split(" ")[0]) : "",
    };
    const contactDefault = {
        email: (parsedOutput?.Result?.["11 Candidate_Email"][0] != "N/A") ? (parsedOutput?.Result?.["11 Candidate_Email"][0]) : "",
        collegeEmail: "",
        mobile: (parsedOutput?.Result?.["09 Candidate_Phone_Number"][0] != "N/A") ? (parsedOutput?.Result?.["09 Candidate_Phone_Number"][0]) : "",
        currentAddress: ((parsedOutput?.Result?.["12 Candidate_City"][0] != "N/A") ? (parsedOutput?.Result?.["12 Candidate_City"][0]+', ') : "") +  ((parsedOutput?.Result?.["13 Candidate_State"][0] != "N/A") ? (parsedOutput?.Result?.["13 Candidate_State"][0]+', ') : "") + ((parsedOutput?.Result?.["14 Candidate_Country"][0] != "N/A") ? (parsedOutput?.Result?.["14 Candidate_Country"][0]) : ''),
        permanentAddress: "",
    };
    const personalDefault = {
        fullName: (parsedOutput?.Result?.["06 Candidate_Name"][0] != "N/A") ? (parsedOutput?.Result?.["06 Candidate_Name"][0]) : "",
        fatherName: "",
        motherName: "",
        dateOfBirth: "",
        gender: "",
    };
    const projectDefault = {
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        associated: "",
    };
    const workDefault = {
        organization: (parsedOutput?.Result?.["28 Professional_Experience_Details"][0]["02 Company"] != "N/A") ? (parsedOutput?.Result?.["28 Professional_Experience_Details"][0]["02 Company"]) : "",
        role: (parsedOutput?.Result?.["28 Professional_Experience_Details"][0]["04 Role"] != "N/A") ? (parsedOutput?.Result?.["28 Professional_Experience_Details"][0]["04 Role"]) : "",
        description: (parsedOutput?.Result?.["28 Professional_Experience_Details"][0]["11 Project Details"] != "N/A") ? (parsedOutput?.Result?.["28 Professional_Experience_Details"][0]["11 Project Details"]) : "",
        startDate: "",
        endDate: "",
    };
    const [current, setCurrent] = useState(false);
    const [disabled, setDisabled] = useState(disabledDefault);

    const axios = useAxiosPrivate();
    const [currentEducation, setCurrentEducation] = useState(currentDefault);
    const [previousEducation, setPreviousEducation] = useState(previousDefault);
    const [certification, setCertification] = useState(certificationDefault);
    const [contact, setContact] = useState(contactDefault);
    const [personal, setPersonal] = useState(personalDefault);
    const [project, setProject] = useState(projectDefault);
    const [work, setWork] = useState(workDefault);
    const [addcert, disableAddcert] = useState(true);
    const [addwork, disableAddwork] = useState(true);
    const [addproj, disableAddproj] = useState(true);
    const handleAcademic = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/student/academic", {
                currentEducation: {
                    ...currentEducation,
                    graduatingYear: parseInt(currentEducation.graduatingYear),
                    studyYear: parseInt(currentEducation.studyYear),
                    cgpa: parseInt(currentEducation.cgpa),
                },
                previousEducation: {
                    ...previousEducation,
                    percentage: parseInt(previousEducation.percentage),
                },
                rollNo: currentEducation.rollNo,
            });
            const success = response?.data?.success;
            if (success) notify("success", success);

            // setCurrentEducation(currentDefault);
            // setPreviousEducation(previousDefault);
            setDisabled((prev) => ({ ...prev, academic: true }));
        } catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    const handleCertification = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/student/certification", {
                ...certification,
            });
            const success = response?.data?.success;
            if (success) notify("success", success);
            setDisabled((prev) => ({ ...prev, certification: true }));
            disableAddcert(false);
           
        } catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    const handleContact = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/student/contact", {
                ...contact,
                mobile: parseInt(contact.mobile) || contact.mobile,
            });
            const success = response?.data?.success;
            if (success) notify("success", success);

            // setContact(contactDefault);
            setDisabled((prev) => ({ ...prev, contact: true }));
        } catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    const handlePersonal = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/student/personal", {
                ...personal,
            });
            const success = response?.data?.success;
            if (success) notify("success", success);

            // setPersonal(personalDefault);
            setDisabled((prev) => ({ ...prev, personal: true }));
        } catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    const handleProject = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/student/project", {
                ...project,
            });
            const success = response?.data?.success;
            if (success) notify("success", success);

            // setProject(projectDefault);
            disableAddproj(false);
            setDisabled((prev) => ({ ...prev, project: true }));
        } catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    const handleWork = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/student/work", {
                ...work,
            });
            const success = response?.data?.success;
            if (success) notify("success", success);

            // if (
            //     parsedOutput &&
            //     parsedOutput.Result &&
            //     parsedOutput.Result["28 Professional_Experience_Details"] &&
            //     parsedOutput.Result["28 Professional_Experience_Details"][0]
            // ) {
            //     const experienceDetails = parsedOutput.Result["28 Professional_Experience_Details"][0];
            //     experienceDetails["02 Company"] = "N/A";
            //     experienceDetails["11 Project Details"] = "N/A";
            //     experienceDetails["04 Role"] = "N/A";
            // }
            disableAddwork(false);
            setDisabled((prev) => ({ ...prev, work: true }));
        } catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        try {
            const profile = document.getElementById("profile");
            const fd = new FormData();
            fd.append("profile", profile.files[0]);
            if (!fd) return;

            const response = await axios.post("/student/profile", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const success = response?.data?.success;
            if (success) notify("success", success);
        } catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    const handleResume = async (e) => {
        e.preventDefault();
        try {
            const resume = document.getElementById("resume");
            const fd = new FormData();
            fd.append("resume", resume.files[0]);
            if (!fd) return;

            const response = await axios.post("/student/resume", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const success = response?.data?.success;
            if (success) notify("success", success);
        } catch (err) {
            notify("failed", err?.response?.data?.message);
        }
    };

    const addCertification = (e) => {
        e.preventDefault();
        const certificationDefaultCurr = {
            name: "",
            organization: "",
        };
        setCertification(certificationDefaultCurr);
        disableAddcert(true);
        setDisabled((prev) => ({ ...prev, certification: false }));
    };

    const addProject = (e) => {
        e.preventDefault();
        const projectDefaultcurr = {
            name: "",
            startDate: "",
            endDate: "",
            description: "",
            associated: "",
        };
        setProject(projectDefaultcurr);
        disableAddproj(true);
        setDisabled((prev) => ({ ...prev, project: false }));
    };

    const addWork = (e) => {
        e.preventDefault();
        const workDefaultcurr = {
            organization: "",
            role: "",
            description: "",
            startDate: "",
            endDate: "",
        };
        setWork(workDefaultcurr);

        disableAddwork(true);
        setDisabled((prev) => ({ ...prev, work: false }));
    };

    return (
        <>
            <div className="d-flex justify-content-center mt-3">
                <h3>Provide all details</h3>
            </div>

            {/* Personal */}
            <div className="d-flex justify-content-center m-3 ">
                <div
                    className="card container p-4 h-100 shadow-2-strong shadow-sm"
                    style={{ backgroundColor: "#fff" }}
                >
                    <div className="card-body">
                        <form>
                            <h3 class="mb-4 pb-2 pb-md-0 mb-md-4">Personal</h3>
                            <fieldset disabled={disabled.personal}>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="pef">Full name</label>
                                        <input
                                            id="pef"
                                            className="form-control"
                                            type="text"
                                            placeholder="Full name"
                                            autoComplete="off"
                                            value={personal.fullName}
                                            onChange={(e) =>
                                                setPersonal((prev) => ({
                                                    ...prev,
                                                    fullName: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6 ">
                                        <label htmlFor="ped">Date Of Birth</label>
                                        <input
                                            id="ped"
                                            className="form-control"
                                            type="text"
                                            placeholder="DD/MM/YY"
                                            autoComplete="off"
                                            value={personal.dateOfBirth}
                                            onChange={(e) =>
                                                setPersonal((prev) => ({
                                                    ...prev,
                                                    dateOfBirth: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="pefa">Father name</label>
                                        <input
                                            id="pefa"
                                            className="form-control"
                                            type="text"
                                            placeholder="Father name"
                                            autoComplete="off"
                                            value={personal.fatherName}
                                            onChange={(e) =>
                                                setPersonal((prev) => ({
                                                    ...prev,
                                                    fatherName: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="peg">Gender</label>
                                        <select
                                            required
                                            id="peg"
                                            className="form-select"
                                            value={personal.gender}
                                            onChange={(e) =>
                                                setPersonal((prev) => ({
                                                    ...prev,
                                                    gender: e.target.value,
                                                }))
                                            }
                                        >
                                            <option defaultValue=""></option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group row mb-4">
                                    <div className="col-md-6">
                                        <label htmlFor="pem">Mother name</label>
                                        <input
                                            id="pem"
                                            className="form-control"
                                            type="text"
                                            placeholder="Mother name"
                                            autoComplete="off"
                                            value={personal.motherName}
                                            onChange={(e) =>
                                                setPersonal((prev) => ({
                                                    ...prev,
                                                    motherName: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <button className="btn btn-primary mb-5" onClick={handlePersonal}>
                                    submit
                                </button>
                            </fieldset>

                            {/* contact */}
                            <h3 class="mb-4 pb-2 pb-md-0 mb-md-4">Contact</h3>
                            <fieldset disabled={disabled.contact}>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cone">Email</label>
                                        <input
                                            id="cone"
                                            className="form-control"
                                            type="email"
                                            placeholder="Email"
                                            autoComplete="off"
                                            value={contact.email}
                                            onChange={(e) =>
                                                setContact((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="conm">Mobile</label>
                                        <input
                                            id="conm"
                                            className="form-control"
                                            type="text"
                                            placeholder="Mobile"
                                            minLength={10}
                                            maxLength={10}
                                            autoComplete="off"
                                            value={contact.mobile}
                                            onChange={(e) =>
                                                setContact((prev) => ({
                                                    ...prev,
                                                    mobile: e.target.value,
                                                }))
                                            }
                                            required
                                        />

                                    </div>
                                </div>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="conce">College email</label>
                                        <input
                                            id="conce"
                                            className="form-control"
                                            type="email"
                                            placeholder="College email"
                                            autoComplete="off"
                                            value={contact.collegeEmail}
                                            onChange={(e) =>
                                                setContact((prev) => ({
                                                    ...prev,
                                                    collegeEmail: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="conp">Permanent address</label>
                                    <textarea
                                        id="conp"
                                        rows="3"
                                        className="form-control"
                                        type="text"
                                        placeholder="Permanent address"
                                        autoComplete="off"
                                        value={contact.permanentAddress}
                                        onChange={(e) =>
                                            setContact((prev) => ({
                                                ...prev,
                                                permanentAddress: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="conec">Current address</label>
                                    <textarea
                                        id="conec"
                                        rows="3"
                                        className="form-control"
                                        type="text"
                                        placeholder="Current address"
                                        autoComplete="off"
                                        value={contact.currentAddress}
                                        onChange={(e) =>
                                            setContact((prev) => ({
                                                ...prev,
                                                currentAddress: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <button className="btn btn-primary mb-5" onClick={handleContact}>
                                    submit
                                </button>
                                </fieldset>
                                <fieldset disabled={disabled.academic}>
                                {/* current education */}
                                <h3 class="mb-4 pb-2 pb-md-0 mb-md-4">Current Education</h3>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cc">College name</label>
                                        <input
                                            id="cc"
                                            className="form-control"
                                            type="text"
                                            placeholder="College name"
                                            autoComplete="off"
                                            value={currentEducation.college}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    college: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="ct">Study year</label>
                                        <input
                                            id="ct"
                                            className="form-control"
                                            type="text"
                                            placeholder="Study Year"
                                            autoComplete="off"
                                            value={currentEducation.studyYear}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    studyYear: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="co">Major</label>
                                        <input
                                            id="co"
                                            className="form-control"
                                            type="text"
                                            placeholder="Major"
                                            autoComplete="off"
                                            value={currentEducation.course}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    course: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cm">Course</label>
                                        <input
                                            id="cm"
                                            className="form-control"
                                            type="text"
                                            placeholder="Course"
                                            autoComplete="off"
                                            value={currentEducation.major}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    major: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cj">Join Date</label>
                                        <input
                                            id="cj"
                                            className="form-control"
                                            type="text"
                                            placeholder="Join Date"
                                            autoComplete="off"
                                            value={currentEducation.joinDate}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    joinDate: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cr">Roll No.</label>
                                        <input
                                            id="cr"
                                            className="form-control"
                                            type="text"
                                            placeholder="Roll No."
                                            autoComplete="off"
                                            value={currentEducation.rollNo}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    rollNo: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cg">Graduating year</label>
                                        <input
                                            id="cg"
                                            className="form-control"
                                            type="text"
                                            placeholder="Graduating Year"
                                            autoComplete="off"
                                            value={currentEducation.graduatingYear}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    graduatingYear: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="ck">Skills</label>
                                        <input
                                            id="ck"
                                            className="form-control"
                                            type="text"
                                            placeholder="Skills"
                                            autoComplete="off"
                                            value={currentEducation.skills.length != 0 ? currentEducation.skills.join(",") : ""}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    skills: e.target.value.split(","),
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="ci">City</label>
                                        <input
                                            id="ci"
                                            className="form-control"
                                            type="text"
                                            placeholder="City"
                                            autoComplete="off"
                                            value={currentEducation.city}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    city: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cn">Interests</label>
                                        <input
                                            id="cn"
                                            className="form-control"
                                            type="text"
                                            placeholder="Interests"
                                            autoComplete="off"
                                            value={currentEducation.interests}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    interests: e.target.value.split(","),
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row row mb-5">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cs">State</label>
                                        <input
                                            id="cs"
                                            className="form-control"
                                            type="text"
                                            placeholder="State"
                                            autoComplete="off"
                                            value={currentEducation.state}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    state: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cp">cgpa</label>
                                        <input
                                            id="cp"
                                            className="form-control"
                                            type="text"
                                            placeholder="cgpa"
                                            autoComplete="off"
                                            value={currentEducation.cgpa}
                                            onChange={(e) =>
                                                setCurrentEducation((prev) => ({
                                                    ...prev,
                                                    cgpa: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <h3 class="mb-4 pb-2 pb-md-0 mb-md-4">Previous Education</h3>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="pc">College</label>
                                        <input
                                            id="pc"
                                            className="form-control"
                                            type="text"
                                            placeholder="College name"
                                            autoComplete="off"
                                            value={previousEducation.college}
                                            onChange={(e) =>
                                                setPreviousEducation((prev) => ({
                                                    ...prev,
                                                    college: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="pm">Major</label>

                                        <input
                                            id="pm"
                                            className="form-control"
                                            type="text"
                                            placeholder="Major"
                                            autoComplete="off"
                                            value={previousEducation.major}
                                            onChange={(e) =>
                                                setPreviousEducation((prev) => ({
                                                    ...prev,
                                                    major: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="ps">State</label>
                                        <input
                                            id="ps"
                                            className="form-control"
                                            type="text"
                                            placeholder="State"
                                            autoComplete="off"
                                            value={previousEducation.state}
                                            onChange={(e) =>
                                                setPreviousEducation((prev) => ({
                                                    ...prev,
                                                    state: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="pp">Percentage</label>
                                        <input
                                            id="pp"
                                            className="form-control"
                                            type="text"
                                            placeholder="Percentage"
                                            autoComplete="off"
                                            value={previousEducation.percentage}
                                            onChange={(e) =>
                                                setPreviousEducation((prev) => ({
                                                    ...prev,
                                                    percentage: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="pi">City</label>
                                        <input
                                            id="pi"
                                            className="form-control"
                                            type="text"
                                            placeholder="City"
                                            autoComplete="off"
                                            value={previousEducation.city}
                                            onChange={(e) =>
                                                setPreviousEducation((prev) => ({
                                                    ...prev,
                                                    city: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={handleAcademic}>
                                    submit
                                </button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>



            {/* Certification */}
            <div className="d-flex justify-content-center m-3">
                <div className="card container p-4 h-100 shadow-2-strong shadow-sm" style={{ backgroundColor: "#fff" }}>
                    <div className="card-body">
                        <form>
                            <fieldset disabled={disabled.certification}>
                                <h3 class="mb-4 pb-2 pb-md-0 mb-md-4">Certifications</h3>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="cen">Name</label>
                                        <input
                                            id="cen"
                                            className="form-control"
                                            type="text"
                                            placeholder="Name"
                                            autoComplete="off"
                                            value={certification.name}
                                            onChange={(e) =>
                                                setCertification((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="ceo">Organization</label>
                                        <input
                                            id="prn"
                                            className="form-control"
                                            type="text"
                                            placeholder="Organization"
                                            autoComplete="off"
                                            value={certification.organization}
                                            onChange={(e) =>
                                                setCertification((prev) => ({
                                                    ...prev,
                                                    organization: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>


                            </fieldset>

                            <div className="row">
                                <div className="col-md-6">
                                    <button
                                        disabled={disabled.certification}
                                        className="btn btn-primary"
                                        onClick={handleCertification}
                                    >
                                        submit
                                    </button>
                                </div>

                                <div className="col-md-6">
                                    <button className="btn btn-dark" onClick={addCertification} disabled={addcert}>
                                        add another
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Project */}
            <div className="d-flex justify-content-center m-3">
                <div className="card container p-4 h-100 shadow-2-strong shadow-sm" style={{ backgroundColor: "#fff" }}>
                    <div className="card-body">
                        <form>
                            <fieldset disabled={disabled.project}>
                                <h3 class="mb-4 pb-2 pb-md-0 mb-md-4">Projects</h3>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="prn">Name</label>
                                        <input
                                            id="prn"
                                            className="form-control"
                                            type="text"
                                            placeholder="Name"
                                            autoComplete="off"
                                            value={project.name}
                                            onChange={(e) =>
                                                setProject((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="prd">Description</label>
                                    <textarea
                                        id="prd"
                                        rows="3"
                                        className="form-control"
                                        type="text"
                                        placeholder="Description"
                                        autoComplete="off"
                                        value={project.description}
                                        onChange={(e) =>
                                            setProject((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="prs">Start date</label>
                                        <input
                                            id="prs"
                                            className="form-control"
                                            type="text"
                                            placeholder="DD/MM/YY"
                                            autoComplete="off"
                                            value={project.startDate}
                                            onChange={(e) =>
                                                setProject((prev) => ({
                                                    ...prev,
                                                    startDate: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="pre">End date</label>
                                        <input
                                            id="pre"
                                            className="form-control"
                                            type="text"
                                            placeholder="DD/MM/YY"
                                            autoComplete="off"
                                            value={project.endDate}
                                            disabled={current}
                                            onChange={(e) =>
                                                setProject((prev) => ({
                                                    ...prev,
                                                    endDate: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>


                                </div>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="pra">Associated</label>
                                        <input
                                            id="pra"
                                            className="form-control"
                                            type="text"
                                            placeholder="Associated"
                                            autoComplete="off"
                                            value={project.associated}
                                            onChange={(e) =>
                                                setProject((prev) => ({
                                                    ...prev,
                                                    associated: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6 mt-4">
                                        <input
                                            id="prc"
                                            className="form-check-input"
                                            type="checkbox"
                                            value={current}
                                            onChange={(e) =>
                                                setCurrent((prev) => {
                                                    setProject((prev) => ({ ...prev, endDate: "" }));
                                                    return !prev;
                                                })
                                            }
                                        />
                                        <label className="form-check-label" htmlFor="prc">
                                            Currently working
                                        </label>
                                    </div>


                                </div>

                            </fieldset>

                            <div className="row">
                                <div className="col-md-6">
                                    <button
                                        disabled={disabled.project}
                                        className="btn btn-primary"
                                        onClick={handleProject}
                                    >
                                        submit
                                    </button>
                                </div>

                                <div className="col-md-6">
                                    <button className="btn btn-dark" onClick={addProject} disabled={addproj}>
                                        add another
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Work */}
            <div className="d-flex justify-content-center m-3">
                <div className="card container p-4 h-100 shadow-2-strong shadow-sm" style={{ backgroundColor: "#fff" }}>
                    <div className="card-body">
                        <form>
                            <fieldset disabled={disabled.work}>
                                <h3 class="mb-4 pb-2 pb-md-0 mb-md-4">Work</h3>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="wo">Organization</label>
                                        <input
                                            id="wo"
                                            className="form-control"
                                            type="text"
                                            placeholder="Organization"
                                            autoComplete="off"
                                            value={work.organization}
                                            onChange={(e) =>
                                                setWork((prev) => ({
                                                    ...prev,
                                                    organization: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="wr">Role</label>
                                        <input
                                            id="wr"
                                            className="form-control"
                                            type="text"
                                            placeholder="Role"
                                            autoComplete="off"
                                            value={work.role}
                                            onChange={(e) =>
                                                setWork((prev) => ({
                                                    ...prev,
                                                    role: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>


                                </div>
                                <div className="form-row row mb-4">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="ws">Start date</label>
                                        <input
                                            id="ws"
                                            className="form-control"
                                            type="text"
                                            placeholder="DD/MM/YY"
                                            autoComplete="off"
                                            value={work.startDate}
                                            onChange={(e) =>
                                                setWork((prev) => ({
                                                    ...prev,
                                                    startDate: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="we">End date</label>
                                        <input
                                            id="we"
                                            className="form-control"
                                            type="text"
                                            placeholder="DD/MM/YY"
                                            autoComplete="off"
                                            value={work.endDate}
                                            onChange={(e) =>
                                                setWork((prev) => ({
                                                    ...prev,
                                                    endDate: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="wd">Description</label>
                                    <textarea
                                        id="wd"
                                        rows="3"
                                        className="form-control"
                                        type="text"
                                        placeholder="Description"
                                        autoComplete="off"
                                        value={work.description}
                                        onChange={(e) =>
                                            setWork((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                            </fieldset>

                            <div className="row">
                                <div className="col-md-6">
                                    <button
                                        disabled={disabled.work}
                                        className="btn btn-primary"
                                        onClick={handleWork}
                                    >
                                        submit
                                    </button>
                                </div>

                                <div className="col-md-6">
                                    <button className="btn btn-dark" onClick={addWork} disabled={addwork}>
                                        add another
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Profile */}
            <div className="d-flex justify-content-center align-items-end mt-3 mb-5">
                <div className="card container p-4 h-100 shadow-2-strong shadow-sm" style={{ backgroundColor: "#fff" }}>
                    <div className="card-body">
                        <form>
                            <h3 class="mb-4 pb-2 pb-md-0 mb-md-4">Profile</h3>
                            <div className="form-row row mb-4">
                                <div className="form-group col-md-9">
                                    <label htmlFor="profile" className="form-label">
                                        <b>Profile pic </b>
                                        (File should be less than 2mb and
                                        only jpeg, jpg and png's allowed)
                                    </label>
                                    <input
                                        className="form-control mt-lg-4"
                                        type="file"
                                        id="profile"
                                        name="profile"
                                    />
                                </div>
                                <div className="form-group col-md-2 mt-4 mt-md-5">
                                <button
                                        className="btn btn-primary m-2"
                                        onClick={handleProfile}
                                    >
                                        upload
                                    </button>   
                                </div>
                            </div>
                            <div className="form-row row mb-4">
                                <div className="form-group col-md-9">
                                    <label htmlFor="resume" className="form-label">
                                        <b>Resumè</b>
                                        (File should be less than 2 mb and
                                        only pdf's are allowed)
                                    </label>
                                    <input
                                        className="form-control mt-lg-4"
                                        type="file"
                                        id="resume"
                                        name="resume"
                                    />
                                </div>
                                <div className="form-group col-md-2 mt-4 mt-md-5">
                                <button
                                        className="btn btn-primary m-2"
                                        onClick={handleResume}
                                    >
                                        upload
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* <div className="d-inline-flex p-2">
                    <Link className="btn btn-primary" to="/student">
                        Home
                    </Link>
                </div> */}
            </div>
        </>
    );
};

export default StudentRegister;

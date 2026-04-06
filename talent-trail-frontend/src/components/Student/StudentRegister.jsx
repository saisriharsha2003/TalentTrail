import React, { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { notify } from "../Toast";
import { Link } from "react-router-dom";

const StudentRegister = () => {

    const parsedOutputString = localStorage.getItem("parsedOutput");
    const parsedOutput = parsedOutputString ? JSON.parse(parsedOutputString) : null;
    const r = parsedOutput?.resume_data || {};

    const disabledDefault = {
        academic: false,
        certification: false,
        contact: false,
        personal: false,
        project: false,
        work: false,
    };

    const currentDefault = {
        college: r?.current_education?.college_name || '',
        course: r?.current_education?.course || '',
        joinDate: r?.current_education?.join_date || "",
        graduatingYear: r?.current_education?.graduating_year || "",
        city: r?.current_education?.city || "",
        state: r?.current_education?.state || "",
        rollNo: r?.current_education?.roll_no || "",
        studyYear: r?.current_education?.study_year || "",
        major: r?.current_education?.major || '',
        skills: r?.current_education?.skills || [],
        interests: r?.current_education?.interests || [],
        cgpa: r?.current_education?.cgpa || "",
    };

    const previousDefault = {
        college: r?.previous_education?.college || '',
        state: r?.previous_education?.state || "",
        city: r?.previous_education?.city || "",
        major: r?.previous_education?.major || '',
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
        dateOfBirth: r?.personal?.date_of_birth || "",
        gender: r?.personal?.gender || "",
    };

    const [current, setCurrent] = useState(false);
    const [disabled, setDisabled] = useState(disabledDefault);

    const axios = useAxiosPrivate();

    const [currentEducation, setCurrentEducation] = useState(currentDefault);
    const [previousEducation, setPreviousEducation] = useState(previousDefault);
    const [contact, setContact] = useState(contactDefault);
    const [personal, setPersonal] = useState(personalDefault);
    const [addcert, disableAddcert] = useState(true);
    const [addwork, disableAddwork] = useState(true);
    const [addproj, disableAddproj] = useState(true);

    const [projects, setProjects] = useState(r?.projects || []);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [experiences, setExperiences] = useState(r?.experience || []);
    const [currentExpIndex, setCurrentExpIndex] = useState(0);
    const [certifications, setCertifications] = useState(r?.certifications || []);
    const [currentCertIndex, setCurrentCertIndex] = useState(0);

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
            let successMsg = "";

            for (let cert of certifications) {
                const response = await axios.post("/student/certification", cert);
                successMsg = response?.data?.success;
            }

            if (successMsg) notify("success", successMsg);

            setDisabled((prev) => ({ ...prev, certification: true }));

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
            let successMsg = "";

            for (let proj of projects) {
                const payload = {
                    name: proj.name,
                    description: proj.description,
                    startDate: proj.startDate,
                    endDate: proj.endDate || null,
                    associated: proj.associated || "Self",
                };

                const response = await axios.post("/student/project", payload);

                successMsg = response?.data?.success;
            }

            if (successMsg) notify("success", successMsg);

            setDisabled((prev) => ({ ...prev, project: true }));

        } catch (err) {
            console.log(err?.response?.data);
            notify("failed", err?.response?.data?.message);
        }
    };

    const handleWork = async (e) => {
        e.preventDefault();

        try {
            let successMsg = "";

            for (let exp of experiences) {
                const payload = {
                    organization: exp.company,
                    role: exp.role,
                    description: exp.description,
                    startDate: exp.start_date,
                    endDate: exp.end_date || "Present",
                };

                const response = await axios.post("/student/work", payload);

                successMsg = response?.data?.success;
            }

            if (successMsg) notify("success", successMsg);

            setDisabled((prev) => ({ ...prev, work: true }));

        } catch (err) {
            console.log(err?.response?.data);
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

            <div className="d-flex justify-content-center m-3 ">
                <div
                    className="card container p-4 h-100 shadow-2-strong shadow-sm"
                    style={{ backgroundColor: "#fff" }}
                >
                    <div className="card-body">
                        <form>
                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Personal</h3>
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

                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Contact</h3>
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
                                <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Current Education</h3>
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
                                <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Previous Education</h3>
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


            <div className="d-flex justify-content-center m-3">
                <div className="card container p-4 h-100 shadow-2-strong shadow-sm" style={{ backgroundColor: "#fff" }}>
                    <div className="card-body">
                        <form>
                            <fieldset disabled={disabled.certification}>
                                <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Certifications</h3>
                                {certifications.length > 0 && (
                                    <>
                                        <div className="d-flex justify-content-between mb-3">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                disabled={currentCertIndex === 0}
                                                onClick={() => setCurrentCertIndex(prev => prev - 1)}
                                            >
                                                ⬅ Prev
                                            </button>

                                            <span>
                                                {currentCertIndex + 1} / {certifications.length}
                                            </span>

                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                disabled={currentCertIndex === certifications.length - 1}
                                                onClick={() => setCurrentCertIndex(prev => prev + 1)}
                                            >
                                                Next ➡
                                            </button>
                                        </div>

                                        <input
                                            className="form-control mb-3"
                                            placeholder="Name"
                                            value={certifications[currentCertIndex]?.name || ""}
                                            onChange={(e) => {
                                                const updated = [...certifications];
                                                updated[currentCertIndex].name = e.target.value;
                                                setCertifications(updated);
                                            }}
                                        />

                                        <input
                                            className="form-control mb-3"
                                            placeholder="Organization"
                                            value={certifications[currentCertIndex]?.organization || ""}
                                            onChange={(e) => {
                                                const updated = [...certifications];
                                                updated[currentCertIndex].organization = e.target.value;
                                                setCertifications(updated);
                                            }}
                                        />
                                    </>
                                )}

                                <div className="d-grid gap-3 mt-3">

                                    <button
                                        type="button"
                                        className="btn btn-dark"
                                        onClick={() => {
                                            setCertifications([
                                                ...certifications,
                                                { name: "", organization: "" }
                                            ]);
                                            setCurrentCertIndex(certifications.length);
                                        }}
                                    >
                                        + Add Certification
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleCertification}
                                        disabled={disabled.certification}
                                    >
                                        Submit All Certifications
                                    </button>

                                </div>

                            </fieldset>

                        </form>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-center m-3">
                <div className="card container p-4 shadow-sm">

                    <h3 className="mb-4">Projects</h3>
                    {projects.length > 0 && (
                        <div className="d-flex justify-content-between mb-3">
                            <button
                                className="btn btn-secondary"
                                disabled={currentProjectIndex === 0}
                                onClick={() => setCurrentProjectIndex((prev) => prev - 1)}
                            >
                                ⬅ Prev
                            </button>

                            <span>
                                {currentProjectIndex + 1} / {projects.length}
                            </span>

                            <button
                                className="btn btn-secondary"
                                disabled={currentProjectIndex === projects.length - 1}
                                onClick={() => setCurrentProjectIndex((prev) => prev + 1)}
                            >
                                Next ➡
                            </button>
                        </div>
                    )}

                    {projects.length > 0 && (
                        <>
                            <input
                                className="form-control mb-3"
                                placeholder="Project Name"
                                value={projects[currentProjectIndex]?.name || ""}
                                onChange={(e) => {
                                    const updated = [...projects];
                                    updated[currentProjectIndex].name = e.target.value;
                                    setProjects(updated);
                                }}
                            />

                            <textarea
                                className="form-control mb-3"
                                placeholder="Description"
                                value={projects[currentProjectIndex]?.description || ""}
                                onChange={(e) => {
                                    const updated = [...projects];
                                    updated[currentProjectIndex].description = e.target.value;
                                    setProjects(updated);
                                }}
                            />

                            <input
                                className="form-control mb-3"
                                placeholder="Start Date"
                                value={projects[currentProjectIndex]?.startDate || ""}
                                onChange={(e) => {
                                    const updated = [...projects];
                                    updated[currentProjectIndex].startDate = e.target.value;
                                    setProjects(updated);
                                }}
                            />

                            <input
                                className="form-control mb-3"
                                placeholder="End Date"
                                value={projects[currentProjectIndex]?.endDate || ""}
                                onChange={(e) => {
                                    const updated = [...projects];
                                    updated[currentProjectIndex].endDate = e.target.value;
                                    setProjects(updated);
                                }}
                            />
                        </>
                    )}

                    <button
                        className="btn btn-dark mt-3"
                        onClick={() => {
                            setProjects([
                                ...projects,
                                {
                                    name: "",
                                    description: "",
                                    startDate: "",
                                    endDate: "",
                                    associated: "",
                                },
                            ]);
                            setCurrentProjectIndex(projects.length);
                        }}
                    >
                        + Add Project
                    </button>

                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleProject}
                        disabled={disabled.project}
                    >
                        Submit All Projects
                    </button>

                </div>
            </div>
            <div className="d-flex justify-content-center m-3">
                <div
                    className="card container p-4 h-100 shadow-2-strong shadow-sm"
                    style={{ backgroundColor: "#fff" }}
                >
                    <div className="card-body">
                        <form>
                            <fieldset disabled={disabled.work}>
                                <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Work</h3>

                                {experiences.length > 0 && (
                                    <div className="card p-3 shadow-sm mb-4">

                                        <div className="d-flex justify-content-between mb-3">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                disabled={currentExpIndex === 0}
                                                onClick={() =>
                                                    setCurrentExpIndex((prev) => prev - 1)
                                                }
                                            >
                                                ⬅ Prev
                                            </button>

                                            <span>
                                                {currentExpIndex + 1} / {experiences.length}
                                            </span>

                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                disabled={
                                                    currentExpIndex === experiences.length - 1
                                                }
                                                onClick={() =>
                                                    setCurrentExpIndex((prev) => prev + 1)
                                                }
                                            >
                                                Next ➡
                                            </button>
                                        </div>

                                        <input
                                            className="form-control mb-3"
                                            placeholder="Organization"
                                            value={experiences[currentExpIndex]?.company || ""}
                                            onChange={(e) => {
                                                const updated = [...experiences];
                                                updated[currentExpIndex].company = e.target.value;
                                                setExperiences(updated);
                                            }}
                                        />

                                        <input
                                            className="form-control mb-3"
                                            placeholder="Role"
                                            value={experiences[currentExpIndex]?.role || ""}
                                            onChange={(e) => {
                                                const updated = [...experiences];
                                                updated[currentExpIndex].role = e.target.value;
                                                setExperiences(updated);
                                            }}
                                        />

                                        <input
                                            className="form-control mb-3"
                                            placeholder="Start Date"
                                            value={experiences[currentExpIndex]?.start_date || ""}
                                            onChange={(e) => {
                                                const updated = [...experiences];
                                                updated[currentExpIndex].start_date =
                                                    e.target.value;
                                                setExperiences(updated);
                                            }}
                                        />

                                        <input
                                            className="form-control mb-3"
                                            placeholder="End Date"
                                            value={experiences[currentExpIndex]?.end_date || ""}
                                            onChange={(e) => {
                                                const updated = [...experiences];
                                                updated[currentExpIndex].end_date =
                                                    e.target.value;
                                                setExperiences(updated);
                                            }}
                                        />

                                        <textarea
                                            className="form-control mb-3"
                                            placeholder="Description"
                                            value={
                                                experiences[currentExpIndex]?.description || ""
                                            }
                                            onChange={(e) => {
                                                const updated = [...experiences];
                                                updated[currentExpIndex].description =
                                                    e.target.value;
                                                setExperiences(updated);
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="d-grid gap-3 mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-dark"
                                        onClick={() => {
                                            setExperiences([
                                                ...experiences,
                                                {
                                                    company: "",
                                                    role: "",
                                                    start_date: "",
                                                    end_date: "",
                                                    description: "",
                                                },
                                            ]);
                                            setCurrentExpIndex(experiences.length);
                                        }}
                                    >
                                        + Add Experience
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={disabled.experience}
                                        onClick={handleWork}
                                    >
                                        Submit All Experience
                                    </button>
                                </div>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-center align-items-end mt-3 mb-5">
                <div className="card container p-4 h-100 shadow-2-strong shadow-sm" style={{ backgroundColor: "#fff" }}>
                    <div className="card-body">
                        <form>
                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Profile</h3>
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

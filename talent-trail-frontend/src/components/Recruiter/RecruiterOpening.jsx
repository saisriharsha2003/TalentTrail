import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';


const RecruiterOpening = () => {
    const jdOutputString = localStorage.getItem("jdOutput");
    const jdOutput = jdOutputString ? JSON.parse(jdOutputString) : null;
    // console.log(jdOutput?.Result?.["06 Job_Title"])
    const initjobDefault = {
        jobRole: "",
        cgpa: "",
        description: "",
        experience:  "",
        seats: "",
        package: "",
        applicationFor: "",
    }

    const jobDefault = {
        jobRole: jdOutput?.result?.["06 Job_Title"] !== "N/A" ? jdOutput?.result?.["06 Job_Title"] : "",
        cgpa: "",
        description: (jdOutput?.result?.["18 IT Skills, Software tools and Programming Languages with only  Keywords:"] !== undefined && jdOutput?.result?.["18 IT Skills, Software tools and Programming Languages with only  Keywords:"][0] !== "N/A" ? "Skills required: \n" + jdOutput?.result?.["18 IT Skills, Software tools and Programming Languages with only  Keywords:"].join(", ") : "") +
                     (jdOutput?.result?.["23 Certifications"] !== undefined && jdOutput?.result?.["23 Certifications"][0] !== "N/A" ? "\nCertifications required: \n" + jdOutput?.result?.["23 Certifications"].join(", ") : ""),
        experience: jdOutput?.result?.["17 Overall_number_of_years_of_experience"] !== undefined && jdOutput?.result?.["17 Overall_number_of_years_of_experience"] !== "N/A" ? String(jdOutput?.result?.["17 Overall_number_of_years_of_experience"]): "",
        seats: jdOutput?.result?.["12 No_of_positions"] !== "N/A" ? jdOutput?.result?.["12 No_of_positions"] : "",
        package: jdOutput?.result?.["15 Bill_Rate"] !== "N/A" ? jdOutput?.result?.["15 Bill_Rate"] : "",
        applicationFor: "",
    };
    
    
    
    const navigate = useNavigate();

    const axios = useAxiosPrivate();
    const [job, setJob] = useState(jobDefault);
    const [colleges, setColleges] = useState([]);

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await axios.get('/recruiter/colleges');

                const colleges = response?.data;
                setColleges(colleges);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchColleges();
    }, [axios]);

    const handleJob = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/recruiter/job/new', {
                ...job,
                cgpa: parseInt(job.cgpa) || job.cgpa,
                seats: parseInt(job.seats) || job.seats
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);
            localStorage.removeItem("jdOutput")
            setJob(initjobDefault);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    return (
        <>

            {/* Job Detail */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        
                        <div className='card-body'>
                        <div className='d-flex justify-content-between'>
                                    <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">Job</h2>
                                    <div >
                                        <button onClick={() => navigate('/uploadJD')} className="btn btn-dark">Upload JD</button>
                                    </div>
                            </div>
                        <form>

                            <div className='form-row row'>

                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='jj'
                                                className="form-control"
                                                type="text"
                                                placeholder='Job role'
                                                autoComplete='off'
                                                value={job.jobRole}
                                                onChange={(e) => setJob(prev => ({ ...prev, jobRole: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='jj'>Job role</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='jg'
                                                className="form-control"
                                                type="text"
                                                placeholder='cgpa'
                                                minLength={10}
                                                maxLength={10}
                                                autoComplete='off'
                                                value={job.cgpa}
                                                onChange={(e) => setJob(prev => ({ ...prev, cgpa: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='jg'>cgpa</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="form-floating flex-nowrap">
                                            <select id='application' required className="form-select" value={job.applicationFor} onChange={(e) => setJob(prev => ({ ...prev, applicationFor: e.target.value }))}>
                                                <option defaultValue=''></option>
                                                <option value='Everyone'>Global Pool</option>
                                                {colleges.map((college, index) => (
                                                    <option key={index} value={college}>{college}</option>
                                                ))}
                                            </select>
                                            <label htmlFor='application'>Application for</label>
                                        </div>
                                    </div>
                                    
                                </div>


                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='je'
                                                className="form-control"
                                                type="text"
                                                placeholder='Experience'
                                                autoComplete='off'
                                                value={job.experience}
                                                onChange={(e) => setJob(prev => ({ ...prev, experience: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='je'>Experience</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='js'
                                                className="form-control"
                                                type="text"
                                                placeholder='Openings'
                                                autoComplete='off'
                                                value={job.seats}
                                                onChange={(e) => setJob(prev => ({ ...prev, seats: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='js'>Openings</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='jp'
                                                className="form-control"
                                                type="text"
                                                placeholder='Package'
                                                autoComplete='off'
                                                value={job.package}
                                                onChange={(e) => setJob(prev => ({ ...prev, package: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='jp'>Package</label>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className='form-row row'>
                                <div className='col-md-12'>
                                <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <textarea
                                                id='jd'
                                                className="form-control"
                                                rows="5"
                                                style={{ height: "250px" }}
                                                type="text"
                                                placeholder='Description'
                                                autoComplete='off'
                                                value={job.description}
                                                onChange={(e) => setJob(prev => ({ ...prev, description: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='jd'>Description</label>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="card-body">
                                <button className="btn btn-primary" onClick={handleJob}>submit</button>
                            </div>

                        </form>
                        </div>
                    </div>
                {/* </div> */}
            </div>

        </>
    )
}

export default RecruiterOpening
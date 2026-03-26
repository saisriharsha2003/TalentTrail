import React, { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { Link } from 'react-router-dom';

const RecruiterRegister = () => {
    const disabledDefault = {
        company: false,
        recruiterDetail: false
    }
    const companyDefault = {
        name: '',
        industry: '',
        size: '',
        website: '',
        address: '',
        mobile: '',
        overview: ''
    }
    const recruiterDetailDefault = {
        fullName: '',
        position: '',
        mobile: '',
        email: '',
        linkedIn: ''
    }

    const [disabled, setDisabled] = useState(disabledDefault);

    const axios = useAxiosPrivate();
    const [company, setCompany] = useState(companyDefault);
    const [recruiterDetail, setRecruiterDetail] = useState(recruiterDetailDefault);

    const handleCompany = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/recruiter/company', {
                ...company,
                size: parseInt(company.size),
                mobile: parseInt(company.mobile) || company.mobile
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setCompany(companyDefault);
            setDisabled(prev => ({ ...prev, company: true }));
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleRecruiterDetail = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/recruiter/recruiterDetails', {
                ...recruiterDetail,
                mobile: parseInt(recruiterDetail.mobile) || recruiterDetail.mobile
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setRecruiterDetail(recruiterDetailDefault);
            setDisabled(prev => ({ ...prev, recruiterDetail: true }));
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleLogo = async (e) => {
        e.preventDefault();
        try {
            const profile = document.getElementById("profile");
            const fd = new FormData();
            fd.append('profile', profile.files[0]);
            if (!fd) return

            const response = await axios.post('/recruiter/profile', fd,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    return (
        <>

            <div className='d-flex justify-content-center mt-4'>
                <h2>Provide all details</h2>
            </div>

            {/* Compay */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                {/* <div className='row'> */}
                <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm mb-5" style={{ backgroundColor: '#fff' }}>
                    <form className="card-body">

                        <fieldset disabled={disabled.company}>

                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Company</h3>
                            <div className='row form-row'>

                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='cn'
                                                className="form-control"
                                                type="text"
                                                placeholder='Name'
                                                autoComplete='off'
                                                value={company.name}
                                                onChange={(e) => setCompany(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='cn'>Name</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='ci'
                                                className="form-control"
                                                type="text"
                                                placeholder='Industry'
                                                autoComplete='off'
                                                value={company.industry}
                                                onChange={(e) => setCompany(prev => ({ ...prev, industry: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='ci'>Industry</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='cs'
                                                className="form-control"
                                                type="text"
                                                placeholder='Size'
                                                autoComplete='off'
                                                value={company.size}
                                                onChange={(e) => setCompany(prev => ({ ...prev, size: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='cs'>Size</label>
                                        </div>
                                    </div>


                                </div>

                                <div className='col-md-6'>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='cw'
                                                className="form-control"
                                                type="text"
                                                placeholder='Website'
                                                autoComplete='off'
                                                value={company.website}
                                                onChange={(e) => setCompany(prev => ({ ...prev, website: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='cw'>Website</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='cm'
                                                className="form-control"
                                                type="text"
                                                placeholder='Mobile'
                                                minLength={10}
                                                maxLength={10}
                                                autoComplete='off'
                                                value={company.mobile}
                                                onChange={(e) => setCompany(prev => ({ ...prev, mobile: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='cm'>Mobile</label>
                                        </div>
                                    </div>


                                </div>

                            </div>
                            <div className='form-row row'>
                                <div className='col-md-12'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <textarea
                                                id='ca'
                                                className="form-control"
                                                type="text"
                                                placeholder='Address'
                                                autoComplete='off'
                                                value={company.address}
                                                onChange={(e) => setCompany(prev => ({ ...prev, address: e.target.value }))}
                                                required
                                                style={{ height: "150px" }}
                                            />
                                            <label htmlFor='ca'>Address</label>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className='form-row row'>
                                <div className='col-md-12'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <textarea
                                                id='co'
                                                className="form-control"
                                                type="text"
                                                placeholder='Overview'
                                                autoComplete='off'
                                                value={company.overview}
                                                onChange={(e) => setCompany(prev => ({ ...prev, overview: e.target.value }))}
                                                required
                                                style={{ height: "150px" }}

                                            />
                                            <label htmlFor='co'>Overview</label>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="card-body">
                                <button className="btn btn-primary" onClick={handleCompany}>submit</button>
                            </div>

                        </fieldset>

                    </form>
                </div>
                {/* </div> */}
            </div>

            {/* Recruiter Detail */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm mb-5" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <fieldset disabled={disabled.recruiterDetail}>

                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Recruiter</h3>

                                <div className='row form-row'>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='rf'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Full name'
                                                    autoComplete='off'
                                                    value={recruiterDetail.fullName}
                                                    onChange={(e) => setRecruiterDetail(prev => ({ ...prev, fullName: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='rf'>Full name</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='rp'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Position'
                                                    autoComplete='off'
                                                    value={recruiterDetail.position}
                                                    onChange={(e) => setRecruiterDetail(prev => ({ ...prev, position: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='rp'>Position</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='rm'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Mobile'
                                                    minLength={10}
                                                    maxLength={10}
                                                    autoComplete='off'
                                                    value={recruiterDetail.mobile}
                                                    onChange={(e) => setRecruiterDetail(prev => ({ ...prev, mobile: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='rm'>Mobile</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='re'
                                                    className="form-control"
                                                    type="email"
                                                    placeholder='Email'
                                                    autoComplete='off'
                                                    value={recruiterDetail.email}
                                                    onChange={(e) => setRecruiterDetail(prev => ({ ...prev, email: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='re'>Email</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='rl'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Linked in'
                                                    autoComplete='off'
                                                    value={recruiterDetail.linkedIn}
                                                    onChange={(e) => setRecruiterDetail(prev => ({ ...prev, linkedIn: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='rl'>Linked in</label>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="card-body">
                                    <button className="btn btn-primary" onClick={handleRecruiterDetail}>submit</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Profile */}
            <div className='d-flex justify-content-center align-items-end m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm mb-5" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

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
                                        onClick={handleLogo}
                                    >
                                        upload
                                    </button>   
                                </div>
                            </div>

                        </form>
                    {/* </div> */}
                </div>

                {/* <div className='d-inline-flex p-2'>
                    <Link className="btn btn-primary" to="/recruiter">Home</Link>
                </div> */}

            </div>

        </>
    )
}

export default RecruiterRegister;

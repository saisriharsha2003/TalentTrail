import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const RecruiterProfile = () => {
    const disabledDefault = {
        company: true,
        recruiterDetail: true,
        account: true
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

    const axios = useAxiosPrivate();
    const navigate = useNavigate();
    const bufferToBase64 = (bufferArray) => {
        const chunkSize = 100000;
        let base64String = '';

        for (let i = 0; i < bufferArray.length; i += chunkSize) {
            const chunk = bufferArray.slice(i, i + chunkSize);
            base64String += String.fromCharCode.apply(null, chunk);
        }

        return btoa(base64String);
    }
    const [disabled, setDisabled] = useState(disabledDefault);

    const [company, setCompany] = useState(companyDefault);
    const [recruiterDetail, setRecruiterDetail] = useState(recruiterDetailDefault);
    const [profile, setProfile] = useState('');
    const [username, setUsername] = useState('');
    const [prevPassword, setPrevPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');


    const fetchRecruiter = async () => {
        try {
            const response = await axios.get('/recruiter/details')

            const recruiter = response?.data
            setCompany({ ...recruiter?.company, logo: null });
            setRecruiterDetail(recruiter?.recruiterDetail);
            setUsername(recruiter?.username);
            setProfile(`data:image/jpeg;base64,${bufferToBase64(recruiter?.company?.logo?.data)}`);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    useEffect(() => {
        const fetchRecruiter = async () => {
            try {
                const response = await axios.get('/recruiter/details')

                const recruiter = response?.data
                if (!recruiter?.company || !recruiter?.recruiterDetail)
                    return navigate('/recruiterRegister');
                setCompany({ ...recruiter?.company, logo: null });
                setRecruiterDetail(recruiter?.recruiterDetail);
                setUsername(recruiter?.username);
                setProfile(`data:image/jpeg;base64,${bufferToBase64(recruiter?.company?.logo?.data)}`);

            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }

        fetchRecruiter();
    }, [axios, navigate]);

    const handleCompany = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/recruiter/company', {
                ...company,
                size: parseInt(company.size),
                mobile: parseInt(company.mobile) || company.mobile
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleRecruiterDetail = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/recruiter/recruiterDetails', {
                ...recruiterDetail,
                mobile: parseInt(recruiterDetail.mobile) || recruiterDetail.mobile
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

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

            fetchRecruiter();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleUsername = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/username', { newUsername: username });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/password', { prevPassword, newPassword });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setPrevPassword('');
            setNewPassword('');
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    return (
        <>

            {/* Compay */}
            <div className='d-flex justify-content-center m-3'>
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <div className='d-flex justify-content-between'>
                                <h2 className='mb-4 pb-1 pb-md-0 mb-md-4'>Company</h2>

                                {disabled.company && (
                                    <div >
                                        <button onClick={(e) => setDisabled(prev => ({ ...prev, company: false }))} className="btn btn-dark">Edit</button>
                                    </div>
                                )}
                            </div>

                            <fieldset disabled={disabled.company}>

                                <div className='from-row row'>


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
                                    </div>

                                    <div className='col-md-6'>
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
                                                />
                                                <label htmlFor='ca'>Address</label>
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

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <textarea
                                                    id='co'
                                                    style={{ minHeight: '147px', height: 'auto' }}
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Overview'
                                                    autoComplete='off'
                                                    value={company.overview}
                                                    onChange={(e) => setCompany(prev => ({ ...prev, overview: e.target.value }))}
                                                    required
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
            </div>

            {/* Recruiter Detail */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <div className='d-flex justify-content-between'>
                                <h2 className='mb-4 pb-1 pb-md-0 mb-md-4'>Recruiter</h2>

                                {disabled.recruiterDetail && (
                                    <div >
                                        <button onClick={(e) => setDisabled(prev => ({ ...prev, recruiterDetail: false }))} className="btn btn-dark">Edit</button>
                                    </div>
                                )}
                            </div>

                            <fieldset disabled={disabled.recruiterDetail}>

                            <div className='from-row row'>

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
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <h2 className='mb-4 pb-1 pb-md-0 mb-md-4'>Profile</h2>

                            <div className='form-row row'>

                                <div className='col-md-3'>
                                    <div className='card-body'>
                                {       profile && <img className="rounded-circle " src={profile} height={'120'} width={'120'} alt='profile' />}
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    <div className='card-body'>
                                    <div className="flex-nowrap">
                                        <label htmlFor="profile" className="form-label"><b>Change Profile pic</b> (File should be less than 2mb and
                                        only jpeg, jpg and png's allowed)</label>
                                        <input
                                            className="form-control"
                                            type="file"
                                            id="profile"
                                            name='profile'
                                        />
                                    </div>
                                    {/* <div className='d-flex flex-row'> */}
                                        {/* <label className="form-label fs-6">File should be lessthan 2 mb and<br /> only jpeg, jpg and png's allwoed</label> */}
                                        <button className="btn btn-primary mt-3" onClick={handleLogo}>upload</button>
                                    {/* </div> */}
                                    </div>
                                </div>

                            </div>

                            {/* <div className='d-flex align-items-center'>

                                {profile && <img src={profile} height={'100'} alt='profile' />}

                                <div className="card-body">
                                    <div className="flex-nowrap">
                                        <label htmlFor="profile" className="form-label"><b>Profile pic</b></label>
                                        <input
                                            className="form-control"
                                            type="file"
                                            id="profile"
                                            name='profile'
                                        />
                                    </div>
                                    <div className='d-flex flex-row'>
                                        <label className="form-label fs-6">File should be lessthan 2 mb and<br /> only jpeg, jpg and png's allwoed</label>
                                        <button className="btn btn-primary m-2" onClick={handleLogo}>upload</button>
                                    </div>
                                </div>

                            </div> */}

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Account */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm mb-5" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <div className='d-flex justify-content-between'>
                                <h2 className='mb-4 pb-1 pb-md-0 mb-md-4'>Account</h2>

                                {disabled.account && (
                                    <div >
                                        <button onClick={(e) => setDisabled(prev => ({ ...prev, account: false }))} className="btn btn-dark">Edit</button>
                                    </div>
                                )}
                            </div>

                            <fieldset disabled={disabled.account}>

                            <div className='from-row row'>

                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="form-floating flex-nowrap">
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Username'
                                                    id='username'
                                                    minLength={8}
                                                    maxLength={30}
                                                    autoComplete='off'
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                />
                                                <label htmlFor='username'>Username</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <button onClick={handleUsername} className="btn btn-primary">edit</button>
                                        </div>

                                    </div>

                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="form-floating flex-nowrap">
                                                <input
                                                    className="form-control"
                                                    type="password"
                                                    autoComplete='off'
                                                    id='prevPassword'
                                                    placeholder='Previous password'
                                                    value={prevPassword}
                                                    min={8}
                                                    onChange={(e) => setPrevPassword(e.target.value)}
                                                    required
                                                />
                                                <label htmlFor='prevPassword'>Previous password</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="form-floating flex-nowrap">
                                                <input
                                                    className="form-control"
                                                    type="password"
                                                    autoComplete='off'
                                                    id='newPassword'
                                                    placeholder='New password'
                                                    value={newPassword}
                                                    min={8}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                                <label htmlFor='newPassword'>New password</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <button onClick={handlePassword} className="btn btn-primary">edit</button>
                                        </div>

                                    </div>

                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

        </>
    )

}

export default RecruiterProfile
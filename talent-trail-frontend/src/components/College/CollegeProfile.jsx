import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const CollegeProfile = () => {
    const disabledDefault = {
        institution: true,
        principal: true,
        placement: true,
        course: true,
        account: true
    }
    const institutionDefault = {
        name: '',
        website: '',
        address: '',
        mobile: ''
    }
    const principalDefault = {
        fullName: '',
        position: '',
        mobile: '',
        email: ''
    }
    const placementDefault = {
        fullName: '',
        position: '',
        mobile: '',
        email: ''
    }
    const courseDefault = {
        name: '',
        duration: '',
        specialization: ''
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

    const [institution, setInstitution] = useState(institutionDefault);
    const [principal, setPrincipal] = useState(principalDefault);
    const [placement, setPlacement] = useState(placementDefault);
    const [courses, setCourses] = useState([]);
    const [profile, setProfile] = useState('');
    const [username, setUsername] = useState('');
    const [prevPassword, setPrevPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newCourse, setNewCourse] = useState(courseDefault);

    const fetchCollege = async () => {
        try {
            const response = await axios.get('/college/details')

            const college = response?.data
            setInstitution(college?.institution);
            setPrincipal(college?.principal);
            setPlacement(college?.placement);
            setCourses(college?.programs);
            setUsername(college?.username);
            setProfile(`data:image/jpeg;base64,${bufferToBase64(college?.logo?.data)}`);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    useEffect(() => {
        const fetchCollege = async () => {
            try {
                const response = await axios.get('/college/details')

                const college = response?.data
                if (!college?.institution || !college?.principal || !college?.placement)
                    return navigate('/collegeRegister');
                setInstitution(college?.institution);
                setPrincipal(college?.principal);
                setPlacement(college?.placement);
                setCourses(college?.programs);
                setUsername(college?.username);
                setProfile(`data:image/jpeg;base64,${bufferToBase64(college?.logo?.data)}`);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchCollege();
    }, [axios, navigate]);

    const handleInstitution = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/college/institution', {
                ...institution,
                mobile: parseInt(institution.mobile) || institution.mobile,
                institutionId: institution._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePrincipal = async (e) => {
        console.log('first')
        e.preventDefault();
        try {
            const response = await axios.put('/college/principal', {
                ...principal,
                mobile: parseInt(principal.mobile) || principal.mobile,
                principalId: principal._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePlacement = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/college/placement', {
                ...placement,
                mobile: parseInt(placement.mobile) || placement.mobile,
                placementId: placement._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/college/course', {
                ...courses[parseInt(e.target.id)],
                courseId: courses[parseInt(e.target.id)]._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const deleteCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`/college/course/${courses[parseInt(e.target.id)]._id}`);
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchCollege();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleNewCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/college/course', { ...newCourse });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setNewCourse(courseDefault);
            setDisabled(prev => ({ ...prev, course: true }));
            fetchCollege();
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

            const response = await axios.post('/college/profile', fd,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchCollege();
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

            <div className='d-flex justify-content-center mt-3'>
                <h3>Provide all details</h3>
            </div>

            {/* Institution */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                <div className="card container h-100 shadow-2-strong p-4 shadow-sm mb-5" style={{ backgroundColor: '#f8f8f8' }}>
                    <form className="card-body">

                        <div className='d-flex justify-content-between'>
                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Institution</h3>
                            {disabled.institution && (
                                <div >
                                    <button onClick={(e) => setDisabled(prev => ({ ...prev, institution: false }))} className="btn btn-danger">Edit</button>
                                </div>
                            )}
                        </div>

                        <fieldset disabled={disabled.institution}>

                            <div className='row form-row'>

                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='in'
                                                className="form-control"
                                                type="text"
                                                placeholder='Name'
                                                autoComplete='off'
                                                value={institution.name}
                                                onChange={(e) => setInstitution(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='in'>Name</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='iw'
                                                className="form-control"
                                                type="text"
                                                placeholder='Website'
                                                autoComplete='off'
                                                value={institution.website}
                                                onChange={(e) => setInstitution(prev => ({ ...prev, website: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='iw'>Website</label>
                                        </div>
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='ia'
                                                className="form-control"
                                                type="text"
                                                placeholder='Address'
                                                autoComplete='off'
                                                value={institution.address}
                                                onChange={(e) => setInstitution(prev => ({ ...prev, address: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='ia'>Address</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='im'
                                                className="form-control"
                                                type="text"
                                                placeholder='Mobile'
                                                autoComplete='off'
                                                value={institution.mobile}
                                                onChange={(e) => setInstitution(prev => ({ ...prev, mobile: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='im'>Mobile</label>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="card-body">
                                <button className="btn btn-success" onClick={handleInstitution}>submit</button>
                            </div>

                        </fieldset>

                    </form>
                </div>
                {/* </div> */}
            </div>

            {/* Principal */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                <div className="card container h-100 shadow-2-strong p-4 shadow-sm mb-5" style={{ backgroundColor: '#f8f8f8' }}>
                    <form className="card-body">

                        <div className='d-flex justify-content-between'>
                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Principal</h3>
                            {disabled.principal && (
                                <div >
                                    <button onClick={(e) => setDisabled(prev => ({ ...prev, principal: false }))} className="btn btn-danger">Edit</button>
                                </div>
                            )}
                        </div>

                        <fieldset disabled={disabled.principal}>

                            <div className='row form-row'>

                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='pf'
                                                className="form-control"
                                                type="text"
                                                placeholder='Full name'
                                                autoComplete='off'
                                                value={principal.fullName}
                                                onChange={(e) => setPrincipal(prev => ({ ...prev, fullName: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='pf'>Full name</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='prp'
                                                className="form-control"
                                                type="text"
                                                placeholder='Position'
                                                autoComplete='off'
                                                value={principal.position}
                                                onChange={(e) => setPrincipal(prev => ({ ...prev, position: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='prp'>Position</label>
                                        </div>
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='pe'
                                                className="form-control"
                                                type="text"
                                                placeholder='Email'
                                                autoComplete='off'
                                                value={principal.email}
                                                onChange={(e) => setPrincipal(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='pe'>Email</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='pm'
                                                className="form-control"
                                                type="text"
                                                placeholder='Mobile'
                                                autoComplete='off'
                                                value={principal.mobile}
                                                onChange={(e) => setPrincipal(prev => ({ ...prev, mobile: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='pm'>Mobile</label>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="card-body">
                                <button className="btn btn-success" onClick={handlePrincipal}>submit</button>
                            </div>

                        </fieldset>

                    </form>
                </div>
                {/* </div> */}
            </div>

            {/* Placement */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                <div className="card container h-100 shadow-2-strong p-4 shadow-sm mb-5" style={{ backgroundColor: '#f8f8f8' }}>
                    <form className="card-body">

                        <div className='d-flex justify-content-between'>
                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Placement</h3>
                            {disabled.placement && (
                                <div >
                                    <button onClick={(e) => setDisabled(prev => ({ ...prev, placement: false }))} className="btn btn-danger">Edit</button>
                                </div>
                            )}
                        </div>

                        <fieldset disabled={disabled.placement}>

                            <div className='row form-row'>

                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='plf'
                                                className="form-control"
                                                type="text"
                                                placeholder='Full name'
                                                autoComplete='off'
                                                value={placement.fullName}
                                                onChange={(e) => setPlacement(prev => ({ ...prev, fullName: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='plf'>Full name</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='plp'
                                                className="form-control"
                                                type="text"
                                                placeholder='Position'
                                                autoComplete='off'
                                                value={placement.position}
                                                onChange={(e) => setPlacement(prev => ({ ...prev, position: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='plp'>Position</label>
                                        </div>
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='ple'
                                                className="form-control"
                                                type="text"
                                                placeholder='Email'
                                                autoComplete='off'
                                                value={placement.email}
                                                onChange={(e) => setPlacement(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='ple'>Email</label>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='plm'
                                                className="form-control"
                                                type="text"
                                                placeholder='Mobile'
                                                autoComplete='off'
                                                value={placement.mobile}
                                                onChange={(e) => setPlacement(prev => ({ ...prev, mobile: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='plm'>Mobile</label>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="card-body">
                                <button className="btn btn-success" onClick={handlePlacement}>submit</button>
                            </div>

                        </fieldset>

                    </form>
                </div>
                {/* </div> */}
            </div>

            {/* Course */}
            {courses.map((course, index) => {
                return (
                    <div key={index} className='d-flex justify-content-center m-3'>
                        {/* <div className='d-inline-flex p-2'> */}
                        <div className="card container h-100 shadow-2-strong p-4 shadow-sm mb-5" style={{ backgroundColor: '#f8f8f8' }}>
                            <form className="card-body">

                                <div className='d-flex justify-content-between'>
                                    <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Course {index + 1}</h3>
                                    {disabled.course && (
                                        <div >
                                            <button onClick={(e) => setDisabled(prev => ({ ...prev, course: false }))} className="btn btn-danger">Edit</button>
                                        </div>
                                    )}
                                </div>

                                <fieldset disabled={disabled.course}>

                                    <div className='row form-row'>

                                        <div className='col-md-6'>
                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id={index + 'cn'}
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Name'
                                                        autoComplete='off'
                                                        value={course.name}
                                                        onChange={(e) =>
                                                            setCourses(prev => {
                                                                prev[index].name = e.target.value
                                                                return [...prev]
                                                            })}
                                                        required
                                                    />
                                                    <label htmlFor={index + 'cn'}>Name</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id={index + 'cd'}
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Duration'
                                                        autoComplete='off'
                                                        value={course.duration}
                                                        onChange={(e) =>
                                                            setCourses(prev => {
                                                                prev[index].duration = e.target.value
                                                                return [...prev]
                                                            })}
                                                        required
                                                    />
                                                    <label htmlFor={index + 'cd'}>Duration</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='col-md-6'>
                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id={index + 'cs'}
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Specialization'
                                                        autoComplete='off'
                                                        value={course.specialization}
                                                        onChange={(e) =>
                                                            setCourses(prev => {
                                                                prev[index].specialization = e.target.value
                                                                return [...prev]
                                                            })}
                                                        required
                                                    />
                                                    <label htmlFor={index + 'cs'}>Specialization</label>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <div className='d-inline-flex'>
                                        <div className="card-body">
                                            <button id={index + 'cbs'} className="btn btn-success" onClick={handleCourse}>edit</button>
                                        </div>

                                        <div className="card-body">
                                            <button id={index + 'cbd'} className="btn btn-danger" onClick={deleteCourse}>delete</button>
                                        </div>
                                    </div>

                                </fieldset>

                            </form>
                        </div>
                        {/* </div> */}
                    </div>
                )
            })}

            {/* New course */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                <div className="card container h-100 shadow-2-strong p-4 shadow-sm mb-5" style={{ backgroundColor: '#f8f8f8' }}>
                    <form className="card-body">

                        <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">New Course</h3>
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
                                            value={newCourse.name}
                                            onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                        <label htmlFor='cn'>Name</label>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="flex-nowrap form-floating">
                                        <input
                                            id='cd'
                                            className="form-control"
                                            type="text"
                                            placeholder='Duration'
                                            autoComplete='off'
                                            value={newCourse.duration}
                                            onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                                            required
                                        />
                                        <label htmlFor='cd'>Duration</label>
                                    </div>
                                </div>
                            </div>

                            <div className='col-md-6'>
                                <div className="card-body">
                                    <div className="flex-nowrap form-floating">
                                        <input
                                            id='cs'
                                            className="form-control"
                                            type="text"
                                            placeholder='Specialization'
                                            autoComplete='off'
                                            value={newCourse.specialization}
                                            onChange={(e) => setNewCourse(prev => ({ ...prev, specialization: e.target.value }))}
                                            required
                                        />
                                        <label htmlFor='cs'>Specialization</label>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="card-body">
                            <button className="btn btn-success" onClick={handleNewCourse}>submit</button>
                        </div>

                    </form>
                    {/* </div> */}
                </div>
            </div>

            {/* Profile */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                <div className="card container h-100 shadow-2-strong p-4 shadow-sm mb-5" style={{ backgroundColor: '#f8f8f8' }}>
                    <form className="card-body">

                        <   h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Profile</h3>                           
                            <div className='form-row row'>

                                <div className='col-md-3'>
                                    <div className='card-body'>
                                        {profile && <img className="rounded-circle " src={profile} height={'120'} width={'120'} alt='profile' />}
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

                    </form>
                </div>
                {/* </div> */}
            </div>

            {/* Account */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                <div className="card container h-100 shadow-2-strong p-4 shadow-sm mb-5" style={{ backgroundColor: '#f8f8f8' }}>
                    <form className="card-body">

                        <div className='d-flex justify-content-between'>
                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-4">Account</h3>
                            {disabled.account && (
                                <div >
                                    <button onClick={(e) => setDisabled(prev => ({ ...prev, account: false }))} className="btn btn-danger">Edit</button>
                                </div>
                            )}
                        </div>

                        <fieldset disabled={disabled.account}>

                            <div className='row form-row'>

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
                                        <button onClick={handleUsername} className="btn btn-success">edit</button>
                                    </div>

                                </div>

                                <div className='col-md-6'>

                                    <div className="card-body">
                                        <div className="form-floating flex-nowrap">
                                            <input
                                                className="form-control"
                                                type="password"
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
                                        <button onClick={handlePassword} className="btn btn-success">edit</button>
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

export default CollegeProfile;

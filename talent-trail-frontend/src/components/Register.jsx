import React, { useState } from 'react';
import '../styles/form.css';
import axios from '../api/axios';
import { notify } from './Toast';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [matchPassword, setMatchPassword] = useState('');
    const [role, setRole] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        if (password !== matchPassword) {
            notify('failed', 'passwords dont match');
            return;
        }
        e.preventDefault();
        try {
            const response = await axios.post('/signup', { username, password, role });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            const response1 = await axios.post('/login', { username, password, role });
            const accessToken = response1?.data?.accessToken;
            localStorage.setItem('accessToken', accessToken);

            if(role.toLowerCase() === 'student'){
                navigate('/uploadResume');
            }
            else{
                navigate('/' + role + 'Register');
            }
            setUsername('');
            setPassword('');
            setMatchPassword('');
            setRole('');
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    };

    return (
        <>
            <div className='form'>
                <div className='d-inline-flex p-2'>
                    <div className="card" style={{ backgroundColor: '#fff', width: '500px' }}>
                        <form className="card-body" onSubmit={handleSubmit}>

                            <div className="card-body">
                            <a href="/" class="d-flex align-items-center mb-3 link-dark text-decoration-none">
                                    <span className="navbar-brand fs-1 pacifico-regular" to={"/"}>Talentrail</span>  
                                </a>
                                <div id="i5mdc" class="col-12 col-md-12 mb-4">
                                    <h2 id="i3nki" class="title">Sign Up</h2>
                                </div>
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
                                <div className="form-floating flex-nowrap">
                                    <input
                                        className="form-control"
                                        type="password"
                                        id='password'
                                        autoComplete='off'
                                        placeholder='Password'
                                        value={password}
                                        min={8}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor='password'>Password</label>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="form-floating flex-nowrap">
                                    <input
                                        className="form-control"
                                        type="password"
                                        id='confirmPassword'
                                        autoComplete='off'
                                        placeholder='Confirm password'
                                        value={matchPassword}
                                        min={8}
                                        onChange={(e) => setMatchPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor='confirmPassword'>Confirm password</label>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="form-floating flex-nowrap">
                                    <select id='role' required className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option defaultValue=''></option>
                                        <option value='student'>Student</option>
                                        <option value='recruiter'>Recruiter</option>
                                        <option value='college'>College</option>
                                    </select>
                                    <label htmlFor='role'>Role</label>
                                </div>
                            </div>

                            <div className="card-body">
                                <button role="button" type="submit" id="iq8qg" class="btn btn-primary rounded-pill text-centered"><strong>Sign Up</strong></button>                            
                            </div>

                        </form>
                    </div>

                    <div id="ihnx5" style={{ width: '400px' }} className="d-flex flex-column text-wrap">
                        <h1 id="iwymk">Welcome To Talentrail</h1>
                        <p id="ioe5g">Talentrail India is a groundbreaking platform addressing the employability challenge in higher education. By analyzing placement data nationwide, we empower policymakers with insights to enhance graduate employability. For recruiters, our extensive database streamlines talent sourcing. Join us in shaping India's skill-driven future.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;

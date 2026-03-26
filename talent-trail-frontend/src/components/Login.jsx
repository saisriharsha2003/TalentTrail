import React, { useEffect, useState } from 'react'
import axios from '../api/axios';
import '../styles/form.css';
import { notify } from './Toast';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    useEffect(() => {
        const storedAcctype = localStorage.getItem('acctype');
        if (storedAcctype) {
            // Clear the 'acctype' value from local storage
            localStorage.removeItem('acctype');
            // Set the 'acctype' value in the component state
            setRole(storedAcctype)
        }

    }, [])
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/login', { username, password, role });
            const accessToken = response?.data?.accessToken;
            const success = response?.data?.success;
            localStorage.setItem('accessToken', accessToken);
            if (success)
                notify('success', success);

            navigate(from || '/user/' + role, { replace: true });
            setUsername('');
            setPassword('');
            setRole('');
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    };

    return (
        <>
            <div className='form'>
                <div className='d-inline-flex ' id="ikel">
                    <div className="card" style={{ backgroundColor: '#fff', width: '500px'}} id="imsf">
                            <form className="card" onSubmit={handleSubmit} id="is53">

                            <div className="card-body">
                                <a href="/" className="d-flex align-items-center mb-3 link-dark text-decoration-none">
                                    <span className="navbar-brand fs-1 pacifico-regular" to={"/"}>Talentrail</span>  
                                </a>
                                <div id="i5mdc" className="col-12 col-md-12 mb-4">
                                    <h4 id="i3nki" className="title">Sign in</h4>
                                    <div id="i58zc">Don't have an account? </div>
                                    <a data-selected-page-collection="" target="" href="/register" id="itmob">Sign Up</a> 
                                </div>
                                <div className="form-floating flex-nowrap">
                                    <input
                                        className="form-control"
                                        type="text"
                                        id='username'
                                        placeholder='Username'
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
                                        autoComplete='off'
                                        type="password"
                                        id='password'
                                        placeholder='Password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor='password'>Password</label>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="form-floating flex-nowrap">
                                    <select id='role' required className="form-select" value={role} defaultValue={role} onChange={(e) => setRole(e.target.value)}>
                                        <option defaultValue>{role}</option>
                                        <option value='admin'>Admin</option>
                                        <option value='student'>Student</option>
                                        <option value='recruiter'>Recruiter</option>
                                        <option value='college'>College</option>
                                    </select>
                                    <label htmlFor='role'>Role</label>
                                </div>
                            </div>

                            <div className="card-body">
                                <button role="button" type="submit" id="iq8qg" className="btn btn-primary rounded-pill text-centered"><strong>Sign In</strong></button>                            
                            </div>

                        </form>
                    </div>

                    <div id="ihnx5" style={{ width: '400px'}} className="d-flex flex-column text-wrap">
                        <h1 id="iwymk">Welcome To Talentrail</h1>
                        <p id="ioe5g">TalenTrail India is a pioneering initiative addressing the employability challenge in India's higher educational institutions. By consolidating placement data from across the nation, TalenTrail India provides policymakers with invaluable insights to enhance employability across diverse educational domains.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { Link } from 'react-router-dom';

const CollegeCompanies = () => {
    const [recruiters, setRecruiters] = useState([]);

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('/college/companies');

                const recruiters = response?.data
                setRecruiters(recruiters);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchCompanies();
    }, [axios]);

    return (
        <>

            <div className='d-flex flex-column justify-content-center mx-5 my-2'>
                <div>
                    <h1>Companies</h1>
                </div>

                <div className='d-flex flex-row justify-content-evenly mx-5 my-2'>

                    {recruiters.map((recrutier, index) => (
                        <div key={index} className="card shadow container text-center my-2 px-4 py-2" style={{ width: '15rem' }}>
                            <Link className="nav-link" to={recrutier._id}>
                                <div className='card-body p-2'>
                                    <b>{recrutier?.company?.name}</b>
                                </div>
                            </Link>
                        </div>
                    ))}

                </div>

            </div>

        </>
    )
}

export default CollegeCompanies;
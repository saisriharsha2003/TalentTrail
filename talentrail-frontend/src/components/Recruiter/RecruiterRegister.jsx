import React, { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const RecruiterRegister = () => {
  const axios = useAxiosPrivate();

  const [step, setStep] = useState(1);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  const navigate = useNavigate();

  const [company, setCompany] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    address: '',
    mobile: '',
    overview: ''
  });

  const [recruiterDetail, setRecruiterDetail] = useState({
    fullName: '',
    position: '',
    mobile: '',
    email: '',
    linkedIn: ''
  });

  const handleCompany = async () => {
    try {
      const res = await axios.post('/recruiter/company', {
        ...company,
        size: parseInt(company.size),
        mobile: parseInt(company.mobile) || company.mobile
      });
      notify('success', res?.data?.success);
    } catch (err) {
      notify('failed', err?.response?.data?.message);
    }
  };

  const handleRecruiterDetail = async () => {
    try {
      const res = await axios.post('/recruiter/recruiterDetails', {
        ...recruiterDetail,
        mobile: parseInt(recruiterDetail.mobile) || recruiterDetail.mobile
      });
      notify('success', res?.data?.success);
    } catch (err) {
      notify('failed', err?.response?.data?.message);
    }
  };

  const handleLogo = async () => {
    try {
      const file = document.getElementById("profile").files[0];
      if (!file) return;

      const fd = new FormData();
      fd.append('profile', file);

      const res = await axios.post('/recruiter/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      notify('success', res?.data?.success);
    } catch (err) {
      notify('failed', err?.response?.data?.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleCompany();
    await handleRecruiterDetail();
    await handleLogo();
    notify('success', 'Recruiter Registration Successful');
    navigate('/user/recruiter/');
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="card shadow-sm border-0 rounded-4 mx-auto" style={{ maxWidth: '900px' }}>

        <div className="bg-primary text-white text-center p-4">
          <h2 className="fw-bold">Recruiter Registration</h2>
          <p className="opacity-75 mb-0">Set up your company and start hiring</p>
        </div>

        <div className="card-body p-4">

          {/* Step Indicator */}
          <div className="d-flex justify-content-between mb-5 position-relative">
            <div className="position-absolute top-50 start-0 end-0 border-top"></div>
            {[1, 2, 3].map(n => (
              <div key={n}
                className={`rounded-circle d-flex align-items-center justify-content-center border 
                ${step >= n ? 'bg-primary text-white' : 'bg-white text-muted'}`}
                style={{ width: 40, height: 40, zIndex: 1 }}>
                {n}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
              <h4 className="mb-4 text-primary">Company Details</h4>

              <div className="row g-3">
                <div className="col-md-6 form-floating">
                  <input className="form-control" placeholder="Name"
                    value={company.name}
                    onChange={e => setCompany({ ...company, name: e.target.value })} required />
                  <label>Name</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input className="form-control" placeholder="Industry"
                    value={company.industry}
                    onChange={e => setCompany({ ...company, industry: e.target.value })} required />
                  <label>Industry</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input className="form-control" placeholder="Website"
                    value={company.website}
                    onChange={e => setCompany({ ...company, website: e.target.value })} />
                  <label>Website</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input className="form-control" placeholder="Mobile"
                    value={company.mobile}
                    onChange={e => setCompany({ ...company, mobile: e.target.value })} required />
                  <label>Mobile</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input className="form-control" placeholder="Size"
                    value={company.size}
                    onChange={e => setCompany({ ...company, size: e.target.value })} required />
                  <label>Company Size</label>
                </div>

                <div className="col-12 form-floating">
                  <textarea className="form-control" style={{ height: 100 }}
                    value={company.address}
                    onChange={e => setCompany({ ...company, address: e.target.value })} required />
                  <label>Address</label>
                </div>

                <div className="col-12 form-floating">
                  <textarea className="form-control" style={{ height: 100 }}
                    value={company.overview}
                    onChange={e => setCompany({ ...company, overview: e.target.value })} />
                  <label>Overview</label>
                </div>
              </div>

              <div className="text-end mt-4">
                <button className="btn btn-primary px-5">Next</button>
              </div>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
              <h4 className="mb-4 text-primary">Recruiter Details</h4>

              <div className="row g-3">
                <div className="col-md-6 form-floating">
                  <input className="form-control"
                    value={recruiterDetail.fullName}
                    onChange={e => setRecruiterDetail({ ...recruiterDetail, fullName: e.target.value })} required />
                  <label>Full Name</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input className="form-control"
                    value={recruiterDetail.position}
                    onChange={e => setRecruiterDetail({ ...recruiterDetail, position: e.target.value })} required />
                  <label>Position</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input className="form-control"
                    value={recruiterDetail.email}
                    onChange={e => setRecruiterDetail({ ...recruiterDetail, email: e.target.value })} required />
                  <label>Email</label>
                </div>

                <div className="col-md-6 form-floating">
                  <input className="form-control"
                    value={recruiterDetail.mobile}
                    onChange={e => setRecruiterDetail({ ...recruiterDetail, mobile: e.target.value })} required />
                  <label>Mobile</label>
                </div>

                <div className="col-12 form-floating">
                  <input className="form-control"
                    value={recruiterDetail.linkedIn}
                    onChange={e => setRecruiterDetail({ ...recruiterDetail, linkedIn: e.target.value })} />
                  <label>LinkedIn</label>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>Back</button>
                <button className="btn btn-primary px-5">Next</button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="text-center">
              <h4 className="mb-4 text-primary">Finish Setup</h4>

              <div className="mb-4">
                <input type="file" id="profile" className="form-control" />
              </div>

              <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-outline-secondary" onClick={prevStep}>Back</button>
                <button className="btn btn-success px-5">Complete Registration</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default RecruiterRegister;
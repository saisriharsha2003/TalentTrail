import React from 'react';
import '../styles/home.css'


const Footer = () => {
    return (
        <div className="container">
            <footer className="row row-cols-1 row-cols-sm-2 row-cols-md-5 py-2 my-5 row-cols-lg-5">
                <div className="col mb-3">
                    <a href="/" className="d-flex align-items-center mb-3 link-dark text-decoration-none">
                        <span className="navbar-brand fs-1 pacifico-regular">Talentrail</span>    
                    </a>
                    <p className="text-muted">&copy; 2024</p>
                </div>

                <div className="col mb-3">
                    {/* Additional content */}
                </div>

                <div className="col mb-3">
                    <h5 style={{color:"#37517e"}} className='fw-bold'>Useful Links</h5>
                    <ul className="nav flex-column mt-3">
                        <li className="nav-item mb-2"><a href="#" className="nav-link p-0 text-muted">Features</a></li>
                        <li className="nav-item mb-2"><a href="#" className="nav-link p-0 text-muted">Contact</a></li>
                        <li className="nav-item mb-2"><a href="#" className="nav-link p-0 text-muted">Login</a></li>
                        <li className="nav-item mb-2"><a href="#" className="nav-link p-0 text-muted">Signup</a></li>
                        <li className="nav-item mb-2"><a href="#" className="nav-link p-0 text-muted">About</a></li>
                    </ul>
                </div>

                <div className="col mb-3">
                    {/* Other content */}
                </div>

                <div className="col mb-3">
                    <h5 style={{color:"#37517e"}} className='fw-bold'>Contact Info</h5>
                    <ul className="nav flex-column mt-3">
                        <li className="nav-item mb-md-1 mb-lg-4">Nambur, Guntur Andhra Pradesh, India.</li>
                        <li className="nav-item mb-2"><strong>Phone: </strong>1234567890</li>
                        <li className="nav-item mb-2">
                            <p>
                                <strong className='d-inline-block' style={{display:"inline"}}>Email: </strong>
                                <a href="mailto:" className="nav-link p-0 text-muted d-inline-block mx-lg-1">tat@mail.com</a>
                            </p>
                        </li>
                    </ul>
                </div>
                <div className="container footer-bottom clearfix border-top mt-2">
                    <div className="copyright mt-4 text-center mb-0">
                        © Copyright
                        <strong><span> Talentrail</span></strong>. All Rights Reserved
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Footer;

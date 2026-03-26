import React from 'react';
import '../styles/home.css'

import Footer from './Footer';
import harsha from './images/harsha.jpeg'
import joseph from './images/joseph.jpeg'
import rajesh from './images/rajesh.jpeg'
import vara from './images/vara.jpeg'




const Home = () => {

    const handleClick = (acctype) => {
        // Set the 'acctype' value to 'College' in local storage
        localStorage.setItem('acctype', acctype);
    }


    return (
        <>

            <div data-js="pre-built-section" id="i76o2" className="pre-built-section width100">
                <section id="hero_ui_07">
                    <div id="inj1t" className="container-fluid">
                        <div id="igxt4" className="row align-items-center">
                            <div id="ideen" className="col-xl-7 col-lg-7 hero_7_content col-md-7 pt-md-5">
                                <h4 id="i7bxi">Placement Portal</h4>
                                <h1 id="iwcxz">Comprehensive and effective Placement Portal</h1>
                                <p id="i725s">Where the appropriate set of opportunities meet the best collection of skills.</p>
                                <a href="#" className="btn btn-primary rounded-pill mt-md-3 mt-lg-5 text-center fw-bold pr-2 pl-2 fs-5">Contact Us for More</a>

                            </div>
                            <div id="iv3t9" className="col-xl-5 col-lg-5 hero_07_right_image text-right col-md-5">
                                <img src="https://i.postimg.cc/yNdhMtqd/home1.png" alt="" id="io01p" className="img-fluid" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section data-js="drapcode-sections" id="ipj6f" className="dc-sections">
                <h1 id="iwco7">Talent Trail has changed the way colleges recruit for...</h1>
                <div className="container-xl">
                    <div className="row">
                        <div id="ip80h" className="col-12 col-sm-12 col-xl-4 col-lg-4 col-md-6">
                            <div id="is9i5" className="box box1">
                                <h1>45000+</h1>
                                <h1 id="i4yog">Students</h1>
                            </div>
                        </div>
                        <div id="iauuy" className="col-12 col-sm-12 col-xl-4 col-lg-4 col-md-6">
                            <div id="iozi6" className="box box1">
                                <h1 id="i1kru">312+</h1>
                                <h1 id="i58me">College</h1>
                            </div>
                        </div>
                        <div id="i9a1s" className="col-12 col-sm-12 col-xl-4 col-lg-4 col-md-6 mt-md-3 mt-lg-0">
                            <div id="i31du" className="box box1">
                                <h1 id="iw8l3">11280+</h1>
                                <h1 id="igodg">Employers</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section data-js="drapcode-sections" id="iirxi" className="dc-sections">
                <div className="container-xl">
                    <div id="ixftz" className="row">
                        <div id="imqoh" className="col-sm-12 col-md-12 col-lg-11 col-xl-11">
                            <section data-js="drapcode-sections" id="issjf" className="dc-sections">
                                <div className="container-md">
                                    <div id="i8vt2" className="row border-radius p-5">
                                        <div id="iblgr" className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3">
                                            <h1 id="igkb2">UNIVERSITIES</h1>
                                        </div>
                                        <div id="imf0h" className="col-12 col-sm-12 col-md-6 col-lg-9 col-xl-9 ml-4">
                                            <h1 id="i64m6">Digitize and automate online placements.</h1>
                                            <p id="i4w0j">Streamline the process, track data, reach out to additional employers, and go online with your placement cell.</p>
                                            <a href="/login" className="btn btn-primary rounded-pill mt-md-3 mt-lg-4 text-center fw-bold pr-2 pl-2" onClick={() => handleClick("college")}>For Universities</a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                    <div className="row">
                        <div id="ifnrw1" className="col-12 col-sm-12 col-md-12 col-lg-11 col-xl-11">
                            <section data-js="drapcode-sections" id="iijhx5" className="dc-sections">
                                <div className="container-md"><div id="idryj7" className="row border-radius p-5">
                                    <div id="i0ep4i" className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3">
                                        <h1 id="ikg9jl">STUDENTS</h1>
                                    </div>
                                    <div id="ifq93i" className="col-12 col-sm-12 col-md-6 col-lg-9 col-xl-9">
                                        <h1 id="izk04o">Learn about jobs, prepare for them, and apply for them.</h1>
                                        <p id="ixaj7g">Find new possibilities, study and practise on the road, and improve your interview preparation.</p>
                                        <a href="/login" className="btn btn-primary rounded-pill mt-md-3 mt-lg-4 text-center fw-bold pr-2 pl-2" onClick={() => handleClick("student")}>For Students</a>
                                    </div>
                                </div>
                                </div>
                            </section>
                        </div>
                    </div>
                    <div className="row">
                        <div id="i075ob" className="col-12 col-sm-12 col-md-12 col-lg-11 col-xl-11">
                            <section data-js="drapcode-sections" id="ivf4yx" className="dc-sections">
                                <div className="container-md">
                                    <div id="i1knk" className="row border-radius p-5">
                                        <div id="in91m" className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3">
                                            <h1 id="ilvzp">EMPLOYERS</h1>
                                        </div>
                                        <div id="iwlmz" className="col-12 col-sm-12 col-md-6 col-lg-9 col-xl-9">
                                            <h1 id="ib5wo">A one-stop site for employment on campus.</h1>
                                            <p id="i08xl">Connect with additional universities online, and our matching algorithms can help you locate your ideal candidate quickly.</p>
                                            <a href="/login" className="btn btn-primary rounded-pill mt-md-3 mt-lg-4 text-center fw-bold pr-2 pl-2" onClick={() => handleClick("recruiter")}>For Employers</a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>


            <section className='Team dc-sections' id="iip7yv">
                <div className="container-xl p-md-5">
                    <div id='ii981t' className='p-3 pt-5 mb-4' >
                        <div className="section-title">
                            <h2>Team</h2>
                            <p className="mb-5">Our Hardworking Team</p>
                        </div>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                            <div className="col">
                                <div className="card procard h-55" >
                                    <div className="card-img-caption">
                                        <img src={rajesh} className="card-img-top" id="" height={325} />
                                        <p style={{ backgroundColor: "#493fe5", color: "#fff" }} className='card-text text-center'>Team Lead</p>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">Rajesh</h5>
                                        <p className="card-text">20BQ1A4247</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="card procard h-55" >
                                    <div className="card-img-caption">
                                        <img src={harsha} className="card-img-top" height={325}/>
                                        <p style={{ backgroundColor: "#493fe5", color: "#fff" }} className='card-text text-center'>Team Member 1</p>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">Harsha</h5>
                                        <p className="card-text">20BQ1A4245</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="card procard h-55" >
                                    <div className="card-img-caption">
                                        <img src={joseph} className="card-img-top" height={325}/>
                                        <p style={{ backgroundColor: "#493fe5", color: "#fff" }} className='card-text text-center'>Team Member 2</p>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">Joseph</h5>
                                        <p className="card-text">20BQ1A4208</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="card procard h-55" >
                                    <div className="card-img-caption">
                                        <img src={vara} className="card-img-top" height={325}/>
                                        <p style={{ backgroundColor: "#493fe5", color: "#fff" }} className='card-text text-center'>Team Member 3</p>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">Vara</h5>
                                        <p className="card-text">20BQ1A4217</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />




        </>
    )
}

export default Home
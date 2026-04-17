import React, { useState } from "react";
import "../assets/styles/home.css";
import Footer from "./Footer";

import harsha from "./images/harsha.jpg";
import joseph from "./images/joseph.jpeg";
import rajesh from "./images/rajesh.jpeg";
import vara from "./images/vara.jpeg";

const Home = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleClick = (acctype) => {
    localStorage.setItem("acctype", acctype);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <section className="hero-modern">
        <div className="container d-flex align-items-center justify-content-between flex-wrap">
          <div className="hero-text">
            <h1 className="hero-title">Build Your Future 🚀</h1>

            <p className="hero-subtext">
              Discover jobs, connect with recruiters, and unlock your career with AI-powered placement.
            </p>

            <div className="d-flex gap-3 mt-4">
              <a href="/login" className="btn btn-glow">
                Get Started →
              </a>

              <a href="#" className="btn btn-outline-light">
                Explore →
              </a>
            </div>
          </div>

          <div className="hero-image">
            <img src="https://i.postimg.cc/yNdhMtqd/home1.png" alt="" />
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center mb-5">Why TalenTrail?</h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <h4>⚡ AI Matching</h4>
                <p>Smart algorithms match students with the best jobs instantly.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card">
                <h4>📊 Analytics</h4>
                <p>Track placement stats and student performance in real time.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card">
                <h4>🔗 Seamless Hiring</h4>
                <p>Connect recruiters and students on a single platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="modern-section">
        <div className="container">
          <h2 className="section-title text-center mb-5">
            Choose Your Path ✨
          </h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="modern-card">
                <h3>🏫 Universities</h3>
                <p>
                  Automate placements, track students, and connect with companies efficiently.
                </p>
                <button
                  className="btn btn-outline-light mt-3"
                  onClick={() => handleClick("college")}
                >
                  Explore →
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="modern-card highlight">
                <h3>🎓 Students</h3>
                <p>
                  Discover jobs, improve skills, and get matched with the best opportunities.
                </p>
                <button
                  className="btn btn-light mt-3"
                  onClick={() => handleClick("student")}
                >
                  Start Applying →
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="modern-card">
                <h3>💼 Employers</h3>
                <p>
                  Hire smarter with AI-powered matching and access top talent instantly.
                </p>
                <button
                  className="btn btn-outline-light mt-3"
                  onClick={() => handleClick("recruiter")}
                >
                  Hire Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="team-modern">
        <div className="container">
          <h2 className="team-title text-center mb-5">
            The Minds Behind TalenTrail 💡
          </h2>

          <div className="row g-4 justify-content-center">
            {[
              { img: rajesh, name: "Rajesh", role: "Team Lead" },
              { img: harsha, name: "Harsha", role: "Developer" },
              { img: joseph, name: "Joseph", role: "Developer" },
              { img: vara, name: "Vara", role: "Developer" },
            ].map((member, i) => (
              <div className="col-lg-3 col-md-6 col-sm-6" key={i}>
                <div className="team-card-modern">
                  <div className="image-wrapper">
                    <img src={member.img} alt={member.name} />
                  </div>

                  <div className="team-content">
                    <h5>{member.name}</h5>
                    <p>{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <h2 className="text-center mb-5">Contact Us</h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit" className="btn btn-glow">
              Send Message →
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
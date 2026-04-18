import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { notify } from "./Toast";
import "../assets/styles/nav.css";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosP = useAxiosPrivate();

  const { user, logout } = useAuth();

  const [profile, setProfile] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [newN, setNewN] = useState(false);
  const [link, setLink] = useState("/");
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const intervalRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const showSidebar =
    user?.userInfo?.username && location.pathname.startsWith("/user/");

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const bufferToBase64 = (bufferArray) => {
    const chunkSize = 100000;
    let base64String = "";

    for (let i = 0; i < bufferArray.length; i += chunkSize) {
      const chunk = bufferArray.slice(i, i + chunkSize);
      base64String += String.fromCharCode.apply(null, chunk);
    }

    return btoa(base64String);
  };

  useEffect(() => {
    if (!user?.userInfo?.role) return;

    if (user.userInfo.role === "admin" || user.userInfo.role === "college")
      return;

    const fetchNotifications = async () => {
      try {
        const res = await axiosP.get(`/${user.userInfo.role}/notifications`);
        setNotifications(res.data);
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };

    fetchNotifications();

    intervalRef.current = setInterval(fetchNotifications, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, axiosP]);

  // 👤 Profile
  useEffect(() => {
    if (!user?.userInfo?.role) return;

    const fetchProfile = async () => {
      try {
        setLink("/user/" + user.userInfo.role);

        const res = await axiosP.get(`/${user.userInfo.role}/profile`);

        if (res?.data?.data?.length) {
          setProfile(`data:image/jpeg;base64,${bufferToBase64(res.data.data)}`);
        }
      } catch (err) {
        notify("failed", err?.response?.data?.message);
      }
    };

    fetchProfile();
  }, [user, axiosP]);

  const handleLogout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });

      logout();

      // 🔥 IMPORTANT CHANGES
      localStorage.clear();
      delete axios.defaults.headers.common["Authorization"];
      setProfile("");

      if (intervalRef.current) clearInterval(intervalRef.current);

      notify("success", "Successfully logged out");
    } catch (err) {
      notify("failed", err?.response?.data?.message);
    }

    navigate("/");
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav
        className="navbar px-2"
        data-bs-theme="dark"
        style={{ backgroundColor: "#18181aff" }}
      >
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />

        <div className="container-fluid">
          <div className="d-flex align-items-center">
            {!showSidebar ? null : (
              <button
                className="navbar-toggler"
                type="button"
                onClick={toggleNavbar}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            )}

            <Link
              className="navbar-brand mx-5 fs-3 pacifico-regular"
              to={link || "/"}
            >
              Talentrail
            </Link>
          </div>

          <ul className="navbar-nav d-flex flex-row align-items-center">
            {!user?.userInfo?.username ? (
              <>
                <li className="nav-item mx-md-3 mx-lg-4 mx-sm-2 mx-xs-1">
                  <a className="nav-link" href="#iirxi">
                    Features
                  </a>
                </li>
                <li className="nav-item mx-md-3 mx-lg-4 mx-sm-2 mx-xs-1">
                  <a className="nav-link" href="#footer">
                    Contact
                  </a>
                </li>
                <li className="nav-item mx-md-3 mx-lg-4 mx-sm-2 mx-xs-1">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item mx-md-3 mx-lg-4 mx-sm-2 mx-xs-1">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item mx-4">
                  <div
                    className="dropdown"
                    ref={notifRef}
                    style={{ float: "right" }}
                  >
                    <button
                      className={`position-relative nav-button ${isNotifOpen ? "bg-white bg-opacity-10" : ""}`}
                      onClick={() => {
                        setIsNotifOpen(!isNotifOpen);
                        setNewN(false);
                      }}
                    >
                      🔔
                      {newN && (
                        <span className="position-absolute start-50 bg-danger border border-light rounded-circle">
                          <span className="visually-hidden"></span>
                        </span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <ul className="notification-dropdown-content list-group show-dropdown">
                        {notifications.length ? (
                          notifications.map((notification, index) => (
                            <li key={index} className="list-group-item">
                              {notification}
                            </li>
                          ))
                        ) : (
                          <li className="list-group-item">No notifications</li>
                        )}
                      </ul>
                    )}
                  </div>
                </li>

                {/* 👤 Profile */}
                <li className="nav-item mx-1">
                  <div
                    className="dropdown"
                    ref={profileRef}
                    style={{ float: "right" }}
                  >
                    <button
                      className={`nav-button dropbtn ${isProfileOpen ? "bg-white bg-opacity-10" : ""}`}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                      {profile ? (
                        <img
                          className="profile"
                          src={profile}
                          height={"35"}
                          alt=""
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          fill="white"
                          className="bi bi-person-circle"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                          <path
                            fillRule="evenodd"
                            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                          />
                        </svg>
                      )}
                    </button>

                    {isProfileOpen && (
                      <ul className="dropdown-content list-group show-dropdown">
                        <li
                          className="list-group-item"
                          onClick={() => {
                            navigate(`/user/${user.userInfo.role}/profile`);
                            setIsProfileOpen(false);
                          }}
                        >
                          Profile
                        </li>
                        <li
                          className="list-group-item"
                          onClick={() => {
                            handleLogout();
                            setIsProfileOpen(false);
                          }}
                        >
                          Logout
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <div className="d-flex">
        {showSidebar && (
          <nav id="ibd6" className={`sidebar ${isOpen ? "active" : ""}`}>
            <div className={`collapse navbar-collapse ${isOpen ? "" : "show"}`}>
              {user.userInfo.role === "student" && (
                <ul className="list-unstyled sidebar-ul">
                  <li className="sidebar-list">
                    <Link className="nav-link rounded" to="/user/student">
                      <i className="bi bi-grid-1x2"></i> Dashboard
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/student/jobOpenings"
                    >
                      <i className="bi bi-briefcase"></i> Job openings
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/student/applied"
                    >
                      <i className="bi bi-check-circle"></i> Applied jobs
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/student/profile"
                    >
                      <i className="bi bi-person"></i> Profile
                    </Link>
                  </li>
                </ul>
              )}

              {user.userInfo.role === "recruiter" && (
                <ul className="list-unstyled sidebar-ul">
                  <li className="sidebar-list">
                    <Link className="nav-link rounded" to="/user/recruiter">
                      <i className="bi bi-grid-1x2"></i> Dashboard
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link className="nav-link rounded" to="/user/recruiter/new">
                      <i className="bi bi-plus-circle"></i> Post new job
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/recruiter/posted"
                    >
                      <i className="bi bi-journal-text"></i> Posted jobs
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/recruiter/applications"
                    >
                      <i className="bi bi-people"></i> Applications
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/recruiter/profile"
                    >
                      <i className="bi bi-person"></i> Profile
                    </Link>
                  </li>
                </ul>
              )}

              {user.userInfo.role === "college" && (
                <ul className="list-unstyled sidebar-ul">
                  <li className="sidebar-list">
                    <Link className="nav-link rounded" to="/user/college">
                      <i className="bi bi-grid-1x2"></i> Dashboard
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/college/companies"
                    >
                      <i className="bi bi-building"></i> Companies
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/college/sections"
                    >
                      <i className="bi bi-columns-gap"></i> Sections
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/college/drives"
                    >
                      <i className="bi bi-mortarboard"></i> Placement drives
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/college/profile"
                    >
                      <i className="bi bi-person"></i> Profile
                    </Link>
                  </li>
                </ul>
              )}

              {user.userInfo.role === "admin" && (
                <ul className="list-unstyled sidebar-ul">
                  <li className="sidebar-list">
                    <Link className="nav-link rounded" to="/user/admin">
                      <i className="bi bi-grid-1x2"></i> Dashboard
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/admin/students"
                    >
                      <i className="bi bi-people"></i> Students
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/admin/recruiters"
                    >
                      <i className="bi bi-building"></i> Recruiters
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/admin/openings"
                    >
                      <i className="bi bi-briefcase"></i> Openings
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link
                      className="nav-link rounded"
                      to="/user/admin/selected"
                    >
                      <i className="bi bi-patch-check"></i> Selected
                    </Link>
                  </li>
                  <li className="sidebar-list">
                    <Link className="nav-link rounded" to="/user/admin/profile">
                      <i className="bi bi-person"></i> Profile
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </nav>
        )}

        <div className={`outlet ${!showSidebar ? "full-width" : ""}`}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;

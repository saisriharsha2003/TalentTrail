import StudentLayout from "./components/Student/StudentLayout";
import StudentDashboard from "./components/Student/StudentDashboard";
import StudentOpenings from "./components/Student/StudentOpenings";
import StudentJobProfile from "./components/Student/StudentJobProfile";
import StudentApplied from "./components/Student/StudentApplied";
import StudentProfile from "./components/Student/StudentProfile";
import UploadResume from "./components/Student/UploadResume";
import StudentRegister from "./components/Student/StudentRegister";

import RecruiterLayout from "./components/Recruiter/RecruiterLayout"
import RecruiterDashboard from "./components/Recruiter/RecruiterDashboard";
import RecruiterOpening from "./components/Recruiter/RecruiterOpening";
import RecruiterPosted from "./components/Recruiter/RecruiterPosted";
import RecruiterJobProfile from "./components/Recruiter/RecruiterJobProfile";
import RecruiterApplications from "./components/Recruiter/RecruiterApplications";
import RecruiterStudentProfile from "./components/Recruiter/RecruiterStudentProfile";
import RecruiterProfile from "./components/Recruiter/RecruiterProfile";
import RecruiterRegister from './components/Recruiter/RecruiterRegister';
import UploadJD from "./components/Recruiter/UploadJD";

import CollegeLayout from "./components/College/CollegeLayout";
import CollegeRegister from "./components/College/CollegeRegister";
import CollegeProfile from "./components/College/CollegeProfile";
import CollegeDashboard from "./components/College/CollegeDashboard";
import CollegeCompanies from "./components/College/CollegeCompanies";
import CollegeCompanyProfile from "./components/College/CollegeCompanyProfile";
import CollegeSections from "./components/College/CollegeSections";
import CollegeDrives from "./components/College/CollegeDrives";
import CollegeDriveProfile from "./components/College/CollegeDriveProfile";
import CollegeStudents from "./components/College/CollegeStudents";
import CollegeStudentProfile from "./components/College/CollegeStudentProfile";

import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminStudents from "./components/Admin/AdminStudents";
import AdminRecruiters from "./components/Admin/AdminRecruiters";
import AdminOpenings from "./components/Admin/AdminOpenings";
import AdminSelected from "./components/Admin/AdminSelected";
import AdminProfile from './components/Admin/AdminProfile';

import Layout from "./components/Layout";
import Login from "./components/Login";
import Register from './components/Register';
import Home from "./components/Home";
import Toast from "./components/Toast";
import NotFound from './components/NotFound';
import UserLayout from "./components/UserLayout";

import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <>
      <Toast />
      <Routes>
        <Route path='/' element={<Layout />}>

          <Route index element={<Home />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
          <Route path="studentRegister" element={<StudentRegister />} />
          <Route path="uploadResume" element={<UploadResume />} />
          <Route path="uploadJD" element={<UploadJD />} />
          <Route path="recruiterRegister" element={<RecruiterRegister />} />
          <Route path="collegeRegister" element={<CollegeRegister />} />

          <Route path='user/' element={<UserLayout />}>

            <Route path='student/' element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path='jobOpenings' element={<StudentOpenings />} />
              <Route path='jobOpenings/:id' element={<StudentJobProfile />} />
              <Route path="applied" element={<StudentApplied />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            <Route path="recruiter/" element={<RecruiterLayout />}>
              <Route index element={<RecruiterDashboard />} />
              <Route path="new" element={<RecruiterOpening />} />
              <Route path="posted" element={<RecruiterPosted />} />
              <Route path="posted/:id" element={<RecruiterJobProfile />} />
              <Route path="applications" element={<RecruiterApplications />} />
              <Route path="applications/:id" element={<RecruiterStudentProfile />} />
              <Route path="profile" element={<RecruiterProfile />} />
            </Route>

            <Route path="college/" element={<CollegeLayout />}>
              <Route index element={<CollegeDashboard />} />
              <Route path="companies" element={<CollegeCompanies />} />
              <Route path="companies/:id" element={<CollegeCompanyProfile />} />
              <Route path="sections" element={<CollegeSections />} />
              <Route path="sections/:course/:id" element={<CollegeStudents />} />
              <Route path="student/:studentId" element={<CollegeStudentProfile />} />
              <Route path="drives" element={<CollegeDrives />} />
              <Route path="drives/:id" element={<CollegeDriveProfile />} />
              <Route path="profile" element={<CollegeProfile />} />
            </Route>

            <Route path="admin/" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="recruiters" element={<AdminRecruiters />} />
              <Route path="openings" element={<AdminOpenings />} />
              <Route path="selected" element={<AdminSelected />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

          </Route>

          <Route path='*' element={<NotFound />} />

        </Route>
      </Routes>
      
    </>
  );
}

export default App;

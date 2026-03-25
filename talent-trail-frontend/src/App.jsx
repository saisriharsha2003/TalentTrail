import Toast from "./components/Toast";
import { Route, Routes } from "react-router-dom";
import NotFound from "./components/NotFound";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Register from "./components/Register";
import RecruiterRegister from "./components/Recruiter/RecruiterRegister";
import RecruiterLayout from "./components/Recruiter/RecruiterLayout";
import RecruiterDashboard from "./components/Recruiter/RecruiterDashboard";

const App = () => {
  return (
    <>
      <Toast />
      <Routes>
        <Route path='/' element={<Layout />}>
            <Route index element={<Home />} />
            <Route path='register' element={<Register />} />
            <Route path="recruiterRegister" element={<RecruiterRegister />} />

            <Route path="recruiter/" element={<RecruiterLayout />}>
                <Route index element={<RecruiterDashboard />} />
            </Route>
            

            <Route index element={<Home />} />
            <Route path='*' element={<NotFound />} />

        </Route>
      </Routes>
      
    </>
  );
}

export default App;

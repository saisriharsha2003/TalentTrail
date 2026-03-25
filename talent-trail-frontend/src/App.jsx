import Home from "./components/Home";
import Toast from "./components/Toast";
import UserLayout from "./components/UserLayout";
import NotFound from "./components/NotFound";
import Register from "./components/Register";
import Layout from "./components/Layout";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <>
      <Toast />
      <Routes>
        <Route path='/' element={<Layout />}>
            <Route index element={<Home />} />
            <Route path='register' element={<Register />} />

            <Route index element={<Home />} />
            <Route path='*' element={<NotFound />} />

        </Route>
      </Routes>
      
    </>
  );
}

export default App;

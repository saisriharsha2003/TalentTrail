import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import StudentProfile from "../Student/StudentProfile";
import { notify } from "../Toast";

const CollegeStudentProfile = () => {
  const { studentId } = useParams();
  const axios = useAxiosPrivate();

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudent = async () => {
    try {
      const response = await axios.get(`/college/student/${studentId}`);
      setStudentData(response?.data);
    } catch (err) {
      notify("failed", err?.response?.data?.message || "Failed to fetch student");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="text-center mt-5 text-muted">
        Student not found
      </div>
    );
  }

  return (
    <StudentProfile
      isReadOnly={true}
      externalData={studentData}
    />
  );
};

export default CollegeStudentProfile;
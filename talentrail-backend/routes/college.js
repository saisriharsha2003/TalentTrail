const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');
const verifyRole = require('../middleware/verifyRole');
const { profileUpload } = require('../middleware/upload');

router.use(verifyRole('college'));

router.get('/', collegeController.getDashboard);

router.get('/details', collegeController.getCollege);

router.get('/profile', collegeController.getProfile);

router.get('/companies', collegeController.getCompanies);

router.get('/company/:recruiterId', collegeController.getCompany);

router.get('/courses', collegeController.getCourses);

router.get('/students/:courseId', collegeController.getStudents);

router.get('/student/:studentId', collegeController.getStudent);

router.get('/drives', collegeController.getDrives);

router.get('/job/:jobId', collegeController.getJob);

router.post('/job/:jobId', collegeController.postJob);

router.post('/institution', collegeController.postInstitution);

router.post('/principal', collegeController.postPrincipal);

router.post('/placement', collegeController.postPlacement);

router.post('/course', collegeController.postCourse);

router.post('/profile', profileUpload.single('profile'), collegeController.postProfile);

router.put('/institution', collegeController.putInstitution);

router.put('/principal', collegeController.putPrincipal);

router.put('/placement', collegeController.putPlacement);

router.put('/course', collegeController.putCourse);

router.delete('/course/:courseId', collegeController.deleteCourse);

module.exports = router;
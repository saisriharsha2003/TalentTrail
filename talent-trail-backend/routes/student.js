const express = require('express');
const router = express.Router();
const verifyRole = require('../middleware/verfyRole');
const studentController = require('../controllers/studentController');
const verificationController = require('../controllers/verificationController');
const { profileUpload, resumeUpload } = require('../middleware/upload');

router.use(verifyRole('student'));

router.get('/$', studentController.getDashboard);

router.get('/details$', studentController.getStudent);

router.get('/jobs$', studentController.getJobs);

router.post('/capabilityCal$', studentController.capabilityCal);

router.get('/applied$', studentController.getAppliedJobs);

router.get('/jobProfile/:jobId', studentController.getJobProfile);

router.get('/profile$', studentController.getProfile);

router.get('/notifications$', studentController.getNotifications);

router.post('/application$', studentController.postAppliedJob);

router.post('/academic$', studentController.postAcademic);

router.post('/certification$', studentController.postCertification);

router.post('/contact$', studentController.postContact);

router.post('/profile$', profileUpload.single('profile'), studentController.postProfile);

router.post('/resume$', resumeUpload.single('resume'), studentController.postResume);

router.post('/parseResume$', resumeUpload.single('resume'), studentController.parseResume);

router.post('/personal$', studentController.postPersonal);

router.post('/project$', studentController.postProject);

router.post('/work$', studentController.postWork);

router.put('/academic$', studentController.putAcademic);

router.put('/certification$', studentController.putCertification);

router.put('/contact$', studentController.putContact);

router.put('/resume$', resumeUpload.single('resume'), studentController.putResume);

router.put('/personal$', studentController.putPersonal);

router.put('/project$', studentController.putProject);

router.put('/work$', studentController.putWork);

router.delete('/certification/:cId', studentController.deleteCertification);

router.delete('/project/:pId', studentController.deleteProject);

router.delete('/work/:wId', studentController.deleteWork);

router.post('/sendMail$', verificationController.sendOTPMail);

router.post('/verifyMail$', verificationController.verifyOTPMail);

router.post('/resendMail$', verificationController.resendOTPMail);

router.post('/sendMobile$', verificationController.sendOTPMobile);

router.post('/verifyMobile$', verificationController.verifyOTPMobile);

router.post('/resendMobile$', verificationController.resendOTPMobile);

module.exports = router;
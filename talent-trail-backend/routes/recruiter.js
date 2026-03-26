const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const verifyRole = require('../middleware/verfyRole');
const { profileUpload, resumeUpload } = require('../middleware/upload');

router.use(verifyRole('recruiter'));

router.get('/$', recruiterController.getDashboard);

router.get('/colleges', recruiterController.getColleges);

router.get('/jobs$', recruiterController.getJobs);

router.get('/jobProfile/:jobId', recruiterController.getJobProfile);

router.get('/studentProfile/:studentId', recruiterController.getStudentProfile);

router.get('/applications$', recruiterController.getApplications);

router.get('/details$', recruiterController.getRecruiter);

router.get('/profile$', recruiterController.getProfile);

router.get('/notifications$', recruiterController.getNotifications);

router.post('/job/new$', recruiterController.postNewJob);

router.post('/application$', recruiterController.postApplication);

router.post('/capabilityCal$', recruiterController.capabilityCal);

router.post('/company$', recruiterController.postCompany);

router.post('/parseJD', resumeUpload.single('jd'), recruiterController.parseJD);

router.post('/profile$', profileUpload.single('profile'), recruiterController.postProfile);

router.post('/recruiterDetails$', recruiterController.postRecruiterDetails);

router.put('/company$', recruiterController.putCompany);

router.put('/recruiterDetails$', recruiterController.putRecruiterDetails);

router.delete('/job/:jobId', recruiterController.deleteJob);

module.exports = router;
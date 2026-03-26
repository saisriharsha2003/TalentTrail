const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyRole = require('../middleware/verfyRole');
const { profileUpload } = require('../middleware/upload');

router.use(verifyRole('admin'));

router.get('/$', adminController.getDashboard);

router.get('/students$', adminController.getStudents);

router.get('/recruiters$', adminController.getRecruiters);

router.get('/openings$', adminController.getOpenings);

router.get('/selected$', adminController.getSelected);

router.get('/details$', adminController.getAdmin);

router.get('/profile$', adminController.getProfile);

router.post('/profile$', profileUpload.single('profile'), adminController.postProfile);

module.exports = router;
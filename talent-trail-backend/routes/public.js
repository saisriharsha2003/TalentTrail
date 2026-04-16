const express = require('express');
const router = express.Router();
const College = require('../models/college');

router.get('/colleges', async (req, res) => {
    try {
        const colleges = await College.find()
            .populate('institution')
            .populate('programs')
            .select('institution username programs')
            .exec();
            
        const formattedColleges = colleges.map(c => ({
            id: c._id,
            name: c.institution?.name || c.username,
            courses: (c.programs || []).map(course => ({
                id: course._id,
                name: course.name,
                specialization: course.specialization
            }))
        }));
        res.json(formattedColleges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

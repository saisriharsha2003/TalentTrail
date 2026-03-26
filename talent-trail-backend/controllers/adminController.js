const Admin = require('../models/admin');
const Job = require('../models/job');
const Student = require('../models/student');
const Recruiter = require('../models/recruiter');
const AppliedJob = require('../models/student/appliedJob');

const getDashboard = async (req, res, next) => {
    const { id } = req;
    try {
        const foundSelectedJobs = await AppliedJob.find({ status: 'selected' }).exec();
        const foundStudents = await Student.find({}).exec();
        const foundRecruiters = await Recruiter.find({}).exec();
        const foundAdmin = await Admin.findById(id).select('username profile').exec();
        if (!foundAdmin) return res.status(401).json({ 'message': 'unauthorized' });

        res.json({
            selected: foundSelectedJobs.length,
            students: foundStudents.length,
            recruiters: foundRecruiters.length,
            username: foundAdmin.username,
            profile: foundAdmin.profile
        })
    }
    catch (err) {
        next(err);
    }
}

const getStudents = async (req, res, next) => {
    try {
        const foundStudents = await Student.find({})
            .populate('personal')
            .populate('contact')
            .populate('academic')
            .populate('workExperiences')
            .populate('projects')
            .populate('certifications')
            .select('username personal contact academic workExperiences projects certifications')
            .exec();

        res.json(foundStudents);
    }
    catch (err) {
        next(err);
    }
}

const getRecruiters = async (req, res, next) => {
    try {
        const foundRecruiters = await Recruiter.find({})
            .populate('recruiterDetail')
            .populate({
                path: 'company',
                select: '-logo'
            })
            .select('username company recruiterDetail')
            .exec();

        res.json(foundRecruiters);
    }
    catch (err) {
        next(err);
    }
}

const getOpenings = async (req, res, next) => {
    try {
        const foundJobs = await Job.find({}).exec();

        res.json(foundJobs);
    }
    catch (err) {
        next(err);
    }
}

const getSelected = async (req, res, next) => {
    try {
        const foundSelectedJobs = await AppliedJob.find({ status: 'selected' }).exec();

        res.json(foundSelectedJobs);
    }
    catch (err) {
        next(err);
    }
}

const getAdmin = async (req, res, next) => {
    const { id } = req;
    try {
        const foundAdmin = await Admin.findById(id).select('username profile').exec();
        if (!foundAdmin) return res.status(401).json({ 'message': 'unauthorized' });

        res.json(foundAdmin);
    }
    catch (err) {
        next(err);
    }
}

const getProfile = async (req, res, next) => {
    const { id } = req;
    try {
        const foundProfile = await Admin.findById(id).select('profile').exec();
        if (!foundProfile) return res.status(401).json({ 'message': 'unauthorized' });

        res.json(foundProfile.profile);
    }
    catch (err) {
        next(err);
    }
}

const postProfile = async (req, res, next) => {
    const { id } = req;
    try {
        const foundAdmin = await Admin.findById(id).exec();
        if (!foundAdmin) return res.status(401).json({ 'message': 'unauthorized' });

        if (!req.file) return res.status(400).json({ 'message': 'Only jpg, jpeg and png are allowed and should be less than 2 mb' });

        foundAdmin.profile = req.file.buffer;
        await foundAdmin.save();

        res.status(201).json({ 'success': 'Profile uploaded successfully' });
    }
    catch (err) {
        next(err);
    }
}

module.exports = {
    getDashboard,
    getStudents,
    getRecruiters,
    getOpenings,
    getSelected,
    getAdmin,
    getProfile,
    postProfile
}
const Job = require('../models/job');
const RecruiterDetail = require('../models/recruiter/recruiterDetails');
const Company = require('../models/recruiter/company');
const Recruiter = require('../models/recruiter');
const AppliedJob = require('../models/student/appliedJob');
const Student = require('../models/student');
const College = require('../models/college');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios');
const FormData = require("form-data");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD
    }
});

const getDashboard = async (req, res, next) => {
    const { id } = req;
    try {
        const foundRecruiter = await Recruiter.findById(id).populate('company').exec();
        if (!foundRecruiter.company) return res.status(401).json({ 'message': 'Details missing' });
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const foundPostedJobs = await Job.find({ recruiter: id }).exec();
        const foundSelectedApplicants = await AppliedJob.find({ companyName: foundRecruiter.company.name, status: 'selected' }).exec();
        const foundRejectedApplicants = await AppliedJob.find({ companyName: foundRecruiter.company.name, status: 'rejected' }).exec();
        const foundApplicants = await AppliedJob.find({ companyName: foundRecruiter.company.name }).exec();
        const response = {
            posted: foundPostedJobs.length,
            selected: foundSelectedApplicants.length,
            rejected: foundRejectedApplicants.length,
            applicants: foundApplicants.length,
            username: foundRecruiter.username,
            profile: foundRecruiter.company.logo
        }

        res.json(response);
    }
    catch (err) {
        next(err);
    }
}

const getColleges = async (req, res, next) => {
    try {
        const foundColleges = await College.find({}).populate('institution').exec();
        const colleges = foundColleges.map(c => c.institution?.name).filter(c => c);

        res.json(colleges);
    }
    catch (err) {
        next(err);
    }
}

const getJobs = async (req, res, next) => {
    const { id } = req;
    try {
        const foundRecruiter = await Recruiter.findById(id).exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const foundPostedJobs = await Job.find({ recruiter: id }).exec();

        res.json(foundPostedJobs);
    }
    catch (err) {
        next(err);
    }
}

const capabilityCal = async (req, res, next) => {
    const { id } = req;
    try {
        const foundRecruiter = await Recruiter.findById(id).exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const { sent1, sent2 } = req.body;
        const formData = new FormData();
        formData.append("sent1", sent1)
        formData.append("sent2", sent2)
        const score = await axios.post("https://supreme-trout-6qxqw59xxgxh5wqw-5080.app.github.dev/compute_score", formData).then((resp) => {
            // console.log(resp.data);
            return resp.data;
        }).catch((e)=> {
            console.log(e.data)
            next(e);
        })
        console.log(score)
        res.status(201).json({score});
    }
    catch (err) {
        next(err);
    }
}

const getJobProfile = async (req, res, next) => {
    const { jobId } = req.params;
    try {
        const foundJob = await Job.findById(jobId).exec();
        if (!foundJob) return res.status(404).json({ 'message': 'Job info not found' });

        const foundCompany = await Company.findOne({ name: foundJob.companyName })
            .select('name industry size website mobile address overview')
            .exec();

        res.json({
            job: foundJob,
            company: foundCompany
        });
    }
    catch (err) {
        next(err);
    }
}

const getStudentProfile = async (req, res, next) => {
    const { studentId } = req.params;
    const { id } = req;
    try {
        const foundStudent = await Student.findById(studentId)
            .populate('personal')
            .populate('contact')
            .populate('academic')
            .populate('workExperiences')
            .populate('projects')
            .populate('certifications')
            .select('personal contact academic workExperiences projects certifications resume')
            .exec();
        if (!foundStudent) return res.status(404).json({ 'message': 'Student not found' });

        const foundJobs = await Job.find({ recruiter: id }).exec();
        if (!foundJobs) return res.status(400).json({ 'message': 'Jobs info not found' });

        const jobIds = foundJobs.map((job) => job._id.toString());
        const foundAppliedJobs = await AppliedJob.find({ userId: studentId, jobId: { $in: jobIds }, status: 'pending' })
            .populate('jobId')
            .exec();

        res.json({
            student: foundStudent,
            jobs: foundAppliedJobs
        });
    }
    catch (err) {
        next(err);
    }
}

const getApplications = async (req, res, next) => {
    const { id } = req;
    try {
        const foundRecruiter = await Recruiter.findById(id).populate('company').exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const foundJobs = await Job.find({ recruiter: id }).exec();
        if (!foundJobs) return res.status(400).json({ 'message': 'Jobs info not found' });

        const jobIds = foundJobs.map((job) => job._id.toString());

        const foundApplications = await AppliedJob.find({ jobId: { $in: jobIds }, status: 'pending' })
            .populate({
                path: 'userId',
                select: 'personal',
                populate: {
                    path: 'personal',
                    model: 'Personal',
                    select: 'fullName'
                },
            })
            .exec();

        const getStudentbasedApplications = (applications, user) => {
            const students = new Set();
            return applications.filter(application => {
                const userApplication = application[user]._id;
                if (!students.has(userApplication)) {
                    students.add(userApplication);
                    return true;
                }
                return false;
            });
        };

        const applications = getStudentbasedApplications(foundApplications, 'userId');

        res.json(applications);

    }
    catch (err) {
        next(err);
    }
}

const getRecruiter = async (req, res, next) => {
    const { id } = req;
    try {
        const foundRecruiter = await Recruiter.findById(id)
            .populate('recruiterDetail')
            .populate('company')
            .select('username company recruiterDetail')
            .exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        res.json(foundRecruiter);
    }
    catch (err) {
        next(err);
    }
}

const getProfile = async (req, res, next) => {
    const { id } = req;
    try {
        const foundRecruiter = await Recruiter.findById(id)
            .populate('company')
            .exec()

        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });
        if (!foundRecruiter.company) return res.status(404).json({ 'message': 'Company details not found' });

        res.json(foundRecruiter.company.logo);
    }
    catch (err) {
        next(err);
    }
}

const getNotifications = async (req, res, next) => {
    const { id } = req;
    try {
        const foundRecruiter = await Recruiter.findById(id).exec()

        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        res.json(foundRecruiter.notification);
    }
    catch (err) {
        next(err);
    }
}

const postNewJob = async (req, res, next) => {
    const { id } = req;
    const { jobRole, applicationFor, cgpa, description, experience, seats, package } = req.body;
    if (!jobRole || !cgpa || !description || !experience || !seats || !package) return res.status(400).json({ 'message': 'All fields required' });
    if (!applicationFor) applicationFor = 'Everyone';
    try {
        const foundRecruiter = await Recruiter.findById(id).populate('company').exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const query = await Job.create({
            companyName: foundRecruiter.company.name,
            jobRole,
            applicationFor,
            cgpa,
            description,
            experience,
            seats,
            package,
            collegeApproved: false,
            recruiter: id
        });

        const notificationQuery = await Student.updateMany({}, { $push: { notification: `${foundRecruiter.company.name} posted new job for role ${jobRole}` } }).exec();

        foundRecruiter.notification = [...foundRecruiter.notification, `Posted new job for role ${jobRole}`];
        await foundRecruiter.save();

        res.status(201).json({ 'success': 'Job created' });
    }
    catch (err) {
        next(err);
    }
}
const parseJD = async (req, res, next) => {
    const { id } = req;

    try {
        const foundRecruiter = await Recruiter.findById(id).populate('company').exec();
        if (!foundRecruiter) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Only pdf or docx under 2MB allowed'
            });
        }
        const filePath = req.file.path;

        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));

        const response = await axios.post(
            process.env.JOB_PARSER,
            formData,
            {
                headers: formData.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        // ✅ validate response
        if (!response?.data?.job_data) {
            return res.status(500).json({
                message: "Parser failed to return valid data"
            });
        }

        // ✅ delete file
        fs.unlinkSync(filePath);

        // ✅ clean response
        return res.status(200).json({
            success: true,
            job_data: response.data.job_data
        });
    } catch (err) {

        console.error("❌ ERROR:");

        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);

            return res.status(err.response.status).json({
                message: err.response.data?.error || "Parser service failed"
            });
        }

        console.error(err.message);

        return res.status(500).json({
            message: "Internal server error while parsing JD"
        });
    }
};

const postApplication = async (req, res, next) => {
    const { id } = req;
    const { applicationId, status } = req.body;
    try {
        const foundRecruiter = await Recruiter.findById(id).exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const foundApplication = await AppliedJob.findById(applicationId).populate('jobId').exec();
        if (!foundApplication) return res.status(400).json({ 'message': 'Application not found' });
        if (foundApplication.jobId.recruiter.toString() !== foundRecruiter._id.toString()) return res.status(401).json({ 'message': 'unauthorized' });

        const foundStudent = await Student.findById(foundApplication.userId).populate('contact').exec();
        if (!foundStudent) return res.status(400).json({ 'message': 'Student not found' });

        const email = foundStudent.contact.email;
        console.log(email);
        const mailOptions = {
            from: process.env.MAIL,
            to: email,
            subject: 'Job application status',
            html: `<p>Your job application for <b>${foundApplication.companyName}</b> is viewed and your application is <b>${status}</b></p>`
        };

        await transporter.sendMail(mailOptions);

        foundApplication.status = status;
        await foundApplication.save();

        foundStudent.notification = [...foundStudent.notification, `Application ${foundApplication.companyName} for role ${foundApplication.jobRole} is ${status}`];
        await foundStudent.save();

        res.json({ 'success': 'Application modified' });
    }
    catch (err) {
        next(err);
    }
}

const postCompany = async (req, res, next) => {
    const { id } = req;
    const { name, industry, size, website, address, mobile, overview } = req.body;
    if (!name || !industry || !size || !website || !address || !mobile || !overview) return res.status(400).json({ 'message': 'All fields required' });
    try {
        const foundRecruiter = await Recruiter.findById(id).exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const foundCompany = await Company.findOne({ recruiter: id }).exec();
        if (foundCompany) return res.status(400).json({ 'message': 'Company info already exists' });

        const query = await Company.create({
            name,
            industry,
            size,
            website,
            address,
            mobile,
            overview,
            recruiter: id
        });

        foundRecruiter.company = query._id;
        await foundRecruiter.save();

        res.status(201).json({ 'success': 'Company details added' });
    }
    catch (err) {
        next(err);
    }
}

const postProfile = async (req, res, next) => {
    const { id } = req;
    try {
        const foundCompany = await Company.findOne({ recruiter: id }).exec();
        if (!foundCompany) return res.status(400).json({ 'message': 'Company details missing' });

        if (!req.file) return res.status(400).json({ 'message': 'Only jpg, jpeg and png are allowed and should be less than 2 mb' });

        foundCompany.logo = req.file.buffer;
        await foundCompany.save();

        res.status(201).json({ 'success': 'Profile uploaded successfully' });
    }
    catch (err) {
        next(err);
    }
}

const postRecruiterDetails = async (req, res, next) => {
    const { id } = req;
    const { fullName, position, mobile, email, linkedIn } = req.body;
    if (!fullName || !position || !mobile || !email || !linkedIn) return res.status(400).json({ 'message': 'All fields required' });
    try {
        const foundRecruiter = await Recruiter.findById(id).exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const foundRecruiterDetail = await RecruiterDetail.findOne({ recruiter: id }).exec();
        if (foundRecruiterDetail) return res.status(400).json({ 'message': 'RecruiterDetail info already exists' });

        const query = await RecruiterDetail.create({
            fullName,
            position,
            mobile,
            email,
            linkedIn,
            recruiter: id
        });

        foundRecruiter.recruiterDetail = query._id;
        await foundRecruiter.save();

        res.status(201).json({ 'success': 'RecruiterDetail details added' });
    }
    catch (err) {
        next(err);
    }
}

const putCompany = async (req, res, next) => {
    const { id } = req;
    const { name, industry, size, website, address, mobile, overview } = req.body;
    if (!name || !industry || !size || !website || !address || !mobile || !overview) return res.status(400).json({ 'message': 'All fields required' });
    try {
        const foundRecruiter = await Recruiter.findById(id).exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const foundCompany = await Company.findOne({ recruiter: id }).exec();
        if (!foundCompany) return res.status(400).json({ 'message': 'Company details missing' });

        if (foundCompany._id.toString() !== foundRecruiter.company.toString()) return res.status(401).json({ 'message': 'unauthorized' });

        foundCompany.name = name;
        foundCompany.industry = industry;
        foundCompany.size = size;
        foundCompany.website = website;
        foundCompany.address = address;
        foundCompany.mobile = mobile;
        foundCompany.overview = overview;

        await foundCompany.save();

        res.status(201).json({ 'success': 'Company details updated' });
    }
    catch (err) {
        next(err);
    }
}

const putRecruiterDetails = async (req, res, next) => {
    const { id } = req;
    const { fullName, position, mobile, email, linkedIn } = req.body;
    if (!fullName || !position || !mobile || !email || !linkedIn) return res.status(400).json({ 'message': 'All fields required' });
    try {
        const foundRecruiter = await Recruiter.findById(id).exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const foundRecruiterDetail = await RecruiterDetail.findOne({ recruiter: id }).exec();
        if (!foundRecruiterDetail) return res.status(400).json({ 'message': 'RecruiterDetail details missing' });

        if (foundRecruiterDetail._id.toString() !== foundRecruiter.recruiterDetail.toString()) return res.status(401).json({ 'message': 'unauthorized' });

        foundRecruiterDetail.fullName = fullName;
        foundRecruiterDetail.position = position;
        foundRecruiterDetail.mobile = mobile;
        foundRecruiterDetail.email = email;
        foundRecruiterDetail.linkedIn = linkedIn;

        await foundRecruiterDetail.save();

        res.status(201).json({ 'success': 'RecruiterDetail details updated' });
    }
    catch (err) {
        next(err);
    }
}

const deleteJob = async (req, res, next) => {
    const { id } = req;
    const { jobId } = req.params;
    if (!jobId) return res.status(400).json({ 'message': 'All fields required' });
    try {
        const foundRecruiter = await Recruiter.findById(id).exec();
        if (!foundRecruiter) return res.status(401).json({ 'message': 'unauthorized' });

        const query = await Job.findByIdAndDelete(jobId).exec();

        res.json({ 'success': 'Job deleted' });
    }
    catch (err) {
        next(err);
    }
}

module.exports = {
    getDashboard,
    getColleges,
    parseJD,
    getJobs,
    capabilityCal,
    getJobProfile,
    getStudentProfile,
    getApplications,
    getRecruiter,
    getProfile,
    getNotifications,
    postNewJob,
    postApplication,
    postCompany,
    postProfile,
    postRecruiterDetails,
    putCompany,
    putRecruiterDetails,
    deleteJob
}
const Student = require('../models/student');
const Academic = require('../models/student/academic');
const Certification = require('../models/student/certification');
const Contact = require('../models/student/contact');
const Personal = require('../models/student/personal');
const Project = require('../models/student/project');
const Work = require('../models/student/workExp');
const Job = require('../models/job');
const AppliedJob = require('../models/student/appliedJob');
const Company = require('../models/recruiter/company');
const Recruiter = require('../models/recruiter');
const fs = require('fs');
const nodemailer = require('nodemailer');
const axios = require('axios');
// const FormData = require("form-data");
// const fetch = require('node-fetch');

const { spawn } = require('child_process');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD
    }
});

const getDashboard = async (req, res, next) => {
    const { user } = req;
    try {
        const foundStudent = await Student.findOne({ username: user }).populate('academic').select('jobsSelected jobsApplied jobsRejected profile username academic').exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundJobs = await Job.find({ applicationFor: { $in: ['Everyone', foundStudent.academic.currentEducation.college] }, collegeApproved: { $ne: false } }).exec()

        const dashboard = { ...foundStudent, openings: foundJobs.length, profile: foundStudent.profile };

        res.json(dashboard);
    }
    catch (err) {
        next(err);
    }
}

const getStudent = async (req, res, next) => {
    const { id } = req;
    try {
        const foundStudent = await Student.findById(id)
            .populate('personal')
            .populate('contact')
            .populate('academic')
            .populate('workExperiences')
            .populate('projects')
            .populate('certifications')
            .select('username personal contact academic workExperiences projects certifications resume profile')
            .exec();

        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        res.json(foundStudent);
    }
    catch (err) {
        next(err);
    }
}

const getJobs = async (req, res, next) => {
    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).populate('academic').exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundJobs = await Job.find({ applicationFor: { $in: ['Everyone', foundStudent.academic.currentEducation.college] }})
            .select('companyName jobRole package description')
            .exec();

        res.json(foundJobs);
    }
    catch (err) {
        next(err);
    }
}

const capabilityCal = async (req, res, next) => {
    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });
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



const getAppliedJobs = async (req, res, next) => {
    const { id } = req;
    try {
        const foundAppliedJobs = await AppliedJob.find({ userId: id }).exec();

        res.json(foundAppliedJobs);
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

const getProfile = async (req, res, next) => {
    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        res.json(foundStudent.profile);
    }
    catch (err) {
        next(err);
    }
}

const getNotifications = async (req, res, next) => {
    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        res.json(foundStudent.notification);
    }
    catch (err) {
        next(err);
    }
}

const postAppliedJob = async (req, res, next) => {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).populate('contact').exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const duplicateApplication = await AppliedJob.findOne({ userId: id, jobId }).exec();
        if (duplicateApplication) return res.status(401).json({ 'message': 'Application is already submitted' });

        const foundJob = await Job.findById(jobId).exec();
        if (!foundJob) return res.status(404).json({ 'message': 'Job details not found' });

        const foundCompany = await Company.findOne({ recruiter: foundJob.recruiter }).exec();
        if (!foundCompany) return res.status(400).json({ 'message': 'Company details not found' });

        const query = await AppliedJob.create({
            companyName: foundJob.companyName,
            jobRole: foundJob.jobRole,
            salary: foundJob.package,
            appliedOn: Date.now(),
            userId: id,
            jobId
        });

        const mailOptions = {
            from: process.env.MAIL,
            to: foundStudent.contact.email,
            subject: 'Job applied',
            html: `<p>Your job application for <b>${foundJob.companyName}</b> is <b>submitted</b></p>`
        };

        await transporter.sendMail(mailOptions);

        foundStudent.applied = [query._id, ...foundStudent.applied];
        foundStudent.notification = [...foundStudent.notification, `Applied for ${foundJob.companyName} successfully`];
        await foundStudent.save();

        const foundRecruiter = await Recruiter.findById(foundJob.recruiter).exec();
        foundRecruiter.notification = [...foundRecruiter.notification, `${foundStudent.username} applied for job ${foundJob.jobRole}`];
        await foundRecruiter.save();

        res.status(201).json({ 'success': 'Applied job successfully' });
    }
    catch (err) {
        next(err);
    }
}

const postAcademic = async (req, res, next) => {
    const { currentEducation, previousEducation, rollNo } = req.body;
    if (!currentEducation || !previousEducation || !rollNo) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundAcademic = await Academic.findOne({ userId: id }).exec();
        if (foundAcademic) return res.status(400).json({ 'message': 'Academic info already exists' });

        const query = await Academic.create({
            currentEducation,
            previousEducation,
            userId: id
        });

        foundStudent.academic = query._id;
        foundStudent.rollNo = rollNo;
        await foundStudent.save();

        res.status(201).json({ 'success': 'Academic info added' });
    }
    catch (err) {
        next(err);
    }
}

const postCertification = async (req, res, next) => {
    const { name, organization } = req.body;
    if (!name || !organization) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const query = await Certification.create({
            name,
            organization,
            userId: id
        });

        foundStudent.certifications = [query._id, ...foundStudent.certifications];
        await foundStudent.save();

        res.status(201).json({ 'success': 'Certification info added' });
    }
    catch (err) {
        next(err);
    }
}

const postContact = async (req, res, next) => {
    const { email, collegeEmail, mobile, currentAddress, permanentAddress } = req.body;
    if (!email || !collegeEmail || !mobile || !currentAddress || !permanentAddress) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundContact = await Contact.findOne({ userId: id }).exec();
        if (foundContact) return res.status(400).json({ 'message': 'Contact info already exists' });

        const duplicateUserMail = await Contact.find({ email }).exec();
        if (duplicateUserMail.length > 0) return res.status(409).json({ 'message': 'User already exist with that mail' });

        const duplicateUserMobile = await Contact.find({ mobile }).exec();
        if (duplicateUserMobile.length > 0) return res.status(409).json({ 'message': 'User already exist with that mobile number' });

        const query = await Contact.create({
            email,
            collegeEmail,
            mobile,
            currentAddress,
            permanentAddress,
            userId: id
        });

        foundStudent.contact = query._id;
        await foundStudent.save();

        res.status(201).json({ 'success': 'Contact info added' });
    }
    catch (err) {
        next(err);
    }
}

const postProfile = async (req, res, next) => {
    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        if (!req.file) return res.status(400).json({ 'message': 'Only jpg, jpeg and png are allowed and should be less than 2 mb' });

        foundStudent.profile = req.file.buffer;
        await foundStudent.save();

        res.status(201).json({ 'success': 'Profile uploaded successfully' });
    }
    catch (err) {
        next(err);
    }
}

const postResume = async (req, res, next) => {
    console.log("In post resume")
    const { id } = req;
    try {
        console.log("In post resume")
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        if (!req.file) return res.status(400).json({ 'message': 'Only pdf are allowed which are lessthan 2 mb' });

        foundStudent.resume = req.file.filename;
        await foundStudent.save();

        res.status(201).json({ 'success': 'Resume uploaded successfully' });
    }
    catch (err) {
        console.log("error in postresume")
        next(err);
    }
}

const parseJsonData = async (data) => {
    try {
        const parsedData = JSON.parse(data.toString());
        return parsedData

        // Process parsed data here

    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
};

const parseResume = async (req, res, next) => {
    const { id } = req;
  
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        if (!req.file) return res.status(400).json({ 'message': 'Only pdf or docx are allowed which are less than 2 mb' });
        // console.log(req)
        const resumeFile = req.file; // Access the buffer of the uploaded file
        const formData = new FormData();
        let buf = fs.readFileSync("/tmp/"+resumeFile.originalname);
        formData.append('resumenergpt', new Blob([buf], { type: resumeFile.mimetype }), resumeFile.originalname); // Append the blob with a filename
        const parsedOutput = await axios.post(process.env.RESUME_PARSER, formData).then((resp) => {
            console.log(resp.data);
            return resp.data;
        }).catch((e) => {
            console.log(e.data)
            next(e);
        })
        fs.unlinkSync("/tmp/"+resumeFile.originalname)
       
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Max-Age", "1800");
        res.setHeader("Access-Control-Allow-Headers", "content-type");
        res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
        res.status(201).json({ success: 'Resume processed successfully \nPlease fill out remaining fields', parsedOutput });

        
        // res.status(200).json({ success: 'Resume processed successfully' });

    }
    catch(err){
        next(err);
    }
}

const postPersonal = async (req, res, next) => {
    const { fullName, fatherName, motherName, dateOfBirth, gender } = req.body;
    if (!fullName || !fatherName || !motherName || !dateOfBirth || !gender) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundPersonal = await Personal.findOne({ userId: id }).exec();
        if (foundPersonal) return res.status(400).json({ 'message': 'Personal info already exists' });

        const query = await Personal.create({
            fullName,
            fatherName,
            motherName,
            dateOfBirth,
            gender,
            userId: id
        });

        foundStudent.personal = query._id;
        await foundStudent.save();

        res.status(201).json({ 'success': 'Personal info added' });
    }
    catch (err) {
        next(err);
    }
}

const postProject = async (req, res, next) => {
    const { name, startDate, endDate, description, associated } = req.body;
    if (!name || !startDate || !description || !associated) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        let query;
        if (!endDate) {
            query = await Project.create({
                name,
                startDate,
                description,
                associated,
                userId: id
            });
        } else {
            query = await Project.create({
                name,
                startDate,
                description,
                associated,
                endDate,
                currentlyWorking: false,
                userId: id
            });
        }

        foundStudent.projects = [query._id, ...foundStudent.projects];
        await foundStudent.save();

        res.status(201).json({ 'success': 'Projects info added' });
    }
    catch (err) {
        next(err);
    }
}

const postWork = async (req, res, next) => {
    const { organization, role, description, startDate, endDate } = req.body;
    if (!organization || !role || !description || !startDate || !endDate) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const query = await Work.create({
            organization,
            role,
            description,
            startDate,
            endDate,
            userId: id
        });

        foundStudent.workExperiences = [query._id, ...foundStudent.workExperiences];
        await foundStudent.save();

        res.status(201).json({ 'success': 'Work experience info added' });
    }
    catch (err) {
        next(err);
    }
}

const putAcademic = async (req, res, next) => {
    const { currentEducation, previousEducation, rollNo, academicId } = req.body;
    if (!currentEducation || !previousEducation || !rollNo || !academicId) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundAcademic = await Academic.findById(academicId).exec();
        if (!foundAcademic) return res.status(400).json({ 'message': 'Academic details not found' });

        if (foundAcademic._id.toString() !== foundStudent.academic.toString()) return res.status(401).json({ 'message': 'unauthorized' });

        foundAcademic.currentEducation = currentEducation;
        foundAcademic.previousEducation = previousEducation;
        foundStudent.rollNo = rollNo;
        await foundStudent.save();
        await foundAcademic.save();

        res.status(201).json({ 'success': 'Academic info updated' });
    }
    catch (err) {
        next(err);
    }
}

const putCertification = async (req, res, next) => {
    const { name, organization, certificationId } = req.body;
    if (!name || !organization || !certificationId) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundCertification = await Certification.findById(certificationId).exec();
        if (!foundCertification) return res.status(400).json({ 'message': 'Certification details not found' });

        if (!foundStudent.certifications.includes(certificationId)) return res.status(401).json({ 'message': 'unauthorized' });

        foundCertification.name = name;
        foundCertification.organization = organization;
        await foundCertification.save();

        res.status(201).json({ 'success': 'Certification info updated' });
    }
    catch (err) {
        next(err);
    }
}

const putContact = async (req, res, next) => {
    const { email, collegeEmail, mobile, currentAddress, permanentAddress, contactId } = req.body;
    if (!email || !collegeEmail || !mobile || !currentAddress || !permanentAddress || !contactId) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const duplicateUserMail = await Contact.find({ email }).exec();
        if (duplicateUserMail.length > 0 && duplicateUserMail.length !== 1) return res.status(409).json({ 'message': 'User already exist with that mail' });

        const duplicateUserMobile = await Contact.find({ mobile }).exec();
        if (duplicateUserMobile.length > 0 && duplicateUserMobile.length !== 1) return res.status(409).json({ 'message': 'User already exist with that mobile number' });

        const foundContact = await Contact.findById(contactId).exec();
        if (!foundContact) return res.status(400).json({ 'message': 'Contact details not found' });

        if (foundContact._id.toString() !== foundStudent.contact.toString()) return res.status(401).json({ 'message': 'unauthorized' });

        foundContact.currentAddress = currentAddress;
        foundContact.permanentAddress = permanentAddress;
        foundContact.collegeEmail = collegeEmail;

        if (foundContact.email !== email) {
            foundContact.email = email;
            foundContact.emailVerified = false;
        }

        if (foundContact.mobile !== mobile) {
            foundContact.mobile = mobile;
            foundContact.mobileVerified = false;
        }

        await foundContact.save();

        res.status(201).json({ 'success': 'Contact info updated' });
    }
    catch (err) {
        next(err);
    }
}

const putResume = async (req, res, next) => {
    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        if (!req.file) return res.status(400).json({ 'message': 'Only pdf are allowed which are lessthan 2 mb' });

        const prevResume = foundStudent.resume;
        const filePath = `/tmp/${prevResume}`
        console.log(filePath)
        if (fs.existsSync(filePath)) {
            await fs.unlink(filePath, (err) => {
                if (err) throw err;
                console.log(`Previous resume ${prevResume} deleted successfully`);
            });
        }

        foundStudent.resume = req.file.filename;
        await foundStudent.save();

        res.status(201).json({ 'success': 'Resume uploaded successfully' });
    }
    catch (err) {
        next(err);
    }
}

const putPersonal = async (req, res, next) => {
    const { fullName, fatherName, motherName, dateOfBirth, gender, personalId } = req.body;
    if (!fullName || !fatherName || !motherName || !dateOfBirth || !gender || !personalId) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundPersonal = await Personal.findById(personalId).exec();
        if (!foundPersonal) return res.status(400).json({ 'message': 'Personal details not found' });

        if (foundPersonal._id.toString() !== foundStudent.personal.toString()) return res.status(401).json({ 'message': 'unauthorized' });

        foundPersonal.fullName = fullName;
        foundPersonal.fatherName = fatherName;
        foundPersonal.motherName = motherName;
        foundPersonal.dateOfBirth = dateOfBirth;
        foundPersonal.gender = gender;

        await foundPersonal.save();

        res.status(201).json({ 'success': 'Personal info updated' });
    }
    catch (err) {
        next(err);
    }
}

const putProject = async (req, res, next) => {
    const { name, startDate, endDate, currentlyWorking, description, associated, projectId } = req.body;
    if (!name || !startDate || !description || !associated || !projectId) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundProject = await Project.findById(projectId).exec();
        if (!foundProject) return res.status(400).json({ 'message': 'Project details not found' });

        if (!foundStudent.projects.includes(projectId)) return res.status(401).json({ 'message': 'unauthorized' });

        if (!endDate) {
            foundProject.name = name;
            foundProject.startDate = startDate;
            foundProject.description = description;
            foundProject.associated = associated;
            foundProject.endDate = '';
            foundProject.currentlyWorking = true;
            await foundProject.save();

        } else {
            foundProject.name = name;
            foundProject.startDate = startDate;
            foundProject.description = description;
            foundProject.associated = associated;
            foundProject.endDate = endDate;
            foundProject.currentlyWorking = false;
            await foundProject.save();
        }

        res.status(201).json({ 'success': 'Projects info updated' });
    }
    catch (err) {
        next(err);
    }
}

const putWork = async (req, res, next) => {
    const { organization, role, description, startDate, endDate, workId } = req.body;
    if (!organization || !role || !description || !startDate || !endDate || !workId) return res.status(400).json({ 'message': 'All fields required' });

    const { id } = req;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundWork = await Work.findById(workId).exec();
        if (!foundWork) return res.status(400).json({ 'message': 'Work details not found' });

        if (!foundStudent.workExperiences.includes(workId)) return res.status(401).json({ 'message': 'unauthorized' });

        foundWork.organization = organization;
        foundWork.role = role;
        foundWork.description = description;
        foundWork.startDate = startDate;
        foundWork.endDate = endDate;

        await foundWork.save();

        res.status(201).json({ 'success': 'Work experience info updated' });
    }
    catch (err) {
        next(err);
    }
}

const deleteCertification = async (req, res, next) => {
    const { id } = req;
    const { cId } = req.params;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundCertification = await Certification.findById(cId).exec();
        if (!foundCertification) return res.status(400).json({ 'message': 'Certification details not found' });

        if (!foundStudent.certifications.includes(cId)) return res.status(401).json({ 'message': 'unauthorized' });

        await Certification.findByIdAndDelete(cId).exec();
        const certifications = foundStudent.certifications;
        foundStudent.certifications = certifications.filter(certId => certId !== cId);
        await foundStudent.save();

        res.json({ 'success': 'Certification info deleted' });
    }
    catch (err) {
        next(err);
    }
}

const deleteProject = async (req, res, next) => {
    const { id } = req;
    const { pId } = req.params;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundProject = await Project.findById(pId).exec();
        if (!foundProject) return res.status(400).json({ 'message': 'Project details not found' });

        if (!foundStudent.projects.includes(pId)) return res.status(401).json({ 'message': 'unauthorized' });

        await Project.findByIdAndDelete(pId).exec();
        const projects = foundStudent.projects;
        foundStudent.projects = projects.filter(projId => projId !== pId);
        await foundStudent.save();

        res.json({ 'success': 'Project info deleted' });
    }
    catch (err) {
        next(err);
    }
}

const deleteWork = async (req, res, next) => {
    const { id } = req;
    const { wId } = req.params;
    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'unauthorized' });

        const foundWork = await Work.findById(wId).exec();
        if (!foundWork) return res.status(400).json({ 'message': 'Work details not found' });

        if (!foundStudent.workExperiences.includes(wId)) return res.status(401).json({ 'message': 'unauthorized' });

        await Work.findByIdAndDelete(wId).exec();
        const works = foundStudent.workExperiences;
        foundStudent.workExperiences = works.filter(workId => workId !== wId);
        await foundStudent.save();

        res.json({ 'success': 'Work info deleted' });
    }
    catch (err) {
        next(err);
    }
}

module.exports = {
    getDashboard,
    getJobs,
    capabilityCal,
    getAppliedJobs,
    postAppliedJob,
    getStudent,
    getJobProfile,
    getProfile,
    getNotifications,
    postAcademic,
    postCertification,
    postContact,
    postProfile,
    postResume,
    parseResume,
    postPersonal,
    postProject,
    postWork,
    putAcademic,
    putCertification,
    putContact,
    putResume,
    putPersonal,
    putProject,
    putWork,
    deleteCertification,
    deleteProject,
    deleteWork
};
const Student = require('../models/student');
const Academic = require('../models/student/academic');
const Certification = require('../models/student/certification');
const Contact = require('../models/student/contact');
const Personal = require('../models/student/personal');
const Project = require('../models/student/project');
const Work = require('../models/student/workExp');
const Job = require('../models/job');
const AppliedJob = require('../models/student/appliedJob.js');
const Company = require('../models/recruiter/company');
const Recruiter = require('../models/recruiter');
const fs = require('fs');
const nodemailer = require('nodemailer');
const axios = require('axios');
const FormData = require("form-data");
// const fetch = require('node-fetch');

const { spawn } = require('child_process');

const generateApplicationId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

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
        const foundStudent = await Student.findOne({ username: user })
        .populate('academic')
        .populate('personal')
        .select('jobsSelected jobsApplied jobsRejected profile username academic personal')
        .lean();

        if (!foundStudent) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // ✅ safe access (avoid crash if academic missing)
        const college = foundStudent?.academic?.currentEducation?.college;

        const foundJobs = await Job.find({
            applicationFor: { $in: ['Everyone', college] },
            collegeApproved: true
        }).lean();

        const dashboard = {
            ...foundStudent,
            openings: foundJobs.length
        };

        res.json(dashboard);

    } catch (err) {
        next(err);
    }
};

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
            .select('username personal contact academic workExperiences projects certifications resume profile rollNo skills interests')
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
        const foundStudent = await Student.findById(id)
            .populate('academic')
            .exec();

        if (!foundStudent)
            return res.status(401).json({ message: 'unauthorized' });

        const appliedJobs = await AppliedJob.find({ userId: id })
            .select('jobId')
            .lean();

        const appliedJobIds = appliedJobs.map(a => a.jobId.toString());

        const foundJobs = await Job.find({
            applicationFor: {
                $in: ['Everyone', foundStudent.academic.currentEducation.college]
            },
            collegeApproved: true,
            _id: { $nin: appliedJobIds } 
        })
        .select(`
            companyName
            jobTitle
            jobDescription
            salaryRange
            experienceRequired
            numberOfOpenings
            skills
            location
            employmentType
            role
            responsibilities
            eligibleBatch
        `)
        .exec();

        res.json(foundJobs);

    } catch (err) {
        next(err);
    }
};

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
        const foundAppliedJobs = await AppliedJob.find({ userId: id })
            .sort({ createdAt: -1 }) // 🔥 latest first
            .populate({
                path: 'jobId',
                select: `
                    jobTitle
                    companyName
                    jobDescription
                    location
                    salaryRange
                    skills
                    responsibilities
                    experienceRequired
                    employmentType
                `
            })
            .lean();

        const response = foundAppliedJobs.map(app => ({
            _id: app._id,
            applicationId: app.applicationId,
            companyName: app.companyName,
            jobTitle: app.jobTitle,
            salary: app.salary,
            status: app.status,
            appliedOn: app.appliedOn,

            // ✅ For card display
            location: app.jobId?.location,
            salaryRange: app.jobId?.salaryRange,

            // 🔥 FULL JOB OBJECT FOR MODAL
            job: app.jobId
        }));

        res.json(response);

    } catch (err) {
        next(err);
    }
};

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

    if (!jobId)
        return res.status(400).json({ message: 'Job ID is required' });

    const { id } = req;

    try {
        const foundStudent = await Student.findById(id)
            .populate('contact')
            .exec();

        if (!foundStudent)
            return res.status(401).json({ message: 'unauthorized' });

        const duplicateApplication = await AppliedJob.findOne({
            userId: id,
            jobId
        }).exec();

        if (duplicateApplication)
            return res.status(409).json({ message: 'Application already submitted' });

        const foundJob = await Job.findById(jobId).exec();
        if (!foundJob)
            return res.status(404).json({ message: 'Job not found' });

        const foundCompany = await Company.findOne({
            recruiter: foundJob.recruiter
        }).exec();

        if (!foundCompany)
            return res.status(400).json({ message: 'Company not found' });

        const applicationId = `APP${Date.now()}`;

        const application = await AppliedJob.create({
            companyName: foundJob.companyName,
            jobTitle: foundJob.jobTitle || foundJob.jobRole,
            salary: foundJob.salaryRange || foundJob.package,

            applicationId, 

            appliedOn: new Date(),
            userId: id,
            jobId
        });

        const mailOptions = {
            from: process.env.MAIL,
            to: foundStudent.contact.email,
            subject: 'Job Application Submitted',
            html: `
                <p>
                    Your application for 
                    <b>${foundJob.jobTitle || foundJob.jobRole}</b> 
                    at <b>${foundJob.companyName}</b> has been submitted successfully.
                </p>
                <p><b>Application ID:</b> ${applicationId}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        foundStudent.applied = [application._id, ...foundStudent.applied];

        foundStudent.notification = [
            ...foundStudent.notification,
            `Applied for ${foundJob.jobTitle || foundJob.jobRole} at ${foundJob.companyName}`
        ];

        await foundStudent.save();

        const foundRecruiter = await Recruiter.findById(foundJob.recruiter).exec();

        if (foundRecruiter) {
            foundRecruiter.notification = [
                ...foundRecruiter.notification,
                `${foundStudent.username} applied for ${foundJob.jobTitle || foundJob.jobRole}`
            ];

            await foundRecruiter.save();
        }

        res.status(201).json({
            success: 'Applied job successfully',
            applicationId 
        });

    } catch (err) {
        next(err);
    }
};

const postAcademic = async (req, res, next) => {
    const { currentEducation, previousEducation, rollNo, collegeId } = req.body;

    if (!currentEducation || !previousEducation || !rollNo) {
        return res.status(400).json({ message: 'All fields required' });
    }

    const { id } = req;

    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) {
            return res.status(401).json({ message: 'unauthorized' });
        }

        const foundAcademic = await Academic.findOne({ userId: id }).exec();
        if (foundAcademic) {
            return res.status(400).json({ message: 'Academic info already exists' });
        }

        const query = await Academic.create({
            currentEducation,
            previousEducation,
            userId: id,
            collegeId
        });

        foundStudent.academic = query._id;
        foundStudent.rollNo = rollNo;

        if (collegeId) {
            foundStudent.college = collegeId;
        }

        await foundStudent.save();

        res.status(201).json({ success: 'Academic info added' });

    } catch (err) {
        next(err);
    }
};
const postSkills = async (req, res, next) => {
    const { skills, interests } = req.body;
    const { id } = req;

    try {
        const student = await Student.findById(id).exec();
        if (!student) {
            return res.status(401).json({ message: 'unauthorized' });
        }

        if (!Array.isArray(skills) || !Array.isArray(interests)) {
            return res.status(400).json({ message: 'Skills & interests must be arrays' });
        }

        student.skills = [...new Set(skills.map(s => s.trim()))];
        student.interests = [...new Set(interests.map(i => i.trim()))];

        await student.save();

        res.status(201).json({ success: 'Skills updated successfully' });

    } catch (err) {
        next(err);
    }
};
const putSkills = async (req, res, next) => {
    const { skills, interests } = req.body;
    const { id } = req;

    try {
        const student = await Student.findById(id).exec();
        if (!student) {
            return res.status(401).json({ message: 'unauthorized' });
        }

        if (Array.isArray(skills)) {
            student.skills = [...new Set(skills.map(s => s.trim()))];
        }

        if (Array.isArray(interests)) {
            student.interests = [...new Set(interests.map(i => i.trim()))];
        }

        await student.save();

        res.json({ success: 'Skills updated' });

    } catch (err) {
        next(err);
    }
};
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
        if (!foundStudent) {
            return res.status(401).json({ message: "unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Only pdf or docx under 2MB allowed"
            });
        }

        const filePath = req.file.path;

        console.log("📤 Sending file to Flask...");
        console.log("URL:", process.env.RESUME_PARSER);

        const formData = new FormData();

        formData.append("file", fs.createReadStream(filePath));

        const response = await axios.post(
            process.env.RESUME_PARSER, // e.g. http://localhost:5000/parse_resume
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        fs.unlinkSync(filePath);

        return res.status(201).json({
            success: "Resume processed successfully. Please fill remaining fields",
            parsedOutput: response.data
        });

    } catch (err) {
        console.error("❌ ERROR:", err.response?.data || err.message);
        next(err);
    }
};

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
            fullName: fullName,
            fatherName: fatherName,
            motherName: motherName || fatherName,
            dateOfBirth: dateOfBirth || null,
            gender: gender || null,
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
    let { name, startDate, endDate, description, associated, githubLink, liveLink } = req.body;

    // ✅ Required validation
    if (!name || !startDate || !description || !associated) {
        return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Allowed associated values
    const allowed = ["self", "college", "work"];
    if (!allowed.includes(associated)) {
        return res.status(400).json({ message: "Invalid associated type" });
    }

    // ✅ Normalize "Present"
    let currentlyWorking = false;

    if (endDate === "Present") {
        currentlyWorking = true;
        endDate = null;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ message: "End date cannot be before start date" });
    }

    if (githubLink && !githubLink.startsWith("http")) {
        githubLink = "https://" + githubLink;
    }

    if (liveLink && !liveLink.startsWith("http")) {
        liveLink = "https://" + liveLink;
    }

    const { id } = req;

    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) {
            return res.status(401).json({ message: "unauthorized" });
        }

        const projectData = {
            name,
            startDate,
            description,
            associated,
            githubLink: githubLink || null,
            liveLink: liveLink || null,
            currentlyWorking,
            userId: id,
        };

        if (!currentlyWorking && endDate) {
            projectData.endDate = endDate;
        }

        const query = await Project.create(projectData);

        foundStudent.projects = [query._id, ...foundStudent.projects];
        await foundStudent.save();

        res.status(201).json({ success: "Project info added" });

    } catch (err) {
        next(err);
    }
};

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
  let { name, startDate, endDate, description, associated, githubLink, liveLink, pId } = req.body;

  if (!name || !startDate || !description || !associated || !pId) {
    return res.status(400).json({ message: "All fields required" });
  }

  const allowed = ["self", "college", "work"];
  if (!allowed.includes(associated)) {
    return res.status(400).json({ message: "Invalid associated type" });
  }

  if (githubLink && !githubLink.startsWith("http")) {
    githubLink = "https://" + githubLink;
  }

  if (liveLink && !liveLink.startsWith("http")) {
    liveLink = "https://" + liveLink;
  }

  let currentlyWorking = false;
  if (!endDate) {
    currentlyWorking = true;
  }

  try {
    const project = await Project.findById(pId).exec();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = name;
    project.description = description;
    project.startDate = startDate;
    project.associated = associated;
    project.githubLink = githubLink || null;
    project.liveLink = liveLink || null;
    project.currentlyWorking = currentlyWorking;

    if (!currentlyWorking && endDate) {
      project.endDate = endDate;
    } else {
      project.endDate = null;
    }

    await project.save();

    res.json({ success: "Project updated successfully" });

  } catch (err) {
    next(err);
  }
};

const putWork = async (req, res, next) => {
    const { organization, role, description, startDate, endDate, wId } = req.body;

    console.log("PUT WORK BODY:", req.body); // 🔥 debug

    if (!organization || !role || !description || !startDate || !wId) {
        return res.status(400).json({ message: "All fields required" });
    }

    const { id } = req;

    try {
        const foundStudent = await Student.findById(id).exec();
        if (!foundStudent) {
            return res.status(401).json({ message: "unauthorized" });
        }

        const foundWork = await Work.findById(wId).exec();
        if (!foundWork) {
            return res.status(400).json({ message: "Work details not found" });
        }

        if (!foundStudent.workExperiences.includes(wId)) {
            return res.status(401).json({ message: "unauthorized" });
        }

        // ✅ Update fields
        foundWork.organization = organization;
        foundWork.role = role;
        foundWork.description = description;
        foundWork.startDate = startDate;

        if (endDate) {
            foundWork.endDate = endDate;
            foundWork.currentlyWorking = false;
        } else {
            foundWork.endDate = null;
            foundWork.currentlyWorking = true;
        }

        await foundWork.save();

        res.json({ success: "Work experience updated" });

    } catch (err) {
        next(err);
    }
};
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
    deleteWork,
    putSkills,
    postSkills,
};
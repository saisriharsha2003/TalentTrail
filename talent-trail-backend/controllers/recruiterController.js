const Job = require("../models/job");
const RecruiterDetail = require("../models/recruiter/recruiterDetails");
const Company = require("../models/recruiter/company");
const Recruiter = require("../models/recruiter");
const AppliedJob = require("../models/student/appliedJob");
const Student = require("../models/student");
const College = require("../models/college");
const nodemailer = require("nodemailer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASSWORD,
  },
});

const getDashboard = async (req, res, next) => {
  const { id } = req;
  try {
    const foundRecruiter = await Recruiter.findById(id)
      .populate("company recruiterDetail")
      .exec();
    if (!foundRecruiter.company)
      return res.status(401).json({ message: "Details missing" });
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const foundPostedJobs = await Job.find({ recruiter: id }).exec();
    const recruiterJobs = await Job.find({ recruiter: id }).select("_id");

    const jobIds = recruiterJobs.map((j) => j._id);

    const foundSelectedApplicants = await AppliedJob.find({
      jobId: { $in: jobIds },
      status: "selected",
    }).exec();

    const foundRejectedApplicants = await AppliedJob.find({
      jobId: { $in: jobIds },
      status: "rejected",
    }).exec();

    const foundApplicants = await AppliedJob.find({
      jobId: { $in: jobIds },
    }).exec();
    const response = {
      posted: foundPostedJobs.length,
      selected: foundSelectedApplicants.length,
      rejected: foundRejectedApplicants.length,
      applicants: foundApplicants.length,
      username: foundRecruiter.username,
      profile: foundRecruiter.company.logo
        ? foundRecruiter.company.logo.toString("base64")
        : null,
      name: foundRecruiter.recruiterDetail.fullName,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
};

const getColleges = async (req, res, next) => {
  try {
    const foundColleges = await College.find({}).populate("institution").exec();
    const colleges = foundColleges
      .map((c) => c.institution?.name)
      .filter((c) => c);

    res.json(colleges);
  } catch (err) {
    next(err);
  }
};

const getJobs = async (req, res, next) => {
  const recruiterId = req.user?.id || req.id;
  try {
    const foundRecruiter = await Recruiter.findById(recruiterId).exec();
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const foundPostedJobs = await Job.find({ recruiter: recruiterId }).exec();
    res.json(foundPostedJobs); // ✅ return jobs array
  } catch (err) {
    next(err);
  }
};

const capabilityCal = async (req, res, next) => {
  const { id } = req;
  try {
    const foundRecruiter = await Recruiter.findById(id).exec();
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const { sent1, sent2 } = req.body;
    const formData = new FormData();
    formData.append("sent1", sent1);
    formData.append("sent2", sent2);
    const score = await axios
      .post(
        "https://supreme-trout-6qxqw59xxgxh5wqw-5080.app.github.dev/compute_score",
        formData,
      )
      .then((resp) => {
        // console.log(resp.data);
        return resp.data;
      })
      .catch((e) => {
        console.log(e.data);
        next(e);
      });
    console.log(score);
    res.status(201).json({ score });
  } catch (err) {
    next(err);
  }
};

const getJobProfile = async (req, res, next) => {
  const { jobId } = req.params;
  try {
    const foundJob = await Job.findById(jobId).exec();
    if (!foundJob)
      return res.status(404).json({ message: "Job info not found" });

    const foundCompany = await Company.findOne({ name: foundJob.companyName })
      .select("name industry size website mobile address overview")
      .exec();

    res.json({
      job: foundJob,
      company: foundCompany,
    });
  } catch (err) {
    next(err);
  }
};

const getStudentProfile = async (req, res, next) => {
  const { studentId } = req.params;
  const { id } = req; // recruiter id

  try {
    const foundStudent = await Student.findById(studentId)
      .populate("personal")
      .populate("contact")
      .populate("academic")
      .populate("workExperiences")
      .populate("projects")
      .populate("certifications")
      .populate("college")
      .select(
        "personal contact academic workExperiences rollNo projects certifications resume jobsApplied jobsSelected jobsRejected college profile",
      )
      .exec();

    if (!foundStudent)
      return res.status(404).json({ message: "Student not found" });

    const recruiterJobs = await Job.find({ recruiter: id }).select("_id");
    const jobIds = recruiterJobs.map((j) => j._id);

    const applications = await AppliedJob.find({
      userId: studentId,
      jobId: { $in: jobIds },
    })
      .populate({
        path: "jobId",
        select: "jobTitle companyName location employmentType salaryRange",
      })
      .sort({ createdAt: -1 }) // latest first
      .exec();

    res.json({
      student: foundStudent,
      applications: applications,
    });
  } catch (err) {
    next(err);
  }
};

const getApplications = async (req, res, next) => {
  const { id } = req;

  try {
    const foundRecruiter = await Recruiter.findById(id)
      .populate("company")
      .exec();

    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const foundJobs = await Job.find({ recruiter: id }).exec();

    if (!foundJobs || foundJobs.length === 0) return res.json([]); // no jobs = no applications

    const jobIds = foundJobs.map((job) => job._id);

    // ✅ REMOVE status filter (IMPORTANT)
    const foundApplications = await AppliedJob.find({
      jobId: { $in: jobIds },
    })
      .populate({
        path: "userId",
        select: "personal",
        populate: {
          path: "personal",
          model: "Personal",
          select: "fullName",
        },
      })
      .sort({ createdAt: -1 }) // latest first (nice UX)
      .exec();

    res.json(foundApplications);
  } catch (err) {
    next(err);
  }
};
const getRecruiter = async (req, res, next) => {
  const { id } = req;
  try {
    const foundRecruiter = await Recruiter.findById(id)
      .populate("recruiterDetail")
      .populate("company")
      .select("username company recruiterDetail")
      .exec();
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    res.json(foundRecruiter);
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  const { id } = req;
  try {
    const foundRecruiter = await Recruiter.findById(id)
      .populate("company")
      .exec();

    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });
    if (!foundRecruiter.company)
      return res.status(404).json({ message: "Company details not found" });

    res.json(foundRecruiter.company.logo);
  } catch (err) {
    next(err);
  }
};

const getNotifications = async (req, res, next) => {
  const { id } = req;
  try {
    const foundRecruiter = await Recruiter.findById(id).exec();

    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    res.json(foundRecruiter.notification);
  } catch (err) {
    next(err);
  }
};

const postNewJob = async (req, res, next) => {
  const recruiterId = req.user?.id || req.id;

  let {
    jobTitle,
    applicationFor,
    jobDescription,
    experienceRequired,
    numberOfOpenings,
    salaryRange,
    location,
    workType,
    employmentType,
    role,
    responsibilities,
    skills,
    eligibleBatch,
    jobCategory,
    department,
  } = req.body;

  if (
    !jobTitle ||
    !jobDescription ||
    !experienceRequired ||
    !numberOfOpenings ||
    !salaryRange
  ) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  if (!applicationFor) applicationFor = "Everyone";

  try {
    const foundRecruiter = await Recruiter.findById(recruiterId)
      .populate("company")
      .exec();

    if (!foundRecruiter) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const cleanedSkills = (skills || []).map((s) => s.trim()).filter(Boolean);

    const normalizedSkills = cleanedSkills.map((s) => s.toLowerCase());

    await Job.create({
      companyName: foundRecruiter.company.name,
      jobTitle,
      applicationFor,
      jobDescription,
      experienceRequired,
      numberOfOpenings: Number(numberOfOpenings),
      salaryRange,
      location,
      workType: workType || null,
      employmentType: employmentType || null,

      role,
      responsibilities,

      skills: [...new Set(cleanedSkills)],
      skillsNormalized: [...new Set(normalizedSkills)],

      eligibleBatch,
      jobCategory,
      department,

      collegeApproved: false,
      recruiter: recruiterId,
    });

    await Student.updateMany(
      {},
      {
        $push: {
          notification: `${foundRecruiter.company.name} posted new job for role ${jobTitle}`,
        },
      },
    ).exec();

    foundRecruiter.notification = [
      ...(foundRecruiter.notification || []),
      `Posted new job for role ${jobTitle}`,
    ];

    await foundRecruiter.save();

    res.status(201).json({ success: "Job created" });
  } catch (err) {
    next(err);
  }
};

const parseJD = async (req, res, next) => {
  const { id } = req;
  let filePath;

  try {
    const foundRecruiter = await Recruiter.findById(id)
      .populate("company")
      .exec();

    if (!foundRecruiter) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({
        message:
          "File upload failed. Only PDF, DOC, DOCX, TXT under 2MB allowed",
      });
    }

    filePath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(process.env.JOB_PARSER, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!response?.data?.job_data) {
      return res.status(500).json({
        message: "Parser failed to return valid data",
      });
    }

    return res.status(200).json({
      success: true,
      job_data: response.data.job_data,
    });

  } catch (err) {
    console.error("❌ parseJD ERROR:", err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data?.error || "Parser service failed",
      });
    }

    return res.status(500).json({
      message: "Internal server error while parsing JD",
    });

  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};
const postApplication = async (req, res, next) => {
  console.log("Request body:", req.body);
  const { applicationId, status } = req.body;
  const allowedStatuses = ["pending", "selected", "rejected"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const recruiterId = req.id; // adjust based on your auth middleware

  try {
    const foundRecruiter = await Recruiter.findById(recruiterId).exec();
    if (!foundRecruiter) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const foundApplication = await AppliedJob.findById(applicationId)
      .populate("jobId")
      .exec();
    if (!foundApplication) {
      return res.status(400).json({ message: "Application not found" });
    }

    if (
      foundApplication.jobId.recruiter.toString() !==
      foundRecruiter._id.toString()
    ) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const foundStudent = await Student.findById(foundApplication.userId)
      .populate("contact")
      .exec();
    if (!foundStudent) {
      return res.status(400).json({ message: "Student not found" });
    }

    const email = foundStudent.contact?.email;
    if (email) {
      const mailOptions = {
        from: process.env.MAIL,
        to: email,
        subject: "Job application status",
        html: `<p>Your job application for <b>${foundApplication.jobId.companyName}</b> is updated. Status: <b>${status}</b></p>`,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error("Mail error:", mailErr);
      }
    }

    foundApplication.status = status;
    await foundApplication.save();

    foundStudent.notification = [
      ...(foundStudent.notification || []),
      `Application for ${foundApplication.jobId.jobTitle} at ${foundApplication.jobId.companyName} is ${status}`,
    ];
    await foundStudent.save();

    res.json({ success: "Application modified" });
  } catch (err) {
    next(err);
  }
};

const postCompany = async (req, res, next) => {
  const { id } = req;
  const { name, industry, size, website, address, mobile, overview } = req.body;
  if (
    !name ||
    !industry ||
    !size ||
    !website ||
    !address ||
    !mobile ||
    !overview
  )
    return res.status(400).json({ message: "All fields required" });
  try {
    const foundRecruiter = await Recruiter.findById(id).exec();
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const foundCompany = await Company.findOne({ recruiter: id }).exec();
    if (foundCompany)
      return res.status(400).json({ message: "Company info already exists" });

    const query = await Company.create({
      name,
      industry,
      size,
      website,
      address,
      mobile,
      overview,
      recruiter: id,
    });

    foundRecruiter.company = query._id;
    await foundRecruiter.save();

    res.status(201).json({ success: "Company details added" });
  } catch (err) {
    next(err);
  }
};

const postProfile = async (req, res, next) => {
  const { id } = req;
  try {
    const foundCompany = await Company.findOne({ recruiter: id }).exec();
    if (!foundCompany)
      return res.status(400).json({ message: "Company details missing" });

    if (!req.file)
      return res.status(400).json({
        message:
          "Only jpg, jpeg and png are allowed and should be less than 2 mb",
      });

    foundCompany.logo = req.file.buffer;
    await foundCompany.save();

    res.status(201).json({ success: "Profile uploaded successfully" });
  } catch (err) {
    next(err);
  }
};

const postRecruiterDetails = async (req, res, next) => {
  const { id } = req;
  const { fullName, position, mobile, email, linkedIn } = req.body;
  if (!fullName || !position || !mobile || !email || !linkedIn)
    return res.status(400).json({ message: "All fields required" });
  try {
    const foundRecruiter = await Recruiter.findById(id).exec();
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const foundRecruiterDetail = await RecruiterDetail.findOne({
      recruiter: id,
    }).exec();
    if (foundRecruiterDetail)
      return res
        .status(400)
        .json({ message: "RecruiterDetail info already exists" });

    const query = await RecruiterDetail.create({
      fullName,
      position,
      mobile,
      email,
      linkedIn,
      recruiter: id,
    });

    foundRecruiter.recruiterDetail = query._id;
    await foundRecruiter.save();

    res.status(201).json({ success: "RecruiterDetail details added" });
  } catch (err) {
    next(err);
  }
};

const putCompany = async (req, res, next) => {
  const { id } = req;
  const { name, industry, size, website, address, mobile, overview } = req.body;
  if (
    !name ||
    !industry ||
    !size ||
    !website ||
    !address ||
    !mobile ||
    !overview
  )
    return res.status(400).json({ message: "All fields required" });
  try {
    const foundRecruiter = await Recruiter.findById(id).exec();
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const foundCompany = await Company.findOne({ recruiter: id }).exec();
    if (!foundCompany)
      return res.status(400).json({ message: "Company details missing" });

    if (foundCompany._id.toString() !== foundRecruiter.company.toString())
      return res.status(401).json({ message: "unauthorized" });

    foundCompany.name = name;
    foundCompany.industry = industry;
    foundCompany.size = size;
    foundCompany.website = website;
    foundCompany.address = address;
    foundCompany.mobile = mobile;
    foundCompany.overview = overview;

    await foundCompany.save();

    res.status(201).json({ success: "Company details updated" });
  } catch (err) {
    next(err);
  }
};

const putRecruiterDetails = async (req, res, next) => {
  const { id } = req;
  const { fullName, position, mobile, email, linkedIn } = req.body;
  if (!fullName || !position || !mobile || !email || !linkedIn)
    return res.status(400).json({ message: "All fields required" });
  try {
    const foundRecruiter = await Recruiter.findById(id).exec();
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const foundRecruiterDetail = await RecruiterDetail.findOne({
      recruiter: id,
    }).exec();
    if (!foundRecruiterDetail)
      return res
        .status(400)
        .json({ message: "RecruiterDetail details missing" });

    if (
      foundRecruiterDetail._id.toString() !==
      foundRecruiter.recruiterDetail.toString()
    )
      return res.status(401).json({ message: "unauthorized" });

    foundRecruiterDetail.fullName = fullName;
    foundRecruiterDetail.position = position;
    foundRecruiterDetail.mobile = mobile;
    foundRecruiterDetail.email = email;
    foundRecruiterDetail.linkedIn = linkedIn;

    await foundRecruiterDetail.save();

    res.status(201).json({ success: "RecruiterDetail details updated" });
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  const { id } = req;
  const { jobId } = req.params;
  if (!jobId) return res.status(400).json({ message: "All fields required" });
  try {
    const foundRecruiter = await Recruiter.findById(id).exec();
    if (!foundRecruiter)
      return res.status(401).json({ message: "unauthorized" });

    const job = await Job.findById(jobId);

    if (!job || job.recruiter.toString() !== id)
      return res.status(401).json({ message: "unauthorized" });

    await job.deleteOne();

    res.json({ success: "Job deleted" });
  } catch (err) {
    next(err);
  }
};

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
  deleteJob,
};

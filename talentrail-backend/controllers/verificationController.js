const Contact = require('../models/student/contact');
const MailOTP = require('../models/mailOTP');
const MobileOTP = require('../models/mobileOTP');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD
    }
});

const OTPMailCreation = async (email, id) => {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
        from: process.env.MAIL,
        to: email,
        subject: 'Verify your email',
        html: `<p>Enter this otp <b>${otp}</b> to verify your email address</p>
            <p>This code expires in <b>10 min</b>`
    };

    await transporter.sendMail(mailOptions);

    const hashedOTP = await bcrypt.hash(String.toString(otp), 10);
    const newMailOTP = await MailOTP.create({
        userId: id,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000
    });
}

const sendOTPMail = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ 'message': 'email is required' });

    const { id, role } = req;
    const User = require('../models/' + role);
    const foundUser = await User.findById(id).exec();
    if (!foundUser) return res.status(401).json({ 'message': 'unauthorized' });

    try {
        await OTPMailCreation(email, id);

        const foundContact = await Contact.findOne({ userId: id }).exec();
        if (!foundContact) return res.status(400).json({ 'message': 'No contact info available please provide it first' });

        foundContact.email = email;
        await foundContact.save();

        res.status(202).json({ 'success': 'Verification mail sent' });
    }
    catch (err) {
        next(err);
    }
}

const verifyOTPMail = async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ 'message': 'OTP is requried' });

    const { id, role } = req;
    const User = require('../models/' + role);
    const foundUser = await User.findById(id).exec();
    if (!foundUser) return res.status(401).json({ 'message': 'unauthorized' });

    try {
        const foundMailOTP = await MailOTP.findOne({ userId: id }).exec();
        if (!foundMailOTP) return res.status(400).json({ 'message': 'Account record does not exist, please verify again' });

        const { expiresAt } = foundMailOTP;
        const hashedOTP = foundMailOTP.otp;
        if (expiresAt < Date.now()) {
            await MailOTP.deleteMany({ userId: id }).exec();
            return res.status(400).json({ 'message': 'Code has expired, please request again' });
        }

        const validOTP = await bcrypt.compare(String.toString(otp), hashedOTP);
        if (!validOTP) return res.status(400).json({ 'message': 'Invalid OTP' });

        const foundContact = await Contact.findOne({ userId: id }).exec();
        if (!foundContact) return res.status(400).json({ 'message': 'No contact info available please provide it first' });

        foundContact.emailVerified = true;
        await foundContact.save();
        await MailOTP.deleteMany({ userId: id }).exec();

        res.json({ 'success': 'Mail verified successfully' });
    }
    catch (err) {
        next(err);
    }
}

const resendOTPMail = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ 'message': 'email is required' });

    const { id, role } = req;
    const User = require('../models/' + role);
    const foundUser = await User.findById(id).exec();
    if (!foundUser) return res.status(401).json({ 'message': 'unauthorized' });

    try {
        await MailOTP.deleteMany({ userId: id }).exec();

        OTPMailCreation(email, id);

        res.status(202).json({ 'success': 'Verification mail re-sent' });
    }
    catch (err) {
        next(err);
    }
}

const OTPMobileCreation = async (mobile, id) => {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const message = `${otp} is your otp for mobile number verification for Talent Trail India`;

    try {
        const response = await fetch(
            `https://www.fast2sms.com/dev/bulkSMS?authorization=${process.env.FAST2SMS_API_KEY}&sender_id=TALNTRL&message=${encodeURIComponent(message)}&language=english&route=p&numbers=${mobile}`
        );
        const data = await response.json();
        if (data.return === false) {
            throw new Error('Fast2SMS API Error: ' + data.message);
        }
    } catch (err) {
        console.error('SMS Send Error:', err);
        throw err;
    }

    const hashedOTP = await bcrypt.hash(String.toString(otp), 10);
    const newMobileOTP = await MobileOTP.create({
        userId: id,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000
    });
}

const sendOTPMobile = async (req, res, next) => {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ 'message': 'mobile number is required' });

    const { id, role } = req;
    const User = require('../models/' + role);
    const foundUser = await User.findById(id).exec();
    if (!foundUser) return res.status(401).json({ 'message': 'unauthorized' });

    try {
        await OTPMobileCreation(mobile, id);

        const foundContact = await Contact.findOne({ userId: id }).exec();
        if (!foundContact) return res.status(400).json({ 'message': 'No contact info available please provide it first' });

        foundContact.mobile = Number(mobile.slice(3,));
        await foundContact.save();

        res.status(202).json({ 'success': 'Verification otp sent' });
    }
    catch (err) {
        next(err);
    }
}

const verifyOTPMobile = async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ 'message': 'OTP is requried' });

    const { id, role } = req;
    const User = require('../models/' + role);
    const foundUser = await User.findById(id).exec();
    if (!foundUser) return res.status(401).json({ 'message': 'unauthorized' });

    try {
        const foundMobileOTP = await MobileOTP.findOne({ userId: id }).exec();
        if (!foundMobileOTP) return res.status(400).json({ 'message': 'Account record does not exist, please verify again' });

        const { expiresAt } = foundMobileOTP;
        const hashedOTP = foundMobileOTP.otp;
        if (expiresAt < Date.now()) {
            await MobileOTP.deleteMany({ userId: id }).exec();
            return res.status(400).json({ 'message': 'Code has expired, please request again' });
        }

        const validOTP = await bcrypt.compare(String.toString(otp), hashedOTP);
        if (!validOTP) return res.status(400).json({ 'message': 'Invalid OTP' });

        const foundContact = await Contact.findOne({ userId: id }).exec();
        if (!foundContact) return res.status(400).json({ 'message': 'No contact info available please provide it first' });

        foundContact.mobileVerified = true;
        await foundContact.save();
        await MobileOTP.deleteMany({ userId: id }).exec();

        res.json({ 'success': 'Mobile verified successfully' });
    }
    catch (err) {
        next(err);
    }
}

const resendOTPMobile = async (req, res, next) => {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ 'message': 'mobile number is required' });

    const { id, role } = req;
    const User = require('../models/' + role);
    const foundUser = await User.findById(id).exec();
    if (!foundUser) return res.status(401).json({ 'message': 'unauthorized' });

    try {
        await MobileOTP.deleteMany({ userId: id }).exec();

        OTPMobileCreation(mobile, id);

        res.status(202).json({ 'success': 'Verification otp re-sent' });
    }
    catch (err) {
        next(err);
    }
}

module.exports = {
    sendOTPMail,
    verifyOTPMail,
    resendOTPMail,
    sendOTPMobile,
    verifyOTPMobile,
    resendOTPMobile
}
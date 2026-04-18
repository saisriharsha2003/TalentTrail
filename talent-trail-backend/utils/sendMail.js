const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD
    }
});

const sendOTP = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Password Reset OTP",
        html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 10 minutes</p>`
    });
};

module.exports = sendOTP;
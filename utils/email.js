const nodemailer = require('nodemailer');

const sendMail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: 'Shah Ruk Khan <srk@example.com>', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
        // html: '<b>Hello world?</b>' // html body (if needed)
    };

    // 3. Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;

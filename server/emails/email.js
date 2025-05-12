const nodemailer = require("nodemailer");

const generateRegisterHTML = (id) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Email</title>
</head>
<body>
  <div style="text-align: center; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
    <img src="https://www.hikepack.io/images/logo-black.png" alt="Hikepack Logo" style="max-width: 100px; margin-bottom: 13px; margin-top: 13px;">
    

    <h2 style="font-size: 22px; font-family: Arial, sans-serif; font-weight: 500; color: #292929; margin-bottom: 16px;">
      Verify your email
    </h2>
    
    <p style="color: #7a7a7a; font-size: 14px; font-family: Arial, sans-serif; font-weight: 400; margin-bottom: 24px;">
      In order to use your Hike Pack account, you need to confirm your email address.
    </p>
    
    <a href="${process.env.EMAIL_URL}/verify-account/${id}" style="text-decoration: none;">
      <button style="
        padding: 15px 50px;
        background-color: #058373;
        color: #ffffff;
        font-size: 16px;
        font-family: Arial, sans-serif;
        font-weight: 400;
        border: none;
        border-radius: 10px;
        cursor: pointer;
      " onmouseover="this.style.backgroundColor='#017565';" onmouseout="this.style.backgroundColor='#058373';">
        Verify email
      </button>
    </a>
    
    <!-- Small Text -->
    <span style="color: #7a7a7a; font-size: 12px; font-family: Arial, sans-serif; font-weight: 400; display: block; margin-top: 24px;">
      If you did not sign up for this account, you can ignore this email, and the account will be deleted.
    </span>
  </div>
</body>
</html>
  `;
};

const generateForgotPasswordHTML = (token) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password</title>
</head>
<body>
  <div style="text-align: center; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
    <img src="https://www.hikepack.io/images/logo-black.png" alt="Hikepack Logo" style="max-width: 100px; margin-bottom: 13px; margin-top: 13px;">
    
    <h2 style="font-size: 22px; font-family: Arial, sans-serif; font-weight: 500; color: #292929; margin-bottom: 16px;">
      Forgotten your password?
    </h2>
    
    <p style="color: #7a7a7a; font-size: 14px; font-family: Arial, sans-serif; font-weight: 400; margin-bottom: 24px;">
      We're sending you this email because you requested a password reset. Click on this link to create a new password:
    </p>
    
    <a href="${process.env.EMAIL_URL}/new-password/${token}" style="text-decoration: none;">
      <button style="
        padding: 15px 50px;
        background-color: #058373;
        color: #ffffff;
        font-size: 16px;
        font-family: Arial, sans-serif;
        font-weight: 400;
        border: none;
        border-radius: 10px;
        cursor: pointer;
      " onmouseover="this.style.backgroundColor='#017565';" onmouseout="this.style.backgroundColor='#058373';">
        Set a new password
      </button>
    </a>
    
    <span style="color: #7a7a7a; font-size: 12px; font-family: Arial, sans-serif; font-weight: 400; display: block; margin-top: 24px;">
      If you did not request a password reset, you can ignore this email. Your password will not be changed.
    </span>
  </div>
</body>
</html>
  `;
};

const reportEmail = (title, content, user) => {
  return `
      <div style="text-align: center; height: 500px;">
        <h2 style="font-weight: 500; color: black";>${title}</h2>
        <hr class="solid" style="width: 50%; border: 1px solid #ededed;">
        <p style="color: gray; font-size: 15px;">${content}</p>
        <hr class="solid" style="margin-bottom: 15px; width: 75px; border: 1px solid #ededed;">
        <span style="color: gray; font-size: 12px;">${user.username} - ${user.email}</span>
      </div>
    `;
};

const sendEmail = async (recipientEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    return { success: false, message: "Failed to send email" };
  }
};

const sendReportEmail = async (recipientEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      }, 
    });

    const mailOptions = {
      from: recipientEmail,
      to: process.env.EMAIL,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    return { success: false, message: "Failed to send email" };
  }
};

module.exports = {
  generateRegisterHTML,
  generateForgotPasswordHTML,
  reportEmail,
  sendEmail,
  sendReportEmail,
};

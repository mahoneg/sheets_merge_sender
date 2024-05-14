const nodemailer = require("nodemailer");

const transporter = require("./keys/emailTransporter");

const fromEmailAddr = "mahoneg1@gmail.com";
const hohoFromEmailAddr = "hohosecretary@gmail.com";

function send_email(sendMsg, toEmail) {
  const toAndHoho = toEmail + ", " + hohoFromEmailAddr;
  const mailOptions = {
    from: fromEmailAddr,
    to: toAndHoho,
    subject: "HoHoKus St Barts Celebration",
    text: sendMsg,
  };

  transporter.sendMail(mailOptions);
}

module.exports = { send_email };

const nodeMailer = require('nodemailer');

const html = `
    <h1>Hello World</h1>
    <p> Wow it is great</p>
`;

async function main() {
    const emailAddr = 'mahoneg1\@gmail.com';
    console.log(emailAddr);

    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: emailAddr,
            pass: 'lkujvvnoqdhpeole'
        }
    });

    const mailOptions = {
        from: emailAddr,
        to: emailAddr,
        subject: 'Wow this is easy??',
        text: 'Happy Anniversary'
    };

    transporter.sendMail(mailOptions);
}


main();
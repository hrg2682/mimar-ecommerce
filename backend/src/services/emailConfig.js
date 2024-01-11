import nodemailer from 'nodemailer';

const PASSWORD = process.env.EMAIL_PASSWORD;

const send365Email = async (from, to, subject, html, text) => {
    try { 
        const transportOptions = {
            host: 'smtp.office365.com',
            port: '587',
            auth: { user: from, pass: PASSWORD },
            secureConnection: true,
            tls: { ciphers: 'SSLv3' }
        };

        const mailTransport = nodemailer.createTransport(transportOptions);

        await mailTransport.sendMail({
            from,
            to,
            replyTo: from,
            subject,
            html,
            text
        });
    } catch (err) { 
        console.error(`send365Email: An error occurred:`, err);
    }
}

const sendGmail = async (from, to, subject, text) => {
    
    const transportOptions = {
        service: 'gmail',
        auth: {
            user: 'imrankhakwani@gmail.com',
            pass: process.env.EMAIL_PASSWORD,
        },
    };

    const mailTransport = nodemailer.createTransport(transportOptions);

    await mailTransport.sendMail({
        from,
        to,
        replyTo: from,
        subject,
        text
    })
    .then((info) => {
        console.log('Message sent: %s', info.messageId);
    })
    .catch(err => {
        console.error('Message failed to send: %s', err);
    });

}

//send365Email("from@example.com", "to@example.com", "Subject", "<i>Hello World</i>", "Hello World");
//sendGmail("imrankhakwani@gmail.com", "imrankhakwani@gmail.com", "Subject", "<h1>Hello World</h1>");

export { send365Email, sendGmail }
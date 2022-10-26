const scheduler = require('node-schedule');
const nodemailer = require('nodemailer');

module.exports = class Email {
    constructor(destinatary, subject, message) {
        this.destinatary = destinatary;
        this.subject = subject;
        this.message = message;
    }

    send() {
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: 'bruno.sdoukos@outlook.com',
                pass: 'mariobros2'
            }
        });
        
        transporter.sendMail({
            from: 'Clearway Task App <bruno.sdoukos@outlook.com>',
            to: this.destinatary.email,
            subject: this.subject,
            text: `Hello, ${this.destinatary.name}!\n\n${this.message}\n\nBest regards,\n\nClearway Task App`

        }, (err) => {
            if (err) {
                throw new Error(err.message);
            }
        });
    }

    schedule(date) {
        scheduler.scheduleJob(date, () => {
            email.send();
        });
    }
}
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';



export const sendMail = async (to: string, subject: string, text:string) => {
    try {

        const smtpConfig: SMTPTransport.Options = {
            host: process.env.SMTP_HOST!,
            port: parseInt(process.env.SMTP_PORT!),
            secure: false,
            auth: {
                user: process.env.SMTP_USERNAME!,
                pass: process.env.SMTP_PASSWORD!,
            }
            
        }

        const transporter = nodemailer.createTransport(smtpConfig);


        const info = await transporter.sendMail({
            from: "The Diddier",
            to,
            subject,
            text,
            
        })

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
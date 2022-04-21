import config from "../../../config/auth"
import sgMail from "@sendgrid/mail"

// SMS based OTP
// import client from "twilio"
import client from "twilio";
//Config
const accountSid = config.twilio.sid;
const authToken = config.twilio.token;
const phone = config.twilio.phone;

export async function sendSMS(body, to) {
    return client(accountSid, authToken).messages.create({
        body: body, // SMS text
        from: phone,
        to: to
    });
};

//Sendgrid config
sgMail.setApiKey(config.sendgrid.apiKey);

//Email based OTP
export async function sendEmail(subject, text, to) {
    const msg = {
        to: to,
        from: "test@example.com",
        subject,
        text
    }

    return sgMail.send(msg);
};
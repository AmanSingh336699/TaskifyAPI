import nodemailer from "nodemailer"
import { EMAIL_VERIFICATION } from "../emailTemplate/sendVerification.js"
import { PASSWORD_RESET_EMAIL } from "../emailTemplate/passwordResetEmail.js"
import { WELCOME_EMAIL } from "../emailTemplate/sendWelcomeEmail.js"
import { SEND_TODO_REMINDER_EMAIL } from "../emailTemplate/todoReminderEmail.js"

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendVerificationEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: "Verify your Email Address",
            html: EMAIL_VERIFICATION(otp)
        }
        await transporter.sendMail(mailOptions)
        return true
    } catch (error) {
        console.error("Error sending verification email", error.message)
        return false
    }
}

export const sendPasswordResetEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_EMAIL(otp)
        }
        await transporter.sendMail(mailOptions)
        return true
    } catch (error) {
        console.error(`Error sending password reset email: ${error.message}`);
        return false;
    }
}

export const sendWelcomeEmail = async (name, email) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Welcome to Our Platform!",
            html: WELCOME_EMAIL(name)
        }
        await transporter.sendMail(mailOptions)
        return true
    } catch (error) {
        console.error(`Error sending welcome email: ${error.message}`);
        return false;
    }
}

export const sendTodoReminderEmail = async (name, email, todo) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Reminder: Your Todo "${todo.title}" is Due Soon!`,
            html: SEND_TODO_REMINDER_EMAIL(name, todo)
        }
        await transporter.sendMail(mailOptions)
        return true
    } catch (error) {
        console.error(`Error sending todo reminder email: ${error.message}`);
        return false;
    }
}

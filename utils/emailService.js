const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        this.templates = this.loadTemplates();
    }

    loadTemplates() {
        const templatesDir = path.join(__dirname, 'email-templates');
        const templates = {};
        
        if (fs.existsSync(templatesDir)) {
            const files = fs.readdirSync(templatesDir);
            
            files.forEach(file => {
                if (file.endsWith('.html')) {
                    const templateName = path.basename(file, '.html');
                    const templatePath = path.join(templatesDir, file);
                    const templateContent = fs.readFileSync(templatePath, 'utf8');
                    templates[templateName] = handlebars.compile(templateContent);
                }
            });
        }
        
        return templates;
    }

    async sendEmail(to, subject, templateName, data) {
        try {
            const html = this.templates[templateName](data);
            
            const mailOptions = {
                from: `"Resume Builder" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            };
            
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email sending error:', error);
            return false;
        }
    }

    // Specific email methods
    async sendWelcomeEmail(user) {
        return this.sendEmail(
            user.email,
            'Welcome to Resume Builder!',
            'welcome',
            { name: user.name }
        );
    }

    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        return this.sendEmail(
            user.email,
            'Reset Your Password',
            'password-reset',
            { name: user.name, resetUrl }
        );
    }

    async sendVerificationEmail(user, verificationToken) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        
        return this.sendEmail(
            user.email,
            'Verify Your Email',
            'email-verification',
            { name: user.name, verificationUrl }
        );
    }

    async sendSubscriptionConfirmation(user, plan) {
        return this.sendEmail(
            user.email,
            'Subscription Confirmed',
            'subscription-confirmation',
            { 
                name: user.name, 
                plan: plan.name,
                amount: plan.amount,
                nextBillingDate: plan.nextBillingDate
            }
        );
    }

    async sendDownloadConfirmation(user, resume, downloadUrl) {
        return this.sendEmail(
            user.email,
            'Your Resume is Ready!',
            'download-confirmation',
            {
                name: user.name,
                resumeTitle: resume.title,
                downloadUrl,
                date: new Date().toLocaleDateString()
            }
        );
    }
}

module.exports = new EmailService();
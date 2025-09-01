import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configure email transporter
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('Email configured for:', process.env.EMAIL_USER);
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    console.warn('Email credentials not configured. EMAIL_USER:', !!process.env.EMAIL_USER, 'EMAIL_PASS:', !!process.env.EMAIL_PASS);
}

// Alternative: SendGrid configuration (uncomment to use)
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, passwordHash });

        const token = jwt.sign(
            { id: user._id, email, name }, // include name in token payload
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, user: { id: user._id, email, name } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword)
            return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: { id: user._id, email, name: user.name },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        // Always return success message for security (don't reveal if email exists)
        if (!user) {
            return res.status(200).json({
                message:
                    'If an account with that email exists, we have sent a password reset link.',
            });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Send email if transporter is configured
        if (!transporter) {
            console.error('Email not configured - password reset token generated but email not sent');
            return res.status(200).json({ 
                message: 'If an account with that email exists, we have sent a password reset link.' 
            });
        }

        const resetUrl = `${
            process.env.FRONTEND_URL || 'http://localhost:8080'
        }/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Memora - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4ade80;">Reset Your Memora Password</h2>
                    <p>You requested a password reset for your Memora journal account.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #4ade80; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
                    <p>This link will expire in 15 minutes for security reasons.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <p>Best regards,<br>The Memora Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message:
                'If an account with that email exists, we have sent a password reset link.',
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({
            message: 'An error occurred. Please try again later.',
        });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: 'Password reset token is invalid or has expired.',
            });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update user password and clear reset token
        user.passwordHash = passwordHash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password has been reset successfully.',
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            message: 'An error occurred. Please try again later.',
        });
    }
};

export const verifyResetToken = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: 'Password reset token is invalid or has expired.',
            });
        }

        res.status(200).json({ message: 'Token is valid.' });
    } catch (err) {
        console.error('Verify token error:', err);
        res.status(500).json({
            message: 'An error occurred. Please try again later.',
        });
    }
};

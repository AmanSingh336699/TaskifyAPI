import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "../email/email.js";
import { generateOTP, storeOTP, verifyOTP } from "../helper/helper.js";
import User from "../models/user.model.js";
import { successResponse, errorResponse, createdResponse } from '../utils/responseUtils.js';
import { deleteRefreshToken, generateAccessToken, generateRefreshToken, setToken, storeRefreshToken } from "../utils/tokenUtils.js"

export const registerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return errorResponse(res, 'All fields required', 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 'User already exists', 400);
        }

        const user = await User.create({ name, email, password });

        const otp = generateOTP();
        await storeOTP(email, otp);
        try {
            await sendVerificationEmail(email, otp)
        } catch (error) {
            await User.findByIdAndDelete(user._id)
            return errorResponse(res, 'Failed to send verification email', 500);
        }

        const responseData = {
            userId: user._id,
            name: user.name,
            email: user.email,
        };

        return createdResponse(res, 'Registration successful. Please verify your email', responseData);
    } catch (error) {
        return errorResponse(res, `Registration failed: ${error.message}`, 500);
    }
};


export const verifyEmailController = async (req, res) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp) {
            return errorResponse(res, "Provide email and otp", 400)
        }
        const user = await User.findOne({ email })
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }
        const isValid = await verifyOTP(email, otp)
        if (!isValid) {
            return errorResponse(res, 'Invalid or expired OTP', 400);
        }
        user.isVerified = true
        await user.save()
        try {
            await sendWelcomeEmail(user.name, user.email);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }
        return successResponse(res, "Email verified successfully", 200, {
            userId: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
        })
    } catch (error) {
        return errorResponse(res, 'Email verification failed', 500);
    }
}

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return errorResponse(res, 'Provide email and password', 400);
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return errorResponse(res, 'Invalid email or password', 401);
        }
        if (!user.isVerified) {
            return errorResponse(res, 'Please verify your email first', 400);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return errorResponse(res, 'Invalid email or password', 401);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        await storeRefreshToken(user._id, refreshToken);

        const tokens = setToken(res, accessToken, refreshToken);

        const responseData = {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            },
            ...tokens,
        };

        return successResponse(res, 'Login successful', 200, responseData);
    } catch (error) {
        return errorResponse(res, `Login failed: ${error.message}`, 500);
    }
};


export const refreshTokenController = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return errorResponse(res, 'Unauthorized: User not authenticated', 401);
        }
        const accessToken = generateAccessToken(req.user._id);
        return successResponse(res, 'Token refreshed successfully', 200, { accessToken });
    } catch (error) {
        return errorResponse(res, `Token refresh failed: ${error.message}`, 500);
    }
}

export const logoutController = async (req, res) => {
    try {
        await deleteRefreshToken(req.user._id)
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        })
        return successResponse(res, 'Logged out successfully', 200, null);
    } catch (error) {
        return errorResponse(res, 'Logout failed', 500);
    }
}

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return errorResponse(res, 'Provide email', 400);
        }
        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const otp = generateOTP();
        await storeOTP(email, otp);
        await sendPasswordResetEmail(email, otp);
        return successResponse(res, 'Password reset OTP sent to your email', 200, null);
    } catch (error) {
        return errorResponse(res, 'Failed to send password reset OTP', 500);
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const { email, otp, password } = req.body
        if (!email || !otp || !password) {
            return errorResponse(res, 'Provide email, OTP, and new password', 400);
        }
        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }
        const isValid = await verifyOTP(email, otp);
        if (!isValid) {
            return errorResponse(res, 'Invalid or expired OTP', 400);
        }
        user.password = password;
        await user.save();

        await deleteRefreshToken(user._id);

        return successResponse(res, 'Password reset successful. Please login with your new password', 200, null);
    } catch (error) {
        return errorResponse(res, 'Password reset failed', 500);
    }
}

export const getCurrentUserController = async (req, res) => {
    try {
        return successResponse(res, 'User retrieved successfully', 200, {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isVerified: req.user.isVerified,
            role: req.user.role,
        });
    } catch (error) {
        return errorResponse(res, 'Failed to retrieve user', 500);
    }
}
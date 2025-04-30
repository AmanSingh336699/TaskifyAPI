export const PASSWORD_RESET_EMAIL = (otp) => {
  return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #ffffff; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #F59E0B;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">You requested to reset your password. Use the OTP below:</p>
          <div style="background: #FFFBEB; color: #92400E; padding: 20px; font-size: 28px; font-weight: bold; text-align: center; border-radius: 8px; letter-spacing: 2px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #777;">This OTP will expire in 5 minutes.</p>
          <p style="color: #999;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `
}
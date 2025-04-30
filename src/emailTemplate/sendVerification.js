export const EMAIL_VERIFICATION = (otp) => {
  return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #ffffff; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #4F46E5;">Email Verification</h2>
          <p style="font-size: 16px; color: #555;">Hi there,</p>
          <p style="font-size: 16px; color: #555;">Use the following OTP to verify your email address:</p>
          <div style="background: #EEF2FF; color: #3730A3; padding: 20px; font-size: 28px; font-weight: bold; text-align: center; border-radius: 8px; letter-spacing: 2px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #777;">This OTP will expire in 5 minutes.</p>
          <p style="color: #999;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `
}
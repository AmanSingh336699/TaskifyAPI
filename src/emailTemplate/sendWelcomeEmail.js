export const WELCOME_EMAIL = (name) => {
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #ffffff; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: #10B981;">Welcome, ${name}!</h2>
        <p style="font-size: 16px; color: #555;">We are excited to have you join us! Get ready to explore and enjoy our platform.</p>
        <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || '#'}" style="background: linear-gradient(to right, #4F46E5, #6366F1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold;">Get Started</a>
        </div>
        <p style="font-size: 14px; color: #777;">If you have any questions, feel free to contact our support team.</p>
    </div>
`
}
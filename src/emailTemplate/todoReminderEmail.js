export const SEND_TODO_REMINDER_EMAIL = (name, todo) => {
  return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #ffffff; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #3B82F6;">Todo Reminder</h2>
          <p style="font-size: 16px; color: #555;">Hey ${name},</p>
          <p style="font-size: 16px; color: #555;">Here's a reminder for your upcoming todo:</p>
          <div style="background: #EFF6FF; padding: 20px; border-left: 4px solid #3B82F6; margin: 20px 0; border-radius: 6px;">
            <p><strong>Title:</strong> ${todo.title}</p>
            <p><strong>Description:</strong> ${todo.description || 'No description available'}</p>
            <p><strong>Priority:</strong> ${todo.priority}</p>
            <p><strong>Due Date:</strong> ${new Date(todo.dueDate).toLocaleString()}</p>
          </div>
          <p style="font-size: 14px; color: #777;">Please complete it before the due date!</p>
        </div>
      `
}
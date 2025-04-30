const parseTimeToSeconds = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') {
    console.warn('parseTimeToSeconds: Invalid or missing timeStr, using default 7d (604800 seconds)');
    return 604800; // Default to 7 days in seconds
  }

  const regex = /^(\d+)([smhd])$/;
  const match = timeStr.match(regex);

  if (!match) {
    throw new Error('Invalid time format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      throw new Error('Invalid time unit');
  }
};

export default parseTimeToSeconds;
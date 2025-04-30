export const successResponse = (res, message, statusCode = 200, data = null) => {
    if (!res) throw new Error('Response object (res) is required.');
    if (!Number.isInteger(statusCode)) {
        throw new Error(`Invalid status code: ${statusCode}. Status code must be an integer.`);
    }
    return res.status(statusCode).json({
        status: 'success',
        message,
        code: statusCode,
        data,
    });
};

export const errorResponse = (res, message, statusCode = 400, data = {}) => {
    if (!res) throw new Error('Response object (res) is required.');
    if (!Number.isInteger(statusCode)) {
        throw new Error(`Invalid status code: ${statusCode}. Status code must be an integer.`);
    }
    return res.status(statusCode).json({
        status: 'error',
        message,
        code: statusCode,
        data,
    });
};

export const createdResponse = (res, message, data = {}) => {
    if (!res) throw new Error('Response object (res) is required.');
    return res.status(201).json({
        status: 'success',
        message,
        code: 201,
        data,
    });
};

export const noContentResponse = (res) => {
    if (!res) throw new Error('Response object (res) is required.');
    return res.status(204).end();
};
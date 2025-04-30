import Joi from 'joi';
import { errorResponse } from '../utils/responseUtils.js';

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((d) => d.message).join(', ');
      return errorResponse(res, errorMessage, 400);
    }

    req.body = value
    next();
  };
};

export const validateRegister = validateRequest(
  Joi.object({
    name: Joi.string().min(2).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  })
);

export const validateLogin = validateRequest(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
);

export const validateVerifyOTP = validateRequest(
  Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  })
);

export const validateForgotPassword = validateRequest(
  Joi.object({
    email: Joi.string().email().required(),
  })
);

export const validateResetPassword = validateRequest(
  Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    password: Joi.string().min(8).required(),
  })
);

export const validateCreateTodo = validateRequest(
  Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    dueDate: Joi.date(),
    tags: Joi.array().items(Joi.string()),
  })
);

export const validateUpdateTodo = validateRequest(
  Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().max(500),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    dueDate: Joi.date(),
    tags: Joi.array().items(Joi.string()),
  })
);

export const validateCreatePost = validateRequest(
  Joi.object({
    title: Joi.string().min(3).max(200).required().messages({
      'string.base': 'Title should be a string.',
      'string.min': 'Title should be at least 3 characters long.',
      'string.max': 'Title should not exceed 200 characters.',
      'any.required': 'Title is required.'
    }),
    content: Joi.string().required().messages({
      'string.base': 'Content should be a string.',
      'any.required': 'Content is required.'
    }),
  })
);

export const validateUpdatePost = validateRequest(
  Joi.object({
    title: Joi.string()
      .min(3)
      .max(200)
      .optional()
      .messages({
        'string.base': 'Title should be a string.',
        'string.min': 'Title should be at least 3 characters long.',
        'string.max': 'Title should not exceed 200 characters.'
      }),
    
    content: Joi.string()
      .optional()
      .messages({
        'string.base': 'Content should be a string.'
      }),
  })
);


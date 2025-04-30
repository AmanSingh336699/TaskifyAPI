import User from '../models/user.model.js';
import Todo from '../models/todo.model.js';
import redisClient from '../config/redis.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export const getUsersController = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('name email role isVerified createdAt'),
            User.estimatedDocumentCount(),
        ]);

        const responseData = {
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
        return successResponse(res, 'Users retrieved successfully', 200, responseData);
    } catch (error) {
        return errorResponse(res, `Failed to fetch users: ${error.message}`, 500);
    }
};

export const deleteUserController = async (req, res) => {
    try {
        const { id: userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        await Promise.all([
            User.findByIdAndDelete(userId),
            Todo.deleteMany({ userId }),
            redisClient.del(`refresh_token:${userId}`).catch(() => { }),
        ]);

        return successResponse(res, 'User and related data deleted successfully', 200, null);
    } catch (error) {
        return errorResponse(res, `Failed to delete user: ${error.message}`, 500);
    }
};

export const updateUserController = async (req, res) => {
    try {
        const { id: userId } = req.params;
        const { role, isVerified } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        if (role !== undefined) {
            if (!['user', 'admin'].includes(role)) {
                return errorResponse(res, 'Invalid role: must be user or admin', 400);
            }
            user.role = role;
        }

        if (typeof isVerified === 'boolean') {
            user.isVerified = isVerified;
        }

        await user.save();

        const responseData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        };
        return successResponse(res, 'User updated successfully', 200, responseData);
    } catch (error) {
        return errorResponse(res, `Failed to update user: ${error.message}`, 500);
    }
};

export const getAnalyticsController = async (req, res) => {
    try {
        const [userAnalytics] = await User.aggregate([
            {
                $facet: {
                    userStats: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                verified: {
                                    $sum: {
                                        $cond: [{ $eq: ['$isVerified', true] }, 1, 0],
                                    },
                                },
                                admins: {
                                    $sum: {
                                        $cond: [{ $eq: ['$role', 'admin'] }, 1, 0],
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                total: 1,
                                verified: 1,
                                notVerified: { $subtract: ['$total', '$verified'] },
                                admins: 1,
                                regularUsers: { $subtract: ['$total', '$admins'] },
                            },
                        },
                    ],
                },
            },
        ]);

        const todoStats = await Todo.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const todoCount = todoStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        let redisUsedMemory = 'N/A';
        try {
            const redisInfoRaw = await redisClient.info('memory');
            redisUsedMemory = redisInfoRaw.match(/used_memory_human:(.+)/)?.[1] || 'N/A';
        } catch (_) { }

        const responseData = {
            counts: {
                users: userAnalytics?.userStats?.[0]?.total || 0,
                todos: await Todo.estimatedDocumentCount(),
            },
            userStats: userAnalytics?.userStats?.[0] || {},
            todoStats: {
                completed: todoCount['completed'] || 0,
                pending: todoCount['pending'] || 0,
                inProgress: todoCount['in-progress'] || 0,
            },
            redis: {
                usedMemory: redisUsedMemory,
            },
        };
        return successResponse(res, 'Analytics retrieved successfully', 200, responseData);
    } catch (error) {
        return errorResponse(res, `Failed to fetch analytics: ${error.message}`, 500);
    }
};

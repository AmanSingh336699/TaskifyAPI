import Todo from "../models/todo.model.js";
import { deleteCacheByPattern, getCache, setCache, deleteCache } from "../utils/cacheUtils.js";
import { successResponse, errorResponse, createdResponse, noContentResponse } from '../utils/responseUtils.js';

export const getAllTodosController = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;
        if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const sortField = req.query.sort || 'createdAt';
        const sortOrder = req.query.order === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const keyData = JSON.stringify({ page, limit, ...req.query });
        const cacheKey = `todos:all:page:${page}:limit:${limit}:${keyData}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return successResponse(res, "Todos retrieved from cache", 200, cached);
        }

        const todos = await Todo.find(filter).sort(sort).skip(skip).limit(limit).lean();
        const total = await Todo.countDocuments(filter);

        const result = {
            todos,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };

        await setCache(cacheKey, result, 600);
        return successResponse(res, 'Todos retrieved successfully', 200, result);
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500);
    }
};

export const getTodosController = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;

        const filter = { userId };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;
        if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const sortField = req.query.sort || 'createdAt';
        const sortOrder = req.query.order === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const keyData = JSON.stringify({ userId, page, limit, ...req.query });
        const cacheKey = `todos:user:${userId}:page:${page}:limit:${limit}:${keyData}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return successResponse(res, "Todos retrieved from cache", 200, cached);
        }

        const todos = await Todo.find(filter).sort(sort).skip(skip).limit(limit).lean();
        const total = await Todo.countDocuments(filter);

        const result = {
            todos,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };

        await setCache(cacheKey, result, 600);
        return successResponse(res, 'Todos retrieved successfully', 200, result);
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500);
    }
};

export const getTodoController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const cacheKey = `todo:${id}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            if (cached.userId.toString() !== userId.toString()) {
                return errorResponse(res, 'Unauthorized', 403);
            }
            return successResponse(res, 'Todo retrieved from cache', 200, cached);
        }

        const todo = await Todo.findById(id).lean();
        if (!todo) return errorResponse(res, 'Todo not found', 404);
        if (todo.userId.toString() !== userId.toString()) {
            return errorResponse(res, 'Unauthorized', 403);
        }

        await setCache(cacheKey, todo, 600);
        return successResponse(res, 'Todo retrieved successfully', 200, todo);
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500);
    }
};

export const createTodoController = async (req, res) => {
    try {
        const userId = req.user._id;
        const todo = await Todo.create({
            userId,
            ...req.body,
        });

        await deleteCacheByPattern(`todos:user:${userId}:*`);
        await deleteCacheByPattern(`todos:all:*`);

        return createdResponse(res, "Todo created successfully", todo);
    } catch (error) {
        return errorResponse(res, "Internal server error", 500);
    }
};

export const updateTodoController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const todo = await Todo.findById(id);
        if (!todo) return errorResponse(res, 'Todo not found', 404);
        if (todo.userId.toString() !== userId.toString()) {
            return errorResponse(res, 'Unauthorized', 403);
        }

        const updated = await Todo.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        await deleteCache(`todo:${id}`);
        await deleteCacheByPattern(`todos:user:${userId}:*`);
        await deleteCacheByPattern(`todos:all:*`);

        return successResponse(res, 'Todo updated successfully', 200, updated);
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500);
    }
};

export const deleteTodoController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const todo = await Todo.findById(id);
        if (!todo) return errorResponse(res, 'Todo not found', 404);
        if (todo.userId.toString() !== userId.toString()) {
            return errorResponse(res, 'Unauthorized', 403);
        }

        await Todo.findByIdAndDelete(id);

        await deleteCache(`todo:${id}`);
        await deleteCacheByPattern(`todos:user:${userId}:*`);
        await deleteCacheByPattern(`todos:all:*`);

        return noContentResponse(res);
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500);
    }
};

export const bulkDeleteTodosController = async (req, res) => {
    try {
        const { ids } = req.body;
        const userId = req.user._id;

        if (!Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'IDs must be a non-empty array', 400);
        }
        if (ids.length > 50) {
            return errorResponse(res, 'Cannot delete more than 50 todos at once', 400);
        }

        const todos = await Todo.find({ _id: { $in: ids }, userId });
        if (todos.length !== ids.length) {
            return errorResponse(res, 'Some todos not found or unauthorized', 403);
        }

        await Todo.deleteMany({ _id: { $in: ids }, userId });

        for (const id of ids) {
            await deleteCache(`todo:${id}`);
        }
        await deleteCacheByPattern(`todos:user:${userId}:*`);
        await deleteCacheByPattern(`todos:all:*`);

        return successResponse(res, `${ids.length} todos deleted successfully`, 200, null);
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500);
    }
};

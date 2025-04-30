import mongoose from "mongoose";
import Post from "../models/post.models.js";
import { createdResponse, errorResponse, noContentResponse, successResponse } from "../utils/responseUtils.js";
import { getCache, setCache, deleteCache, deleteCacheByPattern } from "../utils/cacheUtils.js";

export const getPostsController = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;
        const sortField = req.query.sort || 'createdAt';
        const sortOrder = req.query.order === 'asc' ? 1 : -1;
        const userId = req.query.userId;
        const search = req.query.search;
        const cacheKey = `posts:agg:page:${page}:limit:${limit}:sort:${sortField}:${sortOrder}:search:${search || ''}:user:${userId || 'all'}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return successResponse(res, "Posts retrieved from cache", 200, cachedData);
        }
        const matchStage = {}
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            matchStage.userId = new mongoose.Schema.Types.ObjectId(userId);
        }
        if (search) {
            matchStage.$text = { $search: search };
        }
        const pipeline = [
            { $match: matchStage },
            {
                $sort: search ? { score: { $meta: "textScore" } } : {
                    [sortField]: sortOrder
                }
            },
            {
                $facet: {
                    posts: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        { $unwind: "$user" },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                content: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                ...(search && { score: { $meta: "textScore" } }),
                                user: {
                                    _id: "$user._id",
                                    name: "$user.name",
                                    email: "$user.email",
                                }
                            }
                        }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];
        const result = await Post.aggregate(pipeline);
        const posts = result[0]?.posts || [];
        const total = result[0]?.totalCount[0]?.count || 0;
        const response = {
            posts,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        }
        await setCache(cacheKey, response, 600);
        return successResponse(res, "Posts retrieved successfully", 200, response);
    } catch (error) {
        return errorResponse(res, 'Internal Server Error', 500);
    }
}

export const getPostByIdController = async (req, res) => {
    try {
        const postId = req.params.id
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return errorResponse(res, "Invalid post ID", 400);
        }
        const cacheKey = `post:${postId}`;
        const cachedPost = await getCache(cacheKey);

        if (cachedPost) {
            return successResponse(
                res,
                'Post retrieved from cache successfully',
                cachedPost
            );
        }
        const pipeline = [
            { $match: { _id: new mongoose.Schema.Types.ObjectId(postId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: {
                        _id: "$user._id",
                        name: "$user.name",
                        email: "$user.email",
                    }
                }
            }
        ]
        const result = await Post.aggregate(pipeline);
        if (!result.length) {
            return errorResponse(res, "Post not found", 404);
        }
        await setCache(cacheKey, result[0], 600);
        return successResponse(res, "Post retrieved successfully", 200, result[0]);
    } catch (error) {
        return errorResponse(res, 'Internal Server Error', 500);
    }
}

export const updatePostController = async (req, res) => {
    try {
        const userId = req.user?._id;
        const postId = req.params.id
        const { title, content } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(postId)) {
            return errorResponse(res, "Invalid post ID", 400);
        }
        const post = await Post.findById(postId);

        if (!post) {
            return errorResponse(res, 'Post not found', 404);
        }
        if (post.userId.toString() !== userId.toString()) {
            return errorResponse(res, 'Not authorized to update this post', 401);
        }
        const updatedPost = await Post.findByIdAndUpdate(postId, {
            $set: {
                title,
                content,
                updatedAt: Date.now()
            },
        }, {
            new: true,
            runValidators: true,
            lean: true
        });
        if (!updatedPost) {
            return errorResponse(res, 'Post not found', 404);
        }
        await deleteCache(`post:${postId}`);
        await deleteCacheByPattern('posts:*');
        return successResponse(res, 'Post updated successfully', 200, updatedPost);
    } catch (error) {
        return errorResponse(res, 'Internal Server Error', 500);
    }
}

export const createPostController = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user?._id;
        if (!userId || !title || !content) {
            return errorResponse(res, 'Missing required fields', 400);
        }
        const post = await Post.create({ title, content, userId });
        await deleteCacheByPattern('posts:*')
        return createdResponse(res, 'Post created successfully', post);
    } catch (error) {
        return errorResponse(res, 'Internal Server Error', 500);
    }
}

export const deletePostController = async (req, res) => {
    try {
        const userId = req.user?._id;
        const postId = req.params.id
        if (!userId || !mongoose.Types.ObjectId.isValid(postId)) {
            return errorResponse(res, 'Invalid Post ID', 400);
        }
        const post = await Post.findById(postId)
        if (!post) {
            return errorResponse(res, 'Post not found', 404);
        }
        if (post.userId.toString() !== userId.toString()) {
            return errorResponse(res, 'Not authorized to delete this post', 401);
        }
        await Post.findByIdAndDelete(postId);
        await deleteCache(`post:${postId}`);
        await deleteCacheByPattern('posts:*');
        return noContentResponse(res);
    } catch (error) {
        return errorResponse(res, 'Internal Server Error', 500)
    }
}
import express from 'express';
import {
  getUsersController,
  deleteUserController,
  updateUserController,
  getAnalyticsController,
} from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', getUsersController);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user and all their data (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:id', deleteUserController);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user role or verification status (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/users/:id', updateUserController);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get system analytics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics', getAnalyticsController);

export default router;
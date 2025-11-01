import express from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Récupérer toutes les notifications de l'utilisateur
 * @access  Private
 */
router.get('/', authMiddleware, getUserNotifications);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marquer toutes les notifications comme lues
 * @access  Private
 */
router.put('/read-all', authMiddleware, markAllNotificationsAsRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marquer une notification comme lue
 * @access  Private
 */
router.put('/:id/read', authMiddleware, markNotificationAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Supprimer une notification
 * @access  Private
 */
router.delete('/:id', authMiddleware, deleteNotification);

export default router;


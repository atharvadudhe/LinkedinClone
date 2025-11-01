import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPost,
  getAllPosts,
  getUserPosts,
  editPost,
  deletePost,
  likePost,
} from '../controllers/postController.js';

const router = express.Router();

import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

router.post('/create', protect, upload.single('image'), createPost);
router.get('/all', getAllPosts);
router.get('/profile', protect, getUserPosts);
router.put('/:id/edit', protect, upload.single('image'), editPost);
router.delete('/:id/delete', protect, deletePost);
router.put('/:id/like', protect, likePost);

export default router;
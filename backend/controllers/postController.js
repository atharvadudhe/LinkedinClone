import fs from 'fs';
import path from 'path';
import cloudinary from '../config/cloudinary.js';
import Post from '../models/Post.js';

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let imageUrl = '';

    if (req.file) {
      const filePath = req.file.path;
      const uploadRes = await cloudinary.v2.uploader.upload(filePath, { folder: 'linkedin_clone/posts' });
      imageUrl = uploadRes.secure_url;
      fs.unlink(filePath, (err) => { if (err) console.error('Failed to remove temp file', err); });
    }

    const post = await Post.create({
      user: req.user._id,
      content: content || '',
      image: imageUrl,
    });

    const populated = await post.populate('user', 'name profilePic headline');

    res.status(201).json(populated);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('user', 'name profilePic headline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ page, limit, posts });
  } catch (err) {
    console.error('Get all posts error:', err);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate('user', 'name profilePic headline')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Get user posts error:', err);
    res.status(500).json({ message: 'Server error fetching user posts' });
  }
};

export const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    post.content = content ?? post.content;

    if (req.file) {
      const uploadRes = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'linkedin_clone/posts' });
      post.image = uploadRes.secure_url;
      fs.unlink(req.file.path, (err) => { if (err) console.error('Failed to remove temp file', err); });
    }

    await post.save();
    const populated = await post.populate('user', 'name profilePic headline');
    res.json(populated);
  } catch (err) {
    console.error('Edit post error:', err);
    res.status(500).json({ message: 'Server error editing post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    await Post.deleteOne({ _id: id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userLikedIndex = post.likes.indexOf(req.user._id);
    if (userLikedIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(userLikedIndex, 1);
    }

    await post.save();
    res.json({ likes: post.likes.length, isLiked: userLikedIndex === -1 });
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ message: 'Server error liking post' });
  }
};

export default { createPost, getAllPosts, getUserPosts, editPost, deletePost, likePost };
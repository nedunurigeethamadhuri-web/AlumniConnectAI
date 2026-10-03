const express = require("express");

const {
  getPosts,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} = require("../controllers/community.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

// Get all community posts
router.get("/", getPosts);

// Create a new post
router.post("/", createPost);

// Delete own post
router.delete("/:id", deletePost);

// Like / unlike post
router.patch("/:id/like", toggleLike);

// Add comment
router.post("/:id/comments", addComment);

// Delete own comment
router.delete("/comments/:commentId", deleteComment);

module.exports = router;
const express = require("express");

const {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  searchUsers,
} = require("../controllers/message.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getConversations);

router.get("/unread-count", getUnreadCount);

router.get("/search-users", searchUsers);

router.get("/:userId", getMessages);

router.post("/", sendMessage);

router.patch("/:userId/read", markMessagesAsRead);

module.exports = router;
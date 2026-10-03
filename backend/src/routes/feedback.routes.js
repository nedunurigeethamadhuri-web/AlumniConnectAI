const express = require("express");

const {
  createFeedback,
  getSessionFeedback,
} = require("../controllers/feedback.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", createFeedback);

router.get(
  "/session/:sessionId",
  getSessionFeedback
);

module.exports = router;
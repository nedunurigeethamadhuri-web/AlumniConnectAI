const express = require("express");

const {
  createMentorshipSession,
  getMentorshipSessions,
  getMentorshipSessionById,
  updateMentorshipSession,
  completeMentorshipSession,
  cancelMentorshipSession,
  createSessionFeedback,
} = require("../controllers/mentorshipSession.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

// Get all sessions for the logged-in student/alumni
router.get("/", getMentorshipSessions);

// Get one session
router.get("/:id", getMentorshipSessionById);

// Alumni: schedule a new session
router.post("/", createMentorshipSession);

// Alumni: update a scheduled session
router.patch("/:id", updateMentorshipSession);

// Alumni: mark session as completed
router.patch(
  "/:id/complete",
  completeMentorshipSession
);

// Alumni: cancel a scheduled session
router.patch(
  "/:id/cancel",
  cancelMentorshipSession
);

// Student / Alumni: submit feedback for a completed session
router.post(
  "/:id/feedback",
  createSessionFeedback
);

module.exports = router;
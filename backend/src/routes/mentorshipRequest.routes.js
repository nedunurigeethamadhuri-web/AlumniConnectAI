const express = require("express");

const {
  createMentorshipRequest,
  getSentMentorshipRequests,
  getReceivedMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  cancelMentorshipRequest,
} = require("../controllers/mentorshipRequest.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

// Student
router.post("/requests", createMentorshipRequest);
router.get("/requests/sent", getSentMentorshipRequests);
router.patch(
  "/requests/:id/cancel",
  cancelMentorshipRequest
);

// Alumni
router.get(
  "/requests/received",
  getReceivedMentorshipRequests
);

router.patch(
  "/requests/:id/accept",
  acceptMentorshipRequest
);

router.patch(
  "/requests/:id/reject",
  rejectMentorshipRequest
);

module.exports = router;
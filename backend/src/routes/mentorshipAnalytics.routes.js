const express = require("express");

const {
  getMentorshipAnalytics,
} = require("../controllers/mentorshipAnalytics.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getMentorshipAnalytics);

module.exports = router;
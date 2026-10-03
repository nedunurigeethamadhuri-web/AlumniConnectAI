const express = require("express");

const {
  getMentorRecommendations,
} = require("../controllers/mentor.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get(
  "/recommendations",
  getMentorRecommendations
);

module.exports = router;
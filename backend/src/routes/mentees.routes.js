const express = require("express");

const {
  getMyMentees,
} = require("../controllers/mentees.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getMyMentees);

module.exports = router;
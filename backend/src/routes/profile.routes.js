const express = require("express");

const {
  getStudentProfile,
  createOrUpdateStudentProfile,
  getMyProfileSummary,
} = require("../controllers/profile.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getStudentProfile);

router.put("/", createOrUpdateStudentProfile);

router.get("/summary", getMyProfileSummary);

module.exports = router;
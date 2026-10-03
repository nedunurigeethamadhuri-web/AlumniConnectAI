const express = require("express");

const {
  getAlumniProfile,
  createOrUpdateAlumniProfile,
} = require("../controllers/alumni.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/profile", getAlumniProfile);

router.put("/profile", createOrUpdateAlumniProfile);

module.exports = router;
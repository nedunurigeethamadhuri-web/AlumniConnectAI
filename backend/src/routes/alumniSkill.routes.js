const express = require("express");

const {
  getMyAlumniSkills,
  addAlumniSkill,
  updateAlumniSkill,
  deleteAlumniSkill,
} = require("../controllers/alumniSkill.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getMyAlumniSkills);

router.post("/", addAlumniSkill);

router.put("/:skillId", updateAlumniSkill);

router.delete("/:skillId", deleteAlumniSkill);

module.exports = router;
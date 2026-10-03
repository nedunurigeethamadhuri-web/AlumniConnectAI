const express = require("express");

const {
  getMySkills,
  addSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skill.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getMySkills);

router.post("/", addSkill);

router.put("/:skillId", updateSkill);

router.delete("/:skillId", deleteSkill);

module.exports = router;
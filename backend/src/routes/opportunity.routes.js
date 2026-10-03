const express = require("express");

const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  toggleBookmark,
  getSavedOpportunities,
} = require("../controllers/opportunity.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getOpportunities);

router.get("/saved", getSavedOpportunities);

router.get("/:id", getOpportunityById);

router.post("/", createOpportunity);

router.patch("/:id", updateOpportunity);

router.delete("/:id", deleteOpportunity);

router.post("/:id/bookmark", toggleBookmark);

module.exports = router;
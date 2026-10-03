const {
  getRecommendedMentors,
} = require("../services/mentorMatching.service");

/**
 * Get AI-recommended mentors for the logged-in student.
 */
async function getMentorRecommendations(req, res) {
  try {
    const studentId = req.user.userId;

    const recommendations =
      await getRecommendedMentors(studentId);

    return res.status(200).json({
      success: true,
      message: "Mentor recommendations generated successfully.",
      data: {
        recommendations,
        total: recommendations.length,
      },
    });
  } catch (error) {
    console.error(
      "Mentor recommendation error:",
      error
    );

    const statusCode =
      error.message === "Student not found." ||
      error.message ===
        "Only students can receive mentor recommendations."
        ? 400
        : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Unable to generate mentor recommendations.",
    });
  }
}

module.exports = {
  getMentorRecommendations,
};
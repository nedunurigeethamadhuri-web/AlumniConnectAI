const { prisma } = require("../config/database");

async function createFeedback(req, res) {
  try {
    const userId = req.user.userId;

    const {
      sessionId,
      rating,
      comments,
      strengths,
      improvement,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required.",
      });
    }

    if (
      rating === undefined ||
      rating === null ||
      Number.isNaN(Number(rating))
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating is required.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    const session =
      await prisma.mentorshipSession.findUnique({
        where: {
          id: sessionId,
        },
        include: {
          mentorshipRequest: {
            select: {
              id: true,
              status: true,
            },
          },
          feedback: true,
        },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Mentorship session not found.",
      });
    }

    /*
     * Only participants of the session
     * can submit feedback.
     */
    const isStudent =
      session.studentId === userId;

    const isAlumni =
      session.alumniId === userId;

    if (!isStudent && !isAlumni) {
      return res.status(403).json({
        success: false,
        message:
          "Only the mentor or mentee can submit feedback.",
      });
    }

    /*
     * Feedback should only be submitted
     * after the mentorship session is completed.
     */
    if (session.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "Feedback can only be submitted for completed sessions.",
      });
    }

    /*
     * One feedback record per session because
     * sessionId is unique in the Prisma schema.
     */
    if (session.feedback) {
      return res.status(409).json({
        success: false,
        message:
          "Feedback has already been submitted for this session.",
        data: {
          feedback: session.feedback,
        },
      });
    }

    /*
     * Feedback is directed to the other participant.
     */
    const givenById = userId;

    const receivedById = isStudent
      ? session.alumniId
      : session.studentId;

    const feedback =
      await prisma.feedback.create({
        data: {
          sessionId,
          givenById,
          receivedById,
          rating: numericRating,
          comments:
            comments?.trim() || null,
          strengths:
            strengths?.trim() || null,
          improvement:
            improvement?.trim() || null,
        },
        include: {
          givenBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          receivedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

    return res.status(201).json({
      success: true,
      message:
        "Feedback submitted successfully.",
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error(
      "Create feedback error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit feedback.",
    });
  }
}

async function getSessionFeedback(
  req,
  res
) {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    const session =
      await prisma.mentorshipSession.findUnique({
        where: {
          id: sessionId,
        },
        select: {
          id: true,
          studentId: true,
          alumniId: true,
        },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          "Mentorship session not found.",
      });
    }

    const isParticipant =
      session.studentId === userId ||
      session.alumniId === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this session.",
      });
    }

    const feedback =
      await prisma.feedback.findUnique({
        where: {
          sessionId,
        },
        include: {
          givenBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          receivedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message: feedback
        ? "Feedback fetched successfully."
        : "No feedback submitted yet.",
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error(
      "Get session feedback error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch feedback.",
    });
  }
}

module.exports = {
  createFeedback,
  getSessionFeedback,
};
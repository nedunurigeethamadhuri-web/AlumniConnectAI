const { prisma } = require("../config/database");

/**
 * Create a mentorship session
 * Alumni only
 */
async function createMentorshipSession(req, res) {
  try {
    const alumniId = req.user.userId;

    const {
      mentorshipRequestId,
      title,
      agenda,
      meetingUrl,
      scheduledAt,
      duration,
    } = req.body;

    if (
      !mentorshipRequestId ||
      !title ||
      !scheduledAt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Mentorship request, title and scheduled time are required.",
      });
    }

    const scheduledDate = new Date(scheduledAt);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date and time.",
      });
    }

    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Session must be scheduled for a future date and time.",
      });
    }

    const mentorshipRequest =
      await prisma.mentorshipRequest.findUnique({
        where: {
          id: mentorshipRequestId,
        },
        select: {
          id: true,
          studentId: true,
          alumniId: true,
          status: true,
        },
      });

    if (!mentorshipRequest) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found.",
      });
    }

    if (mentorshipRequest.alumniId !== alumniId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create a session for this mentorship.",
      });
    }

    if (mentorshipRequest.status !== "ACCEPTED") {
      return res.status(400).json({
        success: false,
        message:
          "A session can only be scheduled for an accepted mentorship.",
      });
    }

    const existingSession =
      await prisma.mentorshipSession.findFirst({
        where: {
          mentorshipRequestId,
          scheduledAt: scheduledDate,
          status: {
            not: "CANCELLED",
          },
        },
      });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message:
          "A session is already scheduled at this date and time.",
      });
    }

    const session = await prisma.mentorshipSession.create({
      data: {
        mentorshipRequestId,
        studentId: mentorshipRequest.studentId,
        alumniId,
        title: title.trim(),
        agenda: agenda?.trim() || null,
        meetingUrl: meetingUrl?.trim() || null,
        scheduledAt: scheduledDate,
        duration: duration
          ? Number(duration)
          : null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        alumni: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Mentorship session scheduled successfully.",
      data: session,
    });
  } catch (error) {
    console.error(
      "Create mentorship session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to schedule mentorship session.",
    });
  }
}


/**
 * Get mentorship sessions
 *
 * Alumni -> their sessions
 * Student -> their sessions
 */
async function getMentorshipSessions(req, res) {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let where = {};

    if (role === "ALUMNI") {
      where = {
        alumniId: userId,
      };
    } else if (role === "STUDENT") {
      where = {
        studentId: userId,
      };
    } else {
      return res.status(403).json({
        success: false,
        message:
          "Only students and alumni can view mentorship sessions.",
      });
    }

    const sessions =
      await prisma.mentorshipSession.findMany({
        where,
        orderBy: {
          scheduledAt: "asc",
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentProfile: {
                select: {
                  college: true,
                  branch: true,
                  careerGoal: true,
                },
              },
            },
          },
          alumni: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              alumniProfile: {
                select: {
                  company: true,
                  designation: true,
                  industry: true,
                },
              },
            },
          },
          mentorshipRequest: {
            select: {
              id: true,
              careerGoal: true,
              compatibilityScore: true,
            },
          },
          feedback: true,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Mentorship sessions fetched successfully.",
      data: {
        sessions,
        total: sessions.length,
      },
    });
  } catch (error) {
    console.error(
      "Get mentorship sessions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch mentorship sessions.",
    });
  }
}


/**
 * Get a single mentorship session
 */
async function getMentorshipSessionById(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const session =
      await prisma.mentorshipSession.findUnique({
        where: {
          id,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentProfile: true,
            },
          },
          alumni: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              alumniProfile: true,
            },
          },
          mentorshipRequest: true,
          tasks: true,
          feedback: {
            include: {
              givenBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
              receivedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
        },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Mentorship session not found.",
      });
    }

    const isParticipant =
      session.studentId === userId ||
      session.alumniId === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this session.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentorship session fetched successfully.",
      data: session,
    });
  } catch (error) {
    console.error(
      "Get mentorship session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch mentorship session.",
    });
  }
}


/**
 * Update a scheduled session
 * Alumni only
 */
async function updateMentorshipSession(req, res) {
  try {
    const alumniId = req.user.userId;
    const { id } = req.params;

    const {
      title,
      agenda,
      meetingUrl,
      scheduledAt,
      duration,
    } = req.body;

    const existingSession =
      await prisma.mentorshipSession.findUnique({
        where: {
          id,
        },
      });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: "Mentorship session not found.",
      });
    }

    if (existingSession.alumniId !== alumniId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this session.",
      });
    }

    if (existingSession.status !== "SCHEDULED") {
      return res.status(400).json({
        success: false,
        message:
          "Only scheduled sessions can be updated.",
      });
    }

    let newScheduledAt;

    if (scheduledAt !== undefined) {
      newScheduledAt = new Date(scheduledAt);

      if (Number.isNaN(newScheduledAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid scheduled date and time.",
        });
      }

      if (newScheduledAt <= new Date()) {
        return res.status(400).json({
          success: false,
          message:
            "Session must be scheduled for a future date and time.",
        });
      }
    }

    const session =
      await prisma.mentorshipSession.update({
        where: {
          id,
        },
        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),
          ...(agenda !== undefined && {
            agenda: agenda?.trim() || null,
          }),
          ...(meetingUrl !== undefined && {
            meetingUrl:
              meetingUrl?.trim() || null,
          }),
          ...(scheduledAt !== undefined && {
            scheduledAt: newScheduledAt,
          }),
          ...(duration !== undefined && {
            duration:
              duration === null ||
              duration === ""
                ? null
                : Number(duration),
          }),
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          alumni: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Mentorship session updated successfully.",
      data: session,
    });
  } catch (error) {
    console.error(
      "Update mentorship session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update mentorship session.",
    });
  }
}


/**
 * Complete a mentorship session
 * Alumni only
 */
async function completeMentorshipSession(req, res) {
  try {
    const alumniId = req.user.userId;
    const { id } = req.params;

    const {
      summary,
      actionItems,
    } = req.body;

    const session =
      await prisma.mentorshipSession.findUnique({
        where: {
          id,
        },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Mentorship session not found.",
      });
    }

    if (session.alumniId !== alumniId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to complete this session.",
      });
    }

    if (session.status !== "SCHEDULED") {
      return res.status(400).json({
        success: false,
        message:
          "Only scheduled sessions can be completed.",
      });
    }

    const updatedSession =
      await prisma.mentorshipSession.update({
        where: {
          id,
        },
        data: {
          status: "COMPLETED",
          summary: summary?.trim() || null,
          actionItems:
            actionItems?.trim() || null,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Mentorship session marked as completed.",
      data: updatedSession,
    });
  } catch (error) {
    console.error(
      "Complete mentorship session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to complete mentorship session.",
    });
  }
}


/**
 * Cancel a mentorship session
 * Alumni only
 */
async function cancelMentorshipSession(req, res) {
  try {
    const alumniId = req.user.userId;
    const { id } = req.params;

    const session =
      await prisma.mentorshipSession.findUnique({
        where: {
          id,
        },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Mentorship session not found.",
      });
    }

    if (session.alumniId !== alumniId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to cancel this session.",
      });
    }

    if (session.status !== "SCHEDULED") {
      return res.status(400).json({
        success: false,
        message:
          "Only scheduled sessions can be cancelled.",
      });
    }

    const updatedSession =
      await prisma.mentorshipSession.update({
        where: {
          id,
        },
        data: {
          status: "CANCELLED",
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Mentorship session cancelled successfully.",
      data: updatedSession,
    });
  } catch (error) {
    console.error(
      "Cancel mentorship session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to cancel mentorship session.",
    });
  }
}


/**
 * Submit feedback for a completed mentorship session
 *
 * Student -> gives feedback to Alumni
 * Alumni  -> gives feedback to Student
 *
 * Only one feedback entry is allowed per session.
 */
async function createSessionFeedback(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const {
      rating,
      comments,
      strengths,
      improvement,
    } = req.body;

    const numericRating = Number(rating);

    if (
      rating === undefined ||
      rating === null ||
      rating === "" ||
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
          id,
        },
        select: {
          id: true,
          studentId: true,
          alumniId: true,
          status: true,
        },
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Mentorship session not found.",
      });
    }

    if (
      session.studentId !== userId &&
      session.alumniId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to give feedback for this session.",
      });
    }

    if (session.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "Feedback can only be submitted for completed sessions.",
      });
    }

    const receivedById =
      session.studentId === userId
        ? session.alumniId
        : session.studentId;

    const existingFeedback =
      await prisma.feedback.findUnique({
        where: {
          sessionId: id,
        },
      });

    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message:
          "Feedback has already been submitted for this session.",
        data: existingFeedback,
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        sessionId: id,
        givenById: userId,
        receivedById,
        rating: numericRating,
        comments:
          typeof comments === "string"
            ? comments.trim() || null
            : null,
        strengths:
          typeof strengths === "string"
            ? strengths.trim() || null
            : null,
        improvement:
          typeof improvement === "string"
            ? improvement.trim() || null
            : null,
      },
      include: {
        givenBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receivedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: feedback,
    });
  } catch (error) {
    console.error(
      "Create session feedback error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit session feedback.",
    });
  }
}


module.exports = {
  createMentorshipSession,
  getMentorshipSessions,
  getMentorshipSessionById,
  updateMentorshipSession,
  completeMentorshipSession,
  cancelMentorshipSession,
  createSessionFeedback,
};
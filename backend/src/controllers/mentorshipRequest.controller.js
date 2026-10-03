const { prisma } = require("../config/database");

/**
 * Student sends a mentorship request to an alumni.
 */
async function createMentorshipRequest(req, res) {
  try {
    const studentId = req.user.userId;

    const {
      alumniId,
      careerGoal,
      message,
      compatibilityScore,
      matchReason,
    } = req.body;

    if (!alumniId) {
      return res.status(400).json({
        success: false,
        message: "Alumni ID is required.",
      });
    }

    // Verify student
    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
      },
      include: {
        studentProfile: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    if (student.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can send mentorship requests.",
      });
    }

    // Verify alumni
    const alumni = await prisma.user.findUnique({
      where: {
        id: alumniId,
      },
      include: {
        alumniProfile: true,
      },
    });

    if (!alumni || alumni.role !== "ALUMNI") {
      return res.status(404).json({
        success: false,
        message: "Alumni mentor not found.",
      });
    }

    if (alumni.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This alumni is currently unavailable.",
      });
    }

    // Prevent duplicate pending request
    const existingRequest =
      await prisma.mentorshipRequest.findFirst({
        where: {
          studentId,
          alumniId,
          status: "PENDING",
        },
      });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending mentorship request with this mentor.",
        data: existingRequest,
      });
    }

    const request = await prisma.mentorshipRequest.create({
      data: {
        studentId,
        alumniId,
        careerGoal:
          careerGoal || student.studentProfile?.careerGoal || null,
        message: message || null,
        compatibilityScore:
          compatibilityScore !== undefined
            ? Number(compatibilityScore)
            : null,
        matchReason: matchReason || null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        alumni: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
            alumniProfile: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Mentorship request sent successfully.",
      data: request,
    });
  } catch (error) {
    console.error(
      "Create mentorship request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to send mentorship request.",
    });
  }
}


/**
 * Get mentorship requests sent by the logged-in student.
 */
async function getSentMentorshipRequests(req, res) {
  try {
    const studentId = req.user.userId;

    const requests =
      await prisma.mentorshipRequest.findMany({
        where: {
          studentId,
        },
        include: {
          alumni: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              alumniProfile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Sent mentorship requests retrieved successfully.",
      data: requests,
      total: requests.length,
    });
  } catch (error) {
    console.error(
      "Get sent mentorship requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve sent mentorship requests.",
    });
  }
}


/**
 * Get mentorship requests received by the logged-in alumni.
 */
async function getReceivedMentorshipRequests(req, res) {
  try {
    const alumniId = req.user.userId;

    const requests =
      await prisma.mentorshipRequest.findMany({
        where: {
          alumniId,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              studentProfile: true,
              studentSkills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Received mentorship requests retrieved successfully.",
      data: requests,
      total: requests.length,
    });
  } catch (error) {
    console.error(
      "Get received mentorship requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve received mentorship requests.",
    });
  }
}


/**
 * Alumni accepts a mentorship request.
 */
async function acceptMentorshipRequest(req, res) {
  try {
    const alumniId = req.user.userId;
    const { id } = req.params;

    const request =
      await prisma.mentorshipRequest.findUnique({
        where: {
          id,
        },
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found.",
      });
    }

    if (request.alumniId !== alumniId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to accept this request.",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `This request cannot be accepted because its current status is ${request.status}.`,
      });
    }

    const updatedRequest =
      await prisma.mentorshipRequest.update({
        where: {
          id,
        },
        data: {
          status: "ACCEPTED",
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
          },
          alumni: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              alumniProfile: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message: "Mentorship request accepted successfully.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Accept mentorship request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to accept mentorship request.",
    });
  }
}


/**
 * Alumni rejects a mentorship request.
 */
async function rejectMentorshipRequest(req, res) {
  try {
    const alumniId = req.user.userId;
    const { id } = req.params;

    const request =
      await prisma.mentorshipRequest.findUnique({
        where: {
          id,
        },
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found.",
      });
    }

    if (request.alumniId !== alumniId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to reject this request.",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `This request cannot be rejected because its current status is ${request.status}.`,
      });
    }

    const updatedRequest =
      await prisma.mentorshipRequest.update({
        where: {
          id,
        },
        data: {
          status: "REJECTED",
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
          },
          alumni: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              alumniProfile: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message: "Mentorship request rejected.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Reject mentorship request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to reject mentorship request.",
    });
  }
}


/**
 * Student cancels a pending mentorship request.
 */
async function cancelMentorshipRequest(req, res) {
  try {
    const studentId = req.user.userId;
    const { id } = req.params;

    const request =
      await prisma.mentorshipRequest.findUnique({
        where: {
          id,
        },
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found.",
      });
    }

    if (request.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to cancel this request.",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `Only pending requests can be cancelled. Current status: ${request.status}.`,
      });
    }

    const updatedRequest =
      await prisma.mentorshipRequest.update({
        where: {
          id,
        },
        data: {
          status: "CANCELLED",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Mentorship request cancelled successfully.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Cancel mentorship request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to cancel mentorship request.",
    });
  }
}


module.exports = {
  createMentorshipRequest,
  getSentMentorshipRequests,
  getReceivedMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  cancelMentorshipRequest,
};
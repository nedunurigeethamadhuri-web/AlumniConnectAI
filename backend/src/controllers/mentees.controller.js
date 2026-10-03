const { prisma } = require("../config/database");

async function getMyMentees(req, res) {
  try {
    const alumniId = req.user.userId;

    const alumni = await prisma.user.findUnique({
      where: {
        id: alumniId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni user not found.",
      });
    }

    if (alumni.role !== "ALUMNI") {
      return res.status(403).json({
        success: false,
        message: "Only alumni can view mentees.",
      });
    }

    const mentorshipRequests =
      await prisma.mentorshipRequest.findMany({
        where: {
          alumniId,
          status: "ACCEPTED",
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true,
              studentProfile: {
                select: {
                  college: true,
                  degree: true,
                  branch: true,
                  graduationYear: true,
                  careerGoal: true,
                  bio: true,
                  githubUrl: true,
                  linkedinUrl: true,
                  portfolioUrl: true,
                },
              },
            },
          },
        },
      });

    const mentees = mentorshipRequests.map((request) => ({
      id: request.id,
      status: request.status,
      careerGoal: request.careerGoal,
      message: request.message,
      compatibilityScore: request.compatibilityScore,
      matchReason: request.matchReason,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      student: request.student,
    }));

    return res.status(200).json({
      success: true,
      message: "Mentees fetched successfully.",
      data: {
        mentees,
        total: mentees.length,
      },
    });
  } catch (error) {
    console.error("Get mentees error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch mentees.",
    });
  }
}

module.exports = {
  getMyMentees,
};
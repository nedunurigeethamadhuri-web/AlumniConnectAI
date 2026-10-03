const { prisma } = require("../config/database");

async function getMentorshipAnalytics(req, res) {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isAlumni = user.role === "ALUMNI";
    const isStudent = user.role === "STUDENT";

    if (!isAlumni && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "Analytics are available for students and alumni only.",
      });
    }

    const sessionWhere = isAlumni
      ? { alumniId: userId }
      : { studentId: userId };

    const requestWhere = isAlumni
      ? {
          alumniId: userId,
          status: "ACCEPTED",
        }
      : {
          studentId: userId,
          status: "ACCEPTED",
        };

    const [
      totalSessions,
      completedSessions,
      upcomingSessions,
      cancelledSessions,
      activeMentorships,
      feedbacks,
      recentSessions,
    ] = await Promise.all([
      prisma.mentorshipSession.count({
        where: sessionWhere,
      }),

      prisma.mentorshipSession.count({
        where: {
          ...sessionWhere,
          status: "COMPLETED",
        },
      }),

      prisma.mentorshipSession.count({
        where: {
          ...sessionWhere,
          status: "SCHEDULED",
        },
      }),

      prisma.mentorshipSession.count({
        where: {
          ...sessionWhere,
          status: "CANCELLED",
        },
      }),

      prisma.mentorshipRequest.count({
        where: requestWhere,
      }),

      prisma.feedback.findMany({
        where: {
          receivedById: userId,
        },
        select: {
          rating: true,
          createdAt: true,
        },
      }),

      prisma.mentorshipSession.findMany({
        where: sessionWhere,
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

    const totalRatings = feedbacks.length;

    const averageRating =
      totalRatings > 0
        ? Number(
            (
              feedbacks.reduce(
                (sum, feedback) => sum + feedback.rating,
                0
              ) / totalRatings
            ).toFixed(1)
          )
        : 0;

    const completionRate =
      totalSessions > 0
        ? Number(
            ((completedSessions / totalSessions) * 100).toFixed(1)
          )
        : 0;

    const analytics = {
      role: user.role,

      overview: {
        activeMentorships,
        totalSessions,
        completedSessions,
        upcomingSessions,
        cancelledSessions,
        completionRate,
        averageRating,
        totalRatings,
      },

      recentSessions,

      feedbackSummary: {
        averageRating,
        totalRatings,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Mentorship analytics fetched successfully.",
      data: analytics,
    });
  } catch (error) {
    console.error("Get mentorship analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch mentorship analytics.",
    });
  }
}

module.exports = {
  getMentorshipAnalytics,
};
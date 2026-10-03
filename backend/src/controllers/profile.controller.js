const { prisma } = require("../config/database");

async function getStudentProfile(req, res) {
  try {
    const userId = req.user.userId;

    const profile = await prisma.studentProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            profileImage: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(200).json({
        success: true,
        message: "Student profile not created yet.",
        data: {
          profile: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student profile fetched successfully.",
      data: {
        profile,
      },
    });
  } catch (error) {
    console.error("Get student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student profile.",
    });
  }
}

async function createOrUpdateStudentProfile(req, res) {
  try {
    const userId = req.user.userId;

    const {
      firstName,
      lastName,
      phone,
      location,
      college,
      degree,
      branch,
      graduationYear,
      careerGoal,
      bio,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      resumeUrl,
    } = req.body;

    if (!college || !degree || !branch || !careerGoal) {
      return res.status(400).json({
        success: false,
        message:
          "College, degree, branch and career goal are required.",
      });
    }

    const parsedGraduationYear = graduationYear
      ? Number(graduationYear)
      : null;

    if (
      parsedGraduationYear !== null &&
      (!Number.isInteger(parsedGraduationYear) ||
        parsedGraduationYear < 2000 ||
        parsedGraduationYear > 2100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid graduation year.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim() || null,
        phone: phone?.trim() || null,
        location: location?.trim() || null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        profileImage: true,
        phone: true,
        location: true,
      },
    });

    const profile = await prisma.studentProfile.upsert({
      where: {
        userId,
      },
      update: {
        college: college.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        graduationYear: parsedGraduationYear,
        careerGoal: careerGoal.trim(),
        bio: bio?.trim() || null,
        githubUrl: githubUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        portfolioUrl: portfolioUrl?.trim() || null,
        resumeUrl: resumeUrl?.trim() || null,
      },
      create: {
        userId,
        college: college.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        graduationYear: parsedGraduationYear,
        careerGoal: careerGoal.trim(),
        bio: bio?.trim() || null,
        githubUrl: githubUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        portfolioUrl: portfolioUrl?.trim() || null,
        resumeUrl: resumeUrl?.trim() || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Student profile saved successfully.",
      data: {
        user: updatedUser,
        profile,
      },
    });
  } catch (error) {
    console.error("Save student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save student profile.",
    });
  }
}

async function getMyProfileSummary(req, res) {
  try {
    const userId = req.user.userId;

    const [user, profile, skills] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          profileImage: true,
          phone: true,
          location: true,
        },
      }),

      prisma.studentProfile.findUnique({
        where: {
          userId,
        },
      }),

      prisma.studentSkill.findMany({
        where: {
          studentId: userId,
        },
        include: {
          skill: true,
        },
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let completion = 0;

    if (user.firstName) completion += 5;
    if (user.lastName) completion += 5;
    if (user.phone) completion += 5;
    if (user.location) completion += 5;

    if (profile) {
      if (profile.college) completion += 10;
      if (profile.degree) completion += 10;
      if (profile.branch) completion += 10;
      if (profile.graduationYear) completion += 10;
      if (profile.careerGoal) completion += 10;
      if (profile.bio) completion += 5;
      if (profile.githubUrl) completion += 5;
      if (profile.linkedinUrl) completion += 5;
      if (profile.portfolioUrl) completion += 5;
      if (profile.resumeUrl) completion += 5;
    }

    if (skills.length > 0) {
      completion += 5;
    }

    completion = Math.min(completion, 100);

    return res.status(200).json({
      success: true,
      message: "Profile summary fetched successfully.",
      data: {
        user,
        profile,
        skills,
        profileCompletion: completion,
      },
    });
  } catch (error) {
    console.error("Get profile summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile summary.",
    });
  }
}

module.exports = {
  getStudentProfile,
  createOrUpdateStudentProfile,
  getMyProfileSummary,
};
const { prisma } = require("../config/database");

async function getAlumniProfile(req, res) {
  try {
    const userId = req.user.userId;

    const profile = await prisma.alumniProfile.findUnique({
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
        message: "Alumni profile not created yet.",
        data: {
          profile: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alumni profile fetched successfully.",
      data: {
        profile,
      },
    });
  } catch (error) {
    console.error("Get alumni profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch alumni profile.",
    });
  }
}

async function createOrUpdateAlumniProfile(req, res) {
  try {
    const userId = req.user.userId;

    const {
      firstName,
      lastName,
      phone,
      location,
      company,
      designation,
      industry,
      experienceYears,
      bio,
      mentorshipAreas,
      availability,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    } = req.body;

    const parsedExperienceYears =
      experienceYears !== undefined &&
      experienceYears !== ""
        ? Number(experienceYears)
        : null;

    if (
      parsedExperienceYears !== null &&
      (!Number.isInteger(parsedExperienceYears) ||
        parsedExperienceYears < 0 ||
        parsedExperienceYears > 60)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid experience value.",
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

    const profile = await prisma.alumniProfile.upsert({
      where: {
        userId,
      },
      update: {
        company: company?.trim() || null,
        designation: designation?.trim() || null,
        industry: industry?.trim() || null,
        experienceYears: parsedExperienceYears,
        bio: bio?.trim() || null,
        mentorshipAreas: mentorshipAreas?.trim() || null,
        availability: availability?.trim() || null,
        githubUrl: githubUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        portfolioUrl: portfolioUrl?.trim() || null,
      },
      create: {
        userId,
        company: company?.trim() || null,
        designation: designation?.trim() || null,
        industry: industry?.trim() || null,
        experienceYears: parsedExperienceYears,
        bio: bio?.trim() || null,
        mentorshipAreas: mentorshipAreas?.trim() || null,
        availability: availability?.trim() || null,
        githubUrl: githubUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        portfolioUrl: portfolioUrl?.trim() || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Alumni profile saved successfully.",
      data: {
        user: updatedUser,
        profile,
      },
    });
  } catch (error) {
    console.error("Save alumni profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save alumni profile.",
    });
  }
}

module.exports = {
  getAlumniProfile,
  createOrUpdateAlumniProfile,
};
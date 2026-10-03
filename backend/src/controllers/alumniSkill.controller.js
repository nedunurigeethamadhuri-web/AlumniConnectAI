const { prisma } = require("../config/database");

const allowedLevels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

async function getMyAlumniSkills(req, res) {
  try {
    const userId = req.user.userId;

    const skills = await prisma.alumniSkill.findMany({
      where: {
        alumniId: userId,
      },
      include: {
        skill: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Alumni skills fetched successfully.",
      data: {
        skills,
      },
    });
  } catch (error) {
    console.error("Get alumni skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch alumni skills.",
    });
  }
}

async function addAlumniSkill(req, res) {
  try {
    const userId = req.user.userId;

    const {
      name,
      category,
      description,
      level,
      years,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required.",
      });
    }

    if (level && !allowedLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message:
          "Skill level must be BEGINNER, INTERMEDIATE, ADVANCED or EXPERT.",
      });
    }

    const parsedYears =
      years !== undefined && years !== ""
        ? Number(years)
        : null;

    if (
      parsedYears !== null &&
      (Number.isNaN(parsedYears) || parsedYears < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Years of experience must be a valid positive number.",
      });
    }

    const skillName = name.trim();

    const skill = await prisma.skill.upsert({
      where: {
        name: skillName,
      },
      update: {
        category: category?.trim() || null,
        description: description?.trim() || null,
      },
      create: {
        name: skillName,
        category: category?.trim() || null,
        description: description?.trim() || null,
      },
    });

    const existingAlumniSkill =
      await prisma.alumniSkill.findUnique({
        where: {
          alumniId_skillId: {
            alumniId: userId,
            skillId: skill.id,
          },
        },
      });

    if (existingAlumniSkill) {
      return res.status(409).json({
        success: false,
        message: "You have already added this skill.",
      });
    }

    const alumniSkill = await prisma.alumniSkill.create({
      data: {
        alumniId: userId,
        skillId: skill.id,
        level: level || "INTERMEDIATE",
        years: parsedYears,
      },
      include: {
        skill: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Alumni skill added successfully.",
      data: {
        skill: alumniSkill,
      },
    });
  } catch (error) {
    console.error("Add alumni skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add alumni skill.",
    });
  }
}

async function updateAlumniSkill(req, res) {
  try {
    const userId = req.user.userId;
    const { skillId } = req.params;
    const { level, years } = req.body;

    if (!allowedLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message:
          "Skill level must be BEGINNER, INTERMEDIATE, ADVANCED or EXPERT.",
      });
    }

    const parsedYears =
      years !== undefined && years !== ""
        ? Number(years)
        : null;

    if (
      parsedYears !== null &&
      (Number.isNaN(parsedYears) || parsedYears < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Years of experience must be a valid positive number.",
      });
    }

    const existingSkill =
      await prisma.alumniSkill.findFirst({
        where: {
          id: skillId,
          alumniId: userId,
        },
      });

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Alumni skill not found.",
      });
    }

    const updatedSkill =
      await prisma.alumniSkill.update({
        where: {
          id: skillId,
        },
        data: {
          level,
          years: parsedYears,
        },
        include: {
          skill: true,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Alumni skill updated successfully.",
      data: {
        skill: updatedSkill,
      },
    });
  } catch (error) {
    console.error("Update alumni skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update alumni skill.",
    });
  }
}

async function deleteAlumniSkill(req, res) {
  try {
    const userId = req.user.userId;
    const { skillId } = req.params;

    const existingSkill =
      await prisma.alumniSkill.findFirst({
        where: {
          id: skillId,
          alumniId: userId,
        },
      });

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Alumni skill not found.",
      });
    }

    await prisma.alumniSkill.delete({
      where: {
        id: skillId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Alumni skill removed successfully.",
    });
  } catch (error) {
    console.error("Delete alumni skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove alumni skill.",
    });
  }
}

module.exports = {
  getMyAlumniSkills,
  addAlumniSkill,
  updateAlumniSkill,
  deleteAlumniSkill,
};
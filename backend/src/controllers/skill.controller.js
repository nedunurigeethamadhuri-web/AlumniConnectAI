const { prisma } = require("../config/database");

const allowedLevels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

async function getMySkills(req, res) {
  try {
    const userId = req.user.userId;

    const skills = await prisma.studentSkill.findMany({
      where: {
        studentId: userId,
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
      message: "Skills fetched successfully.",
      data: {
        skills,
      },
    });
  } catch (error) {
    console.error("Get skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch skills.",
    });
  }
}

async function addSkill(req, res) {
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

    const existingStudentSkill =
      await prisma.studentSkill.findUnique({
        where: {
          studentId_skillId: {
            studentId: userId,
            skillId: skill.id,
          },
        },
      });

    if (existingStudentSkill) {
      return res.status(409).json({
        success: false,
        message: "You have already added this skill.",
      });
    }

    const studentSkill = await prisma.studentSkill.create({
      data: {
        studentId: userId,
        skillId: skill.id,
        level: level || "BEGINNER",
        years: parsedYears,
      },
      include: {
        skill: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Skill added successfully.",
      data: {
        skill: studentSkill,
      },
    });
  } catch (error) {
    console.error("Add skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add skill.",
    });
  }
}

async function updateSkill(req, res) {
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
      await prisma.studentSkill.findFirst({
        where: {
          id: skillId,
          studentId: userId,
        },
      });

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    const updatedSkill =
      await prisma.studentSkill.update({
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
      message: "Skill updated successfully.",
      data: {
        skill: updatedSkill,
      },
    });
  } catch (error) {
    console.error("Update skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update skill.",
    });
  }
}

async function deleteSkill(req, res) {
  try {
    const userId = req.user.userId;
    const { skillId } = req.params;

    const existingSkill =
      await prisma.studentSkill.findFirst({
        where: {
          id: skillId,
          studentId: userId,
        },
      });

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    await prisma.studentSkill.delete({
      where: {
        id: skillId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Skill removed successfully.",
    });
  } catch (error) {
    console.error("Delete skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove skill.",
    });
  }
}

module.exports = {
  getMySkills,
  addSkill,
  updateSkill,
  deleteSkill,
};
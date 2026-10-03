const { prisma } = require("../config/database");

/**
 * Calculate how well a student's skills match an alumni's skills.
 * Returns a score between 0 and 100.
 */
function calculateSkillMatch(studentSkills, alumniSkills) {
  if (!studentSkills.length || !alumniSkills.length) {
    return 0;
  }

  const alumniSkillMap = new Map(
    alumniSkills.map((item) => [
      item.skill.name.trim().toLowerCase(),
      item.level,
    ])
  );

  let matchedSkills = 0;
  let totalScore = 0;

  const levelScore = {
    BEGINNER: 0.35,
    INTERMEDIATE: 0.6,
    ADVANCED: 0.8,
    EXPERT: 1,
  };

  for (const studentSkill of studentSkills) {
    const skillName = studentSkill.skill.name.trim().toLowerCase();

    if (alumniSkillMap.has(skillName)) {
      matchedSkills++;

      const alumniLevel = alumniSkillMap.get(skillName);

      totalScore += levelScore[alumniLevel] || 0.5;
    }
  }

  if (matchedSkills === 0) {
    return 0;
  }

  /*
   * Skill compatibility considers:
   * - How many student skills the alumni knows
   * - The alumni's expertise level
   */
  const matchRatio = matchedSkills / studentSkills.length;
  const averageExpertise = totalScore / matchedSkills;

  return Math.round(
    (matchRatio * 0.7 + averageExpertise * 0.3) * 100
  );
}

/**
 * Calculate experience score.
 *
 * More professional experience gives a higher score,
 * with 10+ years treated as the maximum.
 */
function calculateExperienceScore(experienceYears) {
  if (!experienceYears || experienceYears <= 0) {
    return 0;
  }

  return Math.min(Math.round((experienceYears / 10) * 100), 100);
}

/**
 * Calculate how well alumni mentorship areas overlap
 * with the student's skills.
 */
function calculateMentorshipAreaMatch(studentSkills, mentorshipAreas) {
  if (!mentorshipAreas || !studentSkills.length) {
    return 0;
  }

  const areas = mentorshipAreas
    .split(",")
    .map((area) => area.trim().toLowerCase())
    .filter(Boolean);

  if (!areas.length) {
    return 0;
  }

  let matches = 0;

  for (const studentSkill of studentSkills) {
    const skillName = studentSkill.skill.name.trim().toLowerCase();

    const matched = areas.some(
      (area) =>
        area.includes(skillName) ||
        skillName.includes(area)
    );

    if (matched) {
      matches++;
    }
  }

  return Math.round((matches / studentSkills.length) * 100);
}

/**
 * Generate human-readable reasons explaining
 * why a mentor was recommended.
 */
function generateMatchReasons(
  studentSkills,
  alumni,
  skillMatch,
  mentorshipMatch
) {
  const reasons = [];

  const alumniSkillNames = new Set(
    alumni.alumniSkills.map((item) =>
      item.skill.name.trim().toLowerCase()
    )
  );

  const matchedSkillNames = studentSkills
    .filter((studentSkill) =>
      alumniSkillNames.has(
        studentSkill.skill.name.trim().toLowerCase()
      )
    )
    .map((studentSkill) => studentSkill.skill.name);

  if (matchedSkillNames.length > 0) {
    const displaySkills = matchedSkillNames
      .slice(0, 3)
      .join(", ");

    reasons.push(
      `Strong skill match in ${displaySkills}`
    );
  }

  if (skillMatch >= 70) {
    reasons.push("High technical skill compatibility");
  } else if (skillMatch >= 40) {
    reasons.push("Good technical skill compatibility");
  }

  if (alumni.alumniProfile?.experienceYears) {
    const years = alumni.alumniProfile.experienceYears;

    if (years >= 5) {
      reasons.push(`${years}+ years of professional experience`);
    } else if (years >= 2) {
      reasons.push(`${years} years of professional experience`);
    }
  }

  if (mentorshipMatch >= 50) {
    reasons.push("Mentorship areas align with your skills");
  }

  if (
    reasons.length === 0 &&
    alumni.alumniProfile?.mentorshipAreas
  ) {
    reasons.push("Mentorship areas available");
  }

  return reasons.slice(0, 4);
}

/**
 * Get recommended mentors for a student.
 */
async function getRecommendedMentors(studentId) {
  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
    },
    include: {
      studentSkills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  if (student.role !== "STUDENT") {
    throw new Error(
      "Only students can receive mentor recommendations."
    );
  }

  const alumni = await prisma.user.findMany({
    where: {
      role: "ALUMNI",
      status: "ACTIVE",
      id: {
        not: studentId,
      },
    },
    include: {
      alumniProfile: true,
      alumniSkills: {
        include: {
          skill: true,
        },
      },
    },
  });

  const recommendations = alumni.map((alumniUser) => {
    const skillMatch = calculateSkillMatch(
      student.studentSkills,
      alumniUser.alumniSkills
    );

    const experienceScore = calculateExperienceScore(
      alumniUser.alumniProfile?.experienceYears
    );

    const mentorshipMatch = calculateMentorshipAreaMatch(
      student.studentSkills,
      alumniUser.alumniProfile?.mentorshipAreas
    );

    /*
     * Current foundation scoring:
     *
     * Skill compatibility      → 70%
     * Experience               → 20%
     * Mentorship area match    → 10%
     */
    const finalScore = Math.round(
      skillMatch * 0.7 +
        experienceScore * 0.2 +
        mentorshipMatch * 0.1
    );

    const reasons = generateMatchReasons(
      student.studentSkills,
      alumniUser,
      skillMatch,
      mentorshipMatch
    );

    return {
      alumniId: alumniUser.id,

      name: `${alumniUser.firstName} ${
        alumniUser.lastName || ""
      }`.trim(),

      email: alumniUser.email,

      profileImage: alumniUser.profileImage,

      location: alumniUser.location,

      company:
        alumniUser.alumniProfile?.company || null,

      designation:
        alumniUser.alumniProfile?.designation || null,

      industry:
        alumniUser.alumniProfile?.industry || null,

      experienceYears:
        alumniUser.alumniProfile?.experienceYears || 0,

      bio: alumniUser.alumniProfile?.bio || null,

      mentorshipAreas:
        alumniUser.alumniProfile?.mentorshipAreas || null,

      availability:
        alumniUser.alumniProfile?.availability || null,

      githubUrl:
        alumniUser.alumniProfile?.githubUrl || null,

      linkedinUrl:
        alumniUser.alumniProfile?.linkedinUrl || null,

      portfolioUrl:
        alumniUser.alumniProfile?.portfolioUrl || null,

      matchScore: finalScore,

      matchBreakdown: {
        skillMatch,
        experienceScore,
        mentorshipMatch,
      },

      reasons,

      matchedSkills: student.studentSkills
        .filter((studentSkill) =>
          alumniUser.alumniSkills.some(
            (alumniSkill) =>
              alumniSkill.skill.name.trim().toLowerCase() ===
              studentSkill.skill.name.trim().toLowerCase()
          )
        )
        .map((studentSkill) => studentSkill.skill.name),
    };
  });

  /*
   * Highest matching mentors appear first.
   */
  recommendations.sort(
    (a, b) => b.matchScore - a.matchScore
  );

  return recommendations;
}

module.exports = {
  getRecommendedMentors,
};
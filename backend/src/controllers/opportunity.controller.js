const { prisma } = require("../config/database");

const getCurrentUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.userId ||
    req.userId ||
    null
  );
};

/* =========================
   GET ALL OPPORTUNITIES
========================= */
const getOpportunities = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    const {
      search,
      type,
      mode,
      location,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 12, 1),
      50
    );

    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      isActive: true,
    };

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (mode && mode !== "ALL") {
      where.mode = mode;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          company: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          organization: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          skills: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        orderBy: [
          {
            deadline: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: limitNumber,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          savedBy: userId
            ? {
                where: {
                  userId,
                },
                select: {
                  id: true,
                },
              }
            : false,
        },
      }),

      prisma.opportunity.count({
        where,
      }),
    ]);

    const formattedOpportunities = opportunities.map(
      (opportunity) => ({
        ...opportunity,
        isSaved:
          Array.isArray(opportunity.savedBy) &&
          opportunity.savedBy.length > 0,
        savedBy: undefined,
      })
    );

    return res.status(200).json({
      success: true,
      message: "Opportunities fetched successfully.",
      data: {
        opportunities: formattedOpportunities,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (error) {
    console.error("Get opportunities error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load opportunities.",
    });
  }
};


/* =========================
   GET SINGLE OPPORTUNITY
========================= */
const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getCurrentUserId(req);

    const opportunity = await prisma.opportunity.findUnique({
      where: {
        id,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        savedBy: userId
          ? {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Opportunity fetched successfully.",
      data: {
        opportunity: {
          ...opportunity,
          isSaved:
            Array.isArray(opportunity.savedBy) &&
            opportunity.savedBy.length > 0,
          savedBy: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Get opportunity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load opportunity.",
    });
  }
};


/* =========================
   CREATE OPPORTUNITY
========================= */
const createOpportunity = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      title,
      description,
      company,
      organization,
      type,
      mode,
      location,
      skills,
      salary,
      stipend,
      deadline,
      applicationUrl,
      imageUrl,
    } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description and opportunity type are required.",
      });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        company: company?.trim() || null,
        organization: organization?.trim() || null,
        type,
        mode: mode || "REMOTE",
        location: location?.trim() || null,
        skills: skills?.trim() || null,
        salary: salary?.trim() || null,
        stipend: stipend?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        applicationUrl: applicationUrl?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        createdBy: userId,
      },
      include: {
        creator: {
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
      message: "Opportunity created successfully.",
      data: {
        opportunity,
      },
    });
  } catch (error) {
    console.error("Create opportunity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create opportunity.",
    });
  }
};


/* =========================
   UPDATE OPPORTUNITY
========================= */
const updateOpportunity = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    const existingOpportunity =
      await prisma.opportunity.findUnique({
        where: {
          id,
        },
      });

    if (!existingOpportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found.",
      });
    }

    if (existingOpportunity.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this opportunity.",
      });
    }

    const {
      title,
      description,
      company,
      organization,
      type,
      mode,
      location,
      skills,
      salary,
      stipend,
      deadline,
      applicationUrl,
      imageUrl,
      isActive,
    } = req.body;

    const opportunity =
      await prisma.opportunity.update({
        where: {
          id,
        },
        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),

          ...(description !== undefined && {
            description: description.trim(),
          }),

          ...(company !== undefined && {
            company: company?.trim() || null,
          }),

          ...(organization !== undefined && {
            organization:
              organization?.trim() || null,
          }),

          ...(type !== undefined && {
            type,
          }),

          ...(mode !== undefined && {
            mode,
          }),

          ...(location !== undefined && {
            location: location?.trim() || null,
          }),

          ...(skills !== undefined && {
            skills: skills?.trim() || null,
          }),

          ...(salary !== undefined && {
            salary: salary?.trim() || null,
          }),

          ...(stipend !== undefined && {
            stipend: stipend?.trim() || null,
          }),

          ...(deadline !== undefined && {
            deadline: deadline
              ? new Date(deadline)
              : null,
          }),

          ...(applicationUrl !== undefined && {
            applicationUrl:
              applicationUrl?.trim() || null,
          }),

          ...(imageUrl !== undefined && {
            imageUrl: imageUrl?.trim() || null,
          }),

          ...(isActive !== undefined && {
            isActive: Boolean(isActive),
          }),
        },
      });

    return res.status(200).json({
      success: true,
      message: "Opportunity updated successfully.",
      data: {
        opportunity,
      },
    });
  } catch (error) {
    console.error("Update opportunity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update opportunity.",
    });
  }
};


/* =========================
   DELETE OPPORTUNITY
========================= */
const deleteOpportunity = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id,
        },
      });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found.",
      });
    }

    if (opportunity.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this opportunity.",
      });
    }

    await prisma.opportunity.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully.",
    });
  } catch (error) {
    console.error("Delete opportunity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete opportunity.",
    });
  }
};


/* =========================
   SAVE / UNSAVE OPPORTUNITY
========================= */
const toggleBookmark = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id,
        },
      });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found.",
      });
    }

    const existingBookmark =
      await prisma.opportunityBookmark.findUnique({
        where: {
          userId_opportunityId: {
            userId,
            opportunityId: id,
          },
        },
      });

    if (existingBookmark) {
      await prisma.opportunityBookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Opportunity removed from saved list.",
        data: {
          isSaved: false,
        },
      });
    }

    await prisma.opportunityBookmark.create({
      data: {
        userId,
        opportunityId: id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Opportunity saved successfully.",
      data: {
        isSaved: true,
      },
    });
  } catch (error) {
    console.error("Toggle bookmark error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update saved opportunity.",
    });
  }
};


/* =========================
   GET SAVED OPPORTUNITIES
========================= */
const getSavedOpportunities = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const bookmarks =
      await prisma.opportunityBookmark.findMany({
        where: {
          userId,
          opportunity: {
            isActive: true,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          opportunity: {
            include: {
              creator: {
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

    const opportunities = bookmarks.map(
      (bookmark) => ({
        ...bookmark.opportunity,
        isSaved: true,
      })
    );

    return res.status(200).json({
      success: true,
      message: "Saved opportunities fetched successfully.",
      data: {
        opportunities,
        total: opportunities.length,
      },
    });
  } catch (error) {
    console.error(
      "Get saved opportunities error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load saved opportunities.",
    });
  }
};


/* =========================
   EXPORTS
========================= */
module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  toggleBookmark,
  getSavedOpportunities,
};
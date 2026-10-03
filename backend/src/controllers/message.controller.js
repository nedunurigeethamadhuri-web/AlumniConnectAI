const { prisma } = require("../config/database");
const getCurrentUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.userId ||
    req.userId ||
    null
  );
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    location: user.location,
    studentProfile: user.studentProfile
      ? {
          college: user.studentProfile.college,
          degree: user.studentProfile.degree,
          branch: user.studentProfile.branch,
          graduationYear:
            user.studentProfile.graduationYear,
          careerGoal: user.studentProfile.careerGoal,
        }
      : null,
    alumniProfile: user.alumniProfile
      ? {
          company: user.alumniProfile.company,
          designation:
            user.alumniProfile.designation,
          industry: user.alumniProfile.industry,
          experienceYears:
            user.alumniProfile.experienceYears,
          mentorshipAreas:
            user.alumniProfile.mentorshipAreas,
        }
      : null,
  };
};

const getUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  profileImage: true,
  location: true,
  studentProfile: {
    select: {
      college: true,
      degree: true,
      branch: true,
      graduationYear: true,
      careerGoal: true,
    },
  },
  alumniProfile: {
    select: {
      company: true,
      designation: true,
      industry: true,
      experienceYears: true,
      mentorshipAreas: true,
    },
  },
};

const getConversations = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
          },
          {
            receiverId: currentUserId,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: {
          select: getUserSelect,
        },
        receiver: {
          select: getUserSelect,
        },
      },
    });

    const conversationMap = new Map();

    for (const message of messages) {
      const otherUser =
        message.senderId === currentUserId
          ? message.receiver
          : message.sender;

      if (!otherUser) {
        continue;
      }

      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          user: sanitizeUser(otherUser),
          lastMessage: {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            isRead: message.isRead,
            createdAt: message.createdAt,
          },
          unreadCount: 0,
        });
      }

      if (
        message.receiverId === currentUserId &&
        !message.isRead
      ) {
        const conversation =
          conversationMap.get(otherUser.id);

        conversation.unreadCount += 1;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        conversations: Array.from(
          conversationMap.values()
        ),
        total: conversationMap.size,
      },
    });
  } catch (error) {
    console.error(
      "Unable to load conversations:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load conversations.",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);
    const { userId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot start a conversation with yourself.",
      });
    }

    const otherUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: getUserSelect,
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: userId,
          },
          {
            senderId: userId,
            receiverId: currentUserId,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: getUserSelect,
        },
        receiver: {
          select: getUserSelect,
        },
      },
    });

    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(otherUser),
        messages,
        total: messages.length,
      },
    });
  } catch (error) {
    console.error(
      "Unable to load messages:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load messages.",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);
    const { receiverId, content } = req.body;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    if (currentUserId === receiverId) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot send a message to yourself.",
      });
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message content is required.",
      });
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 5000) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot exceed 5000 characters.",
      });
    }

    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
      select: {
        id: true,
        status: true,
        role: true,
      },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found.",
      });
    }

    if (receiver.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message:
          "You cannot message an inactive or suspended user.",
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId: currentUserId,
        receiverId,
        content: trimmedContent,
      },
      include: {
        sender: {
          select: getUserSelect,
        },
        receiver: {
          select: getUserSelect,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: {
        message,
      },
    });
  } catch (error) {
    console.error(
      "Unable to send message:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to send message.",
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);
    const { userId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const result =
      await prisma.message.updateMany({
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Messages marked as read successfully.",
      data: {
        updatedCount: result.count,
      },
    });
  } catch (error) {
    console.error(
      "Unable to mark messages as read:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to mark messages as read.",
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const unreadCount =
      await prisma.message.count({
        where: {
          receiverId: currentUserId,
          isRead: false,
        },
      });

    return res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    console.error(
      "Unable to load unread message count:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load unread message count.",
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!search) {
      return res.status(200).json({
        success: true,
        data: {
          users: [],
          total: 0,
        },
      });
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
        status: "ACTIVE",
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      select: getUserSelect,
      orderBy: {
        firstName: "asc",
      },
      take: 20,
    });

    return res.status(200).json({
      success: true,
      data: {
        users: users.map(sanitizeUser),
        total: users.length,
      },
    });
  } catch (error) {
    console.error(
      "Unable to search users:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to search users.",
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  searchUsers,
};
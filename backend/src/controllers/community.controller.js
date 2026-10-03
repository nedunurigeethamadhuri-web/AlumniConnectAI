const { prisma } = require("../config/database");

const getCurrentUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.userId ||
    req.userId ||
    null
  );
};

// GET ALL COMMUNITY POSTS
async function getPosts(req, res) {
  try {
    const userId = getCurrentUserId(req);

    const posts = await prisma.communityPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,

      author: post.author,

      likesCount: post.likes.length,

      likedByMe: userId
        ? post.likes.some((like) => like.userId === userId)
        : false,

      commentsCount: post.comments.length,

      comments: post.comments,
    }));

    return res.status(200).json({
      success: true,
      message: "Community posts fetched successfully.",
      data: {
        posts: formattedPosts,
        total: formattedPosts.length,
      },
    });
  } catch (error) {
    console.error("Get community posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load community posts.",
    });
  }
}

// CREATE POST
async function createPost(req, res) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { content, imageUrl } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required.",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Post content cannot exceed 2000 characters.",
      });
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId: userId,
        content: content.trim(),
        imageUrl: imageUrl?.trim() || null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully.",
      data: post,
    });
  } catch (error) {
    console.error("Create community post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create post.",
    });
  }
}

// DELETE POST
async function deletePost(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const post = await prisma.communityPost.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own posts.",
      });
    }

    await prisma.communityPost.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Delete community post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete post.",
    });
  }
}

// LIKE / UNLIKE POST
async function toggleLike(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const post = await prisma.communityPost.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const existingLike = await prisma.communityLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.communityLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      const likesCount = await prisma.communityLike.count({
        where: {
          postId: id,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Post unliked.",
        data: {
          liked: false,
          likesCount,
        },
      });
    }

    await prisma.communityLike.create({
      data: {
        postId: id,
        userId,
      },
    });

    const likesCount = await prisma.communityLike.count({
      where: {
        postId: id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Post liked.",
      data: {
        liked: true,
        likesCount,
      },
    });
  } catch (error) {
    console.error("Toggle community like error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update like.",
    });
  }
}

// ADD COMMENT
async function addComment(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required.",
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters.",
      });
    }

    const post = await prisma.communityPost.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId: id,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: comment,
    });
  } catch (error) {
    console.error("Add community comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add comment.",
    });
  }
}

// DELETE COMMENT
async function deleteComment(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { commentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const comment = await prisma.communityComment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own comments.",
      });
    }

    await prisma.communityComment.delete({
      where: {
        id: commentId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete community comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete comment.",
    });
  }
}

module.exports = {
  getPosts,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
};
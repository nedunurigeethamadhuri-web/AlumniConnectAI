import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  Image as ImageIcon,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./CommunityPage.css";

function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [likingPost, setLikingPost] = useState(null);
  const [commentingPost, setCommentingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("accessToken");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    loadCommunity();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me", {
        headers: authHeaders,
      });

      if (response.data?.success) {
        setUser(response.data.data?.user || response.data.data);
      }
    } catch (err) {
      console.error("Unable to load current user:", err);
    }
  };

  const loadCommunity = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/community", {
        headers: authHeaders,
      });

      if (response.data?.success) {
        setPosts(response.data.data?.posts || []);
      }
    } catch (err) {
      console.error("Unable to load community:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load community posts."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await api.post(
        "/community",
        {
          content: content.trim(),
        },
        {
          headers: authHeaders,
        }
      );

      if (response.data?.success) {
        setContent("");
        await loadCommunity();
      }
    } catch (err) {
      console.error("Unable to create post:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create post."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      setLikingPost(postId);

      const response = await api.patch(
        `/community/${postId}/like`,
        {},
        {
          headers: authHeaders,
        }
      );

      if (response.data?.success) {
        const result = response.data.data;

        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likedByMe: result.liked,
                  likesCount: result.likesCount,
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Unable to update like:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update like."
      );
    } finally {
      setLikingPost(null);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((current) => ({
      ...current,
      [postId]: value,
    }));
  };

  const handleAddComment = async (postId) => {
    const comment = commentInputs[postId]?.trim();

    if (!comment) {
      return;
    }

    try {
      setCommentingPost(postId);

      const response = await api.post(
        `/community/${postId}/comments`,
        {
          content: comment,
        },
        {
          headers: authHeaders,
        }
      );

      if (response.data?.success) {
        const newComment = response.data.data;

        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...(post.comments || []),
                    newComment,
                  ],
                  commentsCount:
                    (post.commentsCount || 0) + 1,
                }
              : post
          )
        );

        setCommentInputs((current) => ({
          ...current,
          [postId]: "",
        }));

        setShowComments((current) => ({
          ...current,
          [postId]: true,
        }));
      }
    } catch (err) {
      console.error("Unable to add comment:", err);

      setError(
        err.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setCommentingPost(null);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPost(postId);

      const response = await api.delete(
        `/community/${postId}`,
        {
          headers: authHeaders,
        }
      );

      if (response.data?.success) {
        setPosts((currentPosts) =>
          currentPosts.filter((post) => post.id !== postId)
        );
      }
    } catch (err) {
      console.error("Unable to delete post:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete post."
      );
    } finally {
      setDeletingPost(null);
    }
  };

  const toggleComments = (postId) => {
    setShowComments((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  };

  const getInitials = (person) => {
    if (!person) {
      return "U";
    }

    const first = person.firstName?.charAt(0) || "";
    const last = person.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  const getFullName = (person) => {
    if (!person) {
      return "User";
    }

    return `${person.firstName || ""} ${
      person.lastName || ""
    }`.trim() || "User";
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const postDate = new Date(date);
    const now = new Date();

    const difference =
      Math.floor((now - postDate) / 1000);

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      return `${Math.floor(difference / 60)}m ago`;
    }

    if (difference < 86400) {
      return `${Math.floor(difference / 3600)}h ago`;
    }

    if (difference < 604800) {
      return `${Math.floor(difference / 86400)}d ago`;
    }

    return postDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="community-page">
      <header className="community-topbar">
        <div className="community-topbar-inner">
          <Link
            to="/dashboard"
            className="community-brand"
          >
            Alumni<span>Connect</span>
          </Link>

          <Link
            to="/dashboard"
            className="community-back-button"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="community-container">
        <section className="community-hero">
          <div className="community-hero-icon">
            <Users size={28} />
          </div>

          <div>
            <h1>Alumni Community</h1>
            <p>
              Connect, share knowledge, celebrate achievements,
              and learn from your alumni network.
            </p>
          </div>
        </section>

        {error && (
          <div className="community-error">
            {error}
            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        <section className="community-layout">
          <div className="community-main-column">
            <div className="create-post-card">
              <div className="create-post-user">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={getFullName(user)}
                  />
                ) : (
                  <div className="community-avatar">
                    {getInitials(user)}
                  </div>
                )}
              </div>

              <form
                className="create-post-form"
                onSubmit={handleCreatePost}
              >
                <textarea
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  placeholder="Share something with the community..."
                  maxLength={2000}
                  rows={4}
                />

                <div className="create-post-footer">
                  <div className="post-character-count">
                    {content.length}/2000
                  </div>

                  <div className="create-post-actions">
                    <button
                      type="button"
                      className="post-media-button"
                      disabled
                      title="Image sharing coming soon"
                    >
                      <ImageIcon size={18} />
                      Photo
                    </button>

                    <button
                      type="submit"
                      className="create-post-button"
                      disabled={
                        creating || !content.trim()
                      }
                    >
                      <Send size={17} />

                      {creating
                        ? "Posting..."
                        : "Post"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="community-feed-header">
              <div>
                <h2>Community Feed</h2>
                <p>
                  {posts.length}{" "}
                  {posts.length === 1 ? "post" : "posts"}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="community-loading">
                <div className="community-skeleton-card">
                  <div className="skeleton-line skeleton-avatar-line" />
                  <div className="skeleton-content">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                    <div className="skeleton-line large" />
                    <div className="skeleton-line large" />
                  </div>
                </div>

                <div className="community-skeleton-card">
                  <div className="skeleton-line skeleton-avatar-line" />
                  <div className="skeleton-content">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                    <div className="skeleton-line large" />
                  </div>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="community-empty">
                <div className="community-empty-icon">
                  <Users size={34} />
                </div>

                <h3>No posts yet</h3>

                <p>
                  Be the first to share something with
                  the AlumniConnect community.
                </p>
              </div>
            ) : (
              <div className="community-feed">
                {posts.map((post) => {
                  const isOwnPost =
                    user?.id === post.author?.id;

                  return (
                    <article
                      key={post.id}
                      className="community-post-card"
                    >
                      <div className="community-post-header">
                        <div className="post-author">
                          {post.author?.profileImage ? (
                            <img
                              src={post.author.profileImage}
                              alt={getFullName(
                                post.author
                              )}
                            />
                          ) : (
                            <div className="community-avatar">
                              {getInitials(post.author)}
                            </div>
                          )}

                          <div className="post-author-info">
                            <div className="post-author-name">
                              {getFullName(
                                post.author
                              )}
                            </div>

                            <div className="post-author-meta">
                              <span>
                                {post.author?.role ===
                                "ALUMNI"
                                  ? "Alumni"
                                  : post.author?.role ===
                                    "STUDENT"
                                  ? "Student"
                                  : "Member"}
                              </span>

                              <span>•</span>

                              <span>
                                {formatDate(
                                  post.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isOwnPost && (
                          <button
                            type="button"
                            className="post-more-button"
                            onClick={() =>
                              handleDeletePost(post.id)
                            }
                            disabled={
                              deletingPost === post.id
                            }
                            title="Delete post"
                          >
                            {deletingPost === post.id ? (
                              <span className="delete-loading">
                                ...
                              </span>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="community-post-content">
                        {post.content}
                      </div>

                      {post.imageUrl && (
                        <div className="community-post-image">
                          <img
                            src={post.imageUrl}
                            alt="Post"
                          />
                        </div>
                      )}

                      <div className="community-post-stats">
                        <span>
                          {post.likesCount || 0}{" "}
                          {post.likesCount === 1
                            ? "like"
                            : "likes"}
                        </span>

                        <span>
                          {post.commentsCount || 0}{" "}
                          {post.commentsCount === 1
                            ? "comment"
                            : "comments"}
                        </span>
                      </div>

                      <div className="community-post-actions">
                        <button
                          type="button"
                          className={`post-action-button ${
                            post.likedByMe
                              ? "liked"
                              : ""
                          }`}
                          onClick={() =>
                            handleToggleLike(post.id)
                          }
                          disabled={
                            likingPost === post.id
                          }
                        >
                          <Heart
                            size={18}
                            fill={
                              post.likedByMe
                                ? "currentColor"
                                : "none"
                          }
                          />

                          <span>Like</span>
                        </button>

                        <button
                          type="button"
                          className="post-action-button"
                          onClick={() =>
                            toggleComments(post.id)
                          }
                        >
                          <MessageCircle size={18} />

                          <span>Comment</span>
                        </button>
                      </div>

                      {showComments[post.id] && (
                        <div className="community-comments">
                          <div className="comment-form">
                            <div className="community-avatar small">
                              {getInitials(user)}
                            </div>

                            <div className="comment-input-wrapper">
                              <input
                                type="text"
                                value={
                                  commentInputs[
                                    post.id
                                  ] || ""
                                }
                                onChange={(event) =>
                                  handleCommentChange(
                                    post.id,
                                    event.target.value
                                  )
                                }
                                placeholder="Write a comment..."
                                maxLength={1000}
                                onKeyDown={(event) => {
                                  if (
                                    event.key ===
                                    "Enter"
                                  ) {
                                    event.preventDefault();
                                    handleAddComment(
                                      post.id
                                    );
                                  }
                                }}
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleAddComment(
                                    post.id
                                  )
                                }
                                disabled={
                                  commentingPost ===
                                    post.id ||
                                  !commentInputs[
                                    post.id
                                  ]?.trim()
                                }
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>

                          {post.comments?.length > 0 && (
                            <div className="comments-list">
                              {post.comments.map(
                                (comment) => (
                                  <div
                                    className="comment-item"
                                    key={comment.id}
                                  >
                                    {comment.user
                                      ?.profileImage ? (
                                      <img
                                        src={
                                          comment.user
                                            .profileImage
                                        }
                                        alt={getFullName(
                                          comment.user
                                        )}
                                      />
                                    ) : (
                                      <div className="community-avatar small">
                                        {getInitials(
                                          comment.user
                                        )}
                                      </div>
                                    )}

                                    <div className="comment-body">
                                      <div className="comment-bubble">
                                        <div className="comment-author">
                                          {getFullName(
                                            comment.user
                                          )}
                                        </div>

                                        <div className="comment-text">
                                          {comment.content}
                                        </div>
                                      </div>

                                      <div className="comment-time">
                                        {formatDate(
                                          comment.createdAt
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="community-sidebar">
            <div className="community-info-card">
              <div className="info-card-icon">
                <Users size={22} />
              </div>

              <h3>Community Guidelines</h3>

              <ul>
                <li>Share useful knowledge and experiences.</li>
                <li>Keep conversations respectful.</li>
                <li>Help fellow students and alumni.</li>
                <li>Avoid spam and misleading content.</li>
              </ul>
            </div>

            <div className="community-info-card">
              <h3>What you can share</h3>

              <div className="community-topic">
                🎓 Career experiences
              </div>

              <div className="community-topic">
                💼 Job & internship insights
              </div>

              <div className="community-topic">
                🚀 Projects & achievements
              </div>

              <div className="community-topic">
                💡 Learning resources
              </div>

              <div className="community-topic">
                🤝 Networking opportunities
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default CommunityPage;
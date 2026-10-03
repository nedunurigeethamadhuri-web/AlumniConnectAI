import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Smile,
  UserRound,
  Users,
  X,
} from "lucide-react";
import api from "../services/api";
import "./MessagesPage.css";

function MessagesPage() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    async function loadMessagesPage() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userResponse = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUser = userResponse.data.user;
        setUser(currentUser);

        const conversationsResponse = await api.get("/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setConversations(
          conversationsResponse.data.data?.conversations || []
        );
      } catch (requestError) {
        console.error(
          "Unable to load messages:",
          requestError
        );

        setError(
          requestError.response?.data?.message ||
            "Unable to load messages."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMessagesPage();
  }, [token]);

  useEffect(() => {
    if (!selectedUser || !token) {
      setMessages([]);
      return;
    }

    async function loadConversation() {
      setMessagesLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/messages/${selectedUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(
          response.data.data?.messages || []
        );

        try {
          await api.patch(
            `/messages/${selectedUser.id}/read`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setConversations((previous) =>
            previous.map((conversation) => {
              if (
                conversation.user?.id === selectedUser.id ||
                conversation.id === selectedUser.id
              ) {
                return {
                  ...conversation,
                  unreadCount: 0,
                };
              }

              return conversation;
            })
          );
        } catch (readError) {
          console.error(
            "Unable to mark messages as read:",
            readError
          );
        }
      } catch (requestError) {
        console.error(
          "Unable to load conversation:",
          requestError
        );

        setError(
          requestError.response?.data?.message ||
            "Unable to load conversation."
        );
      } finally {
        setMessagesLoading(false);
      }
    }

    loadConversation();
  }, [selectedUser, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const conversationUser =
        conversation.user ||
        conversation.otherUser ||
        conversation;

      const name = `${conversationUser?.firstName || ""} ${
        conversationUser?.lastName || ""
      }`
        .trim()
        .toLowerCase();

      const email =
        conversationUser?.email?.toLowerCase() || "";

      return (
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch)
      );
    });
  }, [conversations, searchText]);

  function getConversationUser(conversation) {
    return (
      conversation.user ||
      conversation.otherUser ||
      conversation
    );
  }

  function getUserName(targetUser) {
    if (!targetUser) {
      return "Unknown User";
    }

    return `${targetUser.firstName || ""} ${
      targetUser.lastName || ""
    }`.trim() || "User";
  }

  function getInitials(targetUser) {
    if (!targetUser) {
      return "U";
    }

    const first =
      targetUser.firstName?.charAt(0) || "";

    const last =
      targetUser.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "U";
  }

  function getRoleLabel(targetUser) {
    if (targetUser?.role === "ALUMNI") {
      return "Alumni";
    }

    if (targetUser?.role === "STUDENT") {
      return "Student";
    }

    if (targetUser?.role === "ADMIN") {
      return "Admin";
    }

    return "Member";
  }

  function formatMessageTime(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatConversationTime(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const today = new Date();

    const sameDay =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (sameDay) {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    });
  }

  function openConversation(targetUser) {
    if (!targetUser?.id) {
      return;
    }

    setSelectedUser(targetUser);
    setMobileChatOpen(true);
    setShowMenu(false);
  }

  function closeMobileChat() {
    setMobileChatOpen(false);
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    const content = messageText.trim();

    if (!content || !selectedUser || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await api.post(
        "/messages",
        {
          receiverId: selectedUser.id,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newMessage =
        response.data.data?.message ||
        response.data.message;

      if (newMessage && typeof newMessage === "object") {
        setMessages((previous) => [
          ...previous,
          newMessage,
        ]);
      } else {
        const messagesResponse = await api.get(
          `/messages/${selectedUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(
          messagesResponse.data.data?.messages || []
        );
      }

      setMessageText("");

      const conversationsResponse = await api.get(
        "/messages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConversations(
        conversationsResponse.data.data?.conversations || []
      );
    } catch (requestError) {
      console.error(
        "Unable to send message:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  function handleSearchChange(event) {
    const value = event.target.value;

    setSearchText(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setUserSearchResults([]);
      setSearchingUsers(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(
      async () => {
        setSearchingUsers(true);

        try {
          const response = await api.get(
            "/messages/search-users",
            {
              params: {
                search: value.trim(),
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUserSearchResults(
            response.data.data?.users || []
          );
        } catch (requestError) {
          console.error(
            "Unable to search users:",
            requestError
          );

          setUserSearchResults([]);
        } finally {
          setSearchingUsers(false);
        }
      },
      350
    );
  }

  function handleSearchUserSelect(targetUser) {
    openConversation(targetUser);
    setSearchText("");
    setUserSearchResults([]);
  }

  function isOwnMessage(message) {
    return (
      message.senderId === user?.id ||
      message.sender?.id === user?.id
    );
  }

  if (loading) {
    return (
      <div className="messages-loading-page">
        <div className="messages-loading-spinner"></div>
        <p>Loading your messages...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const totalUnread = conversations.reduce(
    (total, conversation) =>
      total + Number(conversation.unreadCount || 0),
    0
  );

  return (
    <div className="messages-page">
      <aside className="messages-sidebar">

        {/* BACK TO DASHBOARD */}
        <div className="messages-dashboard-back">
          <Link to="/dashboard" className="messages-back-link">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>

        <div className="messages-brand-row">
          <Link to="/dashboard" className="messages-brand">
            Alumni<span>Connect</span>
          </Link>
        </div>

        <div className="messages-sidebar-heading">
          <div>
            <span>NETWORK</span>
            <h1>Messages</h1>
          </div>

          <div className="messages-total-badge">
            <MessageCircle size={15} />
            {totalUnread > 0 ? totalUnread : "0"}
          </div>
        </div>

        <div className="messages-search-wrapper">
          <Search size={18} />

          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search people..."
          />

          {searchText && (
            <button
              type="button"
              className="clear-search-button"
              onClick={() => {
                setSearchText("");
                setUserSearchResults([]);
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {searchText.trim() && (
          <div className="message-user-search-results">
            {searchingUsers ? (
              <div className="search-result-status">
                Searching...
              </div>
            ) : userSearchResults.length > 0 ? (
              userSearchResults.map((searchUser) => (
                <button
                  type="button"
                  className="search-user-result"
                  key={searchUser.id}
                  onClick={() =>
                    handleSearchUserSelect(searchUser)
                  }
                >
                  <div className="message-avatar small-avatar">
                    {getInitials(searchUser)}
                  </div>

                  <div>
                    <strong>
                      {getUserName(searchUser)}
                    </strong>

                    <span>
                      {getRoleLabel(searchUser)}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="search-result-status">
                No users found
              </div>
            )}
          </div>
        )}

        <div className="conversation-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const conversationUser =
                getConversationUser(conversation);

              const isSelected =
                selectedUser?.id === conversationUser?.id;

              return (
                <button
                  type="button"
                  className={
                    isSelected
                      ? "conversation-item active"
                      : "conversation-item"
                  }
                  key={conversationUser?.id}
                  onClick={() =>
                    openConversation(conversationUser)
                  }
                >
                  <div className="message-avatar">
                    {getInitials(conversationUser)}
                  </div>

                  <div className="conversation-content">
                    <div className="conversation-top">
                      <strong>
                        {getUserName(conversationUser)}
                      </strong>

                      <span>
                        {formatConversationTime(
                          conversation.lastMessage?.createdAt ||
                            conversation.updatedAt ||
                            conversation.createdAt
                        )}
                      </span>
                    </div>

                    <div className="conversation-bottom">
                      <p>
                        {conversation.lastMessage?.content ||
                          conversation.lastMessage ||
                          "Start a conversation"}
                      </p>

                      {Number(
                        conversation.unreadCount || 0
                      ) > 0 && (
                        <span className="unread-count">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="empty-conversations">
              <div className="empty-message-icon">
                <MessageCircle size={25} />
              </div>

              <h3>No conversations yet</h3>

              <p>
                Search for a student or alumni to start
                a meaningful conversation.
              </p>
            </div>
          )}
        </div>

        <div className="messages-sidebar-bottom">
          <Link to="/dashboard">
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      <main
        className={
          mobileChatOpen
            ? "messages-chat-area mobile-open"
            : "messages-chat-area"
        }
      >
        {selectedUser ? (
          <>
            <header className="chat-header">
              <button
                type="button"
                className="mobile-back-button"
                onClick={closeMobileChat}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="chat-user">
                <div className="message-avatar chat-avatar">
                  {getInitials(selectedUser)}
                </div>

                <div>
                  <h2>{getUserName(selectedUser)}</h2>

                  <div className="chat-user-meta">
                    <span className="online-dot"></span>
                    {getRoleLabel(selectedUser)}
                  </div>
                </div>
              </div>

              <div className="chat-header-actions">
                <Link
                  to={`/profile?userId=${selectedUser.id}`}
                  className="chat-header-button"
                  aria-label="View profile"
                >
                  <UserRound size={18} />
                </Link>

                <button
                  type="button"
                  className="chat-header-button"
                  onClick={() =>
                    setShowMenu((previous) => !previous)
                  }
                  aria-label="More options"
                >
                  <MoreVertical size={19} />
                </button>

                {showMenu && (
                  <div className="chat-options-menu">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                      }}
                    >
                      Conversation info
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                      }}
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>
            </header>

            <div className="chat-body">
              <div className="conversation-intro">
                <div className="conversation-intro-avatar">
                  {getInitials(selectedUser)}
                </div>

                <h3>
                  {getUserName(selectedUser)}
                </h3>

                <p>
                  {getRoleLabel(selectedUser)} on
                  AlumniConnect
                </p>

                <span>
                  Start your professional conversation
                </span>
              </div>

              {messagesLoading ? (
                <div className="conversation-loading">
                  <div className="conversation-spinner"></div>
                  <p>Loading conversation...</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="messages-list">
                  {messages.map((message) => {
                    const ownMessage =
                      isOwnMessage(message);

                    return (
                      <div
                        key={message.id}
                        className={
                          ownMessage
                            ? "message-row own"
                            : "message-row"
                        }
                      >
                        {!ownMessage && (
                          <div className="message-avatar message-list-avatar">
                            {getInitials(
                              message.sender ||
                                selectedUser
                            )}
                          </div>
                        )}

                        <div className="message-bubble-wrapper">
                          <div className="message-bubble">
                            {message.content}
                          </div>

                          <div className="message-meta">
                            <span>
                              {formatMessageTime(
                                message.createdAt
                              )}
                            </span>

                            {ownMessage &&
                              (message.isRead ? (
                                <CheckCheck
                                  size={14}
                                  className="message-read"
                                />
                              ) : (
                                <Check size={14} />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef}></div>
                </div>
              ) : (
                <div className="empty-chat-state">
                  <div className="empty-chat-icon">
                    <MessageCircle size={30} />
                  </div>

                  <h3>Start the conversation</h3>

                  <p>
                    Say hello and begin building a
                    professional connection.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="message-error">
                {error}
              </div>
            )}

            <form
              className="message-composer"
              onSubmit={handleSendMessage}
            >
              <button
                type="button"
                className="composer-icon"
                aria-label="Attach file"
              >
                <Paperclip size={19} />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                placeholder={`Message ${getUserName(
                  selectedUser
                )}...`}
                disabled={sending}
              />

              <button
                type="button"
                className="composer-icon desktop-only"
                aria-label="Add emoji"
              >
                <Smile size={19} />
              </button>

              <button
                type="submit"
                className="send-message-button"
                disabled={
                  !messageText.trim() || sending
                }
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-illustration">
              <MessageCircle size={40} />
            </div>

            <h2>Your conversations</h2>

            <p>
              Select a conversation from the left or
              search for a student or alumni to start
              messaging.
            </p>

            <div className="no-chat-features">
              <div>
                <Users size={17} />
                Connect with alumni
              </div>

              <div>
                <MessageCircle size={17} />
                Discuss career goals
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MessagesPage;
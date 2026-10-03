import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Lock,
  LogOut,
  Moon,
  Shield,
  Sun,
  User,
} from "lucide-react";
import api from "../services/api";
import "./SettingsPage.css";

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem(
      "alumniConnectSettings"
    );

    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch {
        return {
          emailNotifications: true,
          mentorshipNotifications: true,
          opportunityNotifications: true,
          messageNotifications: true,
          profileVisibility: true,
          darkMode: false,
        };
      }
    }

    return {
      emailNotifications: true,
      mentorshipNotifications: true,
      opportunityNotifications: true,
      messageNotifications: true,
      profileVisibility: true,
      darkMode: false,
    };
  });

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error("Unable to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  useEffect(() => {
    localStorage.setItem(
      "alumniConnectSettings",
      JSON.stringify(settings)
    );

    document.body.classList.toggle(
      "settings-dark-mode",
      settings.darkMode
    );
  }, [settings]);

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    window.location.href = "/login";
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="settings-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  const firstName = user?.firstName || "User";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = firstName.charAt(0).toUpperCase();
  const role =
    user?.role === "ALUMNI" ? "Alumni" : "Student";

  return (
    <div
      className={
        settings.darkMode
          ? "settings-page settings-page-dark"
          : "settings-page"
      }
    >
      <div className="settings-container">

        {/* HEADER */}

        <header className="settings-header">
          <div>
            <Link
              to="/dashboard"
              className="settings-back-link"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <div className="settings-title-block">
              <div className="settings-title-icon">
                <Shield size={22} />
              </div>

              <div>
                <span>ACCOUNT & PREFERENCES</span>
                <h1>Settings</h1>
                <p>
                  Manage your account, notifications and
                  privacy preferences.
                </p>
              </div>
            </div>
          </div>

          {saved && (
            <div className="settings-saved">
              <Check size={16} />
              Saved
            </div>
          )}
        </header>

        {/* CONTENT */}

        <main className="settings-content">

          {/* PROFILE */}

          <section className="settings-section">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <User size={19} />
              </div>

              <div>
                <h2>Profile</h2>
                <p>
                  Your basic AlumniConnect account information.
                </p>
              </div>
            </div>

            <div className="settings-profile-card">
              <div className="settings-avatar">
                {initials}
              </div>

              <div className="settings-profile-info">
                <strong>{fullName}</strong>
                <span>{user?.email}</span>
                <small>{role}</small>
              </div>

              <Link
                to="/profile"
                className="settings-outline-button"
              >
                Edit Profile
                <ChevronRight size={16} />
              </Link>
            </div>
          </section>

          {/* NOTIFICATIONS */}

          <section className="settings-section">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <Bell size={19} />
              </div>

              <div>
                <h2>Notifications</h2>
                <p>
                  Choose what notifications you want to receive.
                </p>
              </div>
            </div>

            <div className="settings-options">

              <div className="settings-option">
                <div>
                  <strong>Email notifications</strong>
                  <span>
                    Receive important updates through email.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.emailNotifications
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "emailNotifications",
                      !settings.emailNotifications
                    )
                  }
                >
                  <span></span>
                </button>
              </div>

              <div className="settings-option">
                <div>
                  <strong>Mentorship notifications</strong>
                  <span>
                    Get updates about mentorship requests
                    and sessions.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.mentorshipNotifications
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "mentorshipNotifications",
                      !settings.mentorshipNotifications
                    )
                  }
                >
                  <span></span>
                </button>
              </div>

              <div className="settings-option">
                <div>
                  <strong>Opportunity alerts</strong>
                  <span>
                    Receive notifications about new career
                    opportunities.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.opportunityNotifications
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "opportunityNotifications",
                      !settings.opportunityNotifications
                    )
                  }
                >
                  <span></span>
                </button>
              </div>

              <div className="settings-option">
                <div>
                  <strong>Message notifications</strong>
                  <span>
                    Get notified when someone sends you a
                    message.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.messageNotifications
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "messageNotifications",
                      !settings.messageNotifications
                    )
                  }
                >
                  <span></span>
                </button>
              </div>

            </div>
          </section>

          {/* PRIVACY */}

          <section className="settings-section">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <Lock size={19} />
              </div>

              <div>
                <h2>Privacy</h2>
                <p>
                  Control how other users can discover you.
                </p>
              </div>
            </div>

            <div className="settings-options">

              <div className="settings-option">
                <div>
                  <strong>Profile visibility</strong>
                  <span>
                    Allow other students and alumni to find
                    your profile.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.profileVisibility
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "profileVisibility",
                      !settings.profileVisibility
                    )
                  }
                >
                  <span></span>
                </button>
              </div>

            </div>
          </section>

          {/* APPEARANCE */}

          <section className="settings-section">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                {settings.darkMode ? (
                  <Moon size={19} />
                ) : (
                  <Sun size={19} />
                )}
              </div>

              <div>
                <h2>Appearance</h2>
                <p>
                  Customize the appearance of your
                  AlumniConnect workspace.
                </p>
              </div>
            </div>

            <div className="appearance-card">

              <div className="appearance-option">
                <div className="appearance-icon">
                  <Sun size={18} />
                </div>

                <div>
                  <strong>Light mode</strong>
                  <span>
                    Clean and bright interface
                  </span>
                </div>

                {!settings.darkMode && (
                  <Check
                    size={18}
                    className="appearance-check"
                  />
                )}
              </div>

              <div
                className="appearance-option"
                onClick={() =>
                  updateSetting(
                    "darkMode",
                    !settings.darkMode
                  )
                }
              >
                <div className="appearance-icon">
                  <Moon size={18} />
                </div>

                <div>
                  <strong>Dark mode</strong>
                  <span>
                    Comfortable interface for low light
                  </span>
                </div>

                {settings.darkMode && (
                  <Check
                    size={18}
                    className="appearance-check"
                  />
                )}
              </div>

            </div>
          </section>

          {/* SECURITY */}

          <section className="settings-section">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <Lock size={19} />
              </div>

              <div>
                <h2>Security</h2>
                <p>
                  Manage your account security.
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              className="security-action"
            >
              <div>
                <strong>Account security</strong>
                <span>
                  Password and account information
                </span>
              </div>

              <ChevronRight size={18} />
            </Link>
          </section>

          {/* LOGOUT */}

          <section className="settings-danger-section">
            <div>
              <h2>Sign out</h2>
              <p>
                Sign out of your AlumniConnect account on
                this device.
              </p>
            </div>

            <button
              type="button"
              className="settings-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </section>

        </main>
      </div>
    </div>
  );
}

export default SettingsPage;
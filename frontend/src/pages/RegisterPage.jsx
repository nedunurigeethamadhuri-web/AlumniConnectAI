import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
} from "lucide-react";
import api from "../services/api";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);

      const { user, accessToken, refreshToken } =
        response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to create your account.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page register-page">
      <div className="auth-brand-panel">
        <Link to="/" className="auth-logo">
          Alumni<span>Connect</span>
        </Link>

        <div className="brand-content">
          <div className="brand-badge">BUILD YOUR FUTURE</div>

          <h1>
            One platform.
            <span> Endless possibilities.</span>
          </h1>

          <p>
            Whether you are building your first career or sharing
            years of experience, AlumniConnect helps you create
            meaningful professional connections.
          </p>

          <div className="role-preview">
            <div className="role-preview-card">
              <GraduationCap size={22} />

              <div>
                <strong>Students</strong>
                <span>Learn • Connect • Grow</span>
              </div>
            </div>

            <div className="role-preview-card">
              <Users size={22} />

              <div>
                <strong>Alumni</strong>
                <span>Guide • Mentor • Inspire</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container register-container">
          <Link to="/" className="mobile-auth-logo">
            Alumni<span>Connect</span>
          </Link>

          <div className="auth-heading">
            <h2>Create your account</h2>

            <p>
              Start building your professional network today.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="name-grid">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Geetha"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last name</label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Madhuri"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="registerEmail">
                Email address
              </label>

              <input
                id="registerEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Choose your role</label>

              <div className="role-grid">
                <button
                  type="button"
                  className={
                    formData.role === "STUDENT"
                      ? "role-option active"
                      : "role-option"
                  }
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,
                      role: "STUDENT",
                    }))
                  }
                >
                  <GraduationCap size={20} />

                  <span>
                    <strong>Student</strong>
                    <small>Looking for guidance</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    formData.role === "ALUMNI"
                      ? "role-option active"
                      : "role-option"
                  }
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,
                      role: "ALUMNI",
                    }))
                  }
                >
                  <Users size={20} />

                  <span>
                    <strong>Alumni</strong>
                    <small>Ready to mentor</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="registerPassword">
                Password
              </label>

              <div className="password-input">
                <input
                  id="registerPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="create-account">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
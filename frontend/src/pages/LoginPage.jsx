import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import api from "../services/api";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <Link to="/" className="auth-logo">
          Alumni<span>Connect</span>
        </Link>

        <div className="brand-content">
          <div className="brand-badge">AI-POWERED NETWORKING</div>

          <h1>
            Your career journey
            <span> starts with a connection.</span>
          </h1>

          <p>
            Connect with experienced alumni, discover opportunities
            and build a personalized path towards your career goals.
          </p>

          <div className="brand-points">
            <div>
              <span>✓</span>
              Intelligent mentor matching
            </div>

            <div>
              <span>✓</span>
              Personalized career guidance
            </div>

            <div>
              <span>✓</span>
              Professional alumni community
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container">
          <Link to="/" className="mobile-auth-logo">
            Alumni<span>Connect</span>
          </Link>

          <div className="auth-heading">
            <div className="auth-icon">
              <ShieldCheck size={23} />
            </div>

            <h2>Welcome back</h2>

            <p>
              Sign in to continue your career journey.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>
                <button type="button">
                  Forgot password?
                </button>
              </div>

              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
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
              {loading ? "Signing in..." : "Sign in"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to AlumniConnect?</span>
          </div>

          <Link to="/register" className="create-account">
            Create your account
          </Link>

          <p className="auth-footer-text">
            By continuing, you agree to our Terms of Service
            and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const skillRoutes = require("./routes/skill.routes");
const alumniRoutes = require("./routes/alumni.routes");
const alumniSkillRoutes = require("./routes/alumniSkill.routes");
const mentorRoutes = require("./routes/mentor.routes");
const mentorshipRequestRoutes = require("./routes/mentorshipRequest.routes");
const menteesRoutes = require("./routes/mentees.routes");
const mentorshipSessionRoutes = require("./routes/mentorshipSession.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const mentorshipAnalyticsRoutes = require("./routes/mentorshipAnalytics.routes");
const messageRoutes = require("./routes/message.routes");
const opportunityRoutes = require("./routes/opportunity.routes");
const communityRoutes = require("./routes/community.routes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5174",
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "AlumniConnect AI backend is running successfully!",
    timestamp: new Date().toISOString(),
    environment:
      process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/skills", skillRoutes);
app.use(
  "/api/alumni/skills",
  alumniSkillRoutes
);
app.use("/api/alumni", alumniRoutes);
app.use("/api/alumni", mentorRoutes);

// Mentorship Requests
app.use(
  "/api/mentorship",
  mentorshipRequestRoutes
);

// Mentees
app.use("/api/mentees", menteesRoutes);

app.use(
  "/api/sessions",
  mentorshipSessionRoutes
);

app.use("/api/feedback", feedbackRoutes);

app.use(
  "/api/mentorship-analytics",
  mentorshipAnalyticsRoutes
);

// Messages
app.use("/api/messages", messageRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/community", communityRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Welcome to AlumniConnect AI API",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      err.message ||
      "Internal server error",
  });
});

module.exports = app;
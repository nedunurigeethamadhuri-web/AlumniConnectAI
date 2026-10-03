import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Code2,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  PlayCircle,
  Rocket,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./CareerRoadmapPage.css";

const learningSteps = [
  {
    number: "01",
    title: "Strengthen Java & Programming",
    description:
      "Build strong programming fundamentals and object-oriented programming skills.",
    skills: ["Java", "OOP", "Collections"],
    progress: 82,
    status: "In Progress",
  },
  {
    number: "02",
    title: "Master Data Structures & Algorithms",
    description:
      "Improve problem-solving skills with arrays, strings, trees, graphs and dynamic programming.",
    skills: ["DSA", "Problem Solving", "LeetCode"],
    progress: 68,
    status: "In Progress",
  },
  {
    number: "03",
    title: "Build Machine Learning Skills",
    description:
      "Learn machine learning algorithms and apply them through practical projects.",
    skills: ["Python", "ML", "Scikit-learn"],
    progress: 61,
    status: "In Progress",
  },
  {
    number: "04",
    title: "Build Real-World Projects",
    description:
      "Create strong projects that demonstrate your technical and problem-solving abilities.",
    skills: ["Projects", "GitHub", "Full Stack"],
    progress: 45,
    status: "Upcoming",
  },
  {
    number: "05",
    title: "Prepare for Placements",
    description:
      "Prepare for coding rounds, technical interviews, aptitude and communication rounds.",
    skills: ["Interview Prep", "SQL", "Communication"],
    progress: 25,
    status: "Upcoming",
  },
];

const skillGaps = [
  {
    name: "DSA",
    current: 68,
    target: 85,
  },
  {
    name: "Machine Learning",
    current: 61,
    target: 85,
  },
  {
    name: "SQL & DBMS",
    current: 58,
    target: 80,
  },
  {
    name: "System Design",
    current: 35,
    target: 70,
  },
];

const projects = [
  {
    icon: Brain,
    title: "AI Resume Analyzer",
    description:
      "Build an AI-based system that analyzes resumes and gives personalized improvement suggestions.",
    tags: ["Python", "AI", "NLP"],
  },
  {
    icon: Users,
    title: "Alumni Recommendation System",
    description:
      "Develop a recommendation engine that connects students with suitable alumni mentors.",
    tags: ["ML", "Recommendation", "Node.js"],
  },
  {
    icon: Code2,
    title: "Full-Stack Career Platform",
    description:
      "Build a complete platform with authentication, mentorship, opportunities and analytics.",
    tags: ["React", "Express", "PostgreSQL"],
  },
];

function CareerRoadmapPage() {
  return (
    <div className="career-roadmap-page">
      <header className="career-roadmap-topbar">
        <Link to="/dashboard" className="career-brand">
          <span className="career-brand-main">Alumni</span>
          <span className="career-brand-accent">Connect</span>
        </Link>

        <Link to="/dashboard" className="back-dashboard-link">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>
      </header>

      <main className="career-roadmap-content">
        <section className="career-hero">
          <div className="career-hero-content">
            <div className="career-eyebrow">
              <Rocket size={15} />
              AI-POWERED CAREER PLANNING
            </div>

            <h1>
              Your Personalized
              <span> Career Roadmap</span>
            </h1>

            <p>
              Follow a structured path to strengthen your skills, build
              projects, connect with mentors and prepare for your career.
            </p>

            <div className="career-goal-row">
              <div className="goal-icon">
                <Target size={21} />
              </div>

              <div>
                <span>Current Career Goal</span>
                <strong>AI / ML Engineer</strong>
              </div>
            </div>
          </div>

          <div className="career-hero-progress">
            <div className="progress-circle">
              <div className="progress-circle-inner">
                <strong>78%</strong>
                <span>Complete</span>
              </div>
            </div>

            <p>Overall roadmap progress</p>
          </div>
        </section>

        <section className="roadmap-summary-grid">
          <div className="roadmap-summary-card">
            <div className="summary-icon purple">
              <Target size={20} />
            </div>

            <div>
              <span>Career Goal</span>
              <strong>AI / ML Engineer</strong>
            </div>
          </div>

          <div className="roadmap-summary-card">
            <div className="summary-icon blue">
              <TrendingUp size={20} />
            </div>

            <div>
              <span>Current Progress</span>
              <strong>78%</strong>
            </div>
          </div>

          <div className="roadmap-summary-card">
            <div className="summary-icon green">
              <GraduationCap size={20} />
            </div>

            <div>
              <span>Skills Tracked</span>
              <strong>4 Skills</strong>
            </div>
          </div>

          <div className="roadmap-summary-card">
            <div className="summary-icon orange">
              <Briefcase size={20} />
            </div>

            <div>
              <span>Projects</span>
              <strong>3 Recommended</strong>
            </div>
          </div>
        </section>

        <div className="roadmap-main-grid">
          <section className="roadmap-learning-section">
            <div className="section-heading">
              <div>
                <span className="section-label">YOUR JOURNEY</span>
                <h2>Learning Path</h2>
                <p>
                  Follow these steps to move from your current skills towards
                  your career goal.
                </p>
              </div>

              <div className="journey-count">5 Steps</div>
            </div>

            <div className="roadmap-timeline">
              {learningSteps.map((step, index) => (
                <div className="roadmap-step" key={step.number}>
                  <div className="timeline-left">
                    <div
                      className={`step-number ${
                        step.status === "In Progress" ? "active" : ""
                      }`}
                    >
                      {step.status === "In Progress" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        step.number
                      )}
                    </div>

                    {index !== learningSteps.length - 1 && (
                      <div className="timeline-line" />
                    )}
                  </div>

                  <div className="step-card">
                    <div className="step-card-top">
                      <div>
                        <span className="step-label">STEP {step.number}</span>
                        <h3>{step.title}</h3>
                      </div>

                      <span
                        className={`step-status ${
                          step.status === "In Progress"
                            ? "status-progress"
                            : "status-upcoming"
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <p>{step.description}</p>

                    <div className="step-tags">
                      {step.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>

                    <div className="step-progress-row">
                      <div className="step-progress">
                        <div
                          className="step-progress-fill"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>

                      <strong>{step.progress}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="roadmap-sidebar">
            <section className="roadmap-side-card">
              <div className="side-card-heading">
                <div className="side-title-icon">
                  <TrendingUp size={18} />
                </div>

                <div>
                  <span>SKILL ANALYSIS</span>
                  <h3>Skill Gaps</h3>
                </div>
              </div>

              <p className="side-description">
                Focus on these areas to become more placement-ready.
              </p>

              <div className="skill-gap-list">
                {skillGaps.map((skill) => (
                  <div className="skill-gap-item" key={skill.name}>
                    <div className="skill-gap-header">
                      <span>{skill.name}</span>
                      <strong>{skill.current}%</strong>
                    </div>

                    <div className="skill-gap-bar">
                      <div
                        className="skill-gap-current"
                        style={{ width: `${skill.current}%` }}
                      />
                      <div
                        className="skill-gap-target"
                        style={{ left: `${skill.target}%` }}
                      />
                    </div>

                    <small>Target: {skill.target}%</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="ai-insight-card">
              <div className="ai-insight-icon">
                <Lightbulb size={20} />
              </div>

              <span>AI CAREER INSIGHT</span>

              <h3>Build before you apply</h3>

              <p>
                Completing 2 strong projects and improving DSA can strengthen
                your technical profile for upcoming opportunities.
              </p>

              <Link to="/opportunities" className="insight-link">
                Explore opportunities
                <ArrowRight size={15} />
              </Link>
            </section>

            <section className="roadmap-side-card">
              <div className="side-card-heading">
                <div className="side-title-icon">
                  <Users size={18} />
                </div>

                <div>
                  <span>NETWORK</span>
                  <h3>Mentorship</h3>
                </div>
              </div>

              <p className="side-description">
                Connect with alumni who can guide you through your career
                journey.
              </p>

              <Link to="/mentors" className="side-action">
                Find mentors
                <ChevronRight size={16} />
              </Link>
            </section>
          </aside>
        </div>

        <section className="projects-section">
          <div className="section-heading">
            <div>
              <span className="section-label">BUILD YOUR PORTFOLIO</span>
              <h2>Recommended Projects</h2>
              <p>
                Practical projects can help you turn your learning into
                demonstrable skills.
              </p>
            </div>

            <Link to="/opportunities" className="view-all-link">
              View opportunities
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="projects-grid">
            {projects.map((project) => {
              const Icon = project.icon;

              return (
                <article className="project-card" key={project.title}>
                  <div className="project-icon">
                    <Icon size={21} />
                  </div>

                  <h3>{project.title}</h3>

                  <p>{project.description}</p>

                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <button type="button" className="project-action">
                    <PlayCircle size={16} />
                    Start learning
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="roadmap-bottom-cta">
          <div className="bottom-cta-icon">
            <MessageCircle size={22} />
          </div>

          <div>
            <span>NEED GUIDANCE?</span>
            <h3>Talk to an alumni mentor</h3>
            <p>
              Get practical guidance from someone who has already walked the
              path.
            </p>
          </div>

          <Link to="/mentors" className="cta-button">
            Find a Mentor
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </div>
  );
}

export default CareerRoadmapPage;
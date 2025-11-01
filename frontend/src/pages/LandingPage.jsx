import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

const LandingPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/feed");
  }, [token, navigate]);

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Welcome to LinkedInClone</h1>
        <p className="landing-subtitle">
          Connect with professionals, share your journey, and grow your network
        </p>

        <div className="landing-buttons">
          <Link to="/login" className="btn-login">
            Login
          </Link>
          <Link to="/signup" className="btn-signup">
            Sign Up
          </Link>
        </div>

        <div className="landing-features">
          <div className="feature-item">
            <div className="feature-icon">🤝</div>
            <h3 className="feature-title">Connect</h3>
            <p className="feature-desc">
              Build meaningful professional relationships
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">Share</h3>
            <p className="feature-desc">
              Post updates and showcase your work
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Grow</h3>
            <p className="feature-desc">
              Expand your professional network
            </p>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        Made with ❤️ by <span className="footer-name">Atharva Dudhe</span>
      </footer>
    </div>
  );
};

export default LandingPage;

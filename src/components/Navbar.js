import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { useAuth } from "../AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, registrationStatus, isPlayerSelected } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav>
      <img src="/vinesback.png" alt="Vines" className="nav-image" />
      <ul>
        {location.pathname !== "/" && (
          <li>
            <Link to="/">Home</Link>
          </li>
        )}
        {!user && location.pathname !== "/login" && (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
        {!user && location.pathname !== "/signup" && (
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
        )}
        {user &&
          user.role === "admin" &&
          location.pathname !== "/admin-dashboard" && (
            <li>
              <Link to="/admin-dashboard">Dashboard</Link>
            </li>
          )}
        {user &&
          user.role === "manager" &&
          location.pathname !== "/manager-dashboard" && (
            <li>
              <Link to="/manager-dashboard">Dashboard</Link>
            </li>
          )}
        {user &&
          user.role !== "admin" &&
          user.role !== "manager" &&
          location.pathname !== "/notices" && (
            <li>
              <Link to="/notices">Notice Board</Link>
            </li>
          )}
        {user &&
          user.role !== "admin" &&
          location.pathname !== "/fixtures-and-results" && (
            <li>
              <Link to="/fixtures-and-results">Fixtures and Results</Link>
            </li>
          )}
        {user &&
          user.role === "user" &&
          registrationStatus === "user" &&
          location.pathname !== "/application" && (
            <li>
              <Link to="/application">Application</Link>
            </li>
          )}
        {user &&
          user.role === "user" &&
          registrationStatus === "pending application" && (
            <li>
              <span className="pending-button">Application Pending</span>
            </li>
          )}
        {user &&
          user.role === "user" &&
          registrationStatus === "approved application" &&
          location.pathname !== "/registration" && (
            <li>
              <Link to="/registration">Registration</Link>
            </li>
          )}
        {user &&
          user.role === "user" &&
          registrationStatus === "pending registration" && (
            <li>
              <span className="pending-button">Registration Pending</span>
            </li>
          )}
        {user &&
          user.role === "user" &&
          registrationStatus === "review registration" && (
            <li>
              <Link to="/user-amend-form">Please Review</Link>
            </li>
          )}
        {user &&
          user.role === "user" &&
          registrationStatus === "registered" && (
            <li>
              <span>Registered</span>
            </li>
          )}
        {user &&
          user.role === "player" &&
          isPlayerSelected &&
          location.pathname !== "/match-briefing" && (
            <li>
              <Link to="/match-briefing">Match Briefing</Link>
            </li>
          )}
        {user && (
          <>
            <li className="welcome-message">Welcome, {user.firstName}</li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../css/ManagerDashboard.css";

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Redirect to home or login page if user is not defined
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  const goToFixtures = () => {
    navigate("/manager/fixtures");
  };

  const goToSquadManagement = () => {
    navigate("/manager/squads");
  };

  const createAFixture = () => {
    navigate("manager/create-fixture");
  };

  return (
    <div className="manager-dashboard">
      <h1>Manager Dashboard</h1>
      <p>
        Welcome, {user.firstName} {user.lastName}!
      </p>
      <p>
        Here you can manage your team's activities and other manager-specific
        tasks.
      </p>
      <button onClick={goToFixtures} className="fixtures-button">
        View Fixtures
      </button>
      <button onClick={createAFixture} className="add-fixture-button">
        Create Fixture
      </button>
      <button onClick={goToSquadManagement} className="squads-button">
        Manage Squads
      </button>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default ManagerDashboard;

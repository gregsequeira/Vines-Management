import React from "react";
import { Link } from "react-router-dom";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>
        Welcome, admin! Here you can manage users, view statistics, and perform
        other administrative tasks.
      </p>
      <Link to="/admin/users" className="view-users-button">
        View Users
      </Link>
      <Link to="/admin/notice-board" className="view-notice-board-button">
        Create Notice
      </Link>
      <Link to="/admin/notice-list" className="view-notice-list-button">
        View Notice Board
      </Link>
      <Link to="/admin/create-fixture" className="create-fixture-button">
        Create Fixture
      </Link>
      <Link to="/admin/manage-fixtures" className="manage-fixtures-button">
        Manage Fixtures
      </Link>
      <Link to="/admin/results-list" className="manage-results-button">
        Manage Results
      </Link>
      <Link to="/admin/manage-teams" className="manage-teams-button">
        Manage Teams
      </Link>
      <Link to="/admin/manage-venues" className="manage-venues-button">
        Manage Venues
      </Link>
      <Link
        to="/admin/manage-competitions"
        className="manage-competitions-button"
      >
        Manage Competitions
      </Link>
      <Link to="/admin/applications" className="manage-applications-button">
        Manage Applications
      </Link>
      <Link to="/admin/player-management" className="manage-players-button">
        Manage Players
      </Link>
      <Link to="/admin/manage-managers" className="manage-managers-button">
        Manage Managers
      </Link>
    </div>
  );
};

export default AdminDashboard;

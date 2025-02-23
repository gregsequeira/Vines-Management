import React, { useState } from "react";
import axios from "axios";
import { Link, useParams, useLocation } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import "../css/ResultForm.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ResultForm = ({ onUpdate }) => {
  const { id } = useParams();
  const location = useLocation();
  const existingFixture = location.state ? location.state.fixture : null;

  const [homeScore, setHomeScore] = useState(
    existingFixture ? existingFixture.homeScore : 0
  );
  const [awayScore, setAwayScore] = useState(
    existingFixture ? existingFixture.awayScore : 0
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fixtureData = {
      homeScore,
      awayScore,
      status: "completed",
    };

    try {
      const response = await axios.put(`/api/fixtures/${id}`, fixtureData);
      setMessage("Result updated successfully!");
      setIsModalOpen(true);
      if (onUpdate) onUpdate(response.data.fixture);
    } catch (error) {
      setMessage("Error updating result. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="result-form-container">
      <h2>Update Result</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Date:</label>
          <p>{formatDate(existingFixture.date)}</p>
        </div>
        <div>
          <label>Time:</label>
          <p>{existingFixture.time}</p>
        </div>
        <div>
          <label>Age Group:</label>
          <p>{existingFixture.ageGroup}</p>
        </div>
        <div>
          <label>Home Team:</label>
          <p>{existingFixture.homeTeam}</p>
          <div>
            <label>Score:</label>
            <input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label>Away Team:</label>
          <p>{existingFixture.awayTeam}</p>
          <div>
            <label>Score:</label>
            <input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label>Competition Type:</label>
          <p>{existingFixture.competitionType}</p>
        </div>
        <div>
          <label>Competition Name:</label>
          <p>{existingFixture.competitionName}</p>
        </div>
        <div>
          <label>Venue:</label>
          <p>{existingFixture.venue}</p>
        </div>
        <div>
          <label>Status:</label>
          <p>Completed</p>
        </div>
        <button type="submit">Save Result</button>
        <Link to="/admin/results-list" className="view-results-button">
          View Results
        </Link>
        <Link to="/admin/manage-fixtures" className="view-fixture-list-button">
          View Fixtures
        </Link>
      </form>
      <BootstrapModal
        isOpen={isModalOpen}
        title="Result"
        message={message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ResultForm;

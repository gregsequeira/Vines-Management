import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useLocation } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import "../css/FixtureForm.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const FixtureForm = ({ onUpdate }) => {
  const { id } = useParams(); // Get fixture ID from URL params
  const location = useLocation(); // Get fixture data from location state
  const existingFixture = location.state ? location.state.fixture : null;

  const [date, setDate] = useState(
    existingFixture ? formatDate(existingFixture.date) : ""
  );
  const [time, setTime] = useState(existingFixture ? existingFixture.time : "");
  const [ageGroup, setAgeGroup] = useState(
    existingFixture ? existingFixture.ageGroup : ""
  );
  const [homeTeam, setHomeTeam] = useState(
    existingFixture ? existingFixture.homeTeam : ""
  );
  const [awayTeam, setAwayTeam] = useState(
    existingFixture ? existingFixture.awayTeam : ""
  );
  const [venue, setVenue] = useState(
    existingFixture ? existingFixture.venue : ""
  );
  const [competitionType, setCompetitionType] = useState(
    existingFixture ? existingFixture.competitionType : ""
  );
  const [competitionName, setCompetitionName] = useState(
    existingFixture ? existingFixture.competitionName : ""
  );
  const [status, setStatus] = useState(
    existingFixture ? existingFixture.status : "scheduled"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch data for dropdowns
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsResponse, venuesResponse, competitionsResponse] =
          await Promise.all([
            axios.get("/api/teams"),
            axios.get("/api/venues"),
            axios.get("/api/competitions"),
          ]);
        setTeams(teamsResponse.data);
        setVenues(venuesResponse.data);
        setCompetitions(competitionsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fixtureData = {
      date,
      time,
      ageGroup,
      homeTeam,
      awayTeam,
      venue,
      competitionType,
      competitionName,
      status,
    };

    console.log(fixtureData);

    try {
      const response = existingFixture
        ? await axios.put(`/api/fixtures/${id}`, fixtureData) // Use id when updating
        : await axios.post("/api/fixtures/add", fixtureData);
      setMessage(
        existingFixture
          ? "Fixture updated successfully!"
          : "Fixture created successfully!"
      );
      setIsModalOpen(true);
      if (onUpdate) onUpdate(response.data.fixture); // Call the onUpdate callback if provided
    } catch (error) {
      setMessage("Error creating fixture. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="fixture-form-container">
      <h2>{existingFixture ? "Update Fixture" : "Create Fixture"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Date:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="time">Time:</label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="ageGroup">Age Group:</label>
          <select
            id="ageGroup"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            required
          >
            <option value="">Select Age Group</option>
            <option value="u8">U8</option>
            <option value="u9">U9</option>
            <option value="u11">U11</option>
            <option value="u13">U13</option>
            <option value="u15">U15</option>
            <option value="u17">U17</option>
            <option value="u19">U19</option>
            <option value="senior">senior</option>
          </select>
        </div>
        <div>
          <label htmlFor="homeTeam">Home Team:</label>
          <select
            id="homeTeam"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            required
          >
            <option value="">Select Home Team</option>
            {teams.map((team) => (
              <option key={team._id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="awayTeam">Away Team:</label>
          <select
            id="awayTeam"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            required
          >
            <option value="">Select Away Team</option>
            {teams.map((team) => (
              <option key={team._id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="competitionType">Competition Type:</label>
          <select
            id="competitionType"
            value={competitionType}
            onChange={(e) => setCompetitionType(e.target.value)}
            required
          >
            <option value="">Select Competition Type</option>
            {competitions.map((competition) => (
              <option key={competition._id} value={competition.competitionType}>
                {competition.competitionType}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="competitionName">Competition Name:</label>
          <select
            id="competitionName"
            value={competitionName}
            onChange={(e) => setCompetitionName(e.target.value)}
            required
          >
            <option value="">Select Competition Name</option>
            {competitions.map((competition) => (
              <option key={competition._id} value={competition.competitionName}>
                {competition.competitionName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="venue">Venue:</label>
          <select
            id="venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          >
            <option value="">Select Venue</option>
            {venues.map((venue) => (
              <option key={venue._id} value={venue.name}>
                {venue.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit">
          {existingFixture ? "Update Fixture" : "Create Fixture"}
        </button>
        <Link to="/admin/manage-fixtures" className="view-fixture-list-button">
          View Fixtures
        </Link>
      </form>
      <BootstrapModal
        isOpen={isModalOpen}
        title="Fixture"
        message={message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default FixtureForm;

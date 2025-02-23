import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import BootstrapModal from "./BootstrapModal";
import "../css/MatchBriefing.css";
import { Card } from "react-bootstrap";

const MatchBriefing = () => {
  const { user } = useAuth();
  const [fixtures, setFixtures] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFixtureId, setSelectedFixtureId] = useState("");
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchFixturesForUser = async (userId) => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `/api/matches/fixtures/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFixtures(response.data);
        console.log("Fixtures Details:", response.data);
      } catch (error) {
        console.error("Error fetching fixtures for user", error);
      }
    };

    if (user) {
      fetchFixturesForUser(user._id);
    }
  }, [user]);

  const handleConfirmAvailability = async (fixtureId) => {
    try {
      const token = localStorage.getItem("authToken");

      // Fetch the specific fixture details
      const matchResponse = await axios.get(`/api/matches/${fixtureId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Match Details (Specific Fixture):", matchResponse.data);

      // Extract the player's ID from the selectedPlayers array for this specific match
      const playerFromMatch = matchResponse.data.selectedPlayers.find(
        (player) => player.userId.toString() === user._id.toString()
      );

      if (playerFromMatch) {
        const playerId = playerFromMatch._id; // Extract player ID
        console.log("Player ID:", playerId);

        // Fetch the player's details using the extracted player ID
        const playerResponse = await axios.get(`/api/players/${playerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Player Details (Specific Match):", playerResponse.data);

        setPlayer(playerResponse.data);
      } else {
        console.error("Player not found in selectedPlayers for this fixture");
      }

      setSelectedFixtureId(fixtureId);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching player details for specific match", error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="match-briefing-container">
      <h2>Match Briefing</h2>
      {fixtures.length > 0 ? (
        <div>
          <h3>Fixtures Details</h3>
          <ul>
            {fixtures.map((fixture) => (
              <li key={fixture._id}>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(fixture.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Time:</strong> {fixture.time}
                </div>
                <div>
                  <strong>Home Team:</strong> {fixture.homeTeam}
                </div>
                <div>
                  <strong>Away Team:</strong> {fixture.awayTeam}
                </div>
                <div>
                  <strong>Venue:</strong> {fixture.venue}
                </div>
                <div>
                  <strong>Location:</strong> {fixture.location}
                </div>
                <div>
                  <strong>Competition:</strong> {fixture.competitionName} (
                  {fixture.competitionType})
                </div>
                <div>
                  <strong>Age Group:</strong> {fixture.ageGroup}
                </div>
                <div>
                  <strong>Status:</strong> {fixture.status}
                </div>
                <div>
                  <button
                    onClick={() => handleConfirmAvailability(fixture._id)}
                  >
                    Confirm Availability
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No fixtures found for this player.</p>
      )}
      <BootstrapModal
        isOpen={modalOpen}
        title="Confirm Availability"
        message={`Are you sure you want to confirm your availability for the fixture on ${new Date(
          fixtures.find((fixture) => fixture._id === selectedFixtureId)?.date
        ).toLocaleDateString()}?`}
        onClose={closeModal}
      >
        {player && (
          <Card className="player-card">
            <Card.Body>
              <Card.Title>
                {player.playerFirstName} {player.playerSecondName}
              </Card.Title>
              <Card.Img
                variant="top"
                src={player.playerPhoto || "/default-player-photo.png"}
                alt="Player photo"
                className="player-photo"
              />
              <Card.Text>{player.preferredPosition}</Card.Text>
              <div className="player-select-checkbox">
                <input
                  type="checkbox"
                  id={`select-${player._id}`}
                  checked={
                    player.status === "selected" ||
                    player.status === "confirmed"
                  }
                  disabled
                  className={
                    player.status === "unavailable" ? "unavailable" : ""
                  }
                />
                <label
                  htmlFor={`select-${player._id}`}
                  data-status={player.status}
                ></label>
              </div>
            </Card.Body>
          </Card>
        )}
        <button onClick={closeModal}>Confirm</button>
        <button onClick={closeModal}>Cancel</button>
      </BootstrapModal>
    </div>
  );
};

export default MatchBriefing;

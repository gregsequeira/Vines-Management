import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import "../css/TeamSelection.css";

const TeamSelection = () => {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const [fixture, setFixture] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchFixtureDetails = async () => {
      try {
        const fixtureResponse = await axios.get(`/api/fixtures/${fixtureId}`);
        setFixture(fixtureResponse.data);
      } catch (error) {
        console.error("Error fetching fixture details", error);
      }
    };

    fetchFixtureDetails();
  }, [fixtureId]);

  useEffect(() => {
    const fetchPlayerDetails = async (playerIds) => {
      try {
        const playerDetailsPromises = playerIds.map((playerId) =>
          axios.get(`/api/players/${playerId}`)
        );
        const playersResponse = await Promise.all(playerDetailsPromises);
        const playerDetails = playersResponse.map((response) => response.data);
        setPlayers(playerDetails);
      } catch (error) {
        console.error("Error fetching player details", error);
      }
    };

    const fetchSquadsAndPlayers = async (ageGroup) => {
      try {
        const squadsResponse = await axios.get(`/api/squads`);
        const squads = squadsResponse.data.filter(
          (squad) => squad.ageGroup === ageGroup
        );

        const allPlayerIds = [];
        squads.forEach((squad) => {
          allPlayerIds.push(...squad.players);
        });

        fetchPlayerDetails(allPlayerIds);
      } catch (error) {
        console.error("Error fetching squads and players", error);
      }
    };

    if (fixture) {
      fetchSquadsAndPlayers(fixture.ageGroup);
    }
  }, [fixture]);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const matchResponse = await axios.get(`/api/matches/${fixtureId}`);
        const selectedPlayerIds = matchResponse.data.selectedPlayers.map(
          (player) => player._id
        );

        const playerDetailsPromises = selectedPlayerIds.map((playerId) =>
          axios.get(`/api/players/${playerId}`)
        );
        await Promise.all(playerDetailsPromises);

        setPlayers((prevPlayers) =>
          prevPlayers.map((player) => ({
            ...player,
            status: selectedPlayerIds.includes(player._id)
              ? "selected"
              : "available",
          }))
        );
      } catch (error) {
        console.error("Error fetching match details", error);
      }
    };

    if (fixture) {
      fetchMatchDetails();
    }
  }, [fixture, fixtureId]);

  const handlePlayerSelect = (playerId) => {
    const updatedPlayers = players.map((player) =>
      player._id === playerId
        ? {
            ...player,
            status: player.status === "selected" ? "available" : "selected",
          }
        : player
    );
    setPlayers(updatedPlayers);
  };

  const handleConfirmTeam = async () => {
    const selectedPlayerIds = players
      .filter(
        (player) =>
          player.status === "selected" || player.status === "confirmed"
      )
      .map((player) => player._id);

    try {
      await axios.put(`/api/matches/${fixtureId}`, {
        selectedPlayers: selectedPlayerIds,
      });
      alert("Team confirmed!");
      navigate("/manager/fixtures");
    } catch (error) {
      console.error("Error confirming team", error);
      alert("Failed to confirm team. Please try again.");
    }
  };

  const renderPlayersByPosition = (position) => {
    return players
      .filter((player) => player.preferredPosition === position)
      .map((player) => (
        <Card key={player._id} className="player-card">
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
                onChange={() => handlePlayerSelect(player._id)}
                checked={
                  player.status === "selected" || player.status === "confirmed"
                }
                disabled={player.status === "unavailable"}
                className={player.status === "unavailable" ? "unavailable" : ""}
              />
              <label
                htmlFor={`select-${player._id}`}
                data-status={player.status}
              ></label>
            </div>
          </Card.Body>
        </Card>
      ));
  };

  if (!fixture) {
    return <p>Loading fixture details...</p>;
  }

  return (
    <div className="team-selection-container">
      <h2>Fixture Details</h2>
      <table className="fixture-details-table">
        <thead>
          <tr>
            <th className="dateTh">Date</th>
            <th>Time</th>
            <th>Home Team</th>
            <th>Away Team</th>
            <th className="venueTh">Venue</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="dateTd">
              {new Date(fixture.date).toLocaleDateString()}
            </td>
            <td>{fixture.time}</td>
            <td>{fixture.homeTeam}</td>
            <td>{fixture.awayTeam}</td>
            <td className="venueTd">{fixture.venue}</td>
          </tr>
        </tbody>
      </table>

      <h3>Team Selection</h3>

      <div className="position-container">
        <h4>Goalkeepers</h4>
        <div className="player-cards-container">
          {renderPlayersByPosition("GK")}
        </div>
      </div>

      <div className="position-container">
        <h4>Defenders</h4>
        <div className="player-cards-container">
          {renderPlayersByPosition("DEF")}
        </div>
      </div>

      <div className="position-container">
        <h4>Midfielders</h4>
        <div className="player-cards-container">
          {renderPlayersByPosition("MID")}
        </div>
      </div>

      <div className="position-container">
        <h4>Forwards</h4>
        <div className="player-cards-container">
          {renderPlayersByPosition("FWD")}
        </div>
      </div>

      <div className="confirm-team-button-container">
        <Button variant="success" onClick={handleConfirmTeam}>
          Confirm Team
        </Button>
      </div>
    </div>
  );
};

export default TeamSelection;

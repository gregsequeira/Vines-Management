import React, { useState, useEffect } from "react";
import PlayerDetails from "../components/PlayerDetails";
import BootstrapModal from "../components/BootstrapModal";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import "../css/PlayerManagement.css";

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get("/api/players");
      setPlayers(response.data);
      setFilteredPlayers(response.data);
    } catch (error) {
      console.error("Error fetching players", error);
    }
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setModalOpen(true);
    setEditMode(false);
  };

  const handleEditClick = (player) => {
    setSelectedPlayer(player);
    setModalOpen(true);
    setEditMode(true);
  };

  const handleRemoveClick = async (playerId, userId) => {
    try {
      await axios.put(`/api/players/update-role/${userId}`, {
        role: "user",
      });
      setModalContent({
        title: "Success",
        message: "User role updated to user",
      });
      setIsModalOpen(true);

      setPlayers(players.filter((player) => player._id !== playerId));
    } catch (error) {
      console.error("Error updating user role", error);
      setModalContent({
        title: "Error",
        message: "Failed to update user role",
      });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPlayer(null);
  };

  const closeBootstrapModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    filterPlayers(value, ageGroupFilter);
  };

  const handleAgeGroupChange = (e) => {
    const { value } = e.target;
    setAgeGroupFilter(value);
    filterPlayers(searchTerm, value);
  };

  const filterPlayers = (searchTerm, ageGroupFilter) => {
    const filtered = players.filter((player) => {
      const matchesSearchTerm =
        `${player.playerFirstName} ${player.playerSecondName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesAgeGroup =
        ageGroupFilter === "" || player.ageGroup === ageGroupFilter;
      return matchesSearchTerm && matchesAgeGroup;
    });
    setFilteredPlayers(filtered);
  };

  return (
    <div className="player-management">
      <h1>Player Management</h1>
      <div className="filters">
        <Form.Control
          type="text"
          placeholder="Search for a player..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <Form.Control
          as="select"
          value={ageGroupFilter}
          onChange={handleAgeGroupChange}
          className="age-group-filter"
        >
          <option value="">All Age Groups</option>
          <option value="u8">u8</option>
          <option value="u9">u9</option>
          <option value="u11">u11</option>
          <option value="u13">u13</option>
          <option value="u15">u15</option>
          <option value="u17">u17</option>
          <option value="u19">u19</option>
          <option value="senior">senior</option>
        </Form.Control>
      </div>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Second Name</th>
            <th>Date of Birth</th>
            <th>Age Group</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers &&
            filteredPlayers.map((player) => (
              <tr key={player._id}>
                <td>{player.playerFirstName}</td>
                <td>{player.playerSecondName}</td>
                <td>{new Date(player.playerDob).toLocaleDateString()}</td>
                <td>{player.ageGroup}</td>
                <td>{player.preferredPosition}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => handlePlayerClick(player)}
                  >
                    View
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleEditClick(player)}
                    style={{ marginLeft: "10px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveClick(player._id, player.userId)}
                    style={{ marginLeft: "10px" }}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {selectedPlayer && (
        <PlayerDetails
          player={selectedPlayer}
          show={modalOpen}
          handleClose={closeModal}
          editMode={editMode} // Pass edit mode state to PlayerDetails component
          onSaveSuccess={fetchPlayers} // Callback to refresh player list on save
        />
      )}

      <BootstrapModal
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onClose={closeBootstrapModal}
      />
    </div>
  );
};

export default PlayerManagement;

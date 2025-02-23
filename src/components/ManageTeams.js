import React, { useState, useEffect } from "react";
import axios from "axios";
import BootstrapModal from "./BootstrapModal";
import "../css/ManageTeams.css";

const ManageTeams = () => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get("/api/teams");
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const teamData = { name: teamName };

    try {
      if (selectedTeam) {
        await axios.put(`/api/teams/${selectedTeam._id}`, teamData);
        setMessage("Team updated successfully!");
      } else {
        await axios.post("/api/teams/add", teamData);
        setMessage("Team added successfully!");
      }
      setIsModalOpen(true);
      setTeamName("");
      setSelectedTeam(null);
      const updatedTeams = await axios.get("/api/teams");
      setTeams(updatedTeams.data);
    } catch (error) {
      setMessage("Error adding/updating team. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleEdit = (team) => {
    setSelectedTeam(team);
    setTeamName(team.name);
  };

  const handleDelete = async (team) => {
    try {
      await axios.delete(`/api/teams/${team._id}`);
      setMessage("Team deleted successfully!");
      setIsModalOpen(true);
      const updatedTeams = await axios.get("/api/teams");
      setTeams(updatedTeams.data);
    } catch (error) {
      setMessage("Error deleting team. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="manage-teams-container">
      <h2>Manage Teams</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="teamName">Team Name:</label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>
        <button type="submit">
          {selectedTeam ? "Update Team" : "Add Team"}
        </button>
      </form>
      <table className="teams-table">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team._id}>
              <td>{team.name}</td>
              <td>
                <button onClick={() => handleEdit(team)}>Edit</button>
                <button onClick={() => handleDelete(team)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <BootstrapModal
        isOpen={isModalOpen}
        title="Team"
        message={message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ManageTeams;

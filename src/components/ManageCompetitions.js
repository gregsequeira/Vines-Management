import React, { useState, useEffect } from "react";
import axios from "axios";
import BootstrapModal from "./BootstrapModal";
import "../css/ManageCompetitions.css";

const ManageCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [competitionType, setCompetitionType] = useState("");
  const [competitionName, setCompetitionName] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await axios.get("/api/competitions");
        setCompetitions(response.data);
      } catch (error) {
        console.error("Error fetching competitions:", error);
      }
    };
    fetchCompetitions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const competitionData = { competitionType, competitionName };

    try {
      if (selectedCompetition) {
        await axios.put(
          `/api/competitions/${selectedCompetition._id}`,
          competitionData
        );
        setMessage("Competition updated successfully!");
      } else {
        await axios.post("/api/competitions/add", competitionData);
        setMessage("Competition added successfully!");
      }
      setIsModalOpen(true);
      setCompetitionType("");
      setCompetitionName("");
      setSelectedCompetition(null);
      const updatedCompetitions = await axios.get("/api/competitions");
      setCompetitions(updatedCompetitions.data);
    } catch (error) {
      setMessage("Error adding/updating competition. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleEdit = (competition) => {
    setSelectedCompetition(competition);
    setCompetitionType(competition.competitionType);
    setCompetitionName(competition.competitionName);
  };

  const handleDelete = async (competition) => {
    try {
      await axios.delete(`/api/competitions/${competition._id}`);
      setMessage("Competition deleted successfully!");
      setIsModalOpen(true);
      const updatedCompetitions = await axios.get("/api/competitions");
      setCompetitions(updatedCompetitions.data);
    } catch (error) {
      setMessage("Error deleting competition. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="manage-competitions-container">
      <h2>Manage Competitions</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="competitionType">Competition Type:</label>
          <input
            id="competitionType"
            type="text"
            value={competitionType}
            onChange={(e) => setCompetitionType(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="competitionName">Competition Name:</label>
          <input
            id="competitionName"
            type="text"
            value={competitionName}
            onChange={(e) => setCompetitionName(e.target.value)}
            required
          />
        </div>
        <button type="submit">
          {selectedCompetition ? "Update Competition" : "Add Competition"}
        </button>
      </form>
      <table className="competitions-table">
        <thead>
          <tr>
            <th>Competition Type</th>
            <th>Competition Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {competitions.map((competition) => (
            <tr key={competition._id}>
              <td>{competition.competitionType}</td>
              <td>{competition.competitionName}</td>
              <td>
                <button onClick={() => handleEdit(competition)}>Edit</button>
                <button onClick={() => handleDelete(competition)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <BootstrapModal
        isOpen={isModalOpen}
        title="Competition"
        message={message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ManageCompetitions;

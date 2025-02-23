import React, { useState, useEffect } from "react";
import axios from "axios";
import BootstrapModal from "./BootstrapModal"; 
import "../css/ManageVenues.css"; 

const ManageVenues = () => {
  const [venues, setVenues] = useState([]);
  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get("/api/venues");
        setVenues(response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };
    fetchVenues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const venueData = { name: venueName, location };

    try {
      if (selectedVenue) {
        await axios.put(`/api/venues/${selectedVenue._id}`, venueData);
        setMessage("Venue updated successfully!");
      } else {
        await axios.post("/api/venues/add", venueData);
        setMessage("Venue added successfully!");
      }
      setIsModalOpen(true);
      setVenueName("");
      setLocation("");
      setSelectedVenue(null);
      const updatedVenues = await axios.get("/api/venues");
      setVenues(updatedVenues.data);
    } catch (error) {
      setMessage("Error adding/updating venue. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleEdit = (venue) => {
    setSelectedVenue(venue);
    setVenueName(venue.name);
    setLocation(venue.location);
  };

  const handleDelete = async (venue) => {
    try {
      await axios.delete(`/api/venues/${venue._id}`);
      setMessage("Venue deleted successfully!");
      setIsModalOpen(true);
      const updatedVenues = await axios.get("/api/venues");
      setVenues(updatedVenues.data);
    } catch (error) {
      setMessage("Error deleting venue. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="manage-venues-container">
      <h2>Manage Venues</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="venueName">Venue Name:</label>
          <input
            id="venueName"
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button type="submit">
          {selectedVenue ? "Update Venue" : "Add Venue"}
        </button>
      </form>
      <table className="venues-table">
        <thead>
          <tr>
            <th>Venue Name</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => (
            <tr key={venue._id}>
              <td>{venue.name}</td>
              <td>{venue.location}</td>
              <td>
                <button onClick={() => handleEdit(venue)}>Edit</button>
                <button onClick={() => handleDelete(venue)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <BootstrapModal
        isOpen={isModalOpen}
        title="Venue"
        message={message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ManageVenues;

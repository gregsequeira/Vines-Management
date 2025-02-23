import React, { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import axios from "axios";
import BootstrapModal from "../components/BootstrapModal";
import "../css/PlayerDetails.css";

const PlayerDetails = ({
  player,
  show,
  handleClose,
  editMode,
  onSaveSuccess,
}) => {
  const [playerData, setPlayerData] = useState(player);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoFileName, setPhotoFileName] = useState(
    player.playerPhoto
      ? player.playerPhoto.split("/").pop()
      : "No photo uploaded"
  );
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: editMode ? "Edit Player Details" : "Player Details",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayerData({ ...playerData, [name]: value });
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
    setPhotoFileName(e.target.files[0].name);
  };

  const handleSave = async () => {
    try {
      if (photoFile) {
        const formData = new FormData();
        formData.append("playerPhoto", photoFile);
        const photoResponse = await axios.post(
          `/api/players/upload-photo/${playerData._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        playerData.playerPhoto = photoResponse.data.filePath;
      }

      // If age group is changed, update the squads
      if (player.ageGroup !== playerData.ageGroup) {
        // Remove player from old squad
        if (player.ageGroup) {
          await axios.put(`/api/squads/remove-player`, {
            ageGroup: player.ageGroup,
            playerId: playerData._id,
          });
        }

        // Add player to new squad
        if (playerData.ageGroup) {
          await axios.put(`/api/squads/add-player`, {
            ageGroup: playerData.ageGroup,
            playerId: playerData._id,
          });
        }
      }

      // Update player details
      await axios.put(`/api/players/${playerData._id}`, playerData);

      setModalContent({
        title: "Success",
        message: "Player details updated successfully",
      });
      setIsMessageModalOpen(true);

      // Call onSaveSuccess to refresh parent component
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error("Error updating player details", error);
      setModalContent({
        title: "Error",
        message: "Failed to update player details",
      });
      setIsMessageModalOpen(true);
    }
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    handleClose();
  };

  const ageGroups = ["u8", "u9", "u11", "u13", "u15", "u17", "u19", "senior"];

  return (
    <>
      <BootstrapModal
        isOpen={isMessageModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onClose={closeMessageModal}
      />
      <BootstrapModal
        isOpen={show}
        title={editMode ? "Edit Player Details" : "Player Details"}
        onClose={handleClose}
      >
        {editMode ? (
          <Form className="editForm">
            <Card.Body>
              <Card.Title>
                {playerData.playerFirstName} {playerData.playerSecondName}
              </Card.Title>
            </Card.Body>
            <Card.Body>
              <Form.Group controlId="playerPhoto">
                <Form.Label className="editLabel">Photo</Form.Label>
                <Form.Control
                  type="file"
                  name="playerPhoto"
                  onChange={handleFileChange}
                  className="photo-input"
                />
                <div>{photoFileName}</div>
              </Form.Group>
              <Form.Group controlId="preferredPosition">
                <Form.Label className="editLabel">Position</Form.Label>
                <Form.Control
                  as="select"
                  name="preferredPosition"
                  value={playerData.preferredPosition}
                  onChange={handleChange}
                >
                  <option value="GK">GK</option>
                  <option value="DEF">DEF</option>
                  <option value="MID">MID</option>
                  <option value="FWD">FWD</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="playerRegistrationNumber">
                <Form.Label className="editLabel">
                  Registration Number
                </Form.Label>
                <Form.Control
                  type="text"
                  name="playerRegistrationNumber"
                  value={playerData.playerRegistrationNumber}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="ageGroup">
                <Form.Label className="editLabel">Age Group</Form.Label>
                <Form.Control
                  as="select"
                  name="ageGroup"
                  value={playerData.ageGroup}
                  onChange={handleChange}
                >
                  <option value="">Select Age Group</option>
                  {ageGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="registrationExpiryDate">
                <Form.Label className="editLabel">Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="registrationExpiryDate"
                  value={
                    new Date(playerData.registrationExpiryDate)
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
            <Button
              variant="primary"
              className="save-changes-button"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Form>
        ) : (
          <Card className="player-details">
            <Card.Body>
              <Card.Title>
                {player.playerFirstName} {player.playerSecondName}
              </Card.Title>
            </Card.Body>
            <Card.Img
              variant="top"
              src={player.playerPhoto || "/default-player-photo.png"}
              alt="Player photo"
              className="player-photo"
            />
            <Card.Body>
              <Card.Text>
                <strong>Date of Birth:</strong>{" "}
                {new Date(player.playerDob).toLocaleDateString()}
              </Card.Text>
              <Card.Text>
                <strong>Age Group:</strong> {player.ageGroup}
              </Card.Text>
              <Card.Text>
                <strong>Position:</strong> {player.preferredPosition}
              </Card.Text>
              <Card.Text>
                <strong>Registration Number:</strong>{" "}
                {player.playerRegistrationNumber}
              </Card.Text>
              <Card.Text>
                <strong>Expiry Date:</strong>{" "}
                {new Date(player.registrationExpiryDate).toLocaleDateString()}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
      </BootstrapModal>
    </>
  );
};

export default PlayerDetails;

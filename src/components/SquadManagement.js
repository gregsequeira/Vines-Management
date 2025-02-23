import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import BootstrapModal from "./BootstrapModal";
import { Form, Button } from "react-bootstrap";
import "../css/SquadManagement.css";
import "bootstrap/dist/css/bootstrap.min.css";

const SquadManagement = () => {
  const { user } = useAuth();
  const [manager, setManager] = useState(null);
  const [squads, setSquads] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [secondaryPositionOptions, setSecondaryPositionOptions] = useState([
    "GK",
    "DEF",
    "MID",
    "FWD",
  ]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        if (!user || !user._id) {
          return;
        }
        const response = await axios.get(`/api/managers`);
        const managers = response.data;
        const currentManager = managers.find(
          (manager) => manager.user._id === user._id
        );
        if (isMounted.current) {
          setManager(currentManager);
        }
      } catch (error) {
        if (isMounted.current) {
          console.error("Error fetching manager data", error);
        }
      }
    };

    fetchManagerData();
  }, [user]);

  useEffect(() => {
    const fetchSquadsAndPlayers = async () => {
      if (!manager || !manager.squads) return;

      try {
        const squadsResponse = await axios.get(`/api/squads`);
        const filteredSquads = squadsResponse.data.filter((squad) =>
          manager.squads.includes(squad._id)
        );

        const allPlayers = [];
        for (const squad of filteredSquads) {
          const playerDetailsPromises = squad.players.map((playerId) =>
            axios.get(`/api/players/${playerId}`)
          );
          const playersResponse = await Promise.all(playerDetailsPromises);
          const playerDetails = playersResponse.map(
            (response) => response.data
          );
          allPlayers.push(...playerDetails);
        }
        if (isMounted.current) {
          setSquads(filteredSquads);
          setPlayers(allPlayers);
        }
      } catch (error) {
        if (isMounted.current) {
          console.error("Error fetching squads and players", error);
        }
      }
    };

    if (manager) {
      fetchSquadsAndPlayers();
    }
  }, [manager]);

  useEffect(() => {
    if (selectedPlayer) {
      setSecondaryPositionOptions(
        ["GK", "DEF", "MID", "FWD"].filter(
          (pos) => pos !== selectedPlayer.preferredPosition
        )
      );
    }
  }, [selectedPlayer]);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      await axios.put(`/api/players/${selectedPlayer._id}`, values);
      const updatedPlayers = players.map((player) =>
        player._id === selectedPlayer._id ? { ...player, ...values } : player
      );
      setPlayers(updatedPlayers);
    } catch (error) {
      console.error("Error updating player details", error);
    }
  };

  const renderPlayersByAgeGroup = (ageGroup) => {
    const ageGroupSquad = squads.find((squad) => squad.ageGroup === ageGroup);
    if (!ageGroupSquad) return null;
    const ageGroupPlayers = players.filter((player) =>
      ageGroupSquad.players.includes(player._id)
    );

    return (
      <table className="player-list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {ageGroupPlayers.map((player) => (
            <tr
              key={player._id}
              onClick={() => handlePlayerClick(player)}
              style={{ cursor: "pointer" }}
            >
              <td>
                {player.playerFirstName} {player.playerSecondName}
              </td>
              <td>{player.preferredPosition}</td>
              <td>{player.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  return (
    <div className="squad-management-container">
      <h2>Squad Management</h2>
      {manager ? (
        <div>
          <p className="manager-name">
            Manager: {manager.user.firstName} {manager.user.lastName}
          </p>
          <h3>Assigned Squads</h3>
          {squads.map((squad) => (
            <div key={squad._id} className="age-group-squad">
              <h4>
                <strong>{squad.ageGroup}</strong>
              </h4>
              {renderPlayersByAgeGroup(squad.ageGroup)}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading manager data...</p>
      )}

      {selectedPlayer && (
        <BootstrapModal
          isOpen={showModal}
          title="Player Details"
          onClose={handleCloseModal}
        >
          <Formik
            initialValues={{
              playerFirstName: selectedPlayer.playerFirstName || "",
              playerSecondName: selectedPlayer.playerSecondName || "",
              playerDob: selectedPlayer.playerDob
                ? new Date(selectedPlayer.playerDob).toISOString().split("T")[0]
                : "",
              playerRegistrationNumber:
                selectedPlayer.playerRegistrationNumber || "",
              registrationExpiryDate: selectedPlayer.registrationExpiryDate
                ? new Date(selectedPlayer.registrationExpiryDate)
                    .toISOString()
                    .split("T")[0]
                : "",
              ageGroup: selectedPlayer.ageGroup || "",
              preferredPosition: selectedPlayer.preferredPosition || "",
              secondaryPositions: selectedPlayer.secondaryPositions || [],
              status: selectedPlayer.status || "available",
            }}
            validationSchema={Yup.object({
              ageGroup: Yup.string().required("Age Group is required"),
              preferredPosition: Yup.string()
                .oneOf(["GK", "DEF", "MID", "FWD"])
                .required("Preferred Position is required"),
              secondaryPositions: Yup.array().of(
                Yup.string().oneOf(["GK", "DEF", "MID", "FWD"])
              ),
              status: Yup.string()
                .oneOf(["available", "unavailable"])
                .required("Status is required"),
            })}
            onSubmit={(values) => {
              handleFormSubmit(values);
              handleCloseModal();
            }}
          >
            {({ handleSubmit, values, handleChange }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Field
                    name="playerFirstName"
                    className="form-control"
                    readOnly
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Second Name</Form.Label>
                  <Field
                    name="playerSecondName"
                    className="form-control"
                    readOnly
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Date of Birth</Form.Label>
                  <Field name="playerDob" className="form-control" readOnly />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Registration Expiry Date</Form.Label>
                  <Field
                    name="registrationExpiryDate"
                    className="form-control"
                    readOnly
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Registration Expiry Date</Form.Label>
                  <Field
                    name="registrationExpiryDate"
                    className="form-control"
                    readOnly
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Age Group</Form.Label>
                  <Field name="ageGroup" className="form-control" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Preferred Position</Form.Label>
                  <Field
                    as="select"
                    name="preferredPosition"
                    className="form-control"
                    onChange={(e) => {
                      handleChange(e);
                      setSecondaryPositionOptions(
                        ["GK", "DEF", "MID", "FWD"].filter(
                          (pos) => pos !== e.target.value
                        )
                      );
                    }}
                  >
                    <option value="GK">GK</option>
                    <option value="DEF">DEF</option>
                    <option value="MID">MID</option>
                    <option value="FWD">FWD</option>
                  </Field>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Secondary Positions</Form.Label>
                  <div role="group" aria-labelledby="checkbox-group">
                    {secondaryPositionOptions.map((position) => (
                      <div key={position} className="form-check">
                        <label className="form-check-label">
                          <Field
                            type="checkbox"
                            name="secondaryPositions"
                            value={position}
                            className="form-check-input"
                          />
                          {position}
                        </label>
                      </div>
                    ))}
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Field as="select" name="status" className="form-control">
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </Field>
                </Form.Group>
                <Button type="submit" variant="primary">
                  Save changes
                </Button>
              </Form>
            )}
          </Formik>
        </BootstrapModal>
      )}
    </div>
  );
};

export default SquadManagement;

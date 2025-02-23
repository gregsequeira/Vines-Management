import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import { Button } from "react-bootstrap";
import "../css/ManagerFixtures.css";

const ManagerFixtures = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [squads, setSquads] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState(null); // Track selected fixture
  const [showModal, setShowModal] = useState(false);
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
          console.warn("User data is not available yet.");
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
    const fetchSquads = async () => {
      if (manager) {
        try {
          const squadsResponse = await axios.get(`/api/squads`);
          const filteredSquads = squadsResponse.data.filter((squad) =>
            manager.squads.includes(squad._id)
          );
          if (isMounted.current) {
            setSquads(filteredSquads);
          }
        } catch (error) {
          if (isMounted.current) {
            console.error("Error fetching squads data", error);
          }
        }
      }
    };

    fetchSquads();
  }, [manager]);

  useEffect(() => {
    const fetchFixtures = async () => {
      if (squads.length > 0) {
        try {
          const ageGroups = squads.map((squad) => squad.ageGroup);
          const fixturesResponse = await axios.get(`/api/fixtures`);
          const filteredFixtures = fixturesResponse.data.filter((fixture) =>
            ageGroups.includes(fixture.ageGroup)
          );
          if (isMounted.current) {
            setFixtures(filteredFixtures);
          }
        } catch (error) {
          if (isMounted.current) {
            console.error("Error fetching fixtures data", error);
          }
        }
      }
    };

    fetchFixtures();
  }, [squads]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleFixtureClick = (fixture) => {
    setSelectedFixture(fixture);
    setShowModal(true);
  };

  const handleTeamSelection = async (fixtureId) => {
    try {
      // Create or fetch match
      await axios.get(`/api/matches/${fixtureId}`);
      navigate(`/team-selection/${fixtureId}`);
    } catch (error) {
      console.error("Error creating match", error);
    }
  };

  const handleEdit = (fixture) => {
    navigate(`/manager/fixtures/fixture-form/${fixture._id}`, {
      state: { fixture },
    }); // Redirect to FixtureForm for editing
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFixture(null);
  };

  return (
    <div className="manager-fixtures-container">
      <h2>Manager Fixtures</h2>
      {manager ? (
        <div>
          <p>
            Manager found: {manager.user.firstName} {manager.user.lastName}
          </p>
          <p>Squads: {squads.map((squad) => squad.ageGroup).join(", ")}</p>
          <h3>Fixtures</h3>
          {squads.map((squad) => {
            const squadFixtures = fixtures.filter(
              (fixture) =>
                fixture.ageGroup === squad.ageGroup &&
                (fixture.status === "scheduled" ||
                  fixture.status === "postponed")
            );

            return (
              <div key={squad._id} className="age-group-fixtures">
                <h4>{squad.ageGroup} Fixtures</h4>
                {squadFixtures.length > 0 ? (
                  <table className="fixture-list-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Home Team</th>
                        <th>Away Team</th>
                        <th>Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {squadFixtures.map((fixture) => (
                        <tr
                          key={fixture._id}
                          onClick={() => handleFixtureClick(fixture)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{formatDate(fixture.date)}</td>
                          <td>{fixture.time}</td>
                          <td>{fixture.homeTeam}</td>
                          <td>{fixture.awayTeam}</td>
                          <td>{fixture.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>
                    No scheduled or postponed fixtures for {squad.ageGroup}.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>Loading manager data...</p>
      )}

      {selectedFixture && (
        <BootstrapModal
          isOpen={showModal}
          title="Fixture Details"
          onClose={closeModal}
        >
          <div>
            <p>Date: {formatDate(selectedFixture.date)}</p>
            <p>Time: {selectedFixture.time}</p>
            <p>Home Team: {selectedFixture.homeTeam}</p>
            <p>Away Team: {selectedFixture.awayTeam}</p>
            <p>Venue: {selectedFixture.venue}</p>
            <Button
              variant="primary"
              onClick={() => handleTeamSelection(selectedFixture._id)}
            >
              Team Selection
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleEdit(selectedFixture)}
            >
              Edit Fixture
            </Button>
          </div>
        </BootstrapModal>
      )}
    </div>
  );
};

export default ManagerFixtures;

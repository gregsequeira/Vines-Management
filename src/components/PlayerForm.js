import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import BootstrapModal from "../components/BootstrapModal";
import "../css/PlayerForm.css";

const PlayerForm = () => {
  const { id } = useParams();
  const [playerData, setPlayerData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const ageGroups = ["u8", "u9", "u11", "u13", "u15", "u17", "u19", "senior"];

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`/api/registrations/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlayerData({
            playerFirstName: data.playerFirstName,
            playerSecondName: data.playerSecondName,
            playerDob: data.playerDob,
            playerPhoto: "",
            playerRegistrationNumber: "",
            ageGroup: "",
            registrationExpiryDate: "",
            registration: data._id,
            userId: data.userId, // Include userId in the playerData
          });
        } else {
          console.error("Failed to fetch registration data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching registration data:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    if (id) {
      fetchRegistrationData();
    }
  }, [id]);

  const initialValues = {
    playerFirstName: playerData?.playerFirstName || "",
    playerSecondName: playerData?.playerSecondName || "",
    playerDob: playerData?.playerDob
      ? new Date(playerData.playerDob).toISOString().split("T")[0]
      : "",
    playerPhoto: playerData?.playerPhoto || "",
    playerRegistrationNumber: playerData?.playerRegistrationNumber || "",
    ageGroup: playerData?.ageGroup || "",
    registrationExpiryDate: playerData?.registrationExpiryDate
      ? new Date(playerData.registrationExpiryDate).toISOString().split("T")[0]
      : "",
    registration: playerData?.registration || "",
  };

  const validationSchema = Yup.object({
    playerFirstName: Yup.string().required("First Name is required"),
    playerSecondName: Yup.string().required("Second Name is required"),
    playerDob: Yup.date().required("Date of Birth is required"),
    playerPhoto: Yup.string(),
    playerRegistrationNumber: Yup.string(),
    ageGroup: Yup.string(),
    registrationExpiryDate: Yup.date(),
  });

  const onSubmit = async (values) => {
    try {
      const response = await axios.post("/api/players/create", values);
      const newPlayer = response.data.player;

      // Update user's role to 'player'
      await axios.put(`/api/players/update-role/${playerData.userId}`, {
        role: "player",
      });

      if (values.ageGroup) {
        // Add player to the appropriate squad if age group is specified
        await axios.put(`/api/squads/add-player`, {
          ageGroup: values.ageGroup,
          playerId: newPlayer._id,
        });
      }

      setModalContent({
        title: "Player Created",
        message:
          "Player has been created successfully and user role updated to player!",
      });
      setIsModalOpen(true);
    } catch (error) {
      setModalContent({
        title: "Error",
        message:
          "There was an error saving the player or updating the user role. Please try again.",
      });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/admin/applications");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="player-form">
      <h1>Create Player</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form>
          <div>
            <label htmlFor="playerFirstName">First Name:</label>
            <Field
              type="text"
              id="playerFirstName"
              name="playerFirstName"
              readOnly
            />
            <ErrorMessage
              name="playerFirstName"
              component="div"
              className="error-message"
            />
          </div>
          <div>
            <label htmlFor="playerSecondName">Second Name:</label>
            <Field
              type="text"
              id="playerSecondName"
              name="playerSecondName"
              readOnly
            />
            <ErrorMessage
              name="playerSecondName"
              component="div"
              className="error-message"
            />
          </div>
          <div>
            <label htmlFor="playerDob">Date of Birth:</label>
            <Field type="date" id="playerDob" name="playerDob" readOnly />
            <ErrorMessage
              name="playerDob"
              component="div"
              className="error-message"
            />
          </div>
          <div>
            <label htmlFor="playerPhoto">Photo:</label>
            <Field type="text" id="playerPhoto" name="playerPhoto" />
            <ErrorMessage
              name="playerPhoto"
              component="div"
              className="error-message"
            />
          </div>
          <div>
            <label htmlFor="playerRegistrationNumber">
              Registration Number:
            </label>
            <Field
              type="text"
              id="playerRegistrationNumber"
              name="playerRegistrationNumber"
            />
            <ErrorMessage
              name="playerRegistrationNumber"
              component="div"
              className="error-message"
            />
          </div>
          <div>
            <label htmlFor="ageGroup">Age Group:</label>
            <Field as="select" id="ageGroup" name="ageGroup">
              <option value="">Select Age Group</option>
              {ageGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="ageGroup"
              component="div"
              className="error-message"
            />
          </div>
          <div>
            <label htmlFor="registrationExpiryDate">
              Registration Expiry Date:
            </label>
            <Field
              type="date"
              id="registrationExpiryDate"
              name="registrationExpiryDate"
            />
            <ErrorMessage
              name="registrationExpiryDate"
              component="div"
              className="error-message"
            />
          </div>
          <button type="submit">Create Player</button>
        </Form>
      </Formik>
      <BootstrapModal
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onClose={closeModal}
      />
    </div>
  );
};

export default PlayerForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import "../css/ApplicationForm.css";
import { useAuth } from "../AuthContext";

const ApplicationForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const { user, setUser, setRegistrationStatus } = useAuth();
  const [formData, setFormData] = useState({
    userId: user?._id || "",
    playerFirstName: "",
    playerSecondName: "",
    playerDob: "",
    playerAge: "",
    playerGender: "",
    address: "",
    emailAddress: user?.email || "",
    playerPhone: "",
    parentFirstName: "",
    parentLastName: "",
    parentIDNumber: "",
    parentRelationship: "",
    parentPhone: "",
    parentalConsent: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isParent, setIsParent] = useState(false);
  const [showParentForm, setShowParentForm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleRoleSelection = (role) => {
    if (user) {
      if (role === "Parent") {
        setIsParent(true);
        setShowParentForm(true);
        setFormData((prevData) => ({
          ...prevData,
          parentFirstName: user.firstName,
          parentLastName: user.lastName,
          parentPhone: user.phone,
          emailAddress: user.email,
        }));
      } else {
        setIsParent(false);
        setShowParentForm(false);
        setFormData((prevData) => ({
          ...prevData,
          playerFirstName: user.firstName,
          playerSecondName: user.lastName,
          emailAddress: user.email,
        }));
      }
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDobChange = (e) => {
    handleChange(e);
    const dob = new Date(e.target.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    // Adjust age if the current month is before the birth month,
    // or if it's the birth month but the current date is before the birth date
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    setFormData((prevData) => ({
      ...prevData,
      playerAge: age,
    }));
    setShowParentForm(age < 18);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting application with data:", formData);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch("http://localhost:4000/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData), // Include formData with userId
      });

      if (response.ok) {
        setModalMessage("Application submitted successfully!");

        // Update user status after successful application
        const statusResponse = await fetch(
          "http://localhost:4000/api/auth/user-status/update",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user._id,
              status: "pending application",
            }),
          }
        );

        if (statusResponse.ok) {
          console.log("User status updated successfully.");

          // Update user context with new status
          setUser((prevUser) => ({
            ...prevUser,
            status: "pending application",
          }));
          setRegistrationStatus("pending application");
        } else {
          console.error("Failed to update user status.");
        }
      } else {
        const errorData = await response.json();
        setModalMessage(`Failed to submit application: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setModalMessage("Failed to submit application.");
    }

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    if (modalMessage === "Application submitted successfully!") {
      navigate("/");
    }
  };
  return (
    <div className="application-form-container">
      <h2>Application Form</h2>
      <BootstrapModal
        isOpen={isModalOpen}
        title="Select Role"
        onClose={handleCloseModal}
      >
        <div className="modal-button-container">
          <button
            className="modal-button"
            onClick={() => handleRoleSelection("Player")}
          >
            Player
          </button>
          <button
            className="modal-button"
            onClick={() => handleRoleSelection("Parent")}
          >
            Parent
          </button>
        </div>
      </BootstrapModal>
      <h3>Player Info</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userId">User ID:</label>
          <input
            id="userId"
            name="userId"
            type="text"
            value={formData.userId}
            readOnly
            required
          />
        </div>
        <div>
          <label htmlFor="playerFirstName">Player's First Name:</label>
          <input
            id="playerFirstName"
            name="playerFirstName"
            type="text"
            value={formData.playerFirstName}
            onChange={handleChange}
            required={!isParent}
          />
        </div>
        <div>
          <label htmlFor="playerSecondName">Player's Last Name:</label>
          <input
            id="playerSecondName"
            name="playerSecondName"
            type="text"
            value={formData.playerSecondName}
            onChange={handleChange}
            required={!isParent}
          />
        </div>
        <div>
          <label htmlFor="playerDob">Player's Date of Birth:</label>
          <input
            id="playerDob"
            name="playerDob"
            type="date"
            value={formData.playerDob}
            onChange={handleDobChange}
            required={!isParent}
          />
        </div>
        <div>
          <label htmlFor="playerAge">Player's Age:</label>
          <input
            id="playerAge"
            name="playerAge"
            type="number"
            value={formData.playerAge}
            onChange={handleChange}
            readOnly
            required={!isParent}
          />
        </div>
        <div>
          <label htmlFor="playerGender">Player's Gender:</label>
          <select
            id="playerGender"
            name="playerGender"
            type="text"
            value={formData.playerGender}
            onChange={handleChange}
            required={!isParent}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="emailAddress">Email Address:</label>
          <input
            id="emailAddress"
            name="emailAddress"
            type="email"
            value={formData.emailAddress}
            readOnly
            required
          />
        </div>
        <div>
          <label htmlFor="playerPhone">Player's Phone Number:</label>
          <input
            id="playerPhone"
            name="playerPhone"
            type="text"
            value={formData.playerPhone}
            onChange={handleChange}
            required
          />
        </div>
        {showParentForm && (
          <>
            <h3>Parent Info</h3>
            <div>
              <label htmlFor="parentFirstName">Parent's First Name:</label>
              <input
                id="parentFirstName"
                name="parentFirstName"
                type="text"
                value={formData.parentFirstName}
                onChange={handleChange}
                required={showParentForm}
              />
            </div>
            <div>
              <label htmlFor="parentLastName">Parent's Last Name:</label>
              <input
                id="parentLastName"
                name="parentLastName"
                type="text"
                value={formData.parentLastName}
                onChange={handleChange}
                required={showParentForm}
              />
            </div>
            <div>
              <label htmlFor="parentIDNumber">Parent's ID Number:</label>
              <input
                id="parentIDNumber"
                name="parentIDNumber"
                type="text"
                value={formData.parentIDNumber}
                onChange={handleChange}
                required={showParentForm}
                pattern="\d{13}"
                title="ID number should be 13 digits"
              />
            </div>
            <div>
              <label htmlFor="parentRelationship">Parent's Relationship:</label>
              <select
                id="parentRelationship"
                name="parentRelationship"
                value={formData.parentRelationship}
                onChange={handleChange}
                required={showParentForm}
              >
                <option value="">Select Relationship</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="parentPhone">Parent's Phone Number:</label>
              <input
                id="parentPhone"
                name="parentPhone"
                type="text"
                value={formData.parentPhone}
                onChange={handleChange}
                required={showParentForm}
              />
            </div>
            <div>
              <label htmlFor="parentalConsent">
                <input
                  id="parentalConsent"
                  name="parentalConsent"
                  type="checkbox"
                  checked={formData.parentalConsent}
                  onChange={handleChange}
                  required={showParentForm}
                />
                Parental Consent
              </label>
            </div>
          </>
        )}
        <button type="submit">Submit Application</button>
      </form>
      <BootstrapModal
        isOpen={modalVisible}
        title="Application Status"
        message={modalMessage}
        onClose={closeModal}
      />
    </div>
  );
};

export default ApplicationForm;

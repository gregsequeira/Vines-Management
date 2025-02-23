import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import { useAuth } from "../AuthContext";
import "../css/RegistrationForm.css";

const RegistrationForm = () => {
  const { user, setUser, setRegistrationStatus } = useAuth();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isPlayerAdult, setIsPlayerAdult] = useState(false);

  const [formData, setFormData] = useState({
    userId: user ? user._id : "",
    playerFirstName: "",
    playerSecondName: "",
    playerDob: "",
    playerAge: "",
    playerGender: "",
    playerIDNumber: "",
    address: "",
    schoolName: "",
    gradeLevel: "",
    emailAddress: user ? user.email : "",
    playerPhone: "",
    parentFirstName: "",
    parentLastName: "",
    parentIDNumber: "",
    parentRelationship: "",
    parentPhone: "",
    parentalConsent: false,
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    emergencyContactAltPhone: "",
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    familyDoctor: "",
    doctorPhone: "",
    medicalRelease: false,
    photoRelease: false,
    termsAgreement: false,
    comments: "",
    birthCertificate: null,
    medicalClearance: null,
  });

  useEffect(() => {
    // Fetch existing registration data if available
    const fetchRegistrationData = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/registrations/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFormData((prevData) => ({
            ...prevData,
            ...data,
            playerDob: data.playerDob ? data.playerDob.split("T")[0] : "",
          }));

          // Calculate player's age from fetched playerDob
          const dob = new Date(data.playerDob);
          const age = new Date().getFullYear() - dob.getFullYear();
          setIsPlayerAdult(age >= 18);
        } else {
          console.error("Failed to fetch registration data");
        }
      } catch (error) {
        console.error("Error fetching registration data:", error);
      }
    };
    fetchRegistrationData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setModalMessage("File size exceeds 5MB limit");
        setModalVisible(true);
        return;
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting registration with data:", formData);

    const token = localStorage.getItem("authToken");

    // Prepare FormData
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      // Submit registration update
      const response = await fetch(
        "http://localhost:4000/api/registration/update",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
          credentials: "include",
        }
      );

      if (response.ok) {
        setModalMessage("Registration updated successfully");

        // Update user status after successful registration update
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
              status: "pending registration",
            }),
          }
        );

        if (statusResponse.ok) {
          console.log("User status updated successfully.");

          // Update user context with new status
          setUser((prevUser) => ({
            ...prevUser,
            status: "pending registration",
          }));
          setRegistrationStatus("pending registration");
        } else {
          console.error("Failed to update user status.");
        }

        setModalVisible(true);
        setTimeout(() => navigate("/"), 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error updating registration:", error);
      setModalMessage(error.message || "Error updating registration");
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    if (modalMessage === "Application submitted successfully!") {
      navigate("/");
    }
  };

  return (
    <div className="registration-form-container">
      <h2>Registration</h2>
      <form onSubmit={handleSubmit}>
        {/* Player Information Fields */}
        <div>
          <h3>Player Information</h3>
          <label htmlFor="playerFirstName">Player's First Name:</label>
          <input
            id="playerFirstName"
            name="playerFirstName"
            type="text"
            value={formData.playerFirstName}
            onChange={handleChange}
            readOnly
            required
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
            readOnly
            required
          />
        </div>
        <div>
          <label htmlFor="playerDob">Player's Date of Birth:</label>
          <input
            id="playerDob"
            name="playerDob"
            type="date"
            value={formData.playerDob}
            onChange={handleChange}
            readOnly
            required
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
            required
            readOnly
          />
        </div>
        <div>
          <label htmlFor="playerGender">Player's Gender:</label>
          <select
            id="playerGender"
            name="playerGender"
            value={formData.playerGender}
            onChange={handleChange}
            readOnly
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="playerIDNumber">Player's ID Number:</label>
          <input
            id="playerIDNumber"
            name="playerIDNumber"
            type="text"
            value={formData.playerIDNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            readOnly
            required
          />
        </div>
        <div>
          <label htmlFor="schoolName">School Name:</label>
          <input
            id="schoolName"
            name="schoolName"
            type="text"
            value={formData.schoolName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="gradeLevel">Grade Level:</label>
          <input
            id="gradeLevel"
            name="gradeLevel"
            type="text"
            value={formData.gradeLevel}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="emailAddress">Email Address:</label>
          <input
            id="emailAddress"
            name="emailAddress"
            type="email"
            value={formData.emailAddress}
            onChange={handleChange}
            readOnly
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

        {!isPlayerAdult && (
          <div>
            <h3>Parent Information</h3>
            {/* Parent Information Fields */}
            <label htmlFor="parentFirstName">Parent's First Name:</label>
            <input
              id="parentFirstName"
              name="parentFirstName"
              type="text"
              value={formData.parentFirstName}
              onChange={handleChange}
              readOnly
            />
            <label htmlFor="parentLastName">Parent's Last Name:</label>
            <input
              id="parentLastName"
              name="parentLastName"
              type="text"
              value={formData.parentLastName}
              onChange={handleChange}
              readOnly
            />
            <label htmlFor="parentIDNumber">Parent's ID Number:</label>
            <input
              id="parentIDNumber"
              name="parentIDNumber"
              type="text"
              value={formData.parentIDNumber}
              onChange={handleChange}
              readOnly
            />
            <label htmlFor="parentRelationship">Parent's Relationship:</label>
            <input
              id="parentRelationship"
              name="parentRelationship"
              type="text"
              value={formData.parentRelationship}
              onChange={handleChange}
              readOnly
            />
            <label htmlFor="parentPhone">Parent's Phone Number:</label>
            <input
              id="parentPhone"
              name="parentPhone"
              type="text"
              value={formData.parentPhone}
              onChange={handleChange}
            />
            <label>
              <input
                id="parentalConsent"
                name="parentalConsent"
                type="checkbox"
                checked={formData.parentalConsent}
                onChange={handleChange}
              />
              Parental Consent
            </label>
          </div>
        )}

        {/* Emergency Contact Information Fields */}
        <div>
          <h3>Emergency Contact Information</h3>
          <div>
            <label htmlFor="emergencyContactName">
              Emergency Contact Name:
            </label>
            <input
              id="emergencyContactName"
              name="emergencyContactName"
              type="text"
              value={formData.emergencyContactName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="emergencyContactRelationship">
              Emergency Contact Relationship:
            </label>
            <input
              id="emergencyContactRelationship"
              name="emergencyContactRelationship"
              type="text"
              value={formData.emergencyContactRelationship}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="emergencyContactPhone">
              Emergency Contact Phone:
            </label>
            <input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="text"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="emergencyContactAltPhone">
              Emergency Contact Alt. Phone:
            </label>
            <input
              id="emergencyContactAltPhone"
              name="emergencyContactAltPhone"
              type="text"
              value={formData.emergencyContactAltPhone}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* Medical Information Fields */}
        <div>
          <h3>Medical Information</h3>
          <div>
            <label htmlFor="allergies">Allergies:</label>
            <input
              id="allergies"
              name="allergies"
              type="text"
              value={formData.allergies}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="medicalConditions">Medical Conditions:</label>
            <input
              id="medicalConditions"
              name="medicalConditions"
              type="text"
              value={formData.medicalConditions}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="currentMedications">Current Medications:</label>
            <input
              id="currentMedications"
              name="currentMedications"
              type="text"
              value={formData.currentMedications}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="familyDoctor">Family Doctor:</label>
            <input
              id="familyDoctor"
              name="familyDoctor"
              type="text"
              value={formData.familyDoctor}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="doctorPhone">Doctor's Phone Number:</label>
            <input
              id="doctorPhone"
              name="doctorPhone"
              type="text"
              value={formData.doctorPhone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>
              <input
                id="medicalRelease"
                name="medicalRelease"
                type="checkbox"
                checked={formData.medicalRelease}
                onChange={handleChange}
              />
              Medical Release
            </label>
          </div>
          <div>
            <label>
              <input
                id="photoRelease"
                name="photoRelease"
                type="checkbox"
                checked={formData.photoRelease}
                onChange={handleChange}
              />
              Photo Release
            </label>
          </div>
          <div>
            <label>
              <input
                id="termsAgreement"
                name="termsAgreement"
                type="checkbox"
                checked={formData.termsAgreement}
                onChange={handleChange}
              />
              I agree to the terms and conditions
            </label>
          </div>
          <div>
            <label htmlFor="comments">Additional Comments:</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* File Upload Fields */}
        <div>
          <h3>Required Documents</h3>
          <div>
            <label htmlFor="birthCertificate">Upload Birth Certificate:</label>
            <input
              id="birthCertificate"
              name="birthCertificate"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <label htmlFor="medicalClearance">Upload Medical Clearance:</label>
            <input
              id="medicalClearance"
              name="medicalClearance"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit">Submit Registration</button>
      </form>

      <BootstrapModal
        isOpen={modalVisible}
        title="Registration Status"
        message={modalMessage}
        onClose={closeModal}
      />
    </div>
  );
};

export default RegistrationForm;

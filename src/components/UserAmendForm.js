import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import BootstrapModal from "./BootstrapModal";
import { useNavigate } from "react-router-dom";
import "../css/UserAmendForm.css";

const UserAmendForm = () => {
  const { user, setUser, setRegistrationStatus } = useAuth();
  const [amendments, setAmendments] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const playerInfoFields = {
    playerFirstName: { type: "text", label: "Player First Name" },
    playerSecondName: { type: "text", label: "Player Second Name" },
    playerDob: { type: "date", label: "Player Date of Birth" },
    playerAge: { type: "number", label: "Player Age" },
    playerGender: { type: "text", label: "Player Gender" },
    address: { type: "text", label: "Address" },
    emailAddress: { type: "email", label: "Email Address" },
    playerPhone: { type: "tel", label: "Player Phone" },
    birthCertificate: { type: "file", label: "Birth Certificate" },
  };

  const parentInfoFields = {
    parentFirstName: { type: "text", label: "Parent First Name" },
    parentLastName: { type: "text", label: "Parent Last Name" },
    parentIDNumber: { type: "text", label: "Parent ID Number" },
    parentRelationship: { type: "text", label: "Parent Relationship" },
    parentPhone: { type: "tel", label: "Parent Phone" },
    parentalConsent: { type: "checkbox", label: "Parental Consent" },
  };

  const schoolInfoFields = {
    schoolName: { type: "text", label: "School Name" },
    gradeLevel: { type: "text", label: "Grade Level" },
  };

  const emergencyInfoFields = {
    emergencyContactName: { type: "text", label: "Emergency Contact Name" },
    emergencyContactRelationship: {
      type: "text",
      label: "Emergency Contact Relationship",
    },
    emergencyContactPhone: { type: "tel", label: "Emergency Contact Phone" },
    emergencyContactAltPhone: {
      type: "tel",
      label: "Emergency Contact Alt Phone",
    },
  };

  const medicalInfoFields = {
    allergies: { type: "text", label: "Allergies" },
    medicalConditions: { type: "text", label: "Medical Conditions" },
    currentMedications: { type: "text", label: "Current Medications" },
    familyDoctor: { type: "text", label: "Family Doctor" },
    doctorPhone: { type: "tel", label: "Doctor Phone" },
    medicalRelease: { type: "checkbox", label: "Medical Release" },
    photoRelease: { type: "checkbox", label: "Photo Release" },
    termsAgreement: { type: "checkbox", label: "Terms Agreement" },
    comments: { type: "textarea", label: "Comments" },
  };

  useEffect(() => {
    if (!user) {
      setError("User not found");
      setModalMessage("Error: User not found");
      setModalVisible(true);
      return;
    }

    setLoading(false);
  }, [user]);

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleChange = (field, value) => {
    if (field === "playerDob") {
      const age = calculateAge(value);
      setAmendments((prev) => ({
        ...prev,
        playerDob: value,
        playerAge: age,
      }));
    } else {
      setAmendments((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting amendments with data:", amendments);

    const token = localStorage.getItem("authToken");

    // Prepare FormData
    const formDataToSend = new FormData();
    Object.keys(amendments).forEach((key) => {
      if (amendments[key] !== null) {
        formDataToSend.append(key, amendments[key]);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="amend-form-container">
      <h2>Required Amendments</h2>
      <form onSubmit={handleSubmit}>
        <h3>Player Info</h3>
        {user.fieldsToAmend && user.fieldsToAmend.length > 0 && (
          <>
            {Object.keys(playerInfoFields).map((field) => {
              if (user.fieldsToAmend.includes(field)) {
                const config = playerInfoFields[field];
                return (
                  <div key={field} className="form-group">
                    <label htmlFor={field}>{config.label}:</label>
                    {config.type === "textarea" ? (
                      <textarea
                        className="input-field"
                        id={field}
                        name={field}
                        value={amendments[field] || ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        required
                      />
                    ) : config.type === "file" ? (
                      <input
                        className="input-field"
                        type={config.type}
                        id={field}
                        name={field}
                        onChange={(e) => handleChange(field, e.target.files[0])}
                        required
                      />
                    ) : config.type === "checkbox" ? (
                      <input
                        className="input-field"
                        type={config.type}
                        id={field}
                        name={field}
                        checked={amendments[field] || false}
                        onChange={(e) => handleChange(field, e.target.checked)}
                        required
                      />
                    ) : (
                      <input
                        className="input-field"
                        type={config.type}
                        id={field}
                        name={field}
                        value={amendments[field] || ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        required
                      />
                    )}
                  </div>
                );
              }
              return null;
            })}
          </>
        )}

        {amendments.playerAge && amendments.playerAge < 18 && (
          <>
            <h3>Parent Info</h3>
            {Object.keys(parentInfoFields).map((field) => {
              if (user.fieldsToAmend.includes(field)) {
                const config = parentInfoFields[field];
                return (
                  <div key={field} className="form-group">
                    <label htmlFor={field}>{config.label}:</label>
                    {config.type === "textarea" ? (
                      <textarea
                        className="input-field"
                        id={field}
                        name={field}
                        value={amendments[field] || ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        required
                      />
                    ) : config.type === "file" ? (
                      <input
                        className="input-field"
                        type={config.type}
                        id={field}
                        name={field}
                        onChange={(e) => handleChange(field, e.target.files[0])}
                        required
                      />
                    ) : config.type === "checkbox" ? (
                      <input
                        className="input-field"
                        type={config.type}
                        id={field}
                        name={field}
                        checked={amendments[field] || false}
                        onChange={(e) => handleChange(field, e.target.checked)}
                        required
                      />
                    ) : (
                      <input
                        className="input-field"
                        type={config.type}
                        id={field}
                        name={field}
                        value={amendments[field] || ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        required
                      />
                    )}
                  </div>
                );
              }
              return null;
            })}
          </>
        )}

        <h3>School Info</h3>
        {Object.keys(schoolInfoFields).map((field) => {
          if (user.fieldsToAmend.includes(field)) {
            const config = schoolInfoFields[field];
            return (
              <div key={field} className="form-group">
                <label htmlFor={field}>{config.label}:</label>
                {config.type === "textarea" ? (
                  <textarea
                    className="input-field"
                    id={field}
                    name={field}
                    value={amendments[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required
                  />
                ) : config.type === "file" ? (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    onChange={(e) => handleChange(field, e.target.files[0])}
                    required
                  />
                ) : config.type === "checkbox" ? (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    checked={amendments[field] || false}
                    onChange={(e) => handleChange(field, e.target.checked)}
                    required
                  />
                ) : (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    value={amendments[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required
                  />
                )}
              </div>
            );
          }
          return null;
        })}

        <h3>Emergency Contact Info</h3>
        {Object.keys(emergencyInfoFields).map((field) => {
          if (user.fieldsToAmend.includes(field)) {
            const config = emergencyInfoFields[field];
            return (
              <div key={field} className="form-group">
                <label htmlFor={field}>{config.label}:</label>
                {config.type === "textarea" ? (
                  <textarea
                    className="input-field"
                    id={field}
                    name={field}
                    value={amendments[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required
                  />
                ) : config.type === "file" ? (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    onChange={(e) => handleChange(field, e.target.files[0])}
                    required
                  />
                ) : config.type === "checkbox" ? (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    checked={amendments[field] || false}
                    onChange={(e) => handleChange(field, e.target.checked)}
                    required
                  />
                ) : (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    value={amendments[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required
                  />
                )}
              </div>
            );
          }
          return null;
        })}

        <h3>Medical Info</h3>
        {Object.keys(medicalInfoFields).map((field) => {
          if (user.fieldsToAmend.includes(field)) {
            const config = medicalInfoFields[field];
            return (
              <div key={field} className="form-group">
                <label htmlFor={field}>{config.label}:</label>
                {config.type === "textarea" ? (
                  <textarea
                    className="input-field"
                    id={field}
                    name={field}
                    value={amendments[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required
                  />
                ) : config.type === "file" ? (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    onChange={(e) => handleChange(field, e.target.files[0])}
                    required
                  />
                ) : config.type === "checkbox" ? (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    checked={amendments[field] || false}
                    onChange={(e) => handleChange(field, e.target.checked)}
                    required
                  />
                ) : (
                  <input
                    className="input-field"
                    type={config.type}
                    id={field}
                    name={field}
                    value={amendments[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required
                  />
                )}
              </div>
            );
          }
          return null;
        })}

        <button type="submit" className="submit-button">
          Submit Amendments
        </button>
      </form>

      <BootstrapModal
        isOpen={modalVisible}
        title="Amendment Status"
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default UserAmendForm;

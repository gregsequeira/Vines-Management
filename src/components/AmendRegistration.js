import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import "../css/AmendRegistration.css";

const AmendRegistration = () => {
  const { id } = useParams();
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState({});
  const [comments, setComments] = useState({});
  const [isPlayerAdult, setIsPlayerAdult] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`/api/registrations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched registration data:", data);
          setRegistrationData(data);

          // Calculate player's age from fetched playerDob
          const dob = new Date(data.playerDob);
          const age = new Date().getFullYear() - dob.getFullYear();
          setIsPlayerAdult(age >= 18);

          initializeChecklist(data, age >= 18);
        } else {
          console.error("Failed to fetch registration data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching registration data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRegistrationData();
    }
  }, [id]);

  const initializeChecklist = (data, isAdult) => {
    const fields = [
      "playerFirstName",
      "playerSecondName",
      "playerDob",
      "playerAge",
      "playerGender",
      "address",
      "emailAddress",
      "playerPhone",
      "birthCertificate",
      "parentFirstName",
      "parentLastName",
      "parentIDNumber",
      "parentRelationship",
      "parentPhone",
      "schoolName",
      "gradeLevel",
      "emergencyContactName",
      "emergencyContactRelationship",
      "emergencyContactPhone",
      "emergencyContactAltPhone",
      "allergies",
      "medicalConditions",
      "currentMedications",
      "familyDoctor",
      "doctorPhone",
      "parentalConsent",
      "medicalRelease",
      "photoRelease",
      "termsAgreement",
      "comments",
    ];
    const initialChecklist = {};
    fields.forEach((field) => {
      initialChecklist[field] =
        isAdult && field.startsWith("parent") ? true : false;
    });
    setChecklist(initialChecklist);
  };

  const handleCheckboxChange = (field) => {
    setChecklist((prevChecklist) => ({
      ...prevChecklist,
      [field]: !prevChecklist[field],
    }));
  };

  const handleCommentChange = (field, value) => {
    setComments((prevComments) => ({
      ...prevComments,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");

    const allChecked = Object.values(checklist).every(
      (value) => value === true
    );
    const status = allChecked ? "registered" : "review registration";
    const fieldsToAmend = Object.keys(checklist).filter(
      (field) => !checklist[field]
    );

    const reviewData = {
      userId: registrationData.userId,
      status: status,
      fieldsToAmend: fieldsToAmend,
    };

    console.log("Review data:", reviewData);

    try {
      const response = await fetch(`/api/registration/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        setModalMessage(
          allChecked
            ? "Registration completed and user is now registered!"
            : "Review submitted. User needs to amend the registration."
        );
        setModalVisible(true);
        if (allChecked) {
          setTimeout(
            () => navigate(`/player-form/${registrationData.userId}`),
            2000
          );
        } else {
          setTimeout(() => navigate("/admin/applications"), 2000);
        }
      } else {
        console.error("Failed to submit review");
        setModalMessage("Failed to submit review");
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setModalMessage("Error submitting review");
      setModalVisible(true);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!registrationData) {
    return <div>No registration data found.</div>;
  }

  return (
    <div className="amend-registration-container">
      <h2>Amend Registration</h2>

      <div>
        <h3>Player Information</h3>
        {/* Player Information */}
        <div>
          <p>
            <strong>First Name:</strong> {registrationData.playerFirstName}
          </p>
          <input
            type="checkbox"
            checked={checklist.playerFirstName || false}
            onChange={() => handleCheckboxChange("playerFirstName")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.playerFirstName || ""}
            onChange={(e) =>
              handleCommentChange("playerFirstName", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Second Name:</strong> {registrationData.playerSecondName}
          </p>
          <input
            type="checkbox"
            checked={checklist.playerSecondName || false}
            onChange={() => handleCheckboxChange("playerSecondName")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.playerSecondName || ""}
            onChange={(e) =>
              handleCommentChange("playerSecondName", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {new Date(registrationData.playerDob).toLocaleDateString()}
          </p>
          <input
            type="checkbox"
            checked={checklist.playerDob || false}
            onChange={() => handleCheckboxChange("playerDob")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.playerDob || ""}
            onChange={(e) => handleCommentChange("playerDob", e.target.value)}
          />
        </div>
        <div>
          <p>
            <strong>Age:</strong> {registrationData.playerAge}
          </p>
          <input
            type="checkbox"
            checked={checklist.playerAge || false}
            onChange={() => handleCheckboxChange("playerAge")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.playerAge || ""}
            onChange={(e) => handleCommentChange("playerAge", e.target.value)}
          />
        </div>
        <div>
          <p>
            <strong>Gender:</strong> {registrationData.playerGender}
          </p>
          <input
            type="checkbox"
            checked={checklist.playerGender || false}
            onChange={() => handleCheckboxChange("playerGender")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.playerGender || ""}
            onChange={(e) =>
              handleCommentChange("playerGender", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Address:</strong> {registrationData.address}
          </p>
          <input
            type="checkbox"
            checked={checklist.address || false}
            onChange={() => handleCheckboxChange("address")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.address || ""}
            onChange={(e) => handleCommentChange("address", e.target.value)}
          />
        </div>
        <div>
          <p>
            <strong>Email:</strong> {registrationData.emailAddress}
          </p>
          <input
            type="checkbox"
            checked={checklist.emailAddress || false}
            onChange={() => handleCheckboxChange("emailAddress")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.emailAddress || ""}
            onChange={(e) =>
              handleCommentChange("emailAddress", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Player Phone:</strong> {registrationData.playerPhone}
          </p>
          <input
            type="checkbox"
            checked={checklist.playerPhone || false}
            onChange={() => handleCheckboxChange("playerPhone")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.playerPhone || ""}
            onChange={(e) => handleCommentChange("playerPhone", e.target.value)}
          />
        </div>
      </div>
      <div>
        <div>
          <h3>Birth Certificate</h3>
          {registrationData.birthCertificate ? (
            <img
              src={`http://localhost:3000/${registrationData.birthCertificate}`}
              alt="Birth Certificate"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <p>No birth certificate uploaded</p>
          )}
          <input
            type="checkbox"
            checked={checklist.birthCertificate || false}
            onChange={() => handleCheckboxChange("birthCertificate")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.birthCertificate || ""}
            onChange={(e) =>
              handleCommentChange("birthCertificate", e.target.value)
            }
          />
        </div>

        {!isPlayerAdult && (
          <div>
            <h3>Parent Information</h3>
            {/* Parent Information */}
            <div>
              <p>
                <strong>Parent First Name:</strong>{" "}
                {registrationData.parentFirstName}
              </p>
              <input
                type="checkbox"
                checked={checklist.parentFirstName || false}
                onChange={() => handleCheckboxChange("parentFirstName")}
              />
              <input
                type="text"
                placeholder="Comments"
                value={comments.parentFirstName || ""}
                onChange={(e) =>
                  handleCommentChange("parentFirstName", e.target.value)
                }
              />
            </div>
            <div>
              <p>
                <strong>Parent Last Name:</strong>{" "}
                {registrationData.parentLastName}
              </p>
              <input
                type="checkbox"
                checked={checklist.parentLastName || false}
                onChange={() => handleCheckboxChange("parentLastName")}
              />
              <input
                type="text"
                placeholder="Comments"
                value={comments.parentLastName || ""}
                onChange={(e) =>
                  handleCommentChange("parentLastName", e.target.value)
                }
              />
            </div>
            <div>
              <p>
                <strong>Parent ID Number:</strong>{" "}
                {registrationData.parentIDNumber}
              </p>
              <input
                type="checkbox"
                checked={checklist.parentIDNumber || false}
                onChange={() => handleCheckboxChange("parentIDNumber")}
              />
              <input
                type="text"
                placeholder="Comments"
                value={comments.parentIDNumber || ""}
                onChange={(e) =>
                  handleCommentChange("parentIDNumber", e.target.value)
                }
              />
            </div>
            <div>
              <p>
                <strong>Parent Relationship:</strong>{" "}
                {registrationData.parentRelationship}
              </p>
              <input
                type="checkbox"
                checked={checklist.parentRelationship || false}
                onChange={() => handleCheckboxChange("parentRelationship")}
              />
              <input
                type="text"
                placeholder="Comments"
                value={comments.parentRelationship || ""}
                onChange={(e) =>
                  handleCommentChange("parentRelationship", e.target.value)
                }
              />
            </div>
            <div>
              <p>
                <strong>Parent Phone:</strong> {registrationData.parentPhone}
              </p>
              <input
                type="checkbox"
                checked={checklist.parentPhone || false}
                onChange={() => handleCheckboxChange("parentPhone")}
              />
              <input
                type="text"
                placeholder="Comments"
                value={comments.parentPhone || ""}
                onChange={(e) =>
                  handleCommentChange("parentPhone", e.target.value)
                }
              />
            </div>
          </div>
        )}

        <h3>School Information</h3>
        <div>
          <p>
            <strong>School Name:</strong> {registrationData.schoolName}
          </p>
          <input
            type="checkbox"
            checked={checklist.schoolName || false}
            onChange={() => handleCheckboxChange("schoolName")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.schoolName || ""}
            onChange={(e) => handleCommentChange("schoolName", e.target.value)}
          />
        </div>
        <div>
          <p>
            <strong>Grade Level:</strong> {registrationData.gradeLevel}
          </p>
          <input
            type="checkbox"
            checked={checklist.gradeLevel || false}
            onChange={() => handleCheckboxChange("gradeLevel")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.gradeLevel || ""}
            onChange={(e) => handleCommentChange("gradeLevel", e.target.value)}
          />
        </div>
      </div>
      <div>
        <h3>Emergency Contacts</h3>
        <div>
          <p>
            <strong>Emergency Contact Name:</strong>{" "}
            {registrationData.emergencyContactName}
          </p>
          <input
            type="checkbox"
            checked={checklist.emergencyContactName || false}
            onChange={() => handleCheckboxChange("emergencyContactName")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.emergencyContactName || ""}
            onChange={(e) =>
              handleCommentChange("emergencyContactName", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Emergency Contact Relationship:</strong>{" "}
            {registrationData.emergencyContactRelationship}
          </p>
          <input
            type="checkbox"
            checked={checklist.emergencyContactRelationship || false}
            onChange={() =>
              handleCheckboxChange("emergencyContactRelationship")
            }
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.emergencyContactRelationship || ""}
            onChange={(e) =>
              handleCommentChange(
                "emergencyContactRelationship",
                e.target.value
              )
            }
          />
        </div>
        <div>
          <p>
            <strong>Emergency Contact Phone:</strong>{" "}
            {registrationData.emergencyContactPhone}
          </p>
          <input
            type="checkbox"
            checked={checklist.emergencyContactPhone || false}
            onChange={() => handleCheckboxChange("emergencyContactPhone")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.emergencyContactPhone || ""}
            onChange={(e) =>
              handleCommentChange("emergencyContactPhone", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Emergency Contact Alt Phone:</strong>{" "}
            {registrationData.emergencyContactAltPhone}
          </p>
          <input
            type="checkbox"
            checked={checklist.emergencyContactAltPhone || false}
            onChange={() => handleCheckboxChange("emergencyContactAltPhone")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.emergencyContactAltPhone || ""}
            onChange={(e) =>
              handleCommentChange("emergencyContactAltPhone", e.target.value)
            }
          />
        </div>
      </div>
      <div>
        <h3>Medical Information</h3>
        <div>
          <p>
            <strong>Allergies:</strong> {registrationData.allergies}
          </p>
          <input
            type="checkbox"
            checked={checklist.allergies || false}
            onChange={() => handleCheckboxChange("allergies")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.allergies || ""}
            onChange={(e) => handleCommentChange("allergies", e.target.value)}
          />
        </div>
        <div>
          <p>
            <strong>Medical Conditions:</strong>{" "}
            {registrationData.medicalConditions}
          </p>
          <input
            type="checkbox"
            checked={checklist.medicalConditions || false}
            onChange={() => handleCheckboxChange("medicalConditions")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.medicalConditions || ""}
            onChange={(e) =>
              handleCommentChange("medicalConditions", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Current Medications:</strong>{" "}
            {registrationData.currentMedications}
          </p>
          <input
            type="checkbox"
            checked={checklist.currentMedications || false}
            onChange={() => handleCheckboxChange("currentMedications")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.currentMedications || ""}
            onChange={(e) =>
              handleCommentChange("currentMedications", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Family Doctor:</strong> {registrationData.familyDoctor}
          </p>
          <input
            type="checkbox"
            checked={checklist.familyDoctor || false}
            onChange={() => handleCheckboxChange("familyDoctor")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.familyDoctor || ""}
            onChange={(e) =>
              handleCommentChange("familyDoctor", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Doctor Phone:</strong> {registrationData.doctorPhone}
          </p>
          <input
            type="checkbox"
            checked={checklist.doctorPhone || false}
            onChange={() => handleCheckboxChange("doctorPhone")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.doctorPhone || ""}
            onChange={(e) => handleCommentChange("doctorPhone", e.target.value)}
          />
        </div>
      </div>
      <div>
        <h3>Consents and Agreements</h3>
        <div>
          <p>
            <strong>Parental Consent:</strong>{" "}
            {registrationData.parentalConsent ? "Yes" : "No"}
          </p>
          <input
            type="checkbox"
            checked={checklist.parentalConsent || false}
            onChange={() => handleCheckboxChange("parentalConsent")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.parentalConsent || ""}
            onChange={(e) =>
              handleCommentChange("parentalConsent", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Medical Release:</strong>{" "}
            {registrationData.medicalRelease ? "Yes" : "No"}
          </p>
          <input
            type="checkbox"
            checked={checklist.medicalRelease || false}
            onChange={() => handleCheckboxChange("medicalRelease")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.medicalRelease || ""}
            onChange={(e) =>
              handleCommentChange("medicalRelease", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Photo Release:</strong>{" "}
            {registrationData.photoRelease ? "Yes" : "No"}
          </p>
          <input
            type="checkbox"
            checked={checklist.photoRelease || false}
            onChange={() => handleCheckboxChange("photoRelease")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.photoRelease || ""}
            onChange={(e) =>
              handleCommentChange("photoRelease", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Terms Agreement:</strong>{" "}
            {registrationData.termsAgreement ? "Yes" : "No"}
          </p>
          <input
            type="checkbox"
            checked={checklist.termsAgreement || false}
            onChange={() => handleCheckboxChange("termsAgreement")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.termsAgreement || ""}
            onChange={(e) =>
              handleCommentChange("termsAgreement", e.target.value)
            }
          />
        </div>
        <div>
          <p>
            <strong>Comments:</strong> {registrationData.comments}
          </p>
          <input
            type="checkbox"
            checked={checklist.comments || false}
            onChange={() => handleCheckboxChange("comments")}
          />
          <input
            type="text"
            placeholder="Comments"
            value={comments.comments || ""}
            onChange={(e) => handleCommentChange("comments", e.target.value)}
          />
        </div>
      </div>
      <div>
        <button onClick={handleSubmit}>Submit Review</button>
      </div>
      <BootstrapModal
        isOpen={modalVisible}
        title="Amendment Status"
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default AmendRegistration;

/* In the code snippet above, we have created a new component called AmendRegistration. 
This component fetches registration data for a specific user based on the userId provided in the URL params. 
It then displays the registration data and allows the admin to review and amend the information. */

import React, { useState, useEffect } from "react";
import BootstrapModal from "./BootstrapModal";
import { useNavigate } from "react-router-dom";
import "../css/AdminApplications.css";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] =
    useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
    fetchRegistrations();
  }, []);

  const fetchApplications = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/api/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    }
  };

  const fetchRegistrations = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/api/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setRegistrations([]);
    }
  };

  const handleSelectApplication = (application) => {
    setSelectedRegistration(null);
    setSelectedApplication(application);
    setApplicationModalVisible(true);
    setRegistrationModalVisible(false);
  };

  const handleSelectRegistration = (registration) => {
    setSelectedApplication(null);
    setSelectedRegistration(registration);
    setApplicationModalVisible(false);
    setRegistrationModalVisible(true);

    console.log("Selected Registration:", registration);
    console.log("Selected Registration userId:", registration.userId);
  };

  const handleApprove = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/api/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedApplication.applicationDetails[0]._id,
          status: "approved application",
        }),
      });

      if (response.ok) {
        setStatusMessage("Application approved successfully!");
        fetchApplications();
        fetchRegistrations();
      } else {
        const errorData = await response.json();
        setStatusMessage(`Failed to approve application: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error approving application:", error);
      setStatusMessage("Failed to approve application.");
    }
    setApplicationModalVisible(false);
  };

  const handleDecline = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/api/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedApplication.applicationDetails[0]._id,
          status: "denied",
        }),
      });

      if (response.ok) {
        setStatusMessage("Application declined successfully!");
        fetchApplications();
        fetchRegistrations();
      } else {
        const errorData = await response.json();
        setStatusMessage(`Failed to decline application: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error declining application:", error);
      setStatusMessage("Failed to decline application.");
    }
    setApplicationModalVisible(false);
  };

  const closeModal = () => {
    setApplicationModalVisible(false);
    setRegistrationModalVisible(false);
    setStatusMessage("");
  };

  const handleViewRegistration = async () => {
    setRegistrationModalVisible(false);
    if (selectedRegistration && selectedRegistration._id) {
      const userId = selectedRegistration._id; // This is the user ID we want to match
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`/api/registrations/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const registration = await response.json();
          const registrationId = registration._id;
          navigate(`/admin/amend-registration/${registrationId}`);
        } else {
          console.error("Failed to fetch registration");
        }
      } catch (error) {
        console.error("Error fetching registration:", error);
      }
    } else {
      console.error("Selected registration does not have a userId");
    }
  };

  return (
    <div className="admin-applications-container">
      <h2>Manage Applications and Registrations</h2>
      <div className="applications-table">
        <h3>Applications</h3>
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(
              (application) =>
                application.applicationDetails.length > 0 && (
                  <tr
                    key={application._id}
                    onClick={() => handleSelectApplication(application)}
                  >
                    <td>{`${application.applicationDetails[0].playerFirstName} ${application.applicationDetails[0].playerSecondName}`}</td>
                    <td>{application.applicationDetails[0].emailAddress}</td>
                    <td>{application.applicationDetails[0].address}</td>
                    <td>{application.status}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
      <div className="registrations-table">
        <h3>Registrations</h3>
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(
              (registration) =>
                registration.registrationDetails.length > 0 && (
                  <tr
                    key={registration._id}
                    onClick={() => handleSelectRegistration(registration)}
                  >
                    <td>{`${registration.registrationDetails[0].playerFirstName} ${registration.registrationDetails[0].playerSecondName}`}</td>
                    <td>{registration.registrationDetails[0].emailAddress}</td>
                    <td>{registration.registrationDetails[0].address}</td>
                    <td>{registration.status}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
      {selectedApplication && applicationModalVisible && (
        <BootstrapModal
          isOpen={applicationModalVisible}
          title="Application Details"
          onClose={closeModal}
        >
          <div className="selected-application-modal">
            <div className="selected-application-content">
              <p>
                <strong>Player Name:</strong>{" "}
                {selectedApplication.applicationDetails[0]?.playerFirstName}{" "}
                {selectedApplication.applicationDetails[0]?.playerSecondName}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(
                  selectedApplication.applicationDetails[0]?.playerDob
                ).toLocaleDateString("en-CA")}
              </p>
              <p>
                <strong>Age:</strong>{" "}
                {selectedApplication.applicationDetails[0]?.playerAge}
              </p>
              <p>
                <strong>Gender:</strong>{" "}
                {selectedApplication.applicationDetails[0]?.playerGender}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {selectedApplication.applicationDetails[0]?.address}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {selectedApplication.applicationDetails[0]?.emailAddress}
              </p>
              <p>
                <strong>Player Phone:</strong>{" "}
                {selectedApplication.applicationDetails[0]?.playerPhone}
              </p>
              {selectedApplication.applicationDetails[0]?.parentFirstName && (
                <>
                  <p>
                    <strong>Parent Name:</strong>{" "}
                    {selectedApplication.applicationDetails[0]?.parentFirstName}{" "}
                    {selectedApplication.applicationDetails[0]?.parentLastName}
                  </p>
                  <p>
                    <strong>Parent ID Number:</strong>{" "}
                    {selectedApplication.applicationDetails[0]?.parentIDNumber}
                  </p>
                  <p>
                    <strong>Parent Relationship:</strong>{" "}
                    {
                      selectedApplication.applicationDetails[0]
                        ?.parentRelationship
                    }
                  </p>
                  <p>
                    <strong>Parent Phone:</strong>{" "}
                    {selectedApplication.applicationDetails[0]?.parentPhone}
                  </p>
                  <p>
                    <strong>Parental Consent:</strong>{" "}
                    {selectedApplication.applicationDetails[0]?.parentalConsent
                      ? "Yes"
                      : "No"}
                  </p>
                </>
              )}
              <p>
                <strong>Status:</strong> {selectedApplication.status}
              </p>
              <button className="action-button" onClick={handleApprove}>
                Approve
              </button>
              <button className="action-button" onClick={handleDecline}>
                Decline
              </button>
            </div>
          </div>
        </BootstrapModal>
      )}
      {selectedRegistration && registrationModalVisible && (
        <BootstrapModal
          isOpen={registrationModalVisible}
          title="View Registration"
          onClose={closeModal}
        >
          <div className="confirm-view-registration">
            <p>Would you like to view this registration?</p>
            <button className="action-button" onClick={handleViewRegistration}>
              View
            </button>
            <button className="action-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </BootstrapModal>
      )}
      {statusMessage && (
        <BootstrapModal
          isOpen={!!statusMessage}
          title="Application Status"
          message={statusMessage}
          onClose={() => setStatusMessage("")}
        />
      )}
    </div>
  );
};

export default AdminApplications;

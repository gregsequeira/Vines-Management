import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Table, Button, Card } from "react-bootstrap";
import BootstrapModal from "./BootstrapModal";
import "../css/ManagerManagement.css";

const ManagerManagement = () => {
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [squads, setSquads] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [showManagerModal, setShowManagerModal] = useState(false);

  useEffect(() => {
    fetchManagers();
    fetchEligibleUsers();
    fetchSquads();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get("/api/managers");
      const managersData = response.data.filter((manager) => manager !== null);
      setManagers(managersData);
    } catch (error) {
      console.error("Error fetching managers", error);
    }
  };

  const fetchEligibleUsers = async () => {
    try {
      const response = await axios.get("/api/managers/eligible-managers");
      setUsers(response.data.filter((user) => user !== null));
    } catch (error) {
      console.error("Error fetching eligible users", error);
    }
  };

  const fetchSquads = async () => {
    try {
      const response = await axios.get("/api/squads");
      const squadsData = response.data.filter((squad) => squad !== null);
      setSquads(squadsData);
    } catch (error) {
      console.error("Error fetching squads", error);
    }
  };

  const handleCreateManager = () => {
    setSelectedManager(null);
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditManager = (manager) => {
    setSelectedManager(manager);
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedManager(null);
    setEditMode(false);
  };

  const getAvailableSquadsForEdit = (selectedManager, values) => {
    if (!selectedManager) return [];

    return squads.filter((squad) => {
      const isManaging = selectedManager.squads.includes(squad._id);
      const isAssisting = values.assistants.includes(squad._id);

      return (
        squad &&
        (!squad.manager ||
          squad.manager === selectedManager._id ||
          isManaging) &&
        !isAssisting
      );
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editMode) {
        await axios.put(`/api/managers/${selectedManager._id}`, values);
        setNotificationMessage("Manager updated successfully.");

        // Update squads collection
        const previousSquads = selectedManager.squads.map((squad) => squad._id);
        for (const squadId of previousSquads) {
          if (squadId && !values.squads.includes(squadId)) {
            await axios.put(`/api/squads/${squadId}/remove-manager`, {
              managerId: selectedManager._id,
            });
          }
        }
        for (const squadId of values.squads) {
          if (squadId && !previousSquads.includes(squadId)) {
            await axios.put(`/api/squads/${squadId}/assign-manager`, {
              managerId: selectedManager._id,
            });
          }
        }

        // Update assistant managers collection
        const previousAssistants = squads
          .filter((squad) =>
            squad.assistantManagers?.includes(selectedManager._id)
          )
          .map((squad) => squad._id);

        for (const assistantId of previousAssistants) {
          if (assistantId && !values.assistants.includes(assistantId)) {
            await axios.put(`/api/squads/${assistantId}/remove-assistant`, {
              assistantId: selectedManager._id,
            });
          }
        }
        for (const assistantId of values.assistants) {
          if (assistantId && !previousAssistants.includes(assistantId)) {
            await axios.put(`/api/squads/${assistantId}/assign-assistant`, {
              assistantId: selectedManager._id,
            });
          }
        }
      } else {
        // Include 'assistants' in the request body
        const newManager = await axios.post("/api/managers/create", {
          ...values,
          assistants: values.assistants,
        });
        setNotificationMessage("Manager created successfully.");
        console.log("Manager created successfully:", newManager.data._id);
        await fetchEligibleUsers();
      }

      await fetchSquads();
      await fetchManagers(); // Ensure data is re-fetched
      setShowModal(false);
      setShowNotification(true);
      setSelectedManager(null); // Ensure selectedManager is reset
      setEditMode(false);
    } catch (error) {
      console.error("Error saving manager", error);
      setNotificationMessage("Failed to save manager.");
      setShowNotification(true);
      setEditMode(false);
    }
  };

  const handleShowManagerDetails = (manager) => {
    setSelectedManager(manager);
    setShowManagerModal(true);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
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

  const validationSchema = Yup.object({
    user: Yup.string().required("User is required"),
    dateOfBirth: Yup.date().required("Date of Birth is required"),
    age: Yup.number().required("Age is required"),
    idNumber: Yup.string().required("ID Number is required"),
    contactNumber: Yup.string().required("Contact Number is required"),
    squads: Yup.array()
      .of(Yup.string())
      .required("At least one squad is required"),
    assistants: Yup.array().of(Yup.string()),
  });

  const handleDeleteManager = async (managerId) => {
    try {
      // Call the single delete route that handles the entire deletion process
      await axios.delete(`/api/managers/${managerId}`);

      setNotificationMessage("Manager deleted successfully.");
      await fetchManagers();
      await fetchSquads();
      setShowNotification(true);
      setShowDeleteConfirm(false);
      await fetchEligibleUsers();
    } catch (error) {
      console.error("Error deleting manager", error);
      setNotificationMessage("Failed to delete manager.");
      setShowNotification(true);
    }
  };

  const getAvailableSquads = () => {
    return squads.filter((squad) => {
      return squad && !squad.manager;
    });
  };

  const getAvailableAssistants = (selectedManager, values) => {
    const assignedSquads = values.squads;
    return squads.filter((squad) => {
      return squad && !assignedSquads.includes(squad._id);
    });
  };

  const confirmDeleteManager = (managerId) => {
    setManagerToDelete(managerId);
    setShowDeleteConfirm(true);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const handleCloseManagerModal = () => {
    setShowManagerModal(false);
    setSelectedManager(null);
  };

  const sortedManagers = [...managers].sort((a, b) => {
    const firstNameA = a.user.firstName.toLowerCase();
    const firstNameB = b.user.firstName.toLowerCase();

    if (firstNameA < firstNameB) return -1;
    if (firstNameA > firstNameB) return 1;
    return 0;
  });

  return (
    <div className="manager-management-container">
      <h2>Managers</h2>
      <div className="create-manager-button-container">
        <Button className="create-manager-button" onClick={handleCreateManager}>
          Create Manager
        </Button>
      </div>
      <Table
        className="manager-management-table"
        striped
        bordered
        hover
        variant="dark"
      >
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Squad</th>
            <th>Assistant</th>
            <th className="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedManagers.map((manager) => (
            <tr key={manager._id}>
              <td
                onClick={() => {
                  !editMode && handleShowManagerDetails(manager);
                }}
                className="clickable"
              >
                {manager.user.firstName}
              </td>
              <td
                onClick={() => {
                  !editMode && handleShowManagerDetails(manager);
                }}
                className="clickable"
              >
                {manager.user.lastName}
              </td>
              <td>
                {manager.squads && manager.squads.length > 0
                  ? manager.squads
                      .map((squadId) => {
                        const squad = squads.find(
                          (s) => s && s._id === squadId
                        );
                        return squad ? squad.ageGroup : "Unknown Squad";
                      })
                      .join(", ")
                  : "No Squads Assigned"}
              </td>
              <td>
                {squads
                  .filter((squad) =>
                    squad.assistantManagers?.includes(manager._id)
                  )
                  .map((squad) => squad.ageGroup)
                  .join(", ") || "No Squads Assigned"}
              </td>
              <td className="actions-column">
                <Button
                  variant="info"
                  onClick={() => handleEditManager(manager)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => confirmDeleteManager(manager._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <BootstrapModal
        isOpen={showModal}
        title={editMode ? "Edit Manager" : "Create Manager"}
        onClose={handleCloseModal}
      >
        {selectedManager || !editMode ? (
          <Formik
            initialValues={{
              user: selectedManager ? selectedManager.user._id : "",
              dateOfBirth: selectedManager
                ? new Date(selectedManager.dateOfBirth)
                    .toISOString()
                    .split("T")[0]
                : "",
              age: selectedManager ? selectedManager.age : "",
              idNumber: selectedManager ? selectedManager.idNumber : "",
              contactNumber: selectedManager
                ? selectedManager.contactNumber
                : "",
              squads:
                selectedManager && Array.isArray(selectedManager.squads)
                  ? selectedManager.squads
                  : [],
              assistants: squads
                .filter((squad) =>
                  squad.assistantManagers?.includes(selectedManager?._id)
                )
                .map((squad) => squad._id),
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue }) => (
              <Form>
                {editMode && selectedManager && (
                  <div className="form-group">
                    <label htmlFor="user">User</label>
                    <Field
                      type="text"
                      name="user"
                      id="user"
                      className="form-control"
                      value={`${selectedManager.user.firstName} ${selectedManager.user.lastName}`}
                      readOnly
                    />
                    <ErrorMessage
                      name="user"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                )}
                {!editMode && (
                  <div className="form-group">
                    <label htmlFor="user">User</label>
                    <Field
                      as="select"
                      name="user"
                      id="user"
                      className="form-control"
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="user"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <Field
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-control"
                    onChange={(e) => {
                      setFieldValue("dateOfBirth", e.target.value);
                      setFieldValue("age", calculateAge(e.target.value));
                    }}
                  />
                  <ErrorMessage
                    name="dateOfBirth"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <Field
                    type="number"
                    id="age"
                    name="age"
                    className="form-control"
                    readOnly
                  />
                  <ErrorMessage
                    name="age"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="idNumber">ID Number</label>
                  <Field
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="idNumber"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactNumber">Contact Number</label>
                  <Field
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="contactNumber"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="squads">Squads</label>
                  <div className="checkbox-grid">
                    {editMode
                      ? getAvailableSquadsForEdit(selectedManager, values).map(
                          (squad) => (
                            <div key={squad._id} className="form-check">
                              <Field
                                type="checkbox"
                                name="squads"
                                value={squad._id}
                                checked={values.squads.includes(squad._id)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setFieldValue(
                                    "squads",
                                    isChecked
                                      ? [...values.squads, squad._id]
                                      : values.squads.filter(
                                          (id) => id !== squad._id
                                        )
                                  );

                                  if (isChecked) {
                                    setFieldValue(
                                      "assistants",
                                      values.assistants.filter(
                                        (id) => id !== squad._id
                                      )
                                    );
                                  }
                                }}
                                className="form-check-input"
                              />
                              <label className="form-check-label">
                                {squad.ageGroup}
                              </label>
                            </div>
                          )
                        )
                      : getAvailableSquads().map((squad) => (
                          <div key={squad._id} className="form-check">
                            <Field
                              type="checkbox"
                              name="squads"
                              value={squad._id}
                              checked={values.squads.includes(squad._id)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setFieldValue(
                                  "squads",
                                  isChecked
                                    ? [...values.squads, squad._id]
                                    : values.squads.filter(
                                        (id) => id !== squad._id
                                      )
                                );

                                if (isChecked) {
                                  setFieldValue(
                                    "assistants",
                                    values.assistants.filter(
                                      (id) => id !== squad._id
                                    )
                                  );
                                }
                              }}
                              className="form-check-input"
                            />
                            <label className="form-check-label">
                              {squad.ageGroup}
                            </label>
                          </div>
                        ))}
                  </div>
                  <ErrorMessage
                    name="squads"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="assistants">Assistants</label>
                  <div className="checkbox-grid">
                    {getAvailableAssistants(selectedManager, values).map(
                      (squad) => (
                        <div key={squad._id} className="form-check">
                          <Field
                            type="checkbox"
                            name="assistants"
                            value={squad._id}
                            checked={values.assistants.includes(squad._id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setFieldValue(
                                "assistants",
                                isChecked
                                  ? [...values.assistants, squad._id]
                                  : values.assistants.filter(
                                      (id) => id !== squad._id
                                    )
                              );

                              if (isChecked) {
                                setFieldValue(
                                  "squads",
                                  values.squads.filter((id) => id !== squad._id)
                                );
                              }
                            }}
                            className="form-check-input"
                          />
                          <label className="form-check-label">
                            {squad.ageGroup}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                  <ErrorMessage
                    name="assistants"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <Button
                  type="submit"
                  className="btn btn-primary save-changes-button"
                >
                  {editMode ? "Save Changes" : "Create Manager"}
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <div>Loading...</div>
        )}
      </BootstrapModal>
      <BootstrapModal
        isOpen={showManagerModal}
        title="Manager Details"
        onClose={handleCloseManagerModal}
      >
        {selectedManager && (
          <Card className="manager-details">
            <Card.Body>
              <Card.Title>
                {selectedManager.user.firstName} {selectedManager.user.lastName}
              </Card.Title>
              <Card.Text>
                <strong>Date of Birth:</strong>{" "}
                {new Date(selectedManager.dateOfBirth).toLocaleDateString()}
              </Card.Text>
              <Card.Text>
                <strong>Age:</strong> {selectedManager.age}
              </Card.Text>
              <Card.Text>
                <strong>ID Number:</strong> {selectedManager.idNumber}
              </Card.Text>
              <Card.Text>
                <strong>Contact Number:</strong> {selectedManager.contactNumber}
              </Card.Text>
              <Card.Text>
                <strong>Squads:</strong>{" "}
                {selectedManager.squads && selectedManager.squads.length > 0
                  ? selectedManager.squads
                      .map((squadId) => {
                        const squad = squads.find(
                          (s) => s && s._id === squadId
                        );
                        return squad ? squad.ageGroup : "Unknown Squad";
                      })
                      .join(", ")
                  : "No Squads Assigned"}
              </Card.Text>
              <Card.Text>
                <strong>Assistants:</strong>{" "}
                {squads
                  .filter((squad) =>
                    squad.assistantManagers?.includes(selectedManager._id)
                  )
                  .map((squad) => squad.ageGroup)
                  .join(", ") || "No Squads Assigned"}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
      </BootstrapModal>
      <BootstrapModal
        isOpen={showDeleteConfirm}
        title="Confirm Delete"
        onClose={() => setShowDeleteConfirm(false)}
      >
        <p>Are you sure you want to delete this manager?</p>
        <Button
          variant="danger"
          onClick={() => handleDeleteManager(managerToDelete)}
        >
          Delete
        </Button>
        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
          Cancel
        </Button>
      </BootstrapModal>

      <BootstrapModal
        isOpen={showNotification}
        title="Notification"
        onClose={handleNotificationClose}
      >
        <p>{notificationMessage}</p>
      </BootstrapModal>
    </div>
  );
};

export default ManagerManagement;

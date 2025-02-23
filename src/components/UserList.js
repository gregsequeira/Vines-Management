import React, { useState, useEffect } from "react";
import axios from "axios";
import BootstrapModal from "../components/BootstrapModal";
import "../css/UserList.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({
    title: "",
    message: "",
  });
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    action: null,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/admin/users"
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setModalContent({
      title: "User Options",
      message: `Select an option for ${user.firstName} ${user.lastName}`,
      action: null,
    });
  };

  const handleChangeRole = () => {
    setModalContent({
      title: "Confirm Change Role",
      message: `Are you sure you want to change the role of ${selectedUser.firstName} ${selectedUser.lastName} to manager?`,
      action: "changeRole",
    });
  };

  const handleDeleteUser = () => {
    setModalContent({
      title: "Confirm Delete User",
      message: `Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}?`,
      action: "deleteUser",
    });
  };

  const handleConfirmAction = async () => {
    if (modalContent.action === "changeRole") {
      try {
        await axios.put(
          `http://localhost:4000/api/admin/update-role/${selectedUser._id}`,
          { role: "manager" }
        );
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? { ...user, role: "manager" } : user
          )
        );
        setSuccessModalContent({
          title: "Success",
          message: "User role updated successfully!",
        });
        setIsSuccessModalOpen(true);
      } catch (error) {
        setSuccessModalContent({
          title: "Error",
          message: "Failed to update user role.",
        });
        setIsSuccessModalOpen(true);
      }
    } else if (modalContent.action === "deleteUser") {
      try {
        await axios.delete(
          `http://localhost:4000/api/admin/delete-user/${selectedUser._id}`
        );
        setUsers(users.filter((user) => user._id !== selectedUser._id));
        setSuccessModalContent({
          title: "Success",
          message: "User deleted successfully!",
        });
        setIsSuccessModalOpen(true);
      } catch (error) {
        setSuccessModalContent({
          title: "Error",
          message: "Failed to delete user.",
        });
        setIsSuccessModalOpen(true);
      }
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <div className="user-list">
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} onClick={() => handleUserClick(user)}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <BootstrapModal
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onClose={handleCloseModal}
      >
        <div className="modal-buttons-container">
          {modalContent.action === null ? (
            <>
              <button className="modal-button" onClick={handleChangeRole}>
                Change to Manager
              </button>
              <button className="modal-button" onClick={handleDeleteUser}>
                Delete User
              </button>
            </>
          ) : (
            <>
              <button className="modal-button" onClick={handleConfirmAction}>
                Confirm
              </button>
              <button className="modal-button" onClick={handleCloseModal}>
                Cancel
              </button>
            </>
          )}
        </div>
      </BootstrapModal>
      <BootstrapModal
        isOpen={isSuccessModalOpen}
        title={successModalContent.title}
        message={successModalContent.message}
        onClose={handleCloseSuccessModal}
      />
    </div>
  );
};

export default UserList;

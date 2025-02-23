import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import BootstrapModal from "./BootstrapModal";
import "../css/LoginPage.css";

const LoginPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const onSubmit = async (values) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        values
      );
      const { token, user } = response.data; // Ensure response data includes user

      localStorage.setItem("token", token);

      if (user.role !== "admin" && user.role !== "manager") {
        // Fetch registration status for regular users
        const statusResponse = await axios.get(
          "http://localhost:4000/api/user-status",
          {
            params: { emailAddress: user.email },
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the headers
            },
          }
        );
        login({ user, token, status: statusResponse.data.status });
      } else {
        // Login without fetching registration status for admin
        login({ user, token });
      }

      // Navigate based on role
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setModalMessage(
        "Login failed. Please check your username and password and try again."
      );
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          <div>
            <label htmlFor="username">Username:</label>
            <Field type="text" id="username" name="username" />
            <ErrorMessage
              name="username"
              component="div"
              className="error-message"
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <Field type="password" id="password" name="password" />
            <ErrorMessage
              name="password"
              component="div"
              className="error-message"
            />
          </div>
          <button type="submit">Login</button>
        </Form>
      </Formik>
      <div className="forgot-password-link">
        <a href="/password-reset">Forgot Password?</a>
      </div>
      <BootstrapModal
        isOpen={isModalOpen}
        title="Login Error"
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default LoginPage;

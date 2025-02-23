import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BootstrapModal from "../components/BootstrapModal";
import "../css/PasswordReset.css";

const RequestPasswordReset = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const navigate = useNavigate();

  const initialValues = {
    email: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });

  const onSubmit = async (values) => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/request-password-reset",
        values
      );
      setModalContent({
        title: "Password Reset Requested",
        message: `An email has been sent to reset your password. Please check your inbox.`,
      });
      setIsModalOpen(true);
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Error requesting password reset. Please try again.";
      setModalContent({
        title: "Error",
        message: errorMessage,
      });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/login");
  };

  return (
    <div className="request-password-reset">
      <h1>Request Password Reset</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          <div>
            <label htmlFor="email">Email:</label>
            <Field type="email" id="email" name="email" />
            <ErrorMessage
              name="email"
              component="div"
              className="error-message"
            />
          </div>
          <button type="submit">Request Reset</button>
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

export default RequestPasswordReset;

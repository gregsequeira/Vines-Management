import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import BootstrapModal from "../components/BootstrapModal";
import "../css/PasswordResetForm.css";

const ResetPassword = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const navigate = useNavigate();
  const { token } = useParams();

  const initialValues = {
    password: "",
  };

  const validationSchema = Yup.object({
    password: Yup.string().required("Password is required"),
  });

  const onSubmit = async (values) => {
    try {
      await axios.post(
        `http://localhost:4000/api/auth/reset-password/${token}`,
        values
      );
      setModalContent({
        title: "Password Reset Successful",
        message:
          "Your password has been reset successfully. You can now log in with your new password.",
      });
      setIsModalOpen(true);
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Error resetting password. Please try again.";
      setModalContent({
        title: "Error",
        message: errorMessage,
      });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    modalContent.title === "Password Reset Successful"
      ? navigate("/login")
      : navigate(`/reset-password/${token}`);
  };

  return (
    <div className="reset-password">
      <h1>Reset Password</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          <div>
            <label htmlFor="password">New Password:</label>
            <Field type="password" id="password" name="password" />
            <ErrorMessage
              name="password"
              component="div"
              className="error-message"
            />
          </div>
          <button type="submit">Reset Password</button>
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

export default ResetPassword;

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BootstrapModal from "../components/BootstrapModal";
import "../css/SignupPage.css";

const SignupPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const navigate = useNavigate();

  const initialValues = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    username: Yup.string().required("Username is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const onSubmit = async (values) => {
    try {
      await axios.post("http://localhost:4000/api/auth/signup", values);
      setModalContent({
        title: "Signup Successful",
        message:
          "Thank you for joining Vines FC! As a member, you'll receive the latest news, fixtures, results, promotions, and discounts. We're excited to have you with us!",
      });
      setIsModalOpen(true);
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Signup failed. Please try again.";
      setModalContent({
        title: "Signup Failed",
        message:
          errorMessage === "User already exists"
            ? "A user with this email already exists. Please try a different email."
            : errorMessage,
      });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    modalContent.title === "Signup Successful"
      ? navigate("/login")
      : navigate("/signup");
  };

  return (
    <div className="signup-page">
      <h1>Sign Up</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          <div>
            <label htmlFor="firstName">First Name:</label>
            <Field type="text" id="firstName" name="firstName" />
            <ErrorMessage
              name="firstName"
              component="div"
              className="error-message"
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name:</label>
            <Field type="text" id="lastName" name="lastName" />
            <ErrorMessage
              name="lastName"
              component="div"
              className="error-message"
            />
          </div>
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
            <label htmlFor="email">Email:</label>
            <Field type="email" id="email" name="email" />
            <ErrorMessage
              name="email"
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
          <button type="submit">Sign Up</button>
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

export default SignupPage;

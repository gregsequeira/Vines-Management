import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../css/BootstrapModal.css";

const BootstrapModal = ({ isOpen, title, message, onClose, children }) => {
  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message}
        {children} {/* Render children here */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BootstrapModal;

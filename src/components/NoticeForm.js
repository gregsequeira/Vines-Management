import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import { Editor } from "@tinymce/tinymce-react";
import "../css/NoticeForm.css";

const NoticeForm = ({ existingNotice, onUpdate }) => {
  const [title, setTitle] = useState(
    existingNotice ? existingNotice.title : ""
  );
  const [content, setContent] = useState(
    existingNotice ? existingNotice.content : ""
  );
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (media) {
      formData.append("media", media);
    }

    try {
      const response = existingNotice
        ? await axios.put(`/api/notice/${existingNotice._id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        : await axios.post("/api/notice/add", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
      setMessage(
        existingNotice
          ? "Notice updated successfully!"
          : "Notice created successfully!"
      );
      setTitle("");
      setContent("");
      setMedia(null);
      setMediaPreview(null);
      setIsModalOpen(true);
      if (onUpdate) onUpdate(response.data.notice);
    } catch (error) {
      setMessage("Error creating notice. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="notice-form-container">
      <h2>{existingNotice ? "Edit Notice" : "Create Notice"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="editor-wrapper">
          <label htmlFor="content">Content:</label>
          <Editor
            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            initialValue={content}
            init={{
              height: 500,
              menubar: false,
              plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste code help wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
            }}
            onEditorChange={(content) => setContent(content)}
          />
        </div>
        <div>
          <label htmlFor="media" className="custom-file-upload">
            Choose File
          </label>
          <input
            id="media"
            type="file"
            onChange={handleMediaChange}
            accept="image/*,video/*"
          />
          {mediaPreview && (
            <div className="media-preview">
              {media?.type.startsWith("image/") ? (
                <img src={mediaPreview} alt="Media Preview" />
              ) : (
                <video src={mediaPreview} controls />
              )}
            </div>
          )}
        </div>
        <button type="submit">
          {existingNotice ? "Update Notice" : "Create Notice"}
        </button>
        <Link to="/admin/notice-list" className="view-notice-list-button">
          View Notices
        </Link>
      </form>
      <BootstrapModal
        isOpen={isModalOpen}
        title="Notice"
        message={message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default NoticeForm;

import React, { useState, useEffect } from "react";
import axios from "axios";
import BootstrapModal from "./BootstrapModal";
import "../css/NoticeList.css";

const NoticeList = ({ onEdit }) => {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get("/api/notice");
        setNotices(response.data);
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };
    fetchNotices();
  }, []);

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const handleDeleteNotice = async () => {
    try {
      await axios.delete(`/api/notice/${selectedNotice._id}`);
      setNotices(notices.filter((notice) => notice._id !== selectedNotice._id));
      setMessage("Notice deleted successfully!");
      setIsModalOpen(false);
    } catch (error) {
      setMessage("Error deleting notice. Please try again.");
    }
  };

  const handlePostNotice = async () => {
    try {
      await axios.patch(`/api/notice/post/${selectedNotice._id}`);
      setNotices(
        notices.map((notice) =>
          notice._id === selectedNotice._id
            ? { ...notice, posted: true }
            : notice
        )
      );
      setMessage("Notice posted successfully!");
      setIsModalOpen(false);
    } catch (error) {
      setMessage("Error posting notice. Please try again.");
    }
  };

  const handleRemoveNotice = async () => {
    try {
      await axios.patch(`/api/notice/remove/${selectedNotice._id}`);
      setNotices(
        notices.map((notice) =>
          notice._id === selectedNotice._id
            ? { ...notice, posted: false }
            : notice
        )
      );
      setMessage("Notice removed successfully!");
      setIsModalOpen(false);
    } catch (error) {
      setMessage("Error removing notice. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="notice-list-container">
      <h2>Notice Board</h2>
      {notices.length > 0 ? (
        <ul>
          {notices.map((notice) => (
            <li key={notice._id} onClick={() => handleNoticeClick(notice)}>
              <h3>{notice.title}</h3>
              {notice.content && <p>{notice.content}</p>}
              {notice.media && notice.media.includes("video") ? (
                <video src={`/${notice.media}`} controls />
              ) : (
                notice.media && (
                  <img src={`/${notice.media}`} alt="notice media" />
                )
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-notices">No notices available</p>
      )}
      {selectedNotice && isModalOpen && (
        <BootstrapModal
          isOpen={isModalOpen}
          title={selectedNotice.title}
          message={selectedNotice.content}
          onClose={handleCloseModal}
        >
          <div className="modal-buttons-container">
            {selectedNotice.posted ? (
              <button className="modal-button" onClick={handleRemoveNotice}>
                Remove
              </button>
            ) : (
              <button className="modal-button" onClick={handlePostNotice}>
                Post
              </button>
            )}
            <button
              className="modal-button"
              onClick={() => onEdit(selectedNotice)}
            >
              Edit
            </button>
            <button className="modal-button" onClick={handleDeleteNotice}>
              Delete
            </button>
          </div>
        </BootstrapModal>
      )}
      {message && (
        <BootstrapModal
          isOpen={true}
          title="Notice"
          message={message}
          onClose={() => setMessage("")}
        />
      )}
    </div>
  );
};

export default NoticeList;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/NoticeList.css";

const UserNoticeList = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get("/api/notice");
        const postedNotices = response.data.filter((notice) => notice.posted);
        setNotices(postedNotices);
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="notice-list-container">
      <h2>Notice Board</h2>
      {notices.length > 0 ? (
        <ul>
          {notices.map((notice) => (
            <li key={notice._id}>
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
    </div>
  );
};

export default UserNoticeList;

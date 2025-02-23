import React, { useState, useEffect } from "react";
import "../css/UserFixtures.css";

const UserFixtures = ({ fixtures }) => {
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [groupedFixtures, setGroupedFixtures] = useState({});

  useEffect(() => {
    const grouped = fixtures.reduce((groups, fixture) => {
      const month = new Date(fixture.date).getMonth() + 1;
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(fixture);
      return groups;
    }, {});
    setGroupedFixtures(grouped);

    const currentMonth = new Date().getMonth() + 1;
    const initialCollapsedState = {};
    Object.keys(grouped).forEach((month) => {
      initialCollapsedState[month] = parseInt(month) !== currentMonth;
    });
    setCollapsedMonths(initialCollapsedState);
  }, [fixtures]);

  const toggleMonth = (month) => {
    setCollapsedMonths((prevState) => ({
      ...prevState,
      [month]: !prevState[month],
    }));
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  return (
    <div className="user-fixtures-container">
      {Object.keys(groupedFixtures).map((month) => (
        <div key={month} className="month-box">
          <h3 onClick={() => toggleMonth(month)} className="month-heading">
            {getMonthName(month)}{" "}
            <span className="triangle">
              {collapsedMonths[month] ? "▼" : "▲"}
            </span>
          </h3>
          {!collapsedMonths[month] && (
            <table className="user-fixtures-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Age Group</th>
                  <th>Home Team</th>
                  <th>Away Team</th>
                  <th>Venue</th>
                  <th>Competition Type</th>
                  <th>Competition Name</th>
                </tr>
              </thead>
              <tbody>
                {groupedFixtures[month].map((fixture) => (
                  <tr key={fixture._id}>
                    <td>{formatDate(fixture.date)}</td>
                    <td>{fixture.time}</td>
                    <td>{fixture.ageGroup}</td>
                    <td>{fixture.homeTeam}</td>
                    <td>{fixture.awayTeam}</td>
                    <td>{fixture.venue}</td>
                    <td>{fixture.competitionType}</td>
                    <td>{fixture.competitionName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserFixtures;

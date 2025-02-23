import React, { useState, useEffect } from "react";
import "../css/UserResults.css";

const UserResults = ({ results }) => {
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [groupedResults, setGroupedResults] = useState({});

  useEffect(() => {
    const grouped = results.reduce((groups, result) => {
      const month = new Date(result.date).getMonth() + 1;
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(result);
      return groups;
    }, {});
    setGroupedResults(grouped);

    const currentMonth = new Date().getMonth() + 1;
    const initialCollapsedState = {};
    Object.keys(grouped).forEach((month) => {
      initialCollapsedState[month] = parseInt(month) !== currentMonth;
    });
    setCollapsedMonths(initialCollapsedState);
  }, [results]);

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
    <div className="user-results-container">
      {Object.keys(groupedResults).map((month) => (
        <div key={month} className="month-box">
          <h3 onClick={() => toggleMonth(month)} className="month-heading">
            {getMonthName(month)}{" "}
            <span className="triangle">
              {collapsedMonths[month] ? "▼" : "▲"}
            </span>
          </h3>
          {!collapsedMonths[month] && (
            <table className="user-results-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Age Group</th>
                  <th>Home Team</th>
                  <th>Home Score</th>
                  <th>Away Team</th>
                  <th>Away Score</th>
                  <th>Venue</th>
                  <th>Competition Type</th>
                  <th>Competition Name</th>
                </tr>
              </thead>
              <tbody>
                {groupedResults[month].map((result) => (
                  <tr key={result._id}>
                    <td>{formatDate(result.date)}</td>
                    <td>{result.ageGroup}</td>
                    <td>{result.homeTeam}</td>
                    <td>{result.homeScore}</td>
                    <td>{result.awayTeam}</td>
                    <td>{result.awayScore}</td>
                    <td>{result.venue}</td>
                    <td>{result.competitionType}</td>
                    <td>{result.competitionName}</td>
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

export default UserResults;

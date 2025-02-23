import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import "../css/ResultList.css";

const ResultList = () => {
  const [results, setResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [groupedResults, setGroupedResults] = useState({});
  const [filterMonth, setFilterMonth] = useState("");
  const [filterAgeGroup, setFilterAgeGroup] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get("/api/fixtures");
        const completedResults = response.data.filter(
          (fixture) => fixture.status === "completed"
        ); // Only include completed fixtures
        setResults(completedResults);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };
    fetchResults();
  }, []);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const handleDelete = async (fixture) => {
    try {
      await axios.delete(`/api/fixtures/${fixture._id}`);
      setMessage("Result deleted successfully!");
      setIsModalOpen(true);
      const updatedResults = await axios.get("/api/fixtures");
      const completedResults = updatedResults.data.filter(
        (fixture) => fixture.status === "completed"
      ); // Only include completed fixtures
      setResults(completedResults);
    } catch (error) {
      setMessage("Error deleting result. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleEdit = (fixture) => {
    navigate(`/admin/results-form/${fixture._id}`, { state: { fixture } }); // Redirect to ResultForm for editing
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === "filterMonth") {
      setFilterMonth(value);
    } else if (name === "filterAgeGroup") {
      setFilterAgeGroup(value);
    }
  };

  const filteredResults = results.filter((result) => {
    const resultMonth = new Date(result.date).getMonth() + 1;
    const matchesMonth = filterMonth
      ? resultMonth === parseInt(filterMonth)
      : true;
    const matchesAgeGroup = filterAgeGroup
      ? result.ageGroup === filterAgeGroup
      : true;
    return matchesMonth && matchesAgeGroup;
  });

  return (
    <div className="result-list-container">
      <h2>Completed Results</h2>
      <div className="filters">
        <select
          name="filterMonth"
          value={filterMonth}
          onChange={handleFilterChange}
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {getMonthName(i + 1)}
            </option>
          ))}
        </select>
        <select
          name="filterAgeGroup"
          value={filterAgeGroup}
          onChange={handleFilterChange}
        >
          <option value="">All Age Groups</option>
          <option value="u8">u8</option>
          <option value="u9">u9</option>
          <option value="u11">u11</option>
          <option value="u13">u13</option>
          <option value="u15">u15</option>
          <option value="u17">u17</option>
          <option value="u19">u19</option>
          <option value="senior">senior</option>
        </select>
      </div>
      {Object.keys(groupedResults).map((month) => (
        <div key={month} className="month-box">
          <h3 onClick={() => toggleMonth(month)} className="month-heading">
            {getMonthName(month)}{" "}
            <span className="triangle">
              {collapsedMonths[month] ? "▼" : "▲"}
            </span>
          </h3>
          {!collapsedMonths[month] && (
            <table className="result-list-table">
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedResults[month]
                  .filter((result) => filteredResults.includes(result))
                  .map((result) => (
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
                      <td>
                        <button onClick={() => handleEdit(result)}>Edit</button>
                        <button onClick={() => handleDelete(result)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
      <BootstrapModal
        isOpen={isModalOpen}
        title="Result"
        message={message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ResultList;

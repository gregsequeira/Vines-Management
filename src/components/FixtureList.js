import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BootstrapModal from "./BootstrapModal";
import "../css/FixtureList.css";

const FixtureList = () => {
  const [fixtures, setFixtures] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [groupedFixtures, setGroupedFixtures] = useState({});
  const [filterMonth, setFilterMonth] = useState("");
  const [filterAgeGroup, setFilterAgeGroup] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await axios.get("/api/fixtures");
        const filteredFixtures = response.data.filter(
          (fixture) => fixture.status !== "completed"
        ); // Exclude completed fixtures
        setFixtures(filteredFixtures);
      } catch (error) {
        console.error("Error fetching fixtures:", error);
      }
    };
    fetchFixtures();
  }, []);

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
      setMessage("Fixture deleted successfully!");
      setIsModalOpen(true);
      const updatedFixtures = await axios.get("/api/fixtures");
      const filteredFixtures = updatedFixtures.data.filter(
        (fixture) => fixture.status !== "completed"
      ); // Exclude completed fixtures
      setFixtures(filteredFixtures);
    } catch (error) {
      setMessage("Error deleting fixture. Please try again.");
      setIsModalOpen(true);
    }
  };

  const handleEdit = (fixture) => {
    navigate(`/admin/fixture-form/${fixture._id}`, { state: { fixture } }); // Redirect to FixtureForm for editing
  };

  const handleResult = (fixture) => {
    navigate(`/admin/results-form/${fixture._id}`, { state: { fixture } }); // Redirect to ResultForm for updating results
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

  const filteredFixtures = fixtures.filter((fixture) => {
    const fixtureMonth = new Date(fixture.date).getMonth() + 1;
    const matchesMonth = filterMonth
      ? fixtureMonth === parseInt(filterMonth)
      : true;
    const matchesAgeGroup = filterAgeGroup
      ? fixture.ageGroup === filterAgeGroup
      : true;
    return matchesMonth && matchesAgeGroup;
  });

  return (
    <div className="fixture-list-container">
      <h2>Fixtures</h2>
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
      {Object.keys(groupedFixtures).map((month) => (
        <div key={month} className="month-box">
          <h3 onClick={() => toggleMonth(month)} className="month-heading">
            {getMonthName(month)}{" "}
            <span className="triangle">
              {collapsedMonths[month] ? "▼" : "▲"}
            </span>
          </h3>
          {!collapsedMonths[month] && (
            <table className="fixture-list-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th className="age-group">Squad</th>
                  <th>Home Team</th>
                  <th>Away Team</th>
                  <th>Venue</th>
                  <th>Competition Type</th>
                  <th>Competition Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedFixtures[month]
                  .filter((fixture) => filteredFixtures.includes(fixture))
                  .map((fixture) => (
                    <tr key={fixture._id}>
                      <td>{formatDate(fixture.date)}</td>
                      <td>{fixture.time}</td>
                      <td>{fixture.ageGroup}</td>
                      <td>{fixture.homeTeam}</td>
                      <td>{fixture.awayTeam}</td>
                      <td>{fixture.venue}</td>
                      <td>{fixture.competitionType}</td>
                      <td>{fixture.competitionName}</td>
                      <td>{fixture.status}</td>
                      <td>
                        <button onClick={() => handleEdit(fixture)}>
                          Edit
                        </button>
                        <button onClick={() => handleResult(fixture)}>
                          Result
                        </button>
                        <button onClick={() => handleDelete(fixture)}>
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
        title="Fixture"
        message={message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default FixtureList;

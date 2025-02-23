import React, { useState } from "react";
import "../css/UserFilter.css";

const UserFilter = ({ onFilterChange }) => {
  const [month, setMonth] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [displayType, setDisplayType] = useState("both");

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    onFilterChange({ month: e.target.value, ageGroup, displayType });
  };

  const handleAgeGroupChange = (e) => {
    setAgeGroup(e.target.value);
    onFilterChange({ month, ageGroup: e.target.value, displayType });
  };

  const handleDisplayTypeChange = (e) => {
    setDisplayType(e.target.value);
    onFilterChange({ month, ageGroup, displayType: e.target.value });
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  return (
    <div className="user-filter-container">
      <select
        id="displayType"
        name="displayType"
        value={displayType}
        onChange={handleDisplayTypeChange}
      >
        <option value="both">Fixtures and Results</option>
        <option value="fixtures">Fixtures</option>
        <option value="results">Results</option>
      </select>
      <select
        id="month"
        name="filterMonth"
        value={month}
        onChange={handleMonthChange}
      >
        <option value="">All Months</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {getMonthName(i + 1)}
          </option>
        ))}
      </select>
      <select
        id="ageGroup"
        name="filterAgeGroup"
        value={ageGroup}
        onChange={handleAgeGroupChange}
      >
        <option value="">All Age Groups</option>
        <option value="u8">u8</option>
        <option value="u9">u9</option>
        <option value="u11">u11</option>
        <option value="u13">u13</option>
        <option value="u15">u15</option>
        <option value="u17">u17</option>
        <option value="u19">u19</option>
      </select>
    </div>
  );
};

export default UserFilter;

import React, { useState, useEffect } from "react";
import axios from "axios";
import UserFilter from "../components/UserFilter";
import UserFixtures from "../components/UserFixtures";
import UserResults from "../components/UserResults";
import "../css/UserFixturesAndResults.css";

const UserFixturesAndResults = () => {
  const [fixtures, setFixtures] = useState([]);
  const [results, setResults] = useState([]);
  const [filteredFixtures, setFilteredFixtures] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [displayType, setDisplayType] = useState("both");

  useEffect(() => {
    const fetchFixturesAndResults = async () => {
      try {
        const response = await axios.get("/api/fixtures");
        const fetchedFixtures = response.data.filter(
          (fixture) =>
            fixture.status === "scheduled" || fixture.status === "postponed"
        );
        const fetchedResults = response.data.filter(
          (fixture) => fixture.status === "completed"
        );
        setFixtures(fetchedFixtures);
        setResults(fetchedResults);
        setFilteredFixtures(fetchedFixtures);
        setFilteredResults(fetchedResults);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchFixturesAndResults();
  }, []);

  const handleFilterChange = ({ month, ageGroup, displayType }) => {
    setDisplayType(displayType);

    const filterByMonth = (item) => {
      if (!month) return true;
      const itemMonth = new Date(item.date).getMonth() + 1;
      return itemMonth === parseInt(month);
    };

    const filterByAgeGroup = (item) => {
      if (!ageGroup) return true;
      return item.ageGroup === ageGroup;
    };

    setFilteredFixtures(
      fixtures.filter(
        (fixture) => filterByMonth(fixture) && filterByAgeGroup(fixture)
      )
    );
    setFilteredResults(
      results.filter(
        (result) => filterByMonth(result) && filterByAgeGroup(result)
      )
    );
  };

  return (
    <div className="user-fixtures-and-results-container">
      <h2>Fixtures and Results</h2>
      <UserFilter onFilterChange={handleFilterChange} />
      {displayType !== "results" && (
        <div className="user-fixtures-section">
          <h3>Fixtures</h3>
          <UserFixtures fixtures={filteredFixtures} />
        </div>
      )}
      {displayType !== "fixtures" && (
        <div className="user-results-section">
          <h3>Results</h3>
          <UserResults results={filteredResults} />
        </div>
      )}
    </div>
  );
};

export default UserFixturesAndResults;

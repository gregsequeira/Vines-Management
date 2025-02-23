import React, { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import AdminDashboard from "./components/AdminDashboard";
import ResetPassword from "./components/PasswordResetForm";
import RequestPasswordReset from "./components/PasswordReset";
import UserList from "./components/UserList";
import NoticeForm from "./components/NoticeForm";
import NoticeList from "./components/NoticeList";
import UserNoticeList from "./components/UserNoticeList";
import FixtureForm from "./components/FixtureForm";
import FixtureList from "./components/FixtureList";
import ManageTeams from "./components/ManageTeams";
import ManageVenues from "./components/ManageVenues";
import ManageCompetitions from "./components/ManageCompetitions";
import ResultForm from "./components/ResultForm";
import ResultList from "./components/ResultList";
import UserFixturesAndResults from "./components/UserFixturesAndResults";
import RegistrationForm from "./components/RegistrationForm";
import ApplicationForm from "./components/ApplicationForm";
import AdminApplications from "./components/AdminApplications"; // Import AdminApplications
import AmendRegistration from "./components/AmendRegistration";
import UserAmendForm from "./components/UserAmendForm"; // Import UserAmendForm
import PlayerManagement from "./components/PlayerManagement"; // Import PlayerManagement
import PlayerForm from "./components/PlayerForm"; // Import PlayerForm
import ManagerManagement from "./components/ManagerManagement"; // Import ManagerManagement
import ManagerDashboard from "./components/managerDashboard";
import ManagerFixtures from "./components/ManagerFixtures";
import TeamSelection from "./components/TeamSelection";
import SquadManagement from "./components/SquadManagement";
import MatchBriefing from "./components/MatchBriefing";

const App = () => {
  const [editingNotice, setEditingNotice] = useState(null);
  const navigate = useNavigate();

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    navigate("/admin/notice-board");
  };

  return (
    <div>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/password-reset" element={<RequestPasswordReset />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/application" element={<ApplicationForm />} />
        {/* Added ApplicationForm route */}
        <Route path="/admin/users" element={<UserList />} />
        <Route
          path="/admin/notice-board"
          element={
            <NoticeForm
              existingNotice={editingNotice}
              onUpdate={() => setEditingNotice(null)}
            />
          }
        />
        <Route
          path="/admin/notice-list"
          element={<NoticeList onEdit={handleEditNotice} />}
        />
        <Route path="/notices" element={<UserNoticeList />} />
        <Route path="/admin/create-fixture" element={<FixtureForm />} />
        <Route path="/admin/manage-fixtures" element={<FixtureList />} />
        <Route path="/admin/fixture-form/:id" element={<FixtureForm />} />
        <Route path="/admin/results-form/:id" element={<ResultForm />} />
        <Route path="/admin/results-list" element={<ResultList />} />
        <Route
          path="/fixtures-and-results"
          element={<UserFixturesAndResults />}
        />
        <Route path="/admin/manage-teams" element={<ManageTeams />} />
        <Route path="/admin/manage-venues" element={<ManageVenues />} />
        <Route
          path="/admin/manage-competitions"
          element={<ManageCompetitions />}
        />
        <Route path="/admin/applications" element={<AdminApplications />} />
        {/* Added AdminApplications route */}
        <Route
          path="/admin/amend-registration/:id"
          element={<AmendRegistration />}
        />
        <Route path="/user-amend-form" element={<UserAmendForm />} />
        <Route path="/admin/player-management" element={<PlayerManagement />} />
        {/* Added PlayerManagement route */}
        <Route path="/player-form/:id" element={<PlayerForm />} />
        <Route path="/admin/manage-managers" element={<ManagerManagement />} />
        {/* Added ManagerManagement route */}
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/fixtures" element={<ManagerFixtures />} />
        <Route path="/team-selection/:fixtureId" element={<TeamSelection />} />
        <Route path="/manager/squads" element={<SquadManagement />} />
        <Route
          path="manager-dashboard/manager/create-fixture"
          element={<FixtureForm />}
        />
        <Route
          path="/manager/fixtures/fixture-form/:id"
          element={<FixtureForm />}
        />
        <Route path="/match-briefing" element={<MatchBriefing />} />
      </Routes>
    </div>
  );
};

export default App;

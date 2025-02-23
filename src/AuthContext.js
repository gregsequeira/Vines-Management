import React, { createContext, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [isPlayerSelected, setIsPlayerSelected] = useState(false);

  const login = async ({ user, token, status }) => {
    if (user && token) {
      setUser({ ...user, token });
      setRegistrationStatus(status);
      localStorage.setItem("authToken", token);

      // Check if the player is selected for any matches only if the role is "player"
      if (user.role === "player") {
        try {
          const selectionResponse = await axios.get(
            `/api/matches/check-selection/${user._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setIsPlayerSelected(selectionResponse.data.isSelected);
        } catch (error) {
          console.error("Error checking player selection", error);
        }
      } else {
        setIsPlayerSelected(false);
      }
    } else {
      console.error("Failed to login: User or token missing");
    }
  };

  const logout = () => {
    setUser(null);
    setRegistrationStatus(null);
    setIsPlayerSelected(false);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        registrationStatus,
        setRegistrationStatus,
        isPlayerSelected,
        setIsPlayerSelected,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

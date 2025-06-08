import React from "react";
import { NavLink } from "react-router-dom"; // Ensure NavLink is imported

export const NavBarBrand: React.FC = () => {
  return (
    <div className="nav-bar__brand">
      <NavLink
        to="/"
        style={() => ({
          fontSize: "calc(10px + 0.390625vw)",
        })}
      >
        <img
          className="nav-bar__logo"
          src="/eagle-mitty.svg"
          alt="Taskvision" // Changed from Opsvision3
          width="60"
          height="60"
        />{" "}
        Taskvision {/* Changed from Opsvision3 */}
      </NavLink>
    </div>
  );
};

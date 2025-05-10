import React from "react";
import { NavLink } from "react-router-dom";

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
          src="/opsvision2.svg"
          alt="Opsvision3"
          width="60"
          height="60"
        />{" "}
        Opsvision3
      </NavLink>
    </div>
  );
};

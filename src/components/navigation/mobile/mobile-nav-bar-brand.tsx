import React from "react";
import { NavLink } from "react-router-dom";

interface MobileNavBarBrandProps {
  handleClick: () => void;
}

export const MobileNavBarBrand: React.FC<MobileNavBarBrandProps> = ({
  handleClick,
}) => {
  return (
    <div onClick={handleClick} className="mobile-nav-bar__brand">
      <NavLink
        to="/"
        style={() => ({
          fontSize: "calc(5px + 0.390625vw)",
        })}
      >
        <img
          className="mobile-nav-bar__logo"
          src="/opsvision2.svg"
          alt="Opsvision3"
          width="30"
          height="30"
        />{" "}
        Opsvision3
      </NavLink>
    </div>
  );
};

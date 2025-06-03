import React from "react";
import { NavLink } from "react-router-dom";
import "./left-nav.css";

// Define navigation items based on existing routes
const navItems = [
  { path: "/", label: "Home" },
  { path: "/profile", label: "Profile" },
  { path: "/public", label: "Public" },
  { path: "/protected", label: "Protected" },
  { path: "/admin", label: "Admin" },
  { path: "/admin-features", label: "Admin Features" },
  // TODO: As TaskVision specific features are built, update these links
  // e.g., { path: "/tasks", label: "My Tasks" },
];

export const LeftNav: React.FC = () => {
  return (
    <aside className="left-nav">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
                end={item.path === "/"}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

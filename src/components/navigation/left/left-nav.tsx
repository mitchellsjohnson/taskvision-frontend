import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth0, User } from "@auth0/auth0-react";
import "./left-nav.css";
import { AUTH0_NAMESPACE } from "../../../auth0-namespace";

interface NavItem {
  path: string;
  label: string;
  requiresAuth: boolean;
  requiredRoles?: string[];
  exact?: boolean;
}

// Helper function to check for roles
const userHasRequiredRoles = (
  user: User | undefined,
  requiredRoles?: string[]
): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  if (!user) {
    return false;
  }
  const userRoles = user[`${AUTH0_NAMESPACE}roles`] as string[];
  if (!userRoles || !Array.isArray(userRoles)) {
    return false;
  }
  return requiredRoles.some((role) => userRoles.includes(role));
};

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", requiresAuth: true, exact: false },
  { path: "/tasks", label: "Tasks", requiresAuth: true, exact: false },
  {
    path: "/app-admin",
    label: "Admin Panel",
    requiresAuth: true,
    requiredRoles: ["admin", "ecosystem-admin"],
  },
  {
    path: "/ecosystems",
    label: "Ecosystems",
    requiresAuth: true,
    requiredRoles: ["ecosystem-admin"],
  },
];

export const LeftNav: React.FC = () => {
  const { isAuthenticated, user } = useAuth0();

  return (
    <aside className="left-nav">
      <div className="left-nav__brand">
        <NavLink to="/" className="left-nav__brand-link">
          <img
            className="left-nav__logo"
            src="/eagle-mitty.svg" // Assuming this is your desired logo file
            alt="Taskvision"
            width="60" // Changed from 30
            height="60" // Changed from 30
          />
          <span className="left-nav__brand-text">Taskvision</span>
        </NavLink>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => {
            // Determine if the link should be shown
            let canShowLink = false;
            if (item.requiresAuth) {
              if (isAuthenticated) {
                canShowLink = userHasRequiredRoles(user, item.requiredRoles);
              }
            } else {
              canShowLink = true;
            }

            if (!canShowLink) {
              return null;
            }

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  end={
                    item.exact !== undefined ? item.exact : item.path === "/"
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

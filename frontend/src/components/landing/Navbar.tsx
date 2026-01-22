import { PublicNavbar } from "./PublicNavbar";
import { AuthNavbar } from "./AuthNavbar";

export const Navbar = () => {
  const isAuthenticated = Boolean(localStorage.getItem("token"));
  return isAuthenticated ? <AuthNavbar /> : <PublicNavbar />;
};

import { Session } from "express-session";
import { routes } from "../utils/_variables";
import { ControllerType, UserDetailsType } from "../utils/types";

export const loginController: ControllerType = (req, res) => {
  const query = req.query;
  res.render("login", {
    title: "Admin Login",
    message: query.route ? "Please login" : undefined
  });
};
export const adminLoginController: ControllerType = (req, res) => {
  const route = req.query.route;

  (
    req.session as Session & {
      user?: any;
    }
  ).user = { id: 1, username: "testuser" };
  if (route) {
    res.redirect(route as string);
  }

  if (!route) {
    res.redirect(routes.admin);
  }
};

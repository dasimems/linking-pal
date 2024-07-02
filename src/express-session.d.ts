import session from "express-session";

// Extend the session interface
declare module "express-session" {
  interface SessionData {
    user: { id: number; username: string };
  }
}

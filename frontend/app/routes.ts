import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/workspace", "routes/workspace.tsx"),
  route("/oauth/google/callback", "routes/oauth.google.callback.tsx"),
] satisfies RouteConfig;

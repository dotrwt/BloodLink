import { matchPath, useRouter } from "./lib/router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import CreateRequest from "./pages/requester/CreateRequest";
import MatchingResults from "./pages/requester/MatchingResults";
import TrackRequest from "./pages/requester/TrackRequest";
import Fulfilled from "./pages/requester/Fulfilled";
import RequestHistory from "./pages/requester/RequestHistory";

export default function App() {
  const { path } = useRouter();
  const p = path.split("?")[0];

  // Order matters: most specific first.
  if (p === "/" || p === "") return <Landing />;
  if (p === "/login") return <Login />;

  // Single unified dashboard
  if (
    p === "/app/dashboard" ||
    p === "/app/requester" ||
    p === "/app/donor" ||
    p === "/app/bank" ||
    p === "/select-role"
  ) {
    return <Dashboard />;
  }

  // Request flow
  if (p === "/app/requester/new") return <CreateRequest />;
  if (matchPath("/app/requester/matches/:id", p)) return <MatchingResults />;
  if (matchPath("/app/requester/track/:id", p)) return <TrackRequest />;
  if (matchPath("/app/requester/fulfilled/:id", p)) return <Fulfilled />;
  if (p === "/app/requester/history") return <RequestHistory />;

  if (p === "/app/notifications") return <Notifications />;
  if (p === "/app/profile") return <Profile />;

  return <Landing />;
}

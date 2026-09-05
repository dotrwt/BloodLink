import { matchPath, useRouter } from "./lib/router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RoleSelect from "./pages/RoleSelect";
import DonorDashboard from "./pages/donor/DonorDashboard";
import RequesterDashboard from "./pages/requester/RequesterDashboard";
import BankDashboard from "./pages/bank/BankDashboard";
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

  // Public routes
  if (p === "/" || p === "") return <Landing />;
  if (p === "/login") return <Login />;
  if (p === "/select-role" || p === "/signup") return <RoleSelect />;

  // 3 Distinct Role Dashboards
  if (p === "/app/donor") return <DonorDashboard />;
  if (p === "/app/requester" || p === "/app/dashboard") return <RequesterDashboard />;
  if (p === "/app/bank") return <BankDashboard />;

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

import { matchPath, useRouter } from "./lib/router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RoleSelect from "./pages/RoleSelect";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import RequesterDashboard from "./pages/requester/Dashboard";
import CreateRequest from "./pages/requester/CreateRequest";
import MatchingResults from "./pages/requester/MatchingResults";
import TrackRequest from "./pages/requester/TrackRequest";
import Fulfilled from "./pages/requester/Fulfilled";
import RequestHistory from "./pages/requester/RequestHistory";
import DonorDashboard from "./pages/donor/Dashboard";
import BankDashboard from "./pages/bloodbank/Dashboard";

export default function App() {
  const { path } = useRouter();
  const p = path.split("?")[0];

  // Order matters: most specific first.
  if (p === "/" || p === "") return <Landing />;
  if (p === "/login") return <Login />;
  if (p === "/select-role") return <RoleSelect />;

  if (p === "/app/requester") return <RequesterDashboard />;
  if (p === "/app/requester/new") return <CreateRequest />;
  if (matchPath("/app/requester/matches/:id", p)) return <MatchingResults />;
  if (matchPath("/app/requester/track/:id", p)) return <TrackRequest />;
  if (matchPath("/app/requester/fulfilled/:id", p)) return <Fulfilled />;
  if (p === "/app/requester/history") return <RequestHistory />;

  if (p === "/app/donor") return <DonorDashboard />;
  if (p === "/app/bank") return <BankDashboard />;

  if (p === "/app/notifications") return <Notifications />;
  if (p === "/app/profile") return <Profile />;

  return <Landing />;
}

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAStatus from "@/components/PWAStatus";
import NotFound from "@/pages/NotFound";
import Alerts from "@/pages/Alerts";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Distributors from "@/pages/Distributors";
import InternalNotesHistory from "@/pages/InternalNotesHistory";
import PhotoGallery from "@/pages/PhotoGallery";
import MileageTracking from "@/pages/MileageTracking";
import MileageReports from "@/pages/MileageReports";
import CustomersMap from "@/pages/CustomersMap";
import OfflineSettings from "./pages/OfflineSettings";
import RouteOptimization from "./pages/RouteOptimization";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login"
import Playbook from "./pages/Playbook";
import Customers from "./pages/Customers";
import Routes from "./pages/Routes";
import Visits from "./pages/Visits";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Photos from "./pages/Photos";
import LiveTracking from "./pages/LiveTracking";
import Reports from "./pages/Reports";
import CustomerTimeline from "./pages/CustomerTimeline";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import SalesCoach from "./pages/SalesCoach";
import MobileSettings from "./pages/MobileSettings";
import HubSpotSettings from "./pages/HubSpotSettings";
import CompanyAdmin from "./pages/CompanyAdmin";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/customers"} component={Customers} />
      <Route path={"/routes"} component={Routes} />
      <Route path={"/visits"} component={Visits} />
      <Route path={"/orders"} component={Orders} />
      <Route path={"/products"} component={Products} />
      <Route path={"/photos"} component={Photos} />
      <Route path={"/tracking"} component={LiveTracking} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/customer-timeline/:customerId"} component={CustomerTimeline} />
      <Route path={"/offline-settings"} component={OfflineSettings} />
      <Route path={"/route-optimization"} component={RouteOptimization} />
      <Route path="/distributors" component={Distributors} />
      <Route path="/internal-notes" component={InternalNotesHistory} />
      <Route path="/manager" component={ManagerDashboard} />
      <Route path={"/customers-map"} component={CustomersMap} />
      <Route path={"/photo-gallery"} component={PhotoGallery} />
      <Route path={"/predictive-analytics"} component={PredictiveAnalytics} />
      <Route path={"/sales-coach"} component={SalesCoach} />
      <Route path={"/mobile-settings"} component={MobileSettings} />
      <Route path={"/hubspot-settings"} component={HubSpotSettings} />
      <Route path={"/mileage-tracking"} component={MileageTracking} />
      <Route path={"/mileage-reports"} component={MileageReports} />
      <Route path="/analytics" component={AnalyticsDashboard} />
       <Route path={"alerts"} component={Alerts} />
      <Route path={"company-admin"} component={CompanyAdmin} />
      <Route path={"/playbook"} component={Playbook} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <PWAInstallPrompt />
          <PWAStatus />
          <OfflineIndicator />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
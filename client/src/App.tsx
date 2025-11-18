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
<<<<<<< HEAD
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={Home} />

      <Route path={"/customers"} component={() => (
        <ProtectedRoute>
          <Customers />
        </ProtectedRoute>
      )} />
      <Route path={"/routes"} component={() => (
        <ProtectedRoute>
          <Routes />
        </ProtectedRoute>
      )} />
      <Route path={"/visits"} component={() => (
        <ProtectedRoute>
          <Visits />
        </ProtectedRoute>
      )} />
      <Route path={"/orders"} component={() => (
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      )} />
      <Route path={"/products"} component={() => (
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      )} />
      <Route path={"/photos"} component={() => (
        <ProtectedRoute>
          <Photos />
        </ProtectedRoute>
      )} />
      <Route path={"/tracking"} component={() => (
        <ProtectedRoute>
          <LiveTracking />
        </ProtectedRoute>
      )} />
      <Route path={"/reports"} component={() => (
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      )} />
      <Route path={"/customer-timeline/:customerId"} component={() => (
        <ProtectedRoute>
          <CustomerTimeline />
        </ProtectedRoute>
      )} />
      <Route path={"/offline-settings"} component={() => (
        <ProtectedRoute>
          <OfflineSettings />
        </ProtectedRoute>
      )} />
      <Route path={"/route-optimization"} component={() => (
        <ProtectedRoute>
          <RouteOptimization />
        </ProtectedRoute>
      )} />
      <Route path="/distributors" component={() => (
        <ProtectedRoute>
          <Distributors />
        </ProtectedRoute>
      )} />
      <Route path="/internal-notes" component={() => (
        <ProtectedRoute>
          <InternalNotesHistory />
        </ProtectedRoute>
      )} />
      <Route path="/manager-dashboard" component={() => (
        <ProtectedRoute>
          <ManagerDashboard />
        </ProtectedRoute>
      )} />
      <Route path={"/customers-map"} component={() => (
        <ProtectedRoute>
          <CustomersMap />
        </ProtectedRoute>
      )} />
      <Route path={"/photo-gallery"} component={() => (
        <ProtectedRoute>
          <PhotoGallery />
        </ProtectedRoute>
      )} />
      <Route path={"/predictive-analytics"} component={() => (
        <ProtectedRoute>
          <PredictiveAnalytics />
        </ProtectedRoute>
      )} />
      <Route path={"/sales-coach"} component={() => (
        <ProtectedRoute>
          <SalesCoach />
        </ProtectedRoute>
      )} />
      <Route path={"/mobile-settings"} component={() => (
        <ProtectedRoute>
          <MobileSettings />
        </ProtectedRoute>
      )} />
      <Route path={"/hubspot-settings"} component={() => (
        <ProtectedRoute>
          <HubSpotSettings />
        </ProtectedRoute>
      )} />
      <Route path={"/mileage-tracking"} component={() => (
        <ProtectedRoute>
          <MileageTracking />
        </ProtectedRoute>
      )} />
      <Route path={"/mileage-reports"} component={() => (
        <ProtectedRoute>
          <MileageReports />
        </ProtectedRoute>
      )} />
      <Route path="/analytics" component={() => (
        <ProtectedRoute>
          <AnalyticsDashboard />
        </ProtectedRoute>
      )} />
      <Route path={"alerts"} component={() => (
        <ProtectedRoute>
          <Alerts />
        </ProtectedRoute>
      )} />
      <Route path={"company-admin"} component={() => (
        <ProtectedRoute>
          <CompanyAdmin />
        </ProtectedRoute>
      )} />
      <Route path={"/playbook"} component={() => (
        <ProtectedRoute>
          <Playbook />
        </ProtectedRoute>
      )} />
=======
      <Route path={"/"} component={Home} />
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
      <Route path="/manager-dashboard" component={ManagerDashboard} />
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
>>>>>>> parent of 4ba9cc1 (Add ProtectedRoute)
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

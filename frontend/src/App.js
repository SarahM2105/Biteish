import './App.css';
import Auth from "./auth";
import 'leaflet/dist/leaflet.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookingForm from './pages/customer/CustomerBookingForm';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerEditBooking from './pages/customer/CustomerEditBooking';
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerRestaurantLayout from './pages/owner/OwnerRestaurantLayout';
import OwnerRequests from './pages/owner/Request';
import OwnerNotifications from "./pages/owner/Notifications";
import AdminDashboard from './pages/AdminDashboard';
import CustomerSearchAndFilter from "./pages/customer/CustomerSearchAndFilter";
import CustomerRestaurantDetails from "./pages/customer/CustomerRestaurantDetails";
import CustomerBookingPage from "./pages/customer/CustomerBookingPage";
import ProtectedRoutes from "./components/utils/ProtectedRoute";
import OwnerCheckIn from "./pages/owner/OwnerCheckIn"
import OwnerRestaurantProfile from "./pages/owner/OwnerRestaurantProfile";
import CheckInResult from "./components/Owner/Check-In/CheckInResult";
import OwnerAnalytics from "./pages/owner/OwnerAnalytics";
import OwnerRestaurantSettings from "./pages/owner/OwnerRestaurantSettings";
import OwnerProfilePreference from "./pages/owner/OwnerProfilePreference";
import OwnerMenu from "./pages/owner/OwnerMenu";
import CustomerFavourites from "./pages/customer/CustomerFavourites";
import OwnerEditRestaurantProfile from "./pages/owner/OwnerEditRestaurantProfile";
import { ThemeProvider} from "./ThemeContext";

function App() {
  return (
      <ThemeProvider>
      <Router>
        <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/customer/dashboard" element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                <CustomerDashboard />
            </ProtectedRoutes>
            } />
            <Route path="/customer/search" element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                <CustomerSearchAndFilter/>
                </ProtectedRoutes>
            }/>
            <Route path="/customer/book/:tableId" element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                <CustomerBookingForm />
                </ProtectedRoutes>
            }/>
            <Route path={"/customer/myBookings"} element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                <CustomerBookings />
                </ProtectedRoutes>
            }/>
            <Route path="/customer/notifications" element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                    <CustomerNotifications/>
                </ProtectedRoutes>
            } />
            <Route path={"/customer/profile"} element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                <CustomerProfile />
                </ProtectedRoutes>}/>
            <Route path={"/customer/favourites"} element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                    <CustomerFavourites />
                </ProtectedRoutes>}/>
            <Route path={"/customer/bookings/:reservationId/edit"} element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                <CustomerEditBooking />
                </ProtectedRoutes>
            }/>
            <Route path={"/customer/restaurants/:restaurantId"} element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                    <CustomerRestaurantDetails />
                </ProtectedRoutes>
            }/>
            <Route path={"/customer/restaurants/:restaurantId/book"} element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                    <CustomerBookingPage />
                </ProtectedRoutes>
            }/>
            <Route path="/owner/dashboard" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                <OwnerDashboard/>
                </ProtectedRoutes>
            }/>
            <Route path="/owner/restaurant-layout" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                <OwnerRestaurantLayout/>
                </ProtectedRoutes>
            }/>
            <Route path="/owner/request" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                <OwnerRequests/>
                </ProtectedRoutes>}/>
            <Route path="/owner/notifications" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <OwnerNotifications/>
                </ProtectedRoutes>}/>
            <Route path="/owner/check-ins" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <OwnerCheckIn/>
                </ProtectedRoutes>
            }/>
            <Route path="/owner/check-in/result" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <CheckInResult/>
                </ProtectedRoutes>
            }/>
            <Route path="/owner/restaurant/profile" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <OwnerRestaurantProfile/>
                </ProtectedRoutes>
            }/>
            <Route path="/owner/restaurant/edit" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <OwnerEditRestaurantProfile />
                </ProtectedRoutes>
            }/>
            <Route path="/owner/analytics" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <OwnerAnalytics/>
                </ProtectedRoutes>
            }/>
            <Route path="/owner/settings" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <OwnerRestaurantSettings />
                </ProtectedRoutes>
            }
                   />
            <Route path="/owner/profile-preferences" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <OwnerProfilePreference />
                </ProtectedRoutes>
            }
            />
            <Route path="/owner/menu" element={
                <ProtectedRoutes allowedRoles={["OWNER"]}>
                    <OwnerMenu/>
                </ProtectedRoutes>
            }/>
            <Route path="/admin-dashboard" element={
                <ProtectedRoutes allowedRoles={["ADMIN"]}>
                <AdminDashboard/>
                    </ProtectedRoutes>
                }/>
        </Routes>
      </Router>
      </ThemeProvider>
  );
}

export default App;

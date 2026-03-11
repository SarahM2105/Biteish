import './App.css';
import Auth from "./auth";
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookingForm from './pages/customer/CustomerBookingForm';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerEditBooking from './pages/customer/CustomerEditBooking';
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerRestaurantLayout from './pages/owner/OwnerRestaurantLayout';
import OwnerRequests from './pages/owner/Request';
import OwnerNotifications from "./pages/owner/Notifications";
import AdminDashboard from './pages/AdminDashboard';
import CustomerSearchAndFilter from "./pages/customer/CustomerSearchAndFilter";
import ProtectedRoutes from "./components/utils/ProtectedRoute";

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/customer-dashboard" element={
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
            <Route path={"/customer/book/:tableId"} element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                <CustomerBookingForm />
                </ProtectedRoutes>}/>
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
            <Route path={"/customer/bookings/:reservationId/edit"} element={
                <ProtectedRoutes allowedRoles={["CUSTOMER"]}>
                <CustomerEditBooking />
                </ProtectedRoutes>
            }/>
            <Route path="/owner-dashboard" element={
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
            <Route path="/admin-dashboard" element={
                <ProtectedRoutes allowedRoles={["ADMIN"]}>
                <AdminDashboard/>
                    </ProtectedRoutes>
                }/>
        </Routes>
      </Router>
  );
}

export default App;

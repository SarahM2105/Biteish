import React, {useState} from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import CustomerSideNav from "../../components/CustomerSideNav";
import {useNavigate} from "react-router-dom";
import {logout} from "../../components/utils/logout"

function CustomerDashboard() {
    const name= localStorage.getItem('name') || 'customer';
    const [active, setActive] = useState("Dashboard");
    const navigate = useNavigate();
    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }
    return (
        <DashboardLayout
        name={name}
        sideNav={<CustomerSideNav  active={active} onNavigate={handleNavigate}/>}>
            <h1 className="page-title">Welcome Back, {name}</h1>
            <section className="dashboard-panel">
                <h3>Upcomming Bookings</h3>
                {/*TODO: list of bookings for the upcomming week*/}
            </section>

            <section className="dashboard-panel">
                <h3>Reccomended for you</h3>
                {/*TODO: recommendations sprint 7*/}
            </section>

            <section className="dashboard-panel">
                <h3>Popular Restaurants</h3>
                {/*TODO: sprint 7*/}
            </section>
        </DashboardLayout>
    );
}



export default CustomerDashboard;
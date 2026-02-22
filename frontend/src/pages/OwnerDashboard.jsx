import React, {useState} from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import OwnerSideNav from "../components/OwnerSideNav";
import {useNavigate} from 'react-router-dom';
import {logout} from "../components/utils/logout"

function OwnerDashboard() {
    const name= localStorage.getItem('name') || 'owner';
    const [active, setActive] = useState("Dashboard");
    const navigate = useNavigate();
    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate)
            return;
        }
        setActive(label);
    }
    return (
        <DashboardLayout
            name={name}
            sideNav={<OwnerSideNav active={active} onNavigate={handleNavigate}/>}>
            <h1 className="page-title">Welcome Back, {name}</h1>
            <section className="dashboard-panel">
                <h3>Todays OverView</h3>
                {/*TODO: ...*/}
            </section>

            <section className="dashboard-panel">
                <h3>Todays Bookings</h3>
                {/*TODO: ...*/}
            </section>

            <section className="dashboard-panel">
                <h3>Table Picker</h3>
                {/*TODO: ...*/}
            </section>

            <section className="dashboard-panel">
                <h3>Table Information</h3>
                {/*TODO: ...*/}
            </section>
        </DashboardLayout>
    );
}


export default OwnerDashboard;
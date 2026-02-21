import React, {useState} from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminSideNav from "../components/AdminSideNav";
import {useNavigate} from 'react-router-dom';
import {logout} from "../components/utils/logout"

function AdminDashboard() {
    const name= localStorage.getItem('name') || 'admin';
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
            sideNav={<AdminSideNav active={active} onNavigate={handleNavigate}/>}>
            <h1 className="page-title">Welcome Back, {name}</h1>
            <section className="dashboard-panel">
                <h3>Key Performance Indicator Cards</h3>
                {/*TODO: ...*/}
            </section>

            <section className="dashboard-panel">
                <h3>Alerts</h3>
                {/*TODO: ...*/}
            </section>

            <section className="dashboard-panel">
                <h3>Graphs</h3>
                {/*TODO: ...*/}
            </section>
        </DashboardLayout>
    );
}


export default AdminDashboard;
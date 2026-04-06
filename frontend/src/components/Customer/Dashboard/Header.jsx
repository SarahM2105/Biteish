import react from 'react';
export default function dashboardHeader({name}) {
    return (
        <section className="dashboard-header">
            <h1 className="dashboard__title">
            Welcome Back, {name}
            </h1>
            <p className="dashboard__subtitle">
                Ready to discover your next meal?
            </p>
        </section>
    );
}
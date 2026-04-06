import React, {useState} from 'react';
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import OwnerSideNav from "../../components/OwnerSideNav";
export default function CustomerFavourites() {
    const name = localStorage.getItem("name")|| "customer";
    const [status, setStatus] = useState("");
    const favouriteRestaurants = [
        {
            id: 1,
            name: "Placeholder Restaurant",
            location: "Leicester, ...",
            cuisine: "Italian",
            description: "A italian restaurant",
            accessibility: "Wheelchair access available",
        },
        {
            id: 2,
            name: "Restaurant Placeholder 2",
            location: "Leicester, ...",
            cuisine: "Indian",
            description: "A indian restaurant",
            accessibility: "Step-free entrance",
        },
    ];
    function handlePlaceholderAction(message){
        setStatus(message);
    }
    return (
        <AppLayout
        name={name}
        sideNav={<CustomerSideNav active="Favourites" />}>
            <div
                style={{
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center",
                    marginBottom:24,
                    gap: 12,
                    flexWrap:"wrap",
                }}
                >
                <div>
                    <h1 style={{ marginBottom: 8 }}>My Favourites</h1>
                    <p style={{ marginBottom:0 }}>
                        View and manage your saved favourite restaurants.
                    </p>
                </div>
            </div>
            {status && <div className="dashboard-panel">{status}</div>}
            <section className="dashboard-panel" style={{ marginBottom:20}}>
                <h3 style={{marginTop:0}}>Saved Restaurant</h3>
                <div>
                    Placehodler for favourite restaurants
                </div>
            </section>
            <div
                style={{
                    display:"grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap:16,
                }}
                >
                {favouriteRestaurants.map((restaurant)=>(
                    <section key={restaurant.id} className="dashboard-panel">
                        <h3 style={{marginTop:0, marginBottom:10}}>
                            {restaurant.name}
                        </h3>
                        <div style={{marginBottom:8}}>
                            <strong>Location:</strong>{restaurant.location}
                        </div>
                        <div style={{marginBottom:8}}>
                            <strong>Description:</strong> {restaurant.description}
                        </div>
                        <div style={{marginBottom:12}}>
                            <strong> Accessibility</strong>{restaurant.accessibility}
                        </div>
                        <div style={{display:"flex", gap:8, flexWrap: "wrap"}}>
                            <button
                                type="button"
                                className="sf-bookBtn"
                                onClick={() =>
                            handlePlaceholderAction(`View Restairant for ${restaurant.name} is a placeholder for now `)}>
                                View Restaurant
                            </button>
                            <button
                            type="button"
                            className="sf-bookBtn"
                            onClick={()=>
                            handlePlaceholderAction(
                                `remove favourite for ${restaurant.name} is a placeholder for now `,
                            )
                            }
                            >
                                Remove favourite
                            </button>
                        </div>
                    </section>
                ))}
            </div>
        </AppLayout>
    );
}
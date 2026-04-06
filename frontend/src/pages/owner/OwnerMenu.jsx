import React, {useState} from 'react';
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";

export default function OwnerMenu() {
    const name = localStorage.getItem('name') || 'Owner';
    const [status, setStatus] = useState("");
    const [menuSections]= useState([
        {
            id: 1,
            name: "Starters",
            items: [
                {id: 1, name: "Garlic Bread", price: "£4.50", description: "Freshly baked with garlic butter."},
                {id: 2, name: "Tomato Soup", price: "£5.99", description: "Served with warm bread."},
            ],
        },
        {id: 2, name: "Mains", items: [
                {id: 3, name: "Grilled Chicken", price: "£12.95", description: "Served with fries and salad"},
                {id: 4, name: "Vegtable Pasta ", price: "£11.50", description: "Pasta with seasonal vegtables."},
            ],
        },
        {id: 3, name: "Desserts", items: [
                {id: 5, name: "Chocolate Cake", price: "7.00", description: "Rich chocolate sponge cake"},
            ],
        },
        {id: 4, name: "Drinks", items: [
                {id: 6, name: "Orange Juice", price: "£2.50", description: "Fresh Orange Juice"},
                {id: 7, name: "Still Water", price: "£1.50", description: "Bottled water"},
            ],
        },
    ]);
    function handlePlaceholderAction(message){
        setStatus(message);
    }
    return(
        <AppLayout
        name={name}
        sideNav={<OwnerSideNav active="Menu"/>}
        >
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
                    <h1 style={{ marginBottom: 8}}>Menu Management</h1>
                    <p style={{margin:0}}>
                        Create and organise menu sections and items for your restaurant.
                    </p>
                </div>
                <div style={{display: "flex", gap: 10, flexWrap:"wrap"}}>
                    <button
                        type="button"
                        className="sf-bookBtn"
                        onClick={() =>
                            handlePlaceholderAction("Add Section is a placeholder for now.")
                    }
                        >
                        Add section
                    </button>
                    <button
                        type="button"
                        className="sf-filterBtn"
                        onClick={() =>
                                handlePlaceholderAction("Add Item is a placeholder for now")}
                        >
                        Add Item
                    </button>
                </div>
            </div>
            {status && <div className="dashboard-panel">{status}</div>}
            <section className="dashboard-panel" style={{ marginBottom: 20}}>
                <h3 style={{marginTop:0}}> Menu Overview</h3>
                <div style={{marginBottom:8}}>
                    This page is currently is a placeholder for future menu management.
                </div>
                <div>
                    owners will soon be able to add menu items....
                </div>
            </section>
            <div
                style={{
                    display:"grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap:16,
                }}
                >
                {menuSections.map((section)=>(
                    <secttion key={section.id} className="dashboard-panel">
                        <div
                            style={{
                                display:"flex",
                                justifyContent:"space-between",
                                alignItems:"center",
                                marginBottom:12,
                                gap: 10,
                            }}
                            >
                            <h3 style={{margin:0}}>{section.name}</h3>
                            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                                <button
                                    type="button"
                                    className="sf-bookBtn"
                                    onClick={() =>
                                handlePlaceholderAction(
                                    `add item to ${section.name} is a placeholder for now.`,
                                )}>Add Item</button>
                            </div>
                        </div>
                        {section.items.length ? (
                            section.items.map((item)=> (
                                <div
                                key={item.id}
                                style={{
                                    padding:"12px 0",
                                    borderBottom: "1px solid gray",
                                }}
                                >
                                    <div
                                        style={{
                                            display:"flex",
                                            justifyContent:"space-between",
                                            alignItems: "center",
                                            gap:10,
                                            marginBottom:6,
                                        }}>
                                        <strong>{item.name}</strong>
                                        <span>{item.price}</span>
                                    </div>
                                    <div style={{marginBottom: 10, fontSize:14}}>
                                        {item.description}
                                    </div>
                                    <div style={{display: "flex", gap: 8, flexWrap:"wrap"}}>
                                        <button
                                            type="button"
                                            className="sf-bookBtn"
                                            onClick={() =>
                                         handlePlaceholderAction(
                                             `Edit ${item.name} is a placeholder for now.`
                                         )}
                                            >
                                            Edit
                                        </button>
                                        <button
                                        type="button"
                                        className="sf-bookBtn"
                                        onClick={()=> handlePlaceholderAction(`Remove ${item.name} is a placeholder for now.`)}>
                                            Remove
                                            </button>
                                    </div>
                                </div>
                            ))
                        ):(
                            <div> no items in this section yet</div>
                        )}
                    </secttion>
                ))}
            </div>
        </AppLayout>
    );
}
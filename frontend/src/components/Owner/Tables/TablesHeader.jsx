import React from "react";

export default function TablesHeader({
                                         restaurantName,
                                         onAddZone,
                                         onAddTable,
                                         disableAddTable,
                                     }) {
    return (
        <section className="tables-header">
            <div className="tables-header__content">
                <p className="tables-header__eyebrow">Owner layout management</p>
                <h1 className="tables-header__title">Tables &amp; Zones</h1>
                <p className="tables-header__text">
                    Organise your seating areas, switch between zones, and manage tables visually.
                    {restaurantName ? ` Currently editing ${restaurantName}.` : ""}
                </p>
            </div>

            <div className="tables-header__actions">
                <button
                    type="button"
                    className="tables-header__button tables-header__button--secondary"
                    onClick={onAddZone}
                >
                    Add Zone
                </button>

                <button
                    type="button"
                    className="tables-header__button tables-header__button--primary"
                    onClick={onAddTable}
                    disabled={disableAddTable}
                >
                    Add Table
                </button>
            </div>
        </section>
    );
}
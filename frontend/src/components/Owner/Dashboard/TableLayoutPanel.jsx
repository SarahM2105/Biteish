import React from "react";

export default function TableLayoutPanel({ layoutSummary, zoneSummaries }) {
    return (
        <section className="dashboard-panel owner-panel owner-panel--wide">
            <p className="owner-panel-kicker">Table layout</p>
            <h3>Layout overview</h3>

            <div className="owner-layout-summary">
                <div className="owner-layout-summary__item">
                    <span>Zones</span>
                    <strong>{layoutSummary.zonesCount}</strong>
                </div>
                <div className="owner-layout-summary__item">
                    <span>Total tables</span>
                    <strong>{layoutSummary.totalTables}</strong>
                </div>
                <div className="owner-layout-summary__item">
                    <span>Occupied</span>
                    <strong>{layoutSummary.occupiedTables}</strong>
                </div>
                <div className="owner-layout-summary__item">
                    <span>Reserved</span>
                    <strong>{layoutSummary.reservedTables}</strong>
                </div>
            </div>

            <div className="owner-layout-space">
                <span>This space is reserved for your future visual table layout.</span>
            </div>

            <div className="owner-zone-list">
                {zoneSummaries.map((zone) => (
                    <div key={zone.id} className="owner-zone-row">
                        <div>
                            <strong>{zone.name}</strong>
                            <p>{zone.totalTables} tables</p>
                        </div>

                        <div className="owner-zone-row__stats">
                            <span>{zone.occupiedTables} occupied</span>
                            <span>{zone.reservedTables} reserved</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
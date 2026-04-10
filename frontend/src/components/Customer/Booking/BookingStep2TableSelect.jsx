import React from "react";

export default function BookingStep2TableSelect({ zones, tables, form, updateForm }) {
    return (
        <div>
            <h2>Step 2: Choose table</h2>

            <div>
                <label>Zone</label>
                <br />
                <select
                    value={form.zoneId}
                    onChange={(e) => {
                        updateForm("zoneId", e.target.value);
                        updateForm("tableId", "");
                    }}
                >
                    <option value="">Select a zone</option>
                    {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                            {zone.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <p><strong>Available tables</strong></p>

                {tables.length === 0 ? (
                    <p>No tables available for this zone yet.</p>
                ) : (
                    <div>
                        {tables.map((table) => (
                            <div key={table.id}>
                                <label>
                                    <input
                                        type="radio"
                                        name="tableId"
                                        value={table.id}
                                        checked={form.tableId === table.id}
                                        onChange={() => updateForm("tableId", table.id)}
                                    />
                                    {table.name} - seats {table.capacity}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
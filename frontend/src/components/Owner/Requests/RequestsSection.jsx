import React from "react";

export default function RequestsSection({
                                            eyebrow,
                                            title,
                                            description,
                                            count,
                                            loading,
                                            loadingText,
                                            emptyText,
                                            items,
                                            renderItem,
                                        }) {
    return (
        <section className="owner-requests-section dashboard-panel">
            <div className="owner-requests-section__header">
                <div>
                    <p className="owner-requests-section__eyebrow">{eyebrow}</p>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
                <span className="owner-requests-section__count">{count}</span>
            </div>

            {loading && <div className="owner-requests-empty">{loadingText}</div>}

            {!loading && items.length === 0 && (
                <div className="owner-requests-empty">{emptyText}</div>
            )}

            {!loading && items.length > 0 && (
                <div className="owner-requests-list">
                    {items.map(renderItem)}
                </div>
            )}
        </section>
    );
}
import React from "react";

export default function AnalyticsMetricSection({
                                                   eyebrow,
                                                   title,
                                                   description,
                                                   metrics,
                                                   gridClassName,
                                                   children,
                                               }) {
    return (
        <section className="owner-analytics-section">
            <div className="owner-analytics-section__header">
                <p className="owner-analytics-section__eyebrow">{eyebrow}</p>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>

            <div className={`owner-analytics-metrics-grid ${gridClassName}`}>
                {metrics.map((item) => (
                    <article
                        key={item.label}
                        className="owner-analytics-metric-card"
                    >
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <p>{item.hint}</p>
                    </article>
                ))}
            </div>

            {children}
        </section>
    );
}
import React from "react";

export default function NotificationCard({ item, onPrimaryAction, onSecondaryAction }) {
    return (
        <article
            className={`dashboard-panel notification-card notification-card--${item.kind}`}
        >
            <div className="notification-card__top">
                <div className="notification-card__heading">
                    <span className="notification-card__badge">{item.badgeLabel}</span>
                    <h2>{item.title}</h2>
                </div>

                <div className="notification-card__meta">
                    {item.meta?.map((metaItem, index) => (
                        <span key={`${item.id}-meta-${index}`}>{metaItem}</span>
                    ))}
                </div>
            </div>

            <p className="notification-card__message">{item.message}</p>

            {item.details?.length ? (
                <div className="notification-card__details">
                    {item.details.map((detail, index) => (
                        <span key={`${item.id}-detail-${index}`}>{detail}</span>
                    ))}
                </div>
            ) : null}

            {(item.primaryAction || item.secondaryAction) && (
                <div className="notification-card__actions">
                    {item.primaryAction ? (
                        <button
                            type="button"
                            className="notifications-action notifications-action--primary"
                            onClick={() => onPrimaryAction?.(item)}
                        >
                            {item.primaryAction.label}
                        </button>
                    ) : null}

                    {item.secondaryAction ? (
                        <button
                            type="button"
                            className="notifications-action notifications-action--secondary"
                            onClick={() => onSecondaryAction?.(item)}
                        >
                            {item.secondaryAction.label}
                        </button>
                    ) : null}
                </div>
            )}
        </article>
    );
}
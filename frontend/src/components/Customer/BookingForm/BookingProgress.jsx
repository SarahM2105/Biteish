import React from "react";

const STEPS = [
    { number: 1, label: "Booking details" },
    { number: 2, label: "Choose table" },
    { number: 3, label: "Review" },
    { number: 4, label: "Confirmation" },
];

export default function BookingProgress({ step }) {
    return (
        <section className="booking-progress">
            <div className="booking-progress__header">
                <p className="booking-progress__eyebrow">Progress</p>
                <h2>Step {step} of 4</h2>
            </div>

            <div className="booking-progress__track">
                {STEPS.map((item) => {
                    const isComplete = step > item.number;
                    const isCurrent = step === item.number;

                    return (
                        <div
                            key={item.number}
                            className={`booking-progress__item ${
                                isComplete ? "is-complete" : ""
                            } ${isCurrent ? "is-current" : ""}`}
                        >
                            <div className="booking-progress__marker">
                                <span>{item.number}</span>
                            </div>

                            <div className="booking-progress__copy">
                                <strong>{item.label}</strong>
                                <span>
                                    {isComplete
                                        ? "Completed"
                                        : isCurrent
                                            ? "Current step"
                                            : "Upcoming"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
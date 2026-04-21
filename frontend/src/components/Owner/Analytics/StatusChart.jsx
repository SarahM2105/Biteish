import React from "react";

export default function AnalyticsStatusChart({ data }) {
    const width = 640;
    const height = 300;
    const margin = { top: 24, right: 18, bottom: 62, left: 46 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxValue = Math.max(1, ...data.map((item) => item.value));
    const slotWidth = chartWidth / data.length;
    const barWidth = Math.min(64, slotWidth * 0.52);
    const tickCount = 4;

    const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
        const value = (maxValue / tickCount) * index;
        const y =
            margin.top +
            chartHeight -
            (value / maxValue) * chartHeight;

        return {
            value: Math.round(value),
            y,
        };
    });

    return (
        <div className="owner-analytics-chart">
            <div className="owner-analytics-chart__header">
                <h3>Today's booking status chart</h3>
                <p>Status breakdown for reservations scheduled today.</p>
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="owner-analytics-chart__svg"
                role="img"
                aria-label="Bar chart showing today's reservation statuses"
            >
                {ticks.map((tick) => (
                    <g key={`tick-${tick.y}`}>
                        <line
                            x1={margin.left}
                            y1={tick.y}
                            x2={width - margin.right}
                            y2={tick.y}
                            className="owner-analytics-chart__grid"
                        />
                        <text
                            x={margin.left - 10}
                            y={tick.y + 4}
                            textAnchor="end"
                            className="owner-analytics-chart__tick"
                        >
                            {tick.value}
                        </text>
                    </g>
                ))}

                <line
                    x1={margin.left}
                    y1={margin.top}
                    x2={margin.left}
                    y2={height - margin.bottom}
                    className="owner-analytics-chart__axis"
                />
                <line
                    x1={margin.left}
                    y1={height - margin.bottom}
                    x2={width - margin.right}
                    y2={height - margin.bottom}
                    className="owner-analytics-chart__axis"
                />

                {data.map((item, index) => {
                    const barHeight =
                        item.value > 0 ? (item.value / maxValue) * chartHeight : 0;

                    const x =
                        margin.left +
                        slotWidth * index +
                        (slotWidth - barWidth) / 2;

                    const y = margin.top + chartHeight - barHeight;

                    return (
                        <g key={item.label}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx="12"
                                ry="12"
                                className={`owner-analytics-chart__bar owner-analytics-chart__bar--${
                                    index % 5
                                }`}
                            />

                            <text
                                x={x + barWidth / 2}
                                y={barHeight > 0 ? y - 8 : y - 6}
                                textAnchor="middle"
                                className="owner-analytics-chart__value"
                            >
                                {item.value}
                            </text>

                            <text
                                x={x + barWidth / 2}
                                y={height - margin.bottom + 22}
                                textAnchor="middle"
                                className="owner-analytics-chart__label"
                            >
                                {item.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
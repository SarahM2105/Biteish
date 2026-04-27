const {
    splitPreferenceText,
    makeSignal,
} = require("./recommendationHelpers");

function extractMenuSignalsFromRestaurant(restaurant = {}) {
    const signals = new Set();

    (restaurant.menuItems || []).forEach((item) => {
        splitPreferenceText(item?.dietaryInfo).forEach((token) => {
            const signal = makeSignal("diet", token);

            if (signal) {
                signals.add(signal);
            }
        });

        (item.menuItemTags || []).forEach((entry) => {
            const signal = makeSignal("menu-tag", entry?.tag?.name);

            if (signal) {
                signals.add(signal);
            }
        });
    });

    return [...signals];
}

function extractRestaurantAccessibilitySignals(restaurant = {}) {
    const signals = new Set();

    (restaurant.accessibility || []).forEach((entry) => {
        const signal = makeSignal("access", entry?.option?.optionName);

        if (signal) {
            signals.add(signal);
        }
    });

    return [...signals];
}

function extractTableAccessibilitySignals(table = {}) {
    const signals = new Set();

    (table.tableAccessibilities || []).forEach((entry) => {
        const signal = makeSignal("table-access", entry?.option?.optionName);

        if (signal) {
            signals.add(signal);
        }
    });

    return [...signals];
}

function extractCandidateAccessibilitySignals(restaurant = {}) {
    const signals = new Set();

    extractRestaurantAccessibilitySignals(restaurant).forEach((signal) =>
        signals.add(signal)
    );

    (restaurant.tables || []).forEach((table) => {
        extractTableAccessibilitySignals(table).forEach((signal) =>
            signals.add(signal)
        );
    });

    return [...signals];
}

function extractSignalsFromSearchQuery(searchQuery = "") {
    const text = String(searchQuery || "").toLowerCase().trim();

    if (!text) {
        return [];
    }

    return text
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1)
        .map((token) => makeSignal("query", token))
        .filter(Boolean);
}

function extractSignalsFromInteraction(interaction = {}) {
    const signals = new Set();

    if (interaction.tag?.name) {
        signals.add(makeSignal("tag", interaction.tag.name));
    }

    if (interaction.option?.optionName) {
        signals.add(makeSignal("access", interaction.option.optionName));
    }

    extractSignalsFromSearchQuery(interaction.searchQuery).forEach((signal) =>
        signals.add(signal)
    );

    if (interaction.metadata?.tags && Array.isArray(interaction.metadata.tags)) {
        interaction.metadata.tags.forEach((tagName) => {
            const signal = makeSignal("tag", tagName);

            if (signal) {
                signals.add(signal);
            }
        });
    }

    if (
        interaction.metadata?.accessibility &&
        Array.isArray(interaction.metadata.accessibility)
    ) {
        interaction.metadata.accessibility.forEach((optionName) => {
            const signal = makeSignal("access", optionName);

            if (signal) {
                signals.add(signal);
            }
        });
    }

    return [...signals].filter(Boolean);
}

module.exports = {
    extractMenuSignalsFromRestaurant,
    extractRestaurantAccessibilitySignals,
    extractTableAccessibilitySignals,
    extractCandidateAccessibilitySignals,
    extractSignalsFromSearchQuery,
    extractSignalsFromInteraction,
};
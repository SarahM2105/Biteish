const { getUserRecommendationData } = require("./Queries");
const { scoreRecommendations } = require("./Scoring");

async function getCustomerRecommendations(req, res) {
    try {
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorised user" });
        }

        const [reservations, favourites, interactions, restaurants] =
            await getUserRecommendationData(userId);

        const result = scoreRecommendations({
            reservations,
            favourites,
            interactions,
            restaurants,
            userId,
        });

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getCustomerRecommendations,
};
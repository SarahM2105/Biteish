const {prisma} = require('../prismaClient');

async function getMe(req, res) {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "unauthorised user" });
        }
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {id:true, name: true, email:true, role:true }
        });
        if (!user) {
            return res.status(404).json({ error: " user not found" });
        }
        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Server error"});
    }
}

module.exports = {getMe}
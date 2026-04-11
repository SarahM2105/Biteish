const bcrypt = require('bcrypt');
const { prisma } = require("../prismaClient");

async function getMe(req, res) {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {id: true, name: true, email: true, role: true,},
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function updateMe(req, res) {
    try {
        const userId = req.user.userId;
        const { name, email } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Full name is required" });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email is required" });
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        const existingUser = await prisma.user.findFirst({
            where: {
                email: trimmedEmail,
                NOT: { id: userId },
            },
        });

        if (existingUser) {
            return res.status(409).json({ error: "Email is already in use" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: trimmedName,
                email: trimmedEmail,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function updateMyPassword(req, res) {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: "All password fields are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: "New password must be at least 8 characters long" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New passwords do not match" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const matches = await bcrypt.compare(currentPassword, user.password);

        if (!matches) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getMe,
    updateMe,
    updateMyPassword,
};
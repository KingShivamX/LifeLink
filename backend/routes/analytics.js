import express from "express"
import Donor from "../models/Donor.js"
import BloodRequest from "../models/BloodRequest.js"

const router = express.Router()

// GET /api/analytics/dashboard - Get dashboard analytics
router.get("/dashboard", async (req, res) => {
    try {
        const [
            totalDonors,
            activeDonors,
            totalRequests,
            activeRequests,
            emergencyRequests,
            fulfilledRequests,
        ] = await Promise.all([
            Donor.countDocuments({ isActive: true }),
            Donor.countDocuments({
                isActive: true,
                "availability.isAvailable": true,
            }),
            BloodRequest.countDocuments({}),
            BloodRequest.countDocuments({
                status: { $in: ["pending", "matched"] },
            }),
            BloodRequest.countDocuments({
                requestType: "emergency",
                status: { $in: ["pending", "matched"] },
            }),
            BloodRequest.countDocuments({ status: "fulfilled" }),
        ])

        const responseRate =
            totalRequests > 0
                ? ((fulfilledRequests / totalRequests) * 100).toFixed(1)
                : 0

        res.json({
            success: true,
            data: {
                summary: {
                    totalDonors,
                    activeDonors,
                    totalRequests,
                    activeRequests,
                    emergencyRequests,
                    fulfilledRequests,
                    responseRate: parseFloat(responseRate),
                },
            },
        })
    } catch (error) {
        console.error("Analytics error:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching analytics",
            error: error.message,
        })
    }
})

// GET /api/analytics/blood-types - Blood type distribution
router.get("/blood-types", async (req, res) => {
    try {
        const donorDistribution = await Donor.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$bloodType", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ])

        const requestDistribution = await BloodRequest.aggregate([
            { $group: { _id: "$patient.bloodType", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ])

        res.json({
            success: true,
            data: {
                donors: donorDistribution,
                requests: requestDistribution,
            },
        })
    } catch (error) {
        console.error("Blood type analytics error:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching blood type analytics",
            error: error.message,
        })
    }
})

export default router

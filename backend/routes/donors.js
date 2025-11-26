import express from "express"
import { body, validationResult, query } from "express-validator"
import Donor from "../models/Donor.js"
import BloodRequest from "../models/BloodRequest.js"
import { emitSocketEvent } from "../utils/socket.js"

const router = express.Router()

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation errors",
            errors: errors.array(),
        })
    }
    next()
}

// GET /api/donors - Get all donors with filters (READ)
router.get(
    "/",
    [
        query("bloodType")
            .optional()
            .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
        query("city").optional().isString().trim(),
        query("available").optional().isBoolean(),
        query("lat").optional().isFloat({ min: -90, max: 90 }),
        query("lng").optional().isFloat({ min: -180, max: 180 }),
        query("radius").optional().isInt({ min: 1, max: 100 }),
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 50 }),
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
             const {
                 bloodType,
                 city,
                 available,
                 lat,
                 lng,
                 radius = 10,
                 page = 1,
                 limit = 20,
                 verified,
             } = req.query

             let query = {
                 isActive: true,
             }

             if (verified !== undefined) {
                 query.isVerified = verified === "true"
             }

            // Filter by blood type
            if (bloodType) {
                query.bloodType = bloodType
            }

            // Filter by city
            if (city) {
                query["address.city"] = new RegExp(city, "i")
            }

            // Filter by availability
            if (available !== undefined) {
                query["availability.isAvailable"] = available === "true"
            }

            let donorsQuery = Donor.find(query).select(
                "-password -verificationToken -medicalConditions -medications"
            )

            // Geospatial query if coordinates provided
            if (lat && lng) {
                const coordinates = [parseFloat(lng), parseFloat(lat)]
                const maxDistance = parseInt(radius) * 1000 // Convert km to meters

                donorsQuery = Donor.find({
                    ...query,
                    location: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: coordinates,
                            },
                            $maxDistance: maxDistance,
                        },
                    },
                }).select(
                    "-password -verificationToken -medicalConditions -medications"
                )
            }

            // Pagination
            const skip = (page - 1) * limit
            donorsQuery = donorsQuery.skip(skip).limit(parseInt(limit))

            const donors = await donorsQuery
            const total = await Donor.countDocuments(query)

            res.status(200).json({
                success: true,
                data: {
                    donors,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / limit),
                        totalDonors: total,
                        hasNext: page * limit < total,
                        hasPrev: page > 1,
                    },
                },
                message: `Found ${donors.length} donors`,
            })
        } catch (error) {
            console.error("Error fetching donors:", error)
            res.status(500).json({
                success: false,
                message: "Error fetching donors",
                error: error.message,
            })
        }
    }
)

// POST /api/donors - Register new donor (CREATE)
router.post(
    "/",
    [
        body("firstName")
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage(
                "First name is required and must be under 50 characters"
            ),
        body("lastName")
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage(
                "Last name is required and must be under 50 characters"
            ),
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Valid email is required"),
        body("phone")
            .matches(/^\+?[\d\s\-\(\)]{10,}$/)
            .withMessage("Valid phone number is required"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
        body("bloodType")
            .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
            .withMessage("Valid blood type is required"),
        body("dateOfBirth")
            .isISO8601()
            .withMessage("Valid date of birth is required"),
        body("weight")
            .isFloat({ min: 50, max: 200 })
            .withMessage("Weight must be between 50-200 kg"),
        body("address.street")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Street address is required"),
        body("address.city")
            .trim()
            .isLength({ min: 1 })
            .withMessage("City is required"),
        body("address.state")
            .trim()
            .isLength({ min: 1 })
            .withMessage("State is required"),
        body("address.zipCode")
            .trim()
            .isLength({ min: 1 })
            .withMessage("ZIP code is required"),
        body("location.coordinates")
            .isArray({ min: 2, max: 2 })
            .withMessage("Valid coordinates are required"),
        body("location.coordinates.*")
            .isFloat()
            .withMessage("Coordinates must be numbers"),
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                email,
                phone,
                password,
                bloodType,
                dateOfBirth,
                weight,
                address,
                location,
                medicalConditions = [],
                medications = [],
                availability = {},
            } = req.body

            // Check if donor already exists
            const existingDonor = await Donor.findOne({ email })
            if (existingDonor) {
                return res.status(409).json({
                    success: false,
                    message: "Donor with this email already exists",
                })
            }

            // Validate age
            const age =
                (new Date() - new Date(dateOfBirth)) /
                (365.25 * 24 * 60 * 60 * 1000)
            if (age < 18 || age > 65) {
                return res.status(400).json({
                    success: false,
                    message: "Donor must be between 18 and 65 years old",
                })
            }

            // Create new donor
            const donor = new Donor({
                firstName,
                lastName,
                email,
                phone,
                password,
                bloodType,
                dateOfBirth,
                weight,
                address,
                location: {
                    type: "Point",
                    coordinates: location.coordinates,
                },
                medicalConditions,
                medications,
                availability: {
                    isAvailable: true,
                    schedule: availability.schedule || {},
                    emergencyOnly: availability.emergencyOnly || false,
                },
            })

            await donor.save()

            // Remove sensitive data from response
            const donorResponse = donor.toObject()
            delete donorResponse.password
            delete donorResponse.verificationToken

            // Notify nearby blood requests about new donor
            emitSocketEvent("donor-available", {
                bloodType: donor.bloodType,
                city: donor.address.city,
                donorId: donor._id,
            })

            res.status(201).json({
                success: true,
                message: "Donor registered successfully",
                data: { donor: donorResponse },
            })
        } catch (error) {
            console.error("Error registering donor:", error)

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Donor with this email already exists",
                })
            }

            res.status(500).json({
                success: false,
                message: "Error registering donor",
                error: error.message,
            })
        }
    }
)

// GET /api/donors/:id - Get donor by ID (READ)
router.get("/:id", async (req, res) => {
    try {
        const donor = await Donor.findById(req.params.id).select(
            "-password -verificationToken"
        )

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            })
        }

        res.status(200).json({
            success: true,
            data: { donor },
            message: "Donor retrieved successfully",
        })
    } catch (error) {
        console.error("Error fetching donor:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching donor",
            error: error.message,
        })
    }
})

// PUT /api/donors/:id - Update donor (UPDATE)
router.put(
    "/:id",
    [
        body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
        body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
        body("phone")
            .optional()
            .matches(/^\+?[\d\s\-\(\)]{10,}$/),
        body("bloodType")
            .optional()
            .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
        body("weight").optional().isFloat({ min: 50, max: 200 }),
        body("address.street").optional().trim().isLength({ min: 1 }),
        body("address.city").optional().trim().isLength({ min: 1 }),
        body("address.state").optional().trim().isLength({ min: 1 }),
        body("address.zipCode").optional().trim().isLength({ min: 1 }),
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const donor = await Donor.findById(req.params.id)
            if (!donor) {
                return res.status(404).json({
                    success: false,
                    message: "Donor not found",
                })
            }

            // Update fields
            Object.keys(req.body).forEach((key) => {
                if (key === "address" && req.body.address) {
                    donor.address = {
                        ...donor.address.toObject(),
                        ...req.body.address,
                    }
                } else if (key !== "password" && key !== "email") {
                    donor[key] = req.body[key]
                }
            })

            donor.lastActive = new Date()
            await donor.save()

            const donorResponse = donor.toObject()
            delete donorResponse.password
            delete donorResponse.verificationToken

            res.status(200).json({
                success: true,
                message: "Donor updated successfully",
                data: { donor: donorResponse },
            })
        } catch (error) {
            console.error("Error updating donor:", error)
            res.status(500).json({
                success: false,
                message: "Error updating donor",
                error: error.message,
            })
        }
    }
)

// DELETE /api/donors/:id - Delete donor (DELETE)
router.delete("/:id", async (req, res) => {
    try {
        const donor = await Donor.findById(req.params.id)
        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            })
        }

        // Soft delete - mark as inactive instead of permanent deletion
        donor.isActive = false
        donor.lastActive = new Date()
        await donor.save()

        res.status(200).json({
            success: true,
            message: "Donor account deactivated successfully",
        })
    } catch (error) {
        console.error("Error deleting donor:", error)
        res.status(500).json({
            success: false,
            message: "Error deleting donor",
            error: error.message,
        })
    }
})

// PUT /api/donors/:id/availability - Update donor availability
router.put(
    "/:id/availability",
    [
        body("isAvailable")
            .isBoolean()
            .withMessage("Availability status must be boolean"),
        body("emergencyOnly")
            .optional()
            .isBoolean()
            .withMessage("Emergency only must be boolean"),
        body("schedule")
            .optional()
            .isObject()
            .withMessage("Schedule must be an object"),
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { isAvailable, emergencyOnly, schedule } = req.body

            const donor = await Donor.findById(req.params.id)
            if (!donor) {
                return res.status(404).json({
                    success: false,
                    message: "Donor not found",
                })
            }

            // Update availability
            donor.availability.isAvailable = isAvailable
            if (emergencyOnly !== undefined) {
                donor.availability.emergencyOnly = emergencyOnly
            }
            if (schedule) {
                donor.availability.schedule = {
                    ...donor.availability.schedule,
                    ...schedule,
                }
            }
            donor.lastActive = new Date()

            await donor.save()

            // Notify about availability change
            if (isAvailable) {
                emitSocketEvent("donor-available", {
                    bloodType: donor.bloodType,
                    city: donor.address.city,
                    donorId: donor._id,
                })
            }

            res.status(200).json({
                success: true,
                message: "Availability updated successfully",
                data: { availability: donor.availability },
            })
        } catch (error) {
            console.error("Error updating availability:", error)
            res.status(500).json({
                success: false,
                message: "Error updating availability",
                error: error.message,
            })
        }
    }
)

// POST /api/donors/search/nearby - Find nearby donors for blood type
router.post(
    "/search/nearby",
    [
        body("bloodType")
            .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
            .withMessage("Valid blood type is required"),
        body("coordinates")
            .isArray({ min: 2, max: 2 })
            .withMessage("Valid coordinates are required"),
        body("coordinates.*")
            .isFloat()
            .withMessage("Coordinates must be numbers"),
        body("maxDistance")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Max distance must be 1-100 km"),
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { bloodType, coordinates, maxDistance = 10 } = req.body

            // Find compatible blood types
            const compatibilityMap = {
                "A+": ["A+", "A-", "O+", "O-"],
                "A-": ["A-", "O-"],
                "B+": ["B+", "B-", "O+", "O-"],
                "B-": ["B-", "O-"],
                "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                "AB-": ["A-", "B-", "AB-", "O-"],
                "O+": ["O+", "O-"],
                "O-": ["O-"],
            }

            const compatibleTypes = compatibilityMap[bloodType] || [bloodType]

            const donors = await Donor.find({
                bloodType: { $in: compatibleTypes },
                "availability.isAvailable": true,
                isEligible: true,
                isActive: true,
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: coordinates,
                        },
                        $maxDistance: maxDistance * 1000, // Convert km to meters
                    },
                },
            })
                .select(
                    "firstName lastName bloodType phone address availability donationCount"
                )
                .limit(20)

            res.status(200).json({
                success: true,
                data: {
                    donors,
                    searchCriteria: {
                        requestedBloodType: bloodType,
                        compatibleTypes,
                        maxDistance,
                        coordinates,
                    },
                },
                message: `Found ${donors.length} compatible donors within ${maxDistance}km`,
            })
        } catch (error) {
            console.error("Error searching nearby donors:", error)
            res.status(500).json({
                success: false,
                message: "Error searching nearby donors",
                error: error.message,
            })
        }
    }
)

// GET /api/donors/stats/summary - Get donation statistics
router.get("/stats/summary", async (req, res) => {
    try {
        const totalDonors = await Donor.countDocuments({ isActive: true })
        const availableDonors = await Donor.countDocuments({
            isActive: true,
            "availability.isAvailable": true,
            isEligible: true,
        })

        const bloodTypeStats = await Donor.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$bloodType", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ])

        const cityStats = await Donor.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$address.city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ])

        res.status(200).json({
            success: true,
            data: {
                totalDonors,
                availableDonors,
                bloodTypeDistribution: bloodTypeStats,
                topCities: cityStats,
            },
            message: "Statistics retrieved successfully",
        })
    } catch (error) {
        console.error("Error fetching donor statistics:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching statistics",
            error: error.message,
        })
    }
})

export default router

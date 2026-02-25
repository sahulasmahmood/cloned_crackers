const { prisma } = require('../../config/database');

/**
 * Create a new license
 * POST /api/compliance/licenses
 */
const createLicense = async (req, res) => {
    try {
        const {
            type,
            number,
            expiryDate,
            limitValue,
            documentUrl,
            alertDays = 30,
            isActive = true
        } = req.body;

        if (!type || !number || !expiryDate) {
            return res.status(400).json({
                success: false,
                error: 'Type, Number, and Expiry Date are required'
            });
        }

        const existingLicense = await prisma.license.findUnique({
            where: { number }
        });

        if (existingLicense) {
            return res.status(400).json({
                success: false,
                error: 'License number already exists'
            });
        }

        const license = await prisma.license.create({
            data: {
                type,
                number,
                expiryDate: new Date(expiryDate),
                limitValue,
                documentUrl,
                alertDays: parseInt(alertDays),
                isActive
            }
        });

        res.status(201).json({
            success: true,
            data: license,
            message: 'License added successfully'
        });

    } catch (error) {
        console.error('Error creating license:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add license',
            message: error.message
        });
    }
};

/**
 * Get all licenses
 * GET /api/compliance/licenses
 */
const getLicenses = async (req, res) => {
    try {
        const { type, isActive } = req.query;

        const where = {};
        if (type) where.type = type;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const licenses = await prisma.license.findMany({
            where,
            orderBy: { expiryDate: 'asc' } // Show nearest expiry first
        });

        res.json({
            success: true,
            data: licenses
        });

    } catch (error) {
        console.error('Error fetching licenses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch licenses',
            message: error.message
        });
    }
};

/**
 * Update license
 * PATCH /api/compliance/licenses/:id
 */
const updateLicense = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id;
        delete updateData.createdAt;

        // Handle date conversion if present
        if (updateData.expiryDate) {
            updateData.expiryDate = new Date(updateData.expiryDate);
        }

        const license = await prisma.license.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            data: license,
            message: 'License updated successfully'
        });

    } catch (error) {
        console.error('Error updating license:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update license',
            message: error.message
        });
    }
};

/**
 * Delete license (Soft delete preferrably, but requirement might be hard delete)
 * DELETE /api/compliance/licenses/:id
 */
const deleteLicense = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.license.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'License deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting license:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete license',
            message: error.message
        });
    }
};

module.exports = {
    createLicense,
    getLicenses,
    updateLicense,
    deleteLicense
};

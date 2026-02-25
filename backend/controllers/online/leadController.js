const { prisma } = require('../../config/database');
const { generateInvoiceNumber } = require("../../utils/order/invoiceGenerator");
const { calculateOrderTotals } = require("../../utils/order/gstCalculator");
const { getFinancialPeriod } = require("../../utils/finance/financialPeriod");
const { updateStockAfterOrder } = require("../../utils/inventory/stockUpdateService");
const { createOnlineTransaction } = require("../../utils/finance/transactionService");


/**
 * Create a new lead (Enquiry)
 * POST /api/online/leads
 * Public/Auth access
 */
const createLead = async (req, res) => {
    try {
        const {
            name,
            phone,
            whatsapp,
            location,
            city,
            products,
            totalBudget,
            source = 'Website',
            notes,
            userId,
            address
        } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Name and Phone are required'
            });
        }

        // Generate Lead Number
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const leadNumber = `L${year}${month}-${random}`;

        const leadData = {
            leadNumber,
            userId: userId || null,
            name,
            phone,
            whatsapp,
            location,
            city,
            products: products || [],
            totalBudget: parseFloat(totalBudget) || 0,
            source,
            notes,
            address: address || null,
            status: 'New'
        };

        const lead = await prisma.lead.create({
            data: leadData
        });

        res.status(201).json({
            success: true,
            data: lead,
            message: 'Enquiry submitted successfully'
        });

    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit enquiry',
            message: error.message
        });
    }
};

/**
 * Get all leads
 * GET /api/online/leads
 * Admin access (though currently basic auth check depends on middleware used in routes)
 */
const getLeads = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search, userId } = req.query;

        const where = {};

        // If userId provided, filter by it (for My Enquiries)
        if (userId) {
            where.userId = userId;
        }

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { leadNumber: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.lead.count({ where })
        ]);

        res.json({
            success: true,
            data: leads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / take)
            }
        });

    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leads',
            message: error.message
        });
    }
};

/**
 * Get lead by ID or Lead Number
 * GET /api/online/leads/:id
 */
const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;

        // Try finding by ID first if valid ObjectId format (24 chars hex), else leadNumber
        let lead = null;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            lead = await prisma.lead.findUnique({ where: { id } });
        }

        if (!lead) {
            lead = await prisma.lead.findUnique({ where: { leadNumber: id } });
        }

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        res.json({
            success: true,
            data: lead
        });

    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lead',
            message: error.message
        });
    }
};

/**
 * Convert Lead to Order
 * POST /api/online/leads/:id/convert
 */
const convertToOrder = async (req, res) => {
    try {
        const { id } = req.params;
        // Optional overrides from admin
        const {
            paymentMethod = 'cod',
            overrideCity,
            overrideState
        } = req.body;

        // 1. Fetch Lead
        let lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) {
            // Try leadNumber
            lead = await prisma.lead.findUnique({ where: { leadNumber: id } });
        }

        if (!lead) {
            return res.status(404).json({ success: false, error: 'Lead not found' });
        }

        if (lead.status === 'Converted' || lead.convertedOrderId) {
            return res.status(400).json({ success: false, error: 'Lead already converted' });
        }

        if (!lead.products || lead.products.length === 0) {
            return res.status(400).json({ success: false, error: 'Lead has no products' });
        }

        // 2. User & Customer Resolution
        let user = null;
        let customer = null;

        // Check if userId exists in lead
        if (lead.userId) {
            user = await prisma.user.findUnique({ where: { id: lead.userId } });
            customer = await prisma.customer.findUnique({ where: { userId: lead.userId } });
        }

        // If no user found by ID, try by phone
        if (!user) {
            // Search in Users first (users might exist without customer profile)
            // Note: Users model doesn't enforce unique phone, only email/googleId. 
            // We'll search in Customer model first as it strictly links to User
            customer = await prisma.customer.findFirst({ where: { phoneNumber: lead.phone } });

            if (customer && customer.userId) {
                user = await prisma.user.findUnique({ where: { id: customer.userId } });
            }
        }

        // If still no user, create Guest User & Customer
        if (!user) {
            // Create a pseudo-random password/email for offline user if needed
            // Ideally, we just create a Customer. But OnlineOrder requires userId.
            // So we create a shadow user.

            const randomSuffix = Math.floor(Math.random() * 10000);
            const generatedEmail = `guest_${lead.phone}_${randomSuffix}@offline.com`;

            user = await prisma.user.create({
                data: {
                    name: lead.name,
                    email: generatedEmail,
                    phoneNumber: lead.phone,
                    role: 'user', // Assuming default role is user
                    isActive: true,
                    isVerified: true
                }
            });

            customer = await prisma.customer.create({
                data: {
                    userId: user.id,
                    name: lead.name,
                    phoneNumber: lead.phone,
                    email: generatedEmail,
                    city: lead.city || overrideCity || 'Chennai', // Default fallbacks
                    state: overrideState || 'Tamil Nadu',
                    country: 'India'
                }
            });
        }

        // Ensure customer exists if we found a user but no customer profile
        if (user && !customer) {
            customer = await prisma.customer.create({
                data: {
                    userId: user.id,
                    name: lead.name,
                    phoneNumber: lead.phone,
                    email: user.email,
                    city: lead.city || overrideCity || 'Chennai',
                    state: overrideState || 'Tamil Nadu',
                    country: 'India'
                }
            });
        }

        // 3. Prepare Order Items
        // We need to fetch current product details (price, gst) for the lead products
        const orderItems = [];

        for (const lp of lead.products) {
            if (!lp.productId) continue;

            const product = await prisma.onlineProduct.findUnique({
                where: { id: lp.productId }
            });

            if (!product) continue;

            // Use first variant or default? Lead doesn't seem to store variant info in `LeadProduct` interface?
            // Checking LeadProduct interface: productId, name, quantity, price.
            // Requirement gap: Lead should ideally store variantId if variants exist.
            // Assumption: Using first variant or default values for now.
            // If product has variants, we might default to the first one available.

            let variant = null;
            let variantIndex = 0;

            if (product.enableVariants && product.variants.length > 0) {
                variant = product.variants[0]; // Default to first variant
            } else {
                // Mock variant structure for non-variant products (if schema enforces it)
                // Actually schema says `variants` is Json[], so it should exist.
            }

            // If variant logic is complex, we might need a "Variant Selection" step in Lead UI.
            // For now, assuming standard non-variant flow or 0th variant.

            orderItems.push({
                productId: product.id,
                inventoryProductId: variant?.inventoryProductId || "unknown", // This might be an issue if tracking inventory strictly
                productName: product.shortDescription,
                variantName: variant?.variantName || "Standard",
                displayName: variant?.displayName || product.shortDescription,
                brand: product.brand,
                productImage: variant?.variantImages?.[0] || null, // Assuming image structure
                unitPrice: lp.price || product.defaultSellingPrice, // Use locked price from lead or current price
                mrp: product.defaultMRP,
                quantity: lp.quantity,
                gstPercentage: product.gstPercentage || 0,
                // Add other required fields for GstCalculator
            });
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid products found to convert' });
        }

        // 4. Calculate Totals
        const deliveryAddress = {
            name: lead.name,
            phone: lead.phone,
            addressLine1: lead.location || 'Store Pickup', // Default if missing
            addressLine2: '',
            city: lead.city || overrideCity || 'Chennai',
            state: overrideState || 'Tamil Nadu', // Crucial for GST
            pincode: '000000',
            country: 'India',
            addressType: 'other' // Type
        };

        const totals = await calculateOrderTotals({
            items: orderItems,
            deliveryAddress,
            discount: 0,
            couponDiscount: 0,
            shippingCharge: 0
        });

        // 5. Generate Numbers
        const generateOrderNumber = () => {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
            return `ONL${timestamp}${random}`;
        };
        const orderNumber = generateOrderNumber();
        const invoiceResult = await generateInvoiceNumber(prisma);
        if (!invoiceResult) throw new Error("Invoice settings not configured");
        const { invoiceNumber } = invoiceResult;

        // 6. Create Order
        const { financialYear, accountingPeriod } = await getFinancialPeriod(new Date());

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.onlineOrder.create({
                data: {
                    orderNumber,
                    invoiceNumber,
                    orderType: "offline_lead", // Mark as lead conversion
                    customerId: customer.id,
                    userId: user.id,
                    customerName: customer.name,
                    customerEmail: customer.email || "",
                    customerPhone: customer.phoneNumber || "",
                    deliveryAddress: deliveryAddress,

                    items: totals.items,

                    subtotal: totals.subtotal,
                    tax: totals.tax,
                    taxRate: totals.taxRate,

                    gstType: totals.gstType,
                    cgstAmount: totals.cgstAmount,
                    sgstAmount: totals.sgstAmount,
                    igstAmount: totals.igstAmount,
                    totalGstAmount: totals.totalGstAmount,

                    adminState: totals.adminState,
                    customerState: totals.customerState,

                    discount: totals.discount,
                    couponDiscount: 0,
                    shippingCharge: totals.shippingCharge,

                    total: totals.total,

                    paymentMethod: paymentMethod, // e.g. 'cod' or 'cash'
                    paymentStatus: 'pending', // Admin can mark as paid later
                    orderStatus: 'pending', // Pending processing

                    saleDate: new Date(),
                    accountingPeriod,
                    financialYear,
                }
            });

            // 7. Update Lead
            await tx.lead.update({
                where: { id: lead.id },
                data: {
                    status: 'Converted',
                    convertedOrderId: newOrder.id,
                    updatedAt: new Date()
                }
            });

            return newOrder;
        });

        // 8. Post-creation async tasks
        try {
            // Deduct stock!
            // Note: We need to map order items back to format expected by updateStockAfterOrder?
            // updateStockAfterOrder expects an Order object, so it should be fine.
            await updateStockAfterOrder(order, "ONLINE_ORDER");
        } catch (e) {
            console.error("Stock update failed for converted order", e);
        }

        res.json({
            success: true,
            data: order,
            message: 'Lead converted to order successfully'
        });

    } catch (error) {
        console.error('Error converting lead:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to convert lead',
            message: error.message
        });
    }
};

/**
 * Update lead status/details
 * PATCH /api/online/leads/:id
 */
const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Prevent ID/LeadNumber update
        delete updateData.id;
        delete updateData.leadNumber;
        delete updateData.createdAt;

        // Check if ID is ObjectId or LeadNumber
        let where = {};
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            where = { id };
        } else {
            where = { leadNumber: id };
        }

        const lead = await prisma.lead.update({
            where,
            data: updateData
        });

        res.json({
            success: true,
            data: lead,
            message: 'Lead updated successfully'
        });

    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update lead',
            message: error.message
        });
    }
};

module.exports = {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    convertToOrder
};

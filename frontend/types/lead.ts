export interface LeadProduct {
    productId: string;
    name: string;
    quantity: number;
    price?: number;
}

export interface Lead {
    id: string;
    leadNumber: string;
    userId?: string;
    name: string;
    phone: string;
    whatsapp?: string;
    location?: string;
    city?: string;
    products?: LeadProduct[];
    status: 'New' | 'Contacted' | 'Quotation' | 'Negotiation' | 'Confirmed' | 'Converted' | 'Rejected';
    source?: string;
    notes?: string;
    totalBudget?: number;
    createdAt: string;
    updatedAt: string;
    convertedOrderId?: string;
}

export interface LeadStats {
    total: number;
    new: number;
    contacted: number;
    converted: number;
}

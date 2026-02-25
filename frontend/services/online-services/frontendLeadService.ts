import axiosInstance from "@/lib/axios";
import { Address } from "./addressService";

export interface CreateLeadRequest {
    userId: string;
    addressId: string;
    items: {
        productId: string;
        inventoryProductId: string;
        quantity: number;
        cuttingStyle?: string;
    }[];
    couponCode?: string | null;
}

export type LeadStatus = "PENDING" | "CONTACTED" | "QUOTATION_SENT" | "CONVERTED" | "LOST";

export interface LeadItem {
    id: string;
    productId: string;
    inventoryProductId: string;
    quantity: number;
    productName: string;
    displayName?: string;
    variantName?: string;
    productImage?: string;
    brand?: string;
    unitPrice: number;
    total: number;
    selectedCuttingStyle?: string;
}

export interface Lead {
    id: string;
    leadNumber: string;
    userId: string;
    status: LeadStatus;
    totalAmount: number; // Estimated value
    createdAt: string;
    updatedAt: string;
    items: LeadItem[];
    address?: Address;
}

export interface GetLeadsResponse {
    success: boolean;
    data: Lead[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
}

export const createLead = async (data: CreateLeadRequest) => {
    const response = await axiosInstance.post("/api/online/leads", data);
    return response.data;
};

export const getUserLeads = async (
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: LeadStatus
): Promise<GetLeadsResponse> => {
    const response = await axiosInstance.get(`/api/online/leads`, {
        params: {
            userId,
            page,
            limit,
            status,
        },
    });
    return response.data;
};

export const getLeadByNumber = async (leadNumber: string): Promise<{ success: boolean; data: Lead }> => {
    const response = await axiosInstance.get(`/api/online/leads/${leadNumber}`);
    return response.data;
};

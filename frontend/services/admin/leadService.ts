import axiosInstance from "@/lib/axios";
import { Lead } from "@/types/lead";

const API_URL = "/api/online/leads";

export const leadService = {
    // Get all leads
    getLeads: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
        const response = await axiosInstance.get(API_URL, { params });
        return response.data;
    },

    // Get lead by ID
    getLeadById: async (id: string) => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Create new lead (public/auth)
    createLead: async (data: Partial<Lead>) => {
        const response = await axiosInstance.post(API_URL, data);
        return response.data;
    },

    // Update lead status/details
    updateLead: async (id: string, data: Partial<Lead>) => {
        const response = await axiosInstance.patch(`${API_URL}/${id}`, data);
        return response.data;
    },
    // Convert lead to order
    convertLead: async (id: string, data?: { paymentMethod?: string; overrideCity?: string; overrideState?: string }) => {
        const response = await axiosInstance.post(`${API_URL}/${id}/convert`, data);
        return response.data;
    },
};

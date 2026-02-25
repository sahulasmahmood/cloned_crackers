import axiosInstance from "@/lib/axios";
import { License, LicenseFormData } from "@/types/license";

const API_URL = "/api/compliance/licenses";

export const licenseService = {
    // Get all licenses
    getLicenses: async (params?: { type?: string; isActive?: boolean }) => {
        const response = await axiosInstance.get(API_URL, { params });
        return response.data;
    },

    // Create new license
    createLicense: async (data: LicenseFormData) => {
        const response = await axiosInstance.post(API_URL, data);
        return response.data;
    },

    // Update license
    updateLicense: async (id: string, data: Partial<LicenseFormData>) => {
        const response = await axiosInstance.patch(`${API_URL}/${id}`, data);
        return response.data;
    },

    // Delete license
    deleteLicense: async (id: string) => {
        const response = await axiosInstance.delete(`${API_URL}/${id}`);
        return response.data;
    }
};

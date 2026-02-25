import axiosInstance from "@/lib/axios";

export interface Badge {
  id: string;
  name: string;
  isStatic: boolean;
}

export interface BadgeResponse {
  success: boolean;
  data: {
    static: Badge[];
    custom: Badge[];
    all: Badge[];
  };
  message?: string;
}

export interface SingleBadgeResponse {
  success: boolean;
  data: Badge;
  message?: string;
}

export const badgeService = {
  // Get all badges (static + custom)
  getAllBadges: async (): Promise<BadgeResponse> => {
    const response = await axiosInstance.get("/api/online/badges");
    return response.data;
  },

  // Create custom badge
  createBadge: async (name: string): Promise<SingleBadgeResponse> => {
    const response = await axiosInstance.post("/api/online/badges", { name });
    return response.data;
  },

  // Update custom badge
  updateBadge: async (id: string, name: string): Promise<SingleBadgeResponse> => {
    const response = await axiosInstance.put(`/api/online/badges/${id}`, { name });
    return response.data;
  },

  // Delete custom badge
  deleteBadge: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/api/online/badges/${id}`);
    return response.data;
  },
};

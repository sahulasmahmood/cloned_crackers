import axiosInstance from "@/lib/axios";

// Product model from online-service (synced from inventory)
export interface OnlineProduct {
  id: string;
  itemName: string;
  category?: string | null;
  itemCode?: string | null;
  uom: string;
  purchasePrice: number;
  gstPercentage: number;
  hsnCode?: string | null;
  warehouseId?: string;
  warehouse: { id: string; name: string } | string; // Can be object or string
  quantity: number;
  openingStock: number;
  lowStockAlertLevel: number;
  status: string;
  expiryDate?: string | null;
  description?: string | null;
  itemImage?: string | null; // Presigned URL for display
  itemImageKey?: string | null; // Raw S3 key for storage
  isUsedInOnlineProduct?: boolean; // Flag to indicate if item is already used
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnlineProductResponse {
  success: boolean;
  data: OnlineProduct[];
}

class OnlineProductService {
  private baseURL = "/api/online/products";

  /**
   * Get all products for dropdown selection
   * @param search - Optional search query
   * @returns Promise with products
   */
  async getProducts(search?: string): Promise<OnlineProductResponse> {
    try {
      const params = search ? { search, limit: 50 } : { limit: 50 };
      console.log("🌐 Calling API:", this.baseURL, "with params:", params);
      
      const response = await axiosInstance.get(this.baseURL, { params });
      
      console.log("📡 Raw axios response:", response);
      console.log("📦 Response data:", response.data);
      console.log("📦 Response data.data:", response.data.data);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log("📅 First product expiryDate from service:", response.data.data[0].expiryDate);
        console.log("📅 First product full:", JSON.stringify(response.data.data[0], null, 2));
      }
      
      return response.data;
    } catch (error: unknown) {
      console.error("Error in getProducts:", error);
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param id - Product ID
   * @returns Promise with product data
   */
  async getProductById(id: string): Promise<{
    success: boolean;
    data: OnlineProduct;
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/${id}`);
    return response.data;
  }
}

export const onlineProductService = new OnlineProductService();

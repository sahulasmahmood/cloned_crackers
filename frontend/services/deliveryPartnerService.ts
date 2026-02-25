import axiosInstance from "@/lib/axios";

export interface DeliveryPartner {
  id: string;
  partnerId?: string; // DP001, DP002, etc. (only for approved partners)
  
  // Personal Information
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  alternateMobileNumber?: string;
  profilePhoto?: string;
  profilePhotoUrl?: string; // Presigned URL
  
  // Address Details
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  
  // ID Proof & Verification
  aadharNumber?: string;
  aadharDocument?: string;
  aadharDocumentUrl?: string; // Presigned URL
  licenseNumber: string;
  licenseDocument?: string;
  licenseDocumentUrl?: string; // Presigned URL
  idProofDocument?: string;
  idProofDocumentUrl?: string; // Presigned URL
  
  // Vehicle Details
  vehicleType: "bike" | "scooter" | "car" | "van";
  vehicleModel?: string;
  vehicleNumber: string;
  vehicleRCDocument?: string;
  vehicleRCDocumentUrl?: string; // Presigned URL
  insuranceValidityDate?: string;
  insuranceDocument?: string;
  insuranceDocumentUrl?: string; // Presigned URL
  pollutionCertificateValidity?: string;
  pollutionCertDocument?: string;
  pollutionCertDocumentUrl?: string; // Presigned URL
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyContactNumber?: string;
  
  // Status
  applicationStatus: "pending" | "verified" | "approved" | "rejected";
  partnerStatus?: "active" | "inactive" | "suspended"; // Only for approved partners
  suspensionReason?: string;
  suspensionNote?: string;
  suspendedAt?: string;
  
  // Metrics
  rating: number;
  totalDeliveries: number;
  joiningDate: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPartnersResponse {
  success: boolean;
  data: DeliveryPartner[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DeliveryPartnerResponse {
  success: boolean;
  data: DeliveryPartner;
  message?: string;
}

export interface CreateDeliveryPartnerData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  alternateMobileNumber?: string;
  vehicleType: string;
  vehicleModel?: string;
  vehicleNumber: string;
  licenseNumber: string;
  aadharNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  insuranceValidityDate?: string;
  pollutionCertificateValidity?: string;
  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyContactNumber?: string;
  applicationStatus?: "pending" | "verified" | "approved" | "rejected";
}

export interface UpdateDeliveryPartnerData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  alternateMobileNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  aadharNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  insuranceValidityDate?: string;
  pollutionCertificateValidity?: string;
  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyContactNumber?: string;
}

export interface UpdateApplicationStatusData {
  status: "verified" | "approved" | "rejected";
  reason?: string;
  note?: string;
}

export interface UpdatePartnerStatusData {
  status: "active" | "inactive" | "suspended";
  suspensionReason?: string;
  suspensionNote?: string;
}

/**
 * Get all delivery partners with filters
 */
export const getDeliveryPartners = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string; // applicationStatus
  vehicleType?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<DeliveryPartnersResponse> => {
  const response = await axiosInstance.get("/api/delivery-partners", { params });
  return response.data;
};

/**
 * Get delivery partner by ID
 */
export const getDeliveryPartnerById = async (id: string): Promise<DeliveryPartnerResponse> => {
  const response = await axiosInstance.get(`/api/delivery-partners/${id}`);
  return response.data;
};

/**
 * Create new delivery partner with files
 */
export const createDeliveryPartner = async (
  data: CreateDeliveryPartnerData,
  files?: {
    profilePhoto?: File;
    aadharDocument?: File;
    licenseDocument?: File;
    vehicleRCDocument?: File;
    insuranceDocument?: File;
    pollutionCertDocument?: File;
    idProofDocument?: File;
  }
): Promise<DeliveryPartnerResponse> => {
  const formData = new FormData();
  
  // Append all text fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });
  
  // Append files if provided
  if (files) {
    if (files.profilePhoto) formData.append('profilePhoto', files.profilePhoto);
    if (files.aadharDocument) formData.append('aadharDocument', files.aadharDocument);
    if (files.licenseDocument) formData.append('licenseDocument', files.licenseDocument);
    if (files.vehicleRCDocument) formData.append('vehicleRCDocument', files.vehicleRCDocument);
    if (files.insuranceDocument) formData.append('insuranceDocument', files.insuranceDocument);
    if (files.pollutionCertDocument) formData.append('pollutionCertDocument', files.pollutionCertDocument);
    if (files.idProofDocument) formData.append('idProofDocument', files.idProofDocument);
  }
  
  const response = await axiosInstance.post("/api/delivery-partners", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update delivery partner with files
 */
export const updateDeliveryPartner = async (
  id: string,
  data: UpdateDeliveryPartnerData,
  files?: {
    profilePhoto?: File;
    aadharDocument?: File;
    licenseDocument?: File;
    vehicleRCDocument?: File;
    insuranceDocument?: File;
    pollutionCertDocument?: File;
    idProofDocument?: File;
  }
): Promise<DeliveryPartnerResponse> => {
  const formData = new FormData();
  
  // Append all text fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });
  
  // Append files if provided
  if (files) {
    if (files.profilePhoto) formData.append('profilePhoto', files.profilePhoto);
    if (files.aadharDocument) formData.append('aadharDocument', files.aadharDocument);
    if (files.licenseDocument) formData.append('licenseDocument', files.licenseDocument);
    if (files.vehicleRCDocument) formData.append('vehicleRCDocument', files.vehicleRCDocument);
    if (files.insuranceDocument) formData.append('insuranceDocument', files.insuranceDocument);
    if (files.pollutionCertDocument) formData.append('pollutionCertDocument', files.pollutionCertDocument);
    if (files.idProofDocument) formData.append('idProofDocument', files.idProofDocument);
  }
  
  const response = await axiosInstance.put(`/api/delivery-partners/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update application status (pending -> verified -> approved/rejected)
 */
export const updateApplicationStatus = async (
  id: string,
  data: UpdateApplicationStatusData
): Promise<DeliveryPartnerResponse> => {
  const response = await axiosInstance.put(`/api/delivery-partners/${id}/application-status`, data);
  return response.data;
};

/**
 * Update partner status (active/inactive/suspended) - Only for approved partners
 */
export const updatePartnerStatus = async (
  id: string,
  data: UpdatePartnerStatusData
): Promise<DeliveryPartnerResponse> => {
  const response = await axiosInstance.put(`/api/delivery-partners/${id}/partner-status`, data);
  return response.data;
};

/**
 * Get approved partners (for manage profile)
 */
export const getApprovedPartners = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  partnerStatus?: "active" | "inactive" | "suspended";
  sortBy?: string;
  sortOrder?: string;
}): Promise<DeliveryPartnersResponse> => {
  const response = await axiosInstance.get("/api/delivery-partners/approved", { params });
  return response.data;
};

/**
 * Get application status history
 */
export const getStatusHistory = async (id: string): Promise<{ success: boolean; data: unknown[] }> => {
  const response = await axiosInstance.get(`/api/delivery-partners/${id}/status-history`);
  return response.data;
};

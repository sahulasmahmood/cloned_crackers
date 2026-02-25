export interface License {
    id: string;
    type: 'Shop' | 'Explosive' | 'PESO';
    number: string;
    expiryDate: string;
    limitValue?: string; // e.g. "500kg"
    documentUrl?: string;
    isActive: boolean;
    alertDays: number;
    createdAt: string;
    updatedAt: string;
}

export type LicenseFormData = Omit<License, 'id' | 'createdAt' | 'updatedAt'>;

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type KycStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type VehicleStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export type VehicleType =
  | 'SEDAN'
  | 'SUV'
  | 'HATCHBACK'
  | 'TRUCK'
  | 'VAN'
  | 'MINIVAN'
  | 'COUPE'
  | 'CONVERTIBLE'
  | 'PICKUP'
  | 'BUS'
  | 'TWO_WHEELER'
  | 'THREE_WHEELER'
  | 'OTHER';

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'CNG' | 'LPG' | 'HYBRID';

export type Transmission = 'MANUAL' | 'AUTOMATIC' | 'SEMI_AUTOMATIC' | 'CVT';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  bio?: string;
  city?: string;
  state?: string;
  country: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKycVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  id: string;
  userId: string;
  aadhaarNumber?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  licenseNumber?: string;
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
  selfieUrl?: string;
  status: KycStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedById?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface VehicleAvailability {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  isBlocked: boolean;
  reason?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  fuelType: FuelType;
  transmission: Transmission;
  numberOfSeats: number;
  color?: string;
  licensePlate: string;
  registrationNumber: string;
  registrationExpiry?: string;
  rcDocumentUrl?: string;
  insuranceDocumentUrl?: string;
  insuranceExpiry?: string;
  pucDocumentUrl?: string;
  pucExpiry?: string;
  description?: string;
  features: string[];
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  status: VehicleStatus;
  isAvailableForRent: boolean;
  isAvailableForSwap: boolean;
  approvedAt?: string;
  approvedById?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  images: VehicleImage[];
  availability: VehicleAvailability[];
  owner: {
    id: string;
    name: string;
    avatarUrl?: string;
    city?: string;
    isKycVerified: boolean;
    createdAt: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

import { z } from 'zod';

export const CreateVehicleSchema = z.object({
  brand: z.string().min(1, 'Brand is required').max(50),
  model: z.string().min(1, 'Model is required').max(100),
  year: z
    .number()
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(new Date().getFullYear() + 1, 'Invalid year'),
  vehicleType: z.enum([
    'SEDAN', 'SUV', 'HATCHBACK', 'TRUCK', 'VAN', 'MINIVAN',
    'COUPE', 'CONVERTIBLE', 'PICKUP', 'BUS', 'TWO_WHEELER',
    'THREE_WHEELER', 'OTHER',
  ]),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'CNG', 'LPG', 'HYBRID']),
  transmission: z.enum(['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC', 'CVT']),
  numberOfSeats: z.number().int().min(1).max(50),
  color: z.string().max(30).optional(),
  licensePlate: z
    .string()
    .regex(
      /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/,
      'Invalid Indian license plate format (e.g., MH12AB1234)'
    ),
  registrationNumber: z.string().min(5).max(30),
  description: z.string().max(1000).optional(),
  features: z.array(z.string()).max(20).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  address: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isAvailableForRent: z.boolean().default(true),
  isAvailableForSwap: z.boolean().default(true),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial().omit({
  licensePlate: true,
  registrationNumber: true,
});

export const VehicleSearchSchema = z.object({
  city: z.string().optional(),
  vehicleType: z.string().optional(),
  numberOfSeats: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  brand: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  availableForRent: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  availableForSwap: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  page: z.string().default('1'),
  limit: z.string().default('12'),
  sortBy: z.enum(['newest', 'rating']).default('newest'),
});

export const SetAvailabilitySchema = z.object({
  startDate: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime('Invalid date format'),
  isBlocked: z.boolean(),
  reason: z.string().max(200).optional(),
});

export const AdminVehicleActionSchema = z.object({
  rejectionReason: z.string().max(500).optional(),
});

export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;
export type VehicleSearchInput = z.infer<typeof VehicleSearchSchema>;

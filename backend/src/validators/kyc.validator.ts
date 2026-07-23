import { z } from 'zod';

export const SubmitKycSchema = z.object({
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'),
  licenseNumber: z
    .string()
    .min(5, 'License number is required')
    .max(20, 'Invalid license number'),
});

export const AdminKycActionSchema = z.object({
  rejectionReason: z.string().max(500).optional(),
});

export const KycListQuerySchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']).optional(),
  page: z.string().default('1'),
  limit: z.string().default('20'),
});

export type SubmitKycInput = z.infer<typeof SubmitKycSchema>;

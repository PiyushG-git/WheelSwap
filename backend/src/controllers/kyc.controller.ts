import { Request, Response } from 'express';
import { KycService } from '../services/kyc.service';
import { ApiResponseBuilder } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { Errors } from '../utils/appError.util';

export const KycController = {
  submit: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const files = req.files as Record<string, Express.Multer.File[]>;

    const kycFiles = {
      aadhaarFront: files?.aadhaarFront?.[0]?.buffer,
      aadhaarBack: files?.aadhaarBack?.[0]?.buffer,
      licenseFront: files?.licenseFront?.[0]?.buffer,
      licenseBack: files?.licenseBack?.[0]?.buffer,
      selfie: files?.selfie?.[0]?.buffer,
    };

    if (!kycFiles.aadhaarFront || !kycFiles.licenseFront) {
      throw Errors.badRequest('Aadhaar front and License front images are required');
    }

    const kyc = await KycService.submit(userId, req.body, kycFiles);
    ApiResponseBuilder.created(res, kyc, 'KYC documents submitted successfully');
  }),

  getStatus: asyncHandler(async (req: Request, res: Response) => {
    const kyc = await KycService.getStatus(req.user!.id);
    ApiResponseBuilder.success(res, kyc);
  }),

  // ── Admin ────────────────────────────────────

  adminList: asyncHandler(async (req: Request, res: Response) => {
    const result = await KycService.adminList(req.query as Record<string, unknown>);
    ApiResponseBuilder.success(res, result.items, 'KYC submissions fetched', 200, result.meta);
  }),

  adminGetByUserId: asyncHandler(async (req: Request, res: Response) => {
    const kyc = await KycService.adminGetByUserId(req.params.userId);
    ApiResponseBuilder.success(res, kyc);
  }),

  adminApprove: asyncHandler(async (req: Request, res: Response) => {
    await KycService.approve(req.params.userId, req.user!.id);
    ApiResponseBuilder.success(res, null, 'KYC approved successfully');
  }),

  adminReject: asyncHandler(async (req: Request, res: Response) => {
    const { rejectionReason } = req.body;
    if (!rejectionReason) throw Errors.badRequest('Rejection reason is required');
    await KycService.reject(req.params.userId, req.user!.id, rejectionReason);
    ApiResponseBuilder.success(res, null, 'KYC rejected');
  }),
};

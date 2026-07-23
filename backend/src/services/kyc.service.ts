import { KycRepository } from '../repositories/kyc.repository';
import { UserRepository } from '../repositories/user.repository';
import { uploadToCloudinary } from '../utils/upload.util';
import { CLOUDINARY_FOLDERS } from '../config/cloudinary.config';
import { sendKycStatusEmail } from '../utils/email.util';
import { Errors } from '../utils/appError.util';
import { KycStatus } from '@prisma/client';
import { parsePagination, buildPaginationMeta } from '../utils/response.util';

interface KycFiles {
  aadhaarFront?: Buffer;
  aadhaarBack?: Buffer;
  licenseFront?: Buffer;
  licenseBack?: Buffer;
  selfie?: Buffer;
}

export const KycService = {
  /**
   * Submit or resubmit KYC documents
   */
  async submit(
    userId: string,
    data: { aadhaarNumber: string; licenseNumber: string },
    files: KycFiles
  ) {
    const existing = await KycRepository.findByUserId(userId);

    // Only allow submit if no doc, or previous was rejected
    if (existing && existing.status === KycStatus.APPROVED) {
      throw Errors.conflict('KYC already approved');
    }
    if (existing && existing.status === KycStatus.PENDING) {
      throw Errors.conflict('KYC already submitted and pending review');
    }

    // Upload all provided files to Cloudinary
    const uploads: Record<string, string> = {};
    const folder = CLOUDINARY_FOLDERS.KYC;

    if (files.aadhaarFront) {
      const { url } = await uploadToCloudinary(files.aadhaarFront, folder, {
        publicId: `kyc_${userId}_aadhaar_front`,
      });
      uploads.aadhaarFrontUrl = url;
    }
    if (files.aadhaarBack) {
      const { url } = await uploadToCloudinary(files.aadhaarBack, folder, {
        publicId: `kyc_${userId}_aadhaar_back`,
      });
      uploads.aadhaarBackUrl = url;
    }
    if (files.licenseFront) {
      const { url } = await uploadToCloudinary(files.licenseFront, folder, {
        publicId: `kyc_${userId}_license_front`,
      });
      uploads.licenseFrontUrl = url;
    }
    if (files.licenseBack) {
      const { url } = await uploadToCloudinary(files.licenseBack, folder, {
        publicId: `kyc_${userId}_license_back`,
      });
      uploads.licenseBackUrl = url;
    }
    if (files.selfie) {
      const { url } = await uploadToCloudinary(files.selfie, folder, {
        publicId: `kyc_${userId}_selfie`,
      });
      uploads.selfieUrl = url;
    }

    const kycData = {
      aadhaarNumber: data.aadhaarNumber,
      licenseNumber: data.licenseNumber,
      status: KycStatus.PENDING,
      ...uploads,
    };

    if (!existing) {
      return KycRepository.create({
        user: { connect: { id: userId } },
        ...kycData,
      });
    }

    return KycRepository.update(userId, {
      ...kycData,
      rejectionReason: null,
      verifiedAt: null,
      submittedAt: new Date(),
    });
  },

  /**
   * Get own KYC status
   */
  async getStatus(userId: string) {
    return KycRepository.findByUserId(userId);
  },

  /**
   * Admin: list all KYC submissions
   */
  async adminList(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const status = query.status as KycStatus | undefined;

    const { items, total } = await KycRepository.findAll({ status, skip, take: limit });
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },

  /**
   * Admin: view single KYC
   */
  async adminGetByUserId(userId: string) {
    const kyc = await KycRepository.findByUserId(userId);
    if (!kyc) throw Errors.notFound('KYC document');
    return kyc;
  },

  /**
   * Admin: approve KYC
   */
  async approve(userId: string, adminId: string) {
    const kyc = await KycRepository.findByUserId(userId);
    if (!kyc) throw Errors.notFound('KYC document');
    if (kyc.status === KycStatus.APPROVED) throw Errors.conflict('KYC already approved');

    const user = await UserRepository.findById(userId);
    if (!user) throw Errors.notFound('User');

    await KycRepository.approve(userId, adminId);
    await sendKycStatusEmail(user.email, user.name, 'APPROVED');
  },

  /**
   * Admin: reject KYC
   */
  async reject(userId: string, adminId: string, reason: string) {
    const kyc = await KycRepository.findByUserId(userId);
    if (!kyc) throw Errors.notFound('KYC document');

    const user = await UserRepository.findById(userId);
    if (!user) throw Errors.notFound('User');

    await KycRepository.reject(userId, adminId, reason);
    await sendKycStatusEmail(user.email, user.name, 'REJECTED', reason);
  },
};

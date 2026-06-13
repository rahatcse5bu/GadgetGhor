import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class UploadService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof Cloudinary) {}

  uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new BadRequestException(
        'Cloudinary is not configured. Set CLOUDINARY_* env vars.',
      );
    }
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { folder: 'gadgetghor', resource_type: 'image' },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }

  async deleteImage(publicId: string) {
    await this.cloudinary.uploader.destroy(publicId);
    return { deleted: true };
  }
}

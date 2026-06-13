import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UploadController {
  constructor(private service: UploadService) {}

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 8))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const results = await Promise.all(
      (files || []).map((f) => this.service.uploadImage(f)),
    );
    return { urls: results.map((r) => r.url), results };
  }
}

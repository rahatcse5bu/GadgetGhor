import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BundlesService } from './bundles.service';
import { BundlesController } from './bundles.controller';
import { Bundle, BundleSchema } from './schemas/bundle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bundle.name, schema: BundleSchema }]),
  ],
  controllers: [BundlesController],
  providers: [BundlesService],
  exports: [BundlesService],
})
export class BundlesModule {}

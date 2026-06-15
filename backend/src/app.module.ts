import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { BundlesModule } from './bundles/bundles.module';
import { OrdersModule } from './orders/orders.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { ContactModule } from './contact/contact.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      // Fail a stalled selection faster (default 30s) so the retry kicks in sooner.
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      // NestJS will retry the initial connection a few times before giving up.
      retryAttempts: 5,
      retryDelay: 3000,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    BundlesModule,
    OrdersModule,
    UploadModule,
    MailModule,
    ContactModule,
    SettingsModule,
  ],
})
export class AppModule {}

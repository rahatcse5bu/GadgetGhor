import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class OrderItemInput {
  @IsIn(['product', 'bundle'])
  kind: string;

  @IsString()
  id: string;

  @Min(1)
  quantity: number;

  // Selected variant label, if the product has variants.
  @IsOptional()
  @IsString()
  variant?: string;
}

class CustomerInput {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() phone: string;
}

class AddressInput {
  @IsString() address: string;
  @IsOptional() @IsString() area?: string;
  @IsString() city: string;
  @IsOptional() @IsString() postcode?: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CustomerInput)
  customer: CustomerInput;

  @ValidateNested()
  @Type(() => AddressInput)
  shippingAddress: AddressInput;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @IsOptional()
  @IsIn(['cod', 'bkash', 'nagad', 'card'])
  paymentMethod?: string;

  // Wallet used for the advance (COD) or full (online) payment.
  @IsOptional()
  @IsIn(['bkash', 'nagad', 'rocket'])
  paymentChannel?: string;

  @IsOptional()
  @IsString()
  paymentNumber?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  customerNote?: string;
}

export class UpdateStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  trackingCarrier?: string;

  @IsOptional()
  @IsString()
  trackingCode?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;
}

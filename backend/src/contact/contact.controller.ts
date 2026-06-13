import { Body, Controller, Post } from '@nestjs/common';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MailService } from '../mail/mail.service';

class ContactDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() subject?: string;
  @MinLength(5) message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private mail: MailService) {}

  @Post()
  async submit(@Body() dto: ContactDto) {
    await this.mail.sendContactMessage(dto);
    return { ok: true, message: 'Thanks! We will get back to you shortly.' };
  }
}

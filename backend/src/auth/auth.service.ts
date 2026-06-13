import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private sign(user: { _id?: any; id?: any; email: string; role: string }) {
    const id = (user._id || user.id).toString();
    return this.jwtService.sign({ sub: id, email: user.email, role: user.role });
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const user = await this.usersService.create({ ...dto, role: 'customer' });
    const token = this.sign(user as any);
    return { token, user: this.safe(user) };
  }

  async login(dto: LoginDto) {
    const identifier = (dto.identifier || dto.email || '').trim();
    if (!identifier) throw new UnauthorizedException('Invalid credentials');
    const user = await this.usersService.findByEmailOrUsername(identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await this.usersService.validatePassword(
      dto.password,
      user.password,
    );
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.sign(user);
    return { token, user: this.safe(user.toObject()) };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.safe(user.toObject());
  }

  private safe(user: any) {
    return {
      id: (user._id || user.id).toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone,
    };
  }
}

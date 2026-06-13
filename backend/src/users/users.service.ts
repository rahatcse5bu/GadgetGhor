import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const created = await this.userModel.create({ ...data, password: hashed });
    const obj = created.toObject();
    delete obj.password;
    return obj;
  }

  findByEmail(email: string) {
    // include password explicitly for auth validation
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  // Allow signing in with either an email address or a username.
  findByEmailOrUsername(identifier: string) {
    const id = identifier.toLowerCase().trim();
    return this.userModel
      .findOne({ $or: [{ email: id }, { username: id }] })
      .select('+password')
      .exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async validatePassword(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }
}

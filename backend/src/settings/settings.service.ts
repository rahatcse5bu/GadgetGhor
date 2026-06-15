import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private model: Model<SettingsDocument>,
  ) {}

  // Always returns the single settings doc, creating it with defaults if absent.
  async get() {
    let doc = await this.model.findOne({ key: 'global' }).exec();
    if (!doc) doc = await this.model.create({ key: 'global' });
    return doc;
  }

  async update(data: Partial<Settings>) {
    // never allow the key to be changed
    delete (data as any).key;
    return this.model
      .findOneAndUpdate({ key: 'global' }, data, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      })
      .exec();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  private s3Client: S3Client;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  async updateProfile(
    username: string,
    updateProfileDto: {
      name?: string;
      avatar?: string;
      bio?: string;
      location?: string;
    },
  ): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate({ username }, { $set: updateProfileDto }, { new: true })
      .exec();
    return user;
  }

  async uploadAvatar(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `avatars/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/avatars/${fileName}`;
    } catch (error) {
      console.error('S3 업로드 오류:', error);
      throw new Error('아바타 업로드에 실패했습니다.');
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  async deleteUser(username: string): Promise<void> {
    const result = await this.userModel.deleteOne({ username });
    if (result.deletedCount === 0) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  }
}

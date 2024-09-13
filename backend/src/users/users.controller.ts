import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.username);
    return {
      username: user.username,
      name: user.name,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      roles: user.roles,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Request() req,
    @Body()
    updateProfileDto: {
      name?: string;
      bio?: string;
      location?: string;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const avatarUrl = await this.usersService.uploadAvatar(file);
      updateProfileDto['avatar'] = avatarUrl;
    }
    const updatedUser = await this.usersService.updateProfile(
      req.user.username,
      updateProfileDto,
    );
    return {
      username: updatedUser.username,
      name: updatedUser.name,
      isVerified: updatedUser.isVerified,
      lastLogin: updatedUser.lastLogin,
      roles: updatedUser.roles,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      location: updatedUser.location,
    };
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  async deleteProfile(@Request() req) {
    await this.usersService.deleteUser(req.user.username);
    return { message: '계정이 성공적으로 삭제되었습니다.' };
  }
}

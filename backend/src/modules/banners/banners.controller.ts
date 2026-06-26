import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from 'common/enums';
import { Roles } from 'common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'common/config/multer.config';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }

  @UseInterceptors(CacheInterceptor)
  @Get()
  findAllPublic() {
    return this.bannersService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  create(@Request() req, @Body() createBannerDto: CreateBannerDto, @UploadedFile() file?: Express.Multer.File) {
    return this.bannersService.create(createBannerDto, req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('admin/all')
  findAllForAdmin() {
    return this.bannersService.findAll(false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  update(@Request() req, @Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto, @UploadedFile() file?: Express.Multer.File) {
    return this.bannersService.update(id, updateBannerDto, req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}

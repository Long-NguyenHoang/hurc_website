import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'common/config/multer.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from 'common/dto/pagination.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn một file hợp lệ để tải lên');
    }

    return this.mediaService.uploadSingleFile(file, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.mediaService.findAll(req.user, paginationDto);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.mediaService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(id, updateMediaDto, req.user);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.mediaService.remove(id, req.user);
  }
}

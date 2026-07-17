import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, Request, UploadedFile } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto } from 'common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { UserRole } from 'common/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'common/config/multer.config';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) { }


  @Get()
  findAllPublic(@Query() paginationDto: PaginationDto) {
    return this.articlesService.findAllPublic(paginationDto);
  }


  @Get('detail/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  create(@Request() req, @Body() createArticleDto: CreateArticleDto, @UploadedFile() file?: Express.Multer.File) {
    return this.articlesService.create(createArticleDto, req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('admin/all')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.articlesService.findAllAdmin(paginationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  update(@Request() req, @Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto, @UploadedFile() file?: Express.Multer.File) {
    return this.articlesService.update(id, updateArticleDto, req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}

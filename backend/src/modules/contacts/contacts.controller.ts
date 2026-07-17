import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { UserRole } from 'common/enums';
import { PaginationDto } from 'common/dto/pagination.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) { }

  @UseGuards(ThrottlerGuard)
  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    // HONEYPOT CHECK
    if (createContactDto.website_url) {
      // Bắt quả tang bot điền vào trường ẩn! 
      // Không ném lỗi ra để đánh lừa bot tưởng gửi thành công, hoặc ném lỗi tuỳ ý.
      throw new BadRequestException('Spam detected!');
    }
    return this.contactsService.create(createContactDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('admin/all')
  findAllAdmin(@Query() paginationDto: PaginationDto) {
    return this.contactsService.findAllAdmin(paginationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch('update/:id')
  update(@Request() req, @Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}

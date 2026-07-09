import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Repository, ILike } from 'typeorm';
import { Contact } from 'common/entities/contacts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactStatus } from 'common/enums';
import { PaginationDto } from 'common/dto/pagination.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
  ) { }

  async create(createContactDto: CreateContactDto) {
    if (!createContactDto.email && !createContactDto.phone) {
      throw new BadRequestException('Vui lòng cung cấp ít nhất Email hoặc số điện thoại')
    }

    const newContact = this.contactsRepository.create({
      ...createContactDto,
      status: ContactStatus.PENDING,
    });

    return await this.contactsRepository.save(newContact);
  }

  async findAllAdmin(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, search } = paginationDto;
    const [contacts, total] = await this.contactsRepository.findAndCount({
      where: search ? [
        { full_name: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
        { phone: ILike(`%${search}%`) }
      ] : undefined,
      order: { created_at: 'DESC' },
      relations: { resolved_by_user: true },
      select: {
        resolved_by_user: { id: true, full_name: true, email: true }
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return { data: contacts, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const contact = await this.contactsRepository.findOne({
      where: { id },
      relations: { resolved_by_user: true },
      select: {
        resolved_by_user: { id: true, full_name: true, email: true }
      }
    });

    if (!contact) throw new NotFoundException('Không tìm thấy thông tin liên hệ');
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto, userId: string) {
    const contact = await this.findOne(id);

    contact.status = updateContactDto.status;

    if (updateContactDto.status === ContactStatus.RESOLVED) {
      contact.resolved_by_user = { id: userId } as any;
    }

    return await this.contactsRepository.save(contact);
  }

  async remove(id: string) {
    const contact = await this.findOne(id);
    await this.contactsRepository.softRemove(contact)
    return { message: 'Đã xoá liên hệ thành công' };
  }
}

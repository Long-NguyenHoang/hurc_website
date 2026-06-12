import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from 'common/entities/users.entity';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from 'common/dto/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });

    if (existingUser) {
      throw new ConflictException('Email này đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);
    const { password, ...result } = savedUser;

    return result;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.usersRepository.findAndCount({
      skip: skip,
      take: limit,
      order: { created_at: 'DESC' },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        lastPage,
      }
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = Object.assign(user, updateUserDto);
    await this.usersRepository.save(updatedUser);

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    await this.usersRepository.softRemove(user);
    return { message: 'Đã xóa người dùng thành công' };
  }
}

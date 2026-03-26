import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { UserRole } from 'src/common/interface/recommendation.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userDto: UserDto): Promise<User> {
    const newUser = this.usersRepository.create({
      ...userDto,
      roles: userDto.roles || [UserRole.CUSTOMER],
    });
    return this.usersRepository.save(newUser);
  }

  async findByRole(role: UserRole) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.roles @> :role', { role: [role] })
      .getMany();
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, userDto: UserDto): Promise<User> {
    await this.usersRepository.update(id, userDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}

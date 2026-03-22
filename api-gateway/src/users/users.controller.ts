import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { PARAMS } from 'src/common/util/request-param-handler.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() userDto: UserDto): Promise<User> {
    return this.usersService.create(userDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(`:${PARAMS.ID}`)
  findOne(@Param(PARAMS.ID, ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(`:${PARAMS.ID}`)
  update(
    @Param(PARAMS.ID, ParseIntPipe) id: number,
    @Body() userDto: UserDto,
  ): Promise<User> {
    return this.usersService.update(id, userDto);
  }

  @Delete(`:${PARAMS.ID}`)
  remove(@Param(PARAMS.ID, ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}

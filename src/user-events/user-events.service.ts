import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEvent } from './entities/user-event.entity';
import { UserEventDto } from './dto/user-event.dto';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class UserEventService {
  constructor(
    @InjectRepository(UserEvent)
    private eventsRepository: Repository<UserEvent>,
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
  ) {}

  async logEvent(eventDto: UserEventDto): Promise<UserEvent> {
    const { user_id, product_id, event_type, timestamp } = eventDto;

    try {
      await this.userService.findOne(user_id);
      await this.productService.findOne(product_id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        const logger = new Logger(UserEventService.name);
        logger.warn(`Failed to log event: ${error.message}`);
        throw error;
      }
      throw error;
    }

    const eventData: Partial<UserEvent> = {
      user_id,
      product_id,
      event_type,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    const event = this.eventsRepository.create(eventData as UserEvent);
    return this.eventsRepository.save(event);
  }

  findAll() {
    return this.eventsRepository.find({
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }
}

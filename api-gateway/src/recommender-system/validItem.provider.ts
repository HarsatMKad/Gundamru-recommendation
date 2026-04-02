import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class ValidItemProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly productService: ProductsService,
  ) {}

  async getValidUserIds(): Promise<string[]> {
    const users = await this.usersService.findWithRoleFilter(
      UserRole.USER,
      UserRole.ADMIN,
    );
    return users.map((u) => u.id);
  }

  async getValidProductIds(): Promise<string[]> {
    return await this.productService.getRecomendetProductIds();
  }
}

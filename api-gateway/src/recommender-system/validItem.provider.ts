import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from 'src/common/enum/UserRole.enum';
import * as entitesInterface from 'src/common/interface/entites.interface';

@Injectable()
export class ValidItemProvider {
  constructor(
    @Inject(entitesInterface.I_USERS_SERVICE)
    private readonly usersService: entitesInterface.IUsersService,

    @Inject(entitesInterface.I_PRODUCTS_SERVICE)
    private readonly productService: entitesInterface.IProductService,
  ) {}

  async getValidUserIds(): Promise<string[]> {
    const users = await this.usersService.findWithRoleFilter(
      UserRole.USER,
      UserRole.ADMIN,
    );
    return users.map((u) => u.id);
  }

  async getValidProductsWithAttributes(): Promise<
    entitesInterface.IProductWithAttributes[]
  > {
    return await this.productService.getPublishedProductsWithAttributes();
  }
}

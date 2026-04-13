import { UserRole } from '../enum/UserRole.enum';

export const I_USERS_SERVICE = 'I_USERS_SERVICE';
export const I_PRODUCTS_SERVICE = 'I_PRODUCTS_SERVICE';

export interface User {
  id: string;
  username: string;
  roles: UserRole[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  is_published: boolean;
}

export interface IProductWithAttributes {
  id: string;
  brand_id: string;
  grade: string;
  scale: string;
  price: number;
}

export interface IUsersService {
  findWithRoleFilter(
    includeRole: UserRole,
    excludeRole: UserRole,
  ): Promise<User[]>;
}

export interface IProductService {
  getPublishedProductsWithAttributes(): Promise<IProductWithAttributes[]>;
}

export const I_USERS_SERVICE = 'I_USERS_SERVICE';
export const I_PRODUCTS_SERVICE = 'I_PRODUCTS_SERVICE';

export interface IProductWithAttributes {
  id: string;
  brandId: string;
  grade: string;
  scale: string;
  price: number;
  isRecomended: boolean;
}

export interface IProductService {
  getPublishedProductsWithAttributes(): Promise<IProductWithAttributes[]>;
}

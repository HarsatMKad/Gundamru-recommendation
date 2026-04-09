import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_attributes')
export class ProductAttributes {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  grade!: string;

  @Column()
  scale!: string;

  @Column('uuid')
  product_id!: string;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}

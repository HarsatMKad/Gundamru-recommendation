import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 0 })
  price!: number;

  @Column({ default: 0 })
  stock_quantity!: number;

  @Column()
  brand_id!: string;

  @Column({ default: true })
  is_published!: boolean;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column('text', { default: UserRole.CUSTOMER }) // Используем ENUM для ролей
  roles: UserRole;
}

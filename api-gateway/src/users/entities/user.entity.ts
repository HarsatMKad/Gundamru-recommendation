import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from 'src/common/interface/recommendation.interface';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.CUSTOMER],
  })
  roles: UserRole[];
}

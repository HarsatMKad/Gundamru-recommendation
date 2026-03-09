import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recommender_settings')
export class RecommenderSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  target_context: string;

  @Column({ type: 'jsonb' })
  methods: { strategy: string; weight: number }[];

  @Column({ default: true, nullable: false })
  isActive: boolean;
}

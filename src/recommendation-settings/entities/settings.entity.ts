import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('recommender_settings')
export class RecommenderSetting {
  @PrimaryColumn()
  target_context: string;

  @Column({ type: 'jsonb' })
  methods: { strategy: string; weight: number }[];
}

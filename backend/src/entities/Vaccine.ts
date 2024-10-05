import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Vaccine {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    vaccine_national_code!: number;

  @Column()
    vaccine_name!: string;

  @Column()
    vaccine_is_periodical!: boolean;

  @Column()
    vaccine_minimum_period_type!: string;

  @Column()
    vaccine_minimum_recommend_date!: number;

  @Column({ type: 'varchar', nullable: true })
    vaccine_maximum_period_type!: string | null;

  @Column({ type: 'tinyint', nullable: true })
    vaccine_maximum_recommend_date!: number | null;

  @Column()
    vaccine_round!: number;

  @Column({ nullable: true })
    vaccine_description!: string;
}

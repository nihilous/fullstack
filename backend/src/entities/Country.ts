import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Country {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    national_code!: string;

    @Column()
    name_original!: string;

    @Column()
    name_english!: string;
}
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTempVaccineTable20240924183000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'temp_vaccine',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'vaccine_national_code',
                        type: 'int',
                    },
                    {
                        name: 'vaccine_name',
                        type: 'varchar',
                    },
                    {
                        name: 'vaccine_is_periodical',
                        type: 'boolean',
                    },
                    {
                        name: 'vaccine_minimum_period_type',
                        type: 'varchar',
                    },
                    {
                        name: 'vaccine_minimum_recommend_date',
                        type: 'int',
                    },
                    {
                        name: 'vaccine_maximum_period_type',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'vaccine_maximum_recommend_date',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'vaccine_round',
                        type: 'tinyint',
                    },
                    {
                        name: 'vaccine_description',
                        type: 'varchar',
                        isNullable: true,
                    }
                ],
            })
        );

        await queryRunner.createIndex('temp_vaccine', new TableIndex({
            name: 'IDX_VACCINE_ID',
            columnNames: ['id'],
            isUnique: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('temp_vaccine', 'IDX_VACCINE_ID');
        await queryRunner.dropTable('temp_vaccine');
    }
}

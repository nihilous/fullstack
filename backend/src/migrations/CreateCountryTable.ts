import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCountryTable20240923173000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'country',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'national_code',
                        type: 'varchar',
                    },
                    {
                        name: 'name_english',
                        type: 'varchar',
                    },
                    {
                        name: 'name_original',
                        type: 'varchar',
                    },
                ],
            })
        );

        await queryRunner.createIndex('country', new TableIndex({
            name: 'IDX_COUNTRY_ID',
            columnNames: ['id'],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('country', 'IDX_COUNTRY_ID');
        await queryRunner.dropTable('country');
    }
}

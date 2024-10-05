import {
  MigrationInterface, QueryRunner, Table, TableIndex,
} from 'typeorm';

export class CreateTempCountryTable20240924183000
implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'temp_country',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
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
      }),
    );

    await queryRunner.createIndex(
      'temp_country',
      new TableIndex({
        name: 'IDX_COUNTRY_ID',
        columnNames: ['id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('temp_country', 'IDX_COUNTRY_ID');
    await queryRunner.dropTable('temp_country');
  }
}

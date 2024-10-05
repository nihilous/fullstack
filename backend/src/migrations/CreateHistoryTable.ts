import {
  MigrationInterface, QueryRunner, Table, TableIndex,
} from 'typeorm';

export class CreateHistoryTable20240923173000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'history',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_detail_id',
            type: 'int',
          },
          {
            name: 'vaccine_id',
            type: 'int',
          },
          {
            name: 'history_date',
            type: 'date',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'history',
      new TableIndex({
        name: 'IDX_HISTORY_USER_DETAIL_ID',
        columnNames: ['user_detail_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('history', 'IDX_HISTORY_USER_DETAIL_ID');
    await queryRunner.dropTable('history');
  }
}

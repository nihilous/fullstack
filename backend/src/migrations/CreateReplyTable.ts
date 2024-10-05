import {
  MigrationInterface, QueryRunner, Table, TableIndex,
} from 'typeorm';

export class CreateReplyTable20241009170000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reply',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'board_id',
            type: 'int',
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'text',
            type: 'varchar',
          },
          {
            name: 'is_admin',
            type: 'boolean',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'reply',
      new TableIndex({
        name: 'IDX_REPLY_ID',
        columnNames: ['id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('reply', 'IDX_REPLY_ID');
    await queryRunner.dropTable('reply');
  }
}

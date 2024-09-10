import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBoardTable20241009170000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'board',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'user_id',
                        type: 'int',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
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
            })
        );

        await queryRunner.createIndex('board', new TableIndex({
            name: 'IDX_BOARD_ID',
            columnNames: ['id'],
            isUnique: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('board', 'IDX_BOARD_ID');
        await queryRunner.dropTable('board');
    }
}

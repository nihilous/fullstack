import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUserDetailTable20240923173000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_detail',
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
                        name: 'name',
                        type: 'varchar',
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                    },
                    {
                        name: 'gender',
                        type: 'tinyint',
                    },
                    {
                        name: 'birthdate',
                        type: 'date',
                    },
                    {
                        name: 'nationality',
                        type: 'int',
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

        await queryRunner.createIndex('user_detail', new TableIndex({
            name: 'IDX_USER_ID',
            columnNames: ['user_id']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('user_detail', 'IDX_USER_ID');
        await queryRunner.dropTable('user_detail');
    }
}

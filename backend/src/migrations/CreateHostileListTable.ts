import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateHostileListTable20240917183500 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'hostile_list',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'ip_address',
                        type: 'varchar',
                        length: '45',
                        isNullable: true,
                    },
                    {
                        name: 'attack_count',
                        type: 'int',
                        default: 1,
                    },
                    {
                        name: 'is_banned',
                        type: 'boolean',
                        default: false,
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

        await queryRunner.createIndex('hostile_list', new TableIndex({
            name: 'IDX_HOSTILE_LIST',
            columnNames: ['ip_address'],
            isUnique: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('hostile_list', 'IDX_HOSTILE_LIST');
        await queryRunner.dropTable('hostile_list');
    }
}

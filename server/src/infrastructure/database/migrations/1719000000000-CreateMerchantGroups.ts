import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMerchantGroups1719000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMerchantGroups = await queryRunner.hasTable('merchant_groups');
    if (!hasMerchantGroups) {
      await queryRunner.createTable(
        new Table({
          name: 'merchant_groups',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'status',
              type: 'tinyint',
              width: 1,
              default: 1,
            },
            {
              name: 'merchant_source_id',
              type: 'int',
              isNullable: true,
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
          indices: [
            {
              name: 'idx_merchant_groups_name',
              columnNames: ['name'],
            },
            {
              name: 'idx_merchant_groups_merchant_source',
              columnNames: ['merchant_source_id'],
            },
          ],
        }),
        true
      );
    }

    const hasMerchantGroupMembers = await queryRunner.hasTable('merchant_group_members');
    if (!hasMerchantGroupMembers) {
      await queryRunner.createTable(
        new Table({
          name: 'merchant_group_members',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'group_id',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'merchant_id',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'merchant_code',
              type: 'varchar',
              length: '128',
              isNullable: false,
            },
            {
              name: 'is_merchant_source',
              type: 'tinyint',
              width: 1,
              default: 0,
            },
            {
              name: 'status',
              type: 'tinyint',
              width: 1,
              default: 1,
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
          indices: [
            {
              name: 'idx_merchant_group_members_group_id',
              columnNames: ['group_id'],
            },
            {
              name: 'idx_merchant_group_members_merchant_id',
              columnNames: ['merchant_id'],
            },
            {
              name: 'idx_merchant_group_members_merchant_unique',
              columnNames: ['merchant_id'],
              isUnique: true,
            },
          ],
          foreignKeys: [
            {
              columnNames: ['group_id'],
              referencedTableName: 'merchant_groups',
              referencedColumnNames: ['id'],
              onDelete: 'SET NULL',
            },
          ],
        }),
        true
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMerchantGroupMembers = await queryRunner.hasTable('merchant_group_members');
    if (hasMerchantGroupMembers) {
      await queryRunner.dropTable('merchant_group_members');
    }

    const hasMerchantGroups = await queryRunner.hasTable('merchant_groups');
    if (hasMerchantGroups) {
      await queryRunner.dropTable('merchant_groups');
    }
  }
}

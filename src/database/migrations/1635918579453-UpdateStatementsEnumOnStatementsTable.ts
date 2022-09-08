import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateStatementsEnumOnStatementsTable1635918579453
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'statements',
      'type',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['deposit', 'withdraw', 'transfers'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'statements',
      'type',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['deposit', 'withdraw'],
      }),
    );
  }
}

// server/src/modules/merchant/entities/MerchantGroup.entity.ts

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MerchantGroupMember } from './MerchantGroupMember.entity.ts';

@Entity('merchant_groups')
export class MerchantGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'boolean', default: true })
  status!: boolean;

  @Column({ type: 'int', nullable: true })
  merchant_source_id!: number | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => MerchantGroupMember, member => member.group, { cascade: true })
  members!: MerchantGroupMember[];
}

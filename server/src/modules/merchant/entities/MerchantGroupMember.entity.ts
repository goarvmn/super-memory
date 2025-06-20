// server/src/modules/merchant/entities/MerchantGroupMember.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MerchantGroup } from './MerchantGroup.entity.ts';

@Entity('merchant_group_members')
export class MerchantGroupMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  group_id!: number | null;

  @Column({ type: 'int' })
  merchant_id!: number;

  @Column({ type: 'varchar', length: 128 })
  merchant_code!: string;

  @Column({ type: 'boolean', default: false })
  is_merchant_source!: boolean;

  @Column({ type: 'boolean', default: true })
  status!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => MerchantGroup, group => group.members, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'group_id' })
  group!: MerchantGroup | null;
}

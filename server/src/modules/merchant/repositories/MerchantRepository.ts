// server/src/modules/merchant/repositories/MerchantRepository.ts

import {
  AddMerchantToRegistryRequest,
  Merchant,
  MerchantRegistry,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { DatabasePort } from '../../../infrastructure/adapters/database';
import { CommonParams, DI_TYPES } from '../../../shared';
import { IMerchantRepository, MerchantMemberRecord } from '../interfaces';

/**
 * Database record interfaces for typing
 */
interface MerchantRegistryRecord {
  id: number;
  name: string;
  code: string;
  registry_id: number;
  registry_status: number;
  group_id: number | null;
  is_merchant_source: boolean;
}

@injectable()
export class MerchantRepository implements IMerchantRepository {
  constructor(@inject(DI_TYPES.Database) private database: DatabasePort) {}

  /**
   * Get available merchants
   * Business logic: get all active merchants from table `merchants` that are not yet registered in the registry
   */
  async getAvailableMerchants(params: CommonParams = {}): Promise<Merchant[]> {
    const { search, limit, offset } = params;

    let query = `
      SELECT m.id, m.merchant_name as name, m.goapotik_merchant_code as code
      FROM merchants m
      LEFT JOIN merchant_group_members mgm ON m.id = mgm.merchant_id
      WHERE m.status = 1 AND mgm.merchant_id IS NULL
    `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND (m.merchant_name LIKE ?)`;
      queryParams.push(`%${search}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    return await this.database.query<Merchant[]>(query, queryParams);
  }

  /**
   * Get registered merchants
   * Business logic: get all merchants that are already registered in the registry as individual merchants (not part of any group)
   */
  async getRegisteredMerchants(params: CommonParams = {}): Promise<MerchantRegistry[]> {
    const { search, status, limit, offset } = params;

    let query = `
      SELECT 
        m.id, m.merchant_name as name, m.goapotik_merchant_code as code,
        mgm.id as registry_id, mgm.status as registry_status, mgm.group_id, mgm.is_merchant_source
      FROM merchants m
      INNER JOIN merchant_group_members mgm ON m.id = mgm.merchant_id
      WHERE mgm.group_id IS NULL
    `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND (m.merchant_name LIKE ?)`;
      queryParams.push(`%${search}%`);
    }

    if (status !== undefined) {
      query += ` AND mgm.status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY mgm.id DESC, mgm.status DESC LIMIT ? OFFSET ?`; // order by id and make sure inactive is last
    queryParams.push(limit, offset);

    const result = await this.database.query<MerchantRegistryRecord[]>(query, queryParams);

    // transform to MerchantRegistry
    return result.map<MerchantRegistry>(merchant => ({
      id: merchant.id,
      name: merchant.name,
      code: merchant.code,
      registryId: merchant.registry_id,
      registryStatus: merchant.registry_status,
      groupId: merchant.group_id,
      isMerchantSource: merchant.is_merchant_source,
    }));
  }

  /**
   * Add merchant to registry
   * Business logic: register a merchant by adding to `merchant_group_members`
   */
  async addMerchantToRegistry(params: AddMerchantToRegistryRequest): Promise<number> {
    const member = await this.database.create<any>('merchant_group_members', {
      merchant_id: params.id,
      merchant_code: params.code,
      group_id: params?.group_id ?? null,
      is_merchant_source: params?.is_merchant_source ?? false,
    });

    return member.id;
  }

  /**
   * Update merchant in registry
   * Business logic: update merchant registration data in `merchant_group_members`
   */
  async updateMerchantInRegistry(params: UpdateMerchantRegistryRequest): Promise<void> {
    const { registryId, ...updateData } = params;

    await this.database.update('merchant_group_members', { id: registryId }, updateData);
  }

  /**
   * Remove merchant from registry
   * Business logic: unregister a merchant by removing its record from `merchant_group_members`
   */
  async removeMerchantFromRegistry(registry_id: number): Promise<void> {
    await this.database.delete('merchant_group_members', { id: registry_id });
  }

  /**
   * Find registered merchant
   * Business logic: find a merchant in the registry by partial matching on `merchant_group_members`
   */
  async findRegisteredMerchant(params: Partial<MerchantMemberRecord>): Promise<MerchantMemberRecord | null> {
    return await this.database.findOne<MerchantMemberRecord>('merchant_group_members', params);
  }

  /**
   * Get registered merchants count
   * Business logic: count total number of active registered individual merchants in the registry
   */
  async getRegisteredMerchantsCount(params: CommonParams = {}): Promise<number> {
    const { search, status } = params;

    let query = `
      SELECT COUNT(DISTINCT mgm.id) as total
      FROM merchant_group_members mgm
      INNER JOIN merchants m ON mgm.merchant_id = m.id
      WHERE mgm.group_id IS NULL 
      AND mgm.status = 1
    `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND (m.merchant_name LIKE ?)`;
      queryParams.push(`%${search}%`);
    }

    if (status !== undefined) {
      query += ` AND mgm.status = ?`;
      queryParams.push(status);
    }

    const result = await this.database.query(query, queryParams);
    return result[0]?.total || 0;
  }
}

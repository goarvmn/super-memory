// server/src/modules/merchant/repositories/MerchantRepository.ts

import {
  AddMerchantToRegistryRequest,
  Merchant,
  MerchantRegistry,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { DatabasePort } from '../../../infrastructure/adapters/database/DatabasePort';
import { CommonParams, DI_TYPES } from '../../../shared';
import { IMerchantRepository } from '../interfaces';

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
      SELECT m.id, m.merchant_name as name, m.goapotik_merchant_code as code, m.status
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

    query += ` ORDER BY mgm.id DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const result = await this.database.query<MerchantRegistryRecord[]>(query, queryParams);

    // transform to MerchantRegistry
    return result.map(merchant => ({
      ...merchant,
      registryId: merchant.registry_id,
      registryStatus: merchant.registry_status,
      groupId: merchant.group_id,
      isMerchantSource: merchant.is_merchant_source,
    }));
  }

  /**
   * Add merchant to registry
   * Business logic: register a merchant as an individual merchant in the registry by adding to `merchant_group_members`
   */
  async addMerchantToRegistry(params: AddMerchantToRegistryRequest): Promise<number> {
    const member = await this.database.create<any>('merchant_group_members', {
      group_id: null, // by default, set to null to indicate individual merchant
      merchant_id: params.merchant_id,
      merchant_code: params.merchant_code,
      is_merchant_source: false,
    });

    return member.id;
  }

  /**
   * Update merchant in registry
   * Business logic: update merchant registration data in `merchant_group_members`
   */
  async updateMerchantInRegistry(params: UpdateMerchantRegistryRequest): Promise<void> {
    const { registry_id, ...updateData } = params;

    await this.database.update('merchant_group_members', { id: registry_id }, updateData);
  }

  /**
   * Remove merchant from registry
   * Business logic: unregister a merchant by removing its record from `merchant_group_members`
   */
  async removeMerchantFromRegistry(registryId: number): Promise<void> {
    await this.database.delete('merchant_group_members', { id: registryId });
  }

  /**
   * Check if merchant is registered
   * Business logic: verify if a merchant is already registered in the registry by checking `merchant_group_members`
   */
  async isMerchantRegistered(merchantId: number): Promise<boolean> {
    const result = await this.database.findOne('merchant_group_members', { merchant_id: merchantId });
    return !!result;
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

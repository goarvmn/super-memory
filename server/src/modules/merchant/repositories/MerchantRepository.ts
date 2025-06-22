// server/src/modules/merchant/repositories/MerchantRepository.ts

import {
  AddMerchantToRegistryRequest,
  Merchant,
  MerchantWithRegistry,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { DatabasePort } from '../../../infrastructure/adapters/database/DatabasePort';
import { CommonParams, DI_TYPES } from '../../../shared';
import { IMerchantRepository } from '../interfaces';

@injectable()
export class MerchantRepository implements IMerchantRepository {
  constructor(@inject(DI_TYPES.Database) private database: DatabasePort) {}

  /**
   * Get available merchants
   * Bussiness logic: get all active merchants from table `merchants` and filter out merchants that are already registered in the registry
   */
  async getAvailableMerchants(params: CommonParams = {}): Promise<Merchant[]> {
    const { search, limit, offset } = params;

    let query = `
      SELECT m.id, m.name, m.goapotik_merchant_code as merchant_code
      FROM merchants m
      LEFT JOIN merchant_group_members mgm ON m.id = mgm.merchant_id
      WHERE m.status = 1 AND mgm.merchant_id IS NULL
    `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND (m.name LIKE ?)`;
      queryParams.push(`%${search}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    return await this.database.query<Merchant[]>(query, queryParams);
  }

  /**
   * Get registered merchants
   * Bussiness logic: get all merchants from `merchant_group_members` and filter out merchants that are not registered in the registry
   */
  async getRegisteredMerchants(params: CommonParams = {}): Promise<MerchantWithRegistry[]> {
    const { search, status, limit, offset } = params;

    let query = `
      SELECT 
        m.id, m.name, m.goapotik_merchant_code as merchant_code,
        mgm.id as registry_id, mgm.status, mgm.group_id, mgm.is_merchant_source
      FROM merchants m
      INNER JOIN merchant_group_members mgm ON m.id = mgm.merchant_id
      WHERE mgm.group_id IS NULL
    `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND (m.name LIKE ?)`;
      queryParams.push(`%${search}%`);
    }

    if (status !== undefined) {
      query += ` AND mgm.status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY mgm.id DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    return await this.database.query<MerchantWithRegistry[]>(query, queryParams);
  }

  /**
   * Add merchant to registry
   * Bussiness logic: add merchant to `merchant_group_members`
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
   * Bussiness logic: update merchant from `merchant_group_members`
   */
  async updateMerchantInRegistry(params: UpdateMerchantRegistryRequest): Promise<void> {
    const { registry_id, ...updateData } = params;

    await this.database.update('merchant_group_members', { id: registry_id }, updateData);
  }

  /**
   * Remove merchant from registry
   * Bussiness logic: remove merchant from `merchant_group_members`
   */
  async removeMerchantFromRegistry(registryId: number): Promise<void> {
    await this.database.delete('merchant_group_members', { id: registryId });
  }

  /**
   * Check if merchant is registered
   * Bussiness logic: check if merchant is registered in `merchant_group_members`
   */
  async isMerchantRegistered(merchantId: number): Promise<boolean> {
    const result = await this.database.findOne('merchant_group_members', { merchant_id: merchantId });
    return !!result;
  }

  /**
   * Get reigistered merchants count
   * Bussiness logic: get count of registered merchants
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
      query += ` AND (m.name LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status !== undefined) {
      query += ` AND mgm.status = ?`;
      queryParams.push(status);
    }

    const result = await this.database.query(query, queryParams);
    return result[0]?.total || 0;
  }
}

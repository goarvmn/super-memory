// server/src/modules/merchant/repositories/MerchantRepository.ts

import {
  AddMerchantToRegistryRequest,
  GetMerchantsRequest,
  Merchant,
  MerchantWithRegistry,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { DatabasePort } from '../../../infrastructure/adapters/database/DatabasePort';
import { DI_TYPES } from '../../../shared/types/container';
import { IMerchantRepository } from '../interfaces';

@injectable()
export class MerchantRepository implements IMerchantRepository {
  constructor(@inject(DI_TYPES.Database) private database: DatabasePort) {}

  async getAvailableMerchants(params: GetMerchantsRequest = {}): Promise<Merchant[]> {
    const { search, limit = 10, offset = 0 } = params;

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

  async getRegisteredIndividualMerchants(params: GetMerchantsRequest = {}): Promise<MerchantWithRegistry[]> {
    const { search, status, limit = 9, offset = 0 } = params;

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

    if (status) {
      query += ` AND mg.status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY mgm.id DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    return await this.database.query<MerchantWithRegistry[]>(query, queryParams);
  }

  async addMerchantToRegistry(params: AddMerchantToRegistryRequest): Promise<number> {
    const member = await this.database.create<any>('merchant_group_members', {
      group_id: params.group_id || null,
      merchant_id: params.merchant_id,
      merchant_code: params.merchant_code,
      is_merchant_source: params.is_merchant_source || false,
    });

    return member.id;
  }

  async updateMerchantInRegistry(params: UpdateMerchantRegistryRequest): Promise<void> {
    const { registry_id, ...updateData } = params;

    await this.database.update('merchant_group_members', { id: registry_id }, updateData);
  }

  async removeMerchantFromRegistry(registryId: number): Promise<void> {
    await this.database.delete('merchant_group_members', { id: registryId });
  }

  async isMerchantRegistered(merchantId: number): Promise<boolean> {
    const result = await this.database.findOne('merchant_group_members', { merchant_id: merchantId });
    return !!result;
  }
}

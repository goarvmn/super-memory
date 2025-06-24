// shared/src/types/merchant.ts

export interface Merchant {
  id: number;
  name: string;
  code: string;
}

export interface MerchantRegistry extends Merchant {
  registryId: number;
  registryStatus?: number;
  groupId?: number | null;
  isMerchantSource?: boolean | null;
}

export interface MerchantRegistryWithStats extends MerchantRegistry {
  productsCount?: number;
  syncedCount?: number;
  pendingCount?: number;
}

export interface GroupSummary {
  id: number;
  name: string;
  status: number;
  merchantSourceId: number | null;
  membersCount?: number;
}

export interface GroupWithMembers extends GroupSummary {
  members: MerchantRegistryWithStats[];
}

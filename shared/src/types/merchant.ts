// shared/src/types/merchant.ts

export interface Merchant {
  id: number;
  name: string;
  merchant_code: string;
}

export interface MerchantWithRegistry extends Merchant {
  registry_id: number;
  status: number;
  group_id: number | null;
}

export interface GroupSummary {
  id: number;
  name: string;
  status: number;
  merchant_source_id: number | null;
  member_count: number;
}

export interface GroupMember {
  id: number;
  merchant_name: string;
  merchant_code: string;
  merchant_status: number;
  group_id: number;
  merchant_id: number;
  is_merchant_source: boolean;
}

export interface GroupWithMembers extends GroupSummary {
  members: GroupMember[];
}

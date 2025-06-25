// client/src/lib/data/merchant/mockGroups.ts

import type { GetGroupsResponse, GroupSummary, GroupWithMembers } from '@guesense-dash/shared';

// GroupSummary data

export const mockGroups: GroupSummary[] = [
  {
    id: 1,
    name: 'Electronics Group',
    status: 1,
    merchantSourceId: 1,
    membersCount: 3,
  },
  {
    id: 2,
    name: 'Pharmacy Chain',
    status: 1,
    merchantSourceId: 3,
    membersCount: 2,
  },
  {
    id: 3,
    name: 'Bookstore Network',
    status: 1,
    merchantSourceId: null,
    membersCount: 1,
  },
  {
    id: 4,
    name: 'Supermarket Alliance',
    status: 1,
    merchantSourceId: 6,
    membersCount: 1,
  },
  {
    id: 5,
    name: 'Pet Care Network',
    status: 1,
    merchantSourceId: 8,
    membersCount: 1,
  },
  {
    id: 6,
    name: 'Coffee Shop Chain',
    status: 1,
    merchantSourceId: 10,
    membersCount: 1,
  },
  {
    id: 7,
    name: 'Fashion Retailer Group',
    status: 0,
    merchantSourceId: null,
    membersCount: 1,
  },
  {
    id: 8,
    name: 'Health & Beauty Chain',
    status: 0,
    merchantSourceId: null,
    membersCount: 0,
  },
  {
    id: 9,
    name: 'Sports Equipment Network',
    status: 1,
    merchantSourceId: 9,
    membersCount: 1,
  },
  {
    id: 10,
    name: 'Automotive Parts Group',
    status: 1,
    merchantSourceId: null,
    membersCount: 0,
  },
  {
    id: 11,
    name: 'Food & Beverage Network',
    status: 1,
    merchantSourceId: null,
    membersCount: 0,
  },
  {
    id: 12,
    name: 'Home & Garden Alliance',
    status: 1,
    merchantSourceId: null,
    membersCount: 0,
  },
  {
    id: 13,
    name: 'Baby & Kids Store Chain',
    status: 0,
    merchantSourceId: null,
    membersCount: 0,
  },
  {
    id: 14,
    name: 'Technology Retailers Group',
    status: 1,
    merchantSourceId: null,
    membersCount: 0,
  },
  {
    id: 15,
    name: 'Local Groceries Network',
    status: 0,
    merchantSourceId: null,
    membersCount: 0,
  },
];

// GroupMembers data

const groupMembersData: Record<number, GroupWithMembers['members']> = {
  1: [
    {
      id: 1,
      name: 'Toko Elektronik Jaya',
      code: 'TKE001',
      registryId: 1000,
      isMerchantSource: true,
      productsCount: 345,
      syncedCount: 320,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
    {
      id: 6,
      name: 'Supermarket Central',
      code: 'SMC006',
      registryId: 1002,
      isMerchantSource: false,
      productsCount: 1234,
      syncedCount: 1234,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
    {
      id: 9,
      name: 'Toko Olahraga Sehat',
      code: 'TOS009',
      registryId: 1001,
      isMerchantSource: false,
      productsCount: 289,
      syncedCount: 250,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
  ],
  2: [
    {
      id: 3,
      name: 'Apotek Sehat Sentosa',
      code: 'ASS003',
      registryId: 1003,
      isMerchantSource: true,
      productsCount: 89,
      syncedCount: 89,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
    {
      id: 12,
      name: 'Apotek 24 Jam Eheuy',
      code: 'A24012',
      registryId: 1005,
      isMerchantSource: false,
      productsCount: 198,
      syncedCount: 150,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
  ],
  3: [
    {
      id: 4,
      name: 'Toko Buku Pintar',
      code: 'TBP004',
      registryId: 1004,
      isMerchantSource: false,
      productsCount: 234,
      syncedCount: 0,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
  ],
  4: [
    {
      id: 6,
      name: 'Supermarket Central',
      code: 'SMC006',
      registryId: 1005,
      isMerchantSource: true,
      productsCount: 1234,
      syncedCount: 1234,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
  ],
  5: [
    {
      id: 8,
      name: 'Pet Shop Sayangku',
      code: 'PSS008',
      registryId: 1006,
      isMerchantSource: true,
      productsCount: 123,
      syncedCount: 100,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
  ],
  6: [
    {
      id: 10,
      name: 'Warung Kopi Nikmat',
      code: 'WKN010',
      registryId: 1007,
      isMerchantSource: true,
      productsCount: 45,
      syncedCount: 45,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
  ],
  7: [
    {
      id: 5,
      name: 'Toko Fashion Modern',
      code: 'TFM005',
      registryId: 1008,
      isMerchantSource: false,
      productsCount: 567,
      syncedCount: 567,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
  ],
  9: [
    {
      id: 9,
      name: 'Toko Olahraga Sehat',
      code: 'TOS009',
      registryId: 1009,
      isMerchantSource: true,
      productsCount: 289,
      syncedCount: 250,
      get pendingCount() {
        return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
      },
    },
  ],
};

/**
 * Get groups list
 */
export const createGroupsResponse = (page: number, itemsPerPage: number): GetGroupsResponse => ({
  groups: mockGroups,
  pagination: {
    total: mockGroups.length,
    totalPages: Math.ceil(mockGroups.length / itemsPerPage),
    currentPage: page,
    hasNextPage: page < Math.ceil(mockGroups.length / itemsPerPage),
  },
});

/**
 * Get group with members
 */
export const getGroupWithMembers = async (groupId: number): Promise<GroupWithMembers | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const groupSummary = mockGroups.find(g => g.id === groupId);
  if (!groupSummary) return null;

  const members = groupMembersData[groupId] || [];

  return {
    ...groupSummary,
    members,
  };
};

/**
 * Get multiple groups with members (for batch operations)
 */
export const getGroupsWithMembers = async (groupIds: number[]): Promise<GroupWithMembers[]> => {
  const results = await Promise.all(groupIds.map(id => getGroupWithMembers(id)));

  return results.filter(Boolean) as GroupWithMembers[];
};

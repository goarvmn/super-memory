// client/src/lib/data/merchant/mockMerchants.ts

import type { GetMerchantsResponse, MerchantRegistryWithStats } from '@guesense-dash/shared';

export const mockMerchants: MerchantRegistryWithStats[] = [
  {
    id: 1,
    name: 'Toko Elektronik Jaya',
    code: 'TKE001',
    registryId: 101,
    registryStatus: 1,
    groupId: null,
    productsCount: 345,
    syncedCount: 320,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 2,
    name: 'Warung Sembako Berkah',
    code: 'WSB002',
    registryId: 102,
    registryStatus: 1,
    groupId: null,
    productsCount: 156,
    syncedCount: 0,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 5,
    name: 'Toko Fashion Modern',
    code: 'TFM005',
    registryId: 105,
    registryStatus: 1,
    groupId: null,
    productsCount: 567,
    syncedCount: 567,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 7,
    name: 'Toko Furniture Indah',
    code: 'TFI007',
    registryId: 107,
    registryStatus: 1,
    groupId: null,
    productsCount: 78,
    syncedCount: 0,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 9,
    name: 'Toko Olahraga Sehat',
    code: 'TOS009',
    registryId: 109,
    registryStatus: 1,
    groupId: null,
    productsCount: 289,
    syncedCount: 250,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 11,
    name: 'Toko Mainan Anak',
    code: 'TMA011',
    registryId: 111,
    registryStatus: 0,
    groupId: null,
    productsCount: 356,
    syncedCount: 300,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 13,
    name: 'Warung Kopi Santai',
    code: 'WKS013',
    registryId: 113,
    registryStatus: 1,
    groupId: null,
    productsCount: 67,
    syncedCount: 45,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 14,
    name: 'Toko Kosmetik Cantik',
    code: 'TKC014',
    registryId: 114,
    registryStatus: 1,
    groupId: null,
    productsCount: 234,
    syncedCount: 200,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 15,
    name: 'Bengkel Motor Jaya',
    code: 'BMJ015',
    registryId: 115,
    registryStatus: 1,
    groupId: null,
    productsCount: 89,
    syncedCount: 0,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 16,
    name: 'Toko Sepatu Trendy',
    code: 'TST016',
    registryId: 116,
    registryStatus: 0,
    groupId: null,
    productsCount: 145,
    syncedCount: 120,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 17,
    name: 'Warung Makan Enak',
    code: 'WME017',
    registryId: 117,
    registryStatus: 1,
    groupId: null,
    productsCount: 45,
    syncedCount: 45,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 18,
    name: 'Toko Elektronik Digital',
    code: 'TED018',
    registryId: 118,
    registryStatus: 1,
    groupId: null,
    productsCount: 389,
    syncedCount: 200,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 19,
    name: 'Mini Market Segar',
    code: 'MMS019',
    registryId: 119,
    registryStatus: 1,
    groupId: null,
    productsCount: 678,
    syncedCount: 0,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 20,
    name: 'Apotek Sehat Baru',
    code: 'ASB020',
    registryId: 120,
    registryStatus: 0,
    groupId: null,
    productsCount: 167,
    syncedCount: 150,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },

  // Assigned merchants (already in groups) - won't show in merchant cards
  {
    id: 3,
    name: 'Apotek Sehat Sentosa',
    code: 'ASS003',
    registryId: 103,
    registryStatus: 1,
    groupId: 2,
    productsCount: 89,
    syncedCount: 89,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 4,
    name: 'Toko Buku Pintar',
    code: 'TBP004',
    registryId: 104,
    registryStatus: 1,
    groupId: 3,
    productsCount: 234,
    syncedCount: 180,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 6,
    name: 'Supermarket Central',
    code: 'SMC006',
    registryId: 106,
    registryStatus: 1,
    groupId: 4,
    productsCount: 1234,
    syncedCount: 1200,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 8,
    name: 'Pet Shop Sayang',
    code: 'PSS008',
    registryId: 108,
    registryStatus: 1,
    groupId: 5,
    productsCount: 123,
    syncedCount: 100,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 10,
    name: 'Warung Kopi Nikmat',
    code: 'WKN010',
    registryId: 110,
    registryStatus: 1,
    groupId: 6,
    productsCount: 45,
    syncedCount: 45,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
  {
    id: 12,
    name: 'Apotek 24 Jam',
    code: 'A24012',
    registryId: 112,
    registryStatus: 0,
    groupId: 2,
    productsCount: 198,
    syncedCount: 198,
    get pendingCount() {
      return (this.productsCount ?? 0) - (this.syncedCount ?? 0);
    },
  },
];

export const createMerchantsResponse = (page: number, itemsPerPage: number) =>
  ({
    merchants: mockMerchants,
    pagination: {
      total: mockMerchants.length,
      totalPages: Math.ceil(mockMerchants.length / itemsPerPage),
      currentPage: page,
      hasNextPage: page < Math.ceil(mockMerchants.length / itemsPerPage),
    },
  }) as GetMerchantsResponse;

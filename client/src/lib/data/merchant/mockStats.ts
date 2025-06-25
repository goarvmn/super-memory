// client/src/lib/data/merchant/mockStats.ts

import { mockGroups } from './mockGroups';
import { mockMerchants } from './mockMerchants';

export const calculateStats = () => {
  return {
    totalMerchants: mockMerchants.length,
    totalGroups: mockGroups.length,
  };
};

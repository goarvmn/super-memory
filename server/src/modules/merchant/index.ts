// server/src/modules/merchant/index.ts

// Export types (interface contracts)
export type { IGroupRepository, IGroupService, IMerchantRepository, IMerchantService } from './interfaces';

// Export services
export { GroupService } from './services/GroupService';
export { MerchantService } from './services/MerchantService';

// Export repositories
export { GroupRepository } from './repositories/GroupRepository';
export { MerchantRepository } from './repositories/MerchantRepository';

// Export controllers
export { GroupController } from './controllers/GroupController';
export { MerchantController } from './controllers/MerchantController';

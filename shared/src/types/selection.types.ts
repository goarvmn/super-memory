// shared/src/types/selection.types.ts

import { SyncInfo } from './merchant.types';

/**
 * Selection Type Enum
 */
export type SelectionType =
  | 'merchant' // Individual merchant selection
  | 'group-source' // Group selection using source merchant
  | 'group-member'; // Specific group member selection

/**
 * Action Type Enum
 */
export type ActionType =
  | 'view-products'
  | 'sync-products'
  | 'sync-group' // Sync all group members (bulk sync)
  | 'apply-to-all-members' // Apply source mappings to all members
  | 'apply-source-mapping' // Apply source mapping to specific member
  | 'view-history'; // View audit history

/**
 * Selected Merchant Context
 */
export interface SelectedMerchant {
  // Base merchant info
  id: string;
  name: string;
  merchant_code: string;
  status: 'active' | 'inactive';

  // Selection context
  type: SelectionType;
  sync_info: SyncInfo;

  group_id?: number;
  group_name?: string;
  is_group_source?: boolean;
}

/**
 * Available Actions
 */
export interface AvailableActions {
  can_view_products: boolean;
  can_sync_products: boolean;
  can_sync_group: boolean;
  can_apply_to_all_members: boolean;
  can_apply_source_mapping: boolean;
  can_start_mapping: boolean;
  can_view_history: boolean;

  // Action labels for UI
  primary_action: ActionType;
  primary_action_label: string;
  secondary_actions: Array<{
    action: ActionType;
    label: string;
    variant: 'default' | 'secondary' | 'destructive';
    disabled?: boolean;
  }>;
}

/**
 * Selection State
 */
export interface SelectionState {
  selected_merchant: SelectedMerchant | null;
  available_actions: AvailableActions | null;

  is_loading: boolean;
}

/**
 * Selection Event
 */
export interface SelectionEvent {
  type: 'select_merchant' | 'select_group' | 'select_group_member' | 'clear_selection';
  payload: {
    merchant_id?: string;
    group_id?: number;
    selection_type?: SelectionType;
    metadata?: Record<string, any>;
  };
  timestamp: string;
}

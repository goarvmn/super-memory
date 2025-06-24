// client/src/features/merchant/components/SelectionPanel.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupWithMembers, MerchantRegistryWithStats } from '@guesense-dash/shared';
import { Eye, Loader2, Package, Users } from 'lucide-react';
import React from 'react';

interface SelectionPanelProps {
  selectedMerchant: MerchantRegistryWithStats | null;
  selectedGroup: GroupWithMembers | null;
  loadingStates: { [key: string]: boolean };
  getTemplateSourceName: (sourceId: number | null) => string;
  onActionClick: (actionKey: string, callback: () => void) => void;
  onClearMerchantSelection: () => void;
  onClearGroupSelection: () => void;
}

export const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selectedMerchant,
  selectedGroup,
  loadingStates,
  getTemplateSourceName,
  onActionClick,
  onClearMerchantSelection,
  onClearGroupSelection,
}) => {
  // No selection state
  if (!selectedMerchant && !selectedGroup) {
    return (
      <Card className="mt-8 border-dashed border-2 border-gray-300 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Selection Made</h3>
          <p className="text-gray-500">Choose a merchant or merchant group from above to view available actions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900">
          {selectedMerchant && `Selected Merchant: ${selectedMerchant.name}`}
          {selectedGroup && `Selected Group: ${selectedGroup.name}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Merchant Selection */}
        {selectedMerchant && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Merchant Code:</span>
                  <div className="font-medium">{selectedMerchant.code}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Products:</span>
                  <div className="font-medium">{selectedMerchant.productsCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Synced:</span>
                  <div className="font-medium text-green-600">{selectedMerchant.syncedCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Pending:</span>
                  <div className="font-medium text-orange-600">{selectedMerchant.pendingCount}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {selectedMerchant.pendingCount && selectedMerchant.pendingCount > 0 ? (
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={loadingStates['sync-products']}
                  onClick={() => onActionClick('sync-products', () => console.log('Sync products'))}
                >
                  {loadingStates['sync-products'] ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Sync Products (+{selectedMerchant.pendingCount} new)
                    </>
                  )}
                </Button>
              ) : null}
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                disabled={loadingStates['view-products']}
                onClick={() => onActionClick('view-products', () => console.log('View products'))}
              >
                {loadingStates['view-products'] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    View Products
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={onClearMerchantSelection}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Group Selection */}
        {selectedGroup && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Members:</span>
                  <div className="font-medium">{selectedGroup.membersCount} merchants</div>
                </div>
                <div>
                  <span className="text-gray-600">Template Source:</span>
                  <div className="font-medium">{getTemplateSourceName(selectedGroup.merchantSourceId)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="font-medium">{selectedGroup.status === 1 ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                disabled={loadingStates['sync-group-products']}
                onClick={() => onActionClick('sync-group-products', () => console.log('Sync group products'))}
              >
                {loadingStates['sync-group-products'] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Sync Products
                  </>
                )}
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                disabled={loadingStates['view-group-products']}
                onClick={() => onActionClick('view-group-products', () => console.log('View group products'))}
              >
                {loadingStates['view-group-products'] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    View Products
                  </>
                )}
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                disabled={loadingStates['apply-to-members']}
                onClick={() => onActionClick('apply-to-members', () => console.log('Apply to members'))}
              >
                {loadingStates['apply-to-members'] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Apply to All Members
                  </>
                )}
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                disabled={loadingStates['sync-all-groups']}
                onClick={() => onActionClick('sync-all-groups', () => console.log('Sync all groups'))}
              >
                {loadingStates['sync-all-groups'] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Sync All Groups
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={onClearGroupSelection}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

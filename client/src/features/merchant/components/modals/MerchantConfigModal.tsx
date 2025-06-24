// client/src/features/merchant/components/modals/MerchantConfigModal.tsx

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createGroupsResponse } from '@/lib/data/merchant';
import { useModalStore, useUiStore } from '@/lib/stores/merchant';
import { Loader2, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useMerchants } from '../../hooks/useMerchants';

const MerchantConfigModal: React.FC = () => {
  const { configMerchant, closeMerchantConfig, updateMerchantConfig, deleteMerchantFromRegistry } = useMerchants();

  const { showMerchantConfigModal, setShowMerchantConfigModal } = useModalStore();
  const { loadingStates } = useUiStore();

  // Local form state
  const [merchantConfigForm, setMerchantConfigForm] = useState({
    status: '',
    groupId: '',
  });

  // Mock groups data for dropdown
  const mockGroupsResponse = createGroupsResponse(1, 100); // Get all groups

  // Initialize form when configMerchant changes
  useEffect(() => {
    if (configMerchant) {
      setMerchantConfigForm({
        status: configMerchant.registryStatus === 1 ? 'active' : 'inactive',
        groupId: configMerchant.groupId ? configMerchant.groupId.toString() : '',
      });
    }
  }, [configMerchant]);

  const handleConfigSave = async () => {
    if (!configMerchant) return;

    try {
      const result = await updateMerchantConfig(configMerchant.registryId, {
        registryStatus: merchantConfigForm.status === 'active' ? 1 : 0,
        groupId:
          merchantConfigForm.groupId && merchantConfigForm.groupId !== 'none'
            ? parseInt(merchantConfigForm.groupId)
            : null,
      });

      if (result.success) {
        setShowMerchantConfigModal(false);
        closeMerchantConfig();
        setMerchantConfigForm({ status: '', groupId: '' });
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      // In real app, show error toast
    }
  };

  const handleConfigDelete = async () => {
    if (!configMerchant) return;

    if (window.confirm(`Delete ${configMerchant.name} from registry? This action cannot be undone.`)) {
      try {
        const result = await deleteMerchantFromRegistry(configMerchant.registryId);

        if (result.success) {
          setShowMerchantConfigModal(false);
          closeMerchantConfig();
          setMerchantConfigForm({ status: '', groupId: '' });
        }
      } catch (error) {
        console.error('Failed to delete merchant:', error);
        // In real app, show error toast
      }
    }
  };

  const handleConfigCancel = () => {
    setShowMerchantConfigModal(false);
    closeMerchantConfig();
    setMerchantConfigForm({ status: '', groupId: '' });
  };

  if (!configMerchant) return null;

  return (
    <Dialog open={showMerchantConfigModal} onOpenChange={setShowMerchantConfigModal}>
      <DialogContent className="shadow-xl max-w-md border-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Merchant Configuration</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Configure settings for {configMerchant.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="merchant-status" className="text-sm font-medium text-gray-700">
              Merchant Status
            </Label>
            <Select
              value={merchantConfigForm.status}
              onValueChange={value => setMerchantConfigForm(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="merchant-status" className="w-full h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assign to Group Field */}
          <div className="space-y-2">
            <Label htmlFor="merchant-group" className="text-sm font-medium text-gray-700">
              Assign to Group
            </Label>
            <Select
              value={merchantConfigForm.groupId}
              onValueChange={value => setMerchantConfigForm(prev => ({ ...prev, groupId: value }))}
            >
              <SelectTrigger id="merchant-group" className="w-full h-11">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Group</SelectItem>
                {mockGroupsResponse.groups
                  .filter(g => g.status === 1)
                  .map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            variant="destructive"
            onClick={handleConfigDelete}
            disabled={loadingStates['delete-merchant']}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loadingStates['delete-merchant'] ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleConfigCancel}
              className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 px-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfigSave}
              disabled={loadingStates['save-merchant-config']}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loadingStates['save-merchant-config'] ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MerchantConfigModal;

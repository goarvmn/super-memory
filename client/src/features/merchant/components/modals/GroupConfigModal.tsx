// client/src/features/merchant/components/modals/GroupConfigModal.tsx

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModalStore, useUiStore } from '@/lib/stores/merchant';
import { Loader2, Trash2, UserMinus, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useGroups } from '../../hooks/useGroups';

const GroupConfigModal: React.FC = () => {
  const { configGroup, closeGroupConfig, updateGroupConfig, deleteGroup } = useGroups();

  const { showGroupConfigModal, setShowGroupConfigModal } = useModalStore();
  const { loadingStates, setLoadingState } = useUiStore();

  // Local form state
  const [groupConfigForm, setGroupConfigForm] = useState({
    name: '',
    status: '',
    sourceId: '',
  });

  // Initialize form when configGroup changes
  useEffect(() => {
    if (configGroup) {
      setGroupConfigForm({
        name: configGroup.name,
        status: configGroup.status === 1 ? 'active' : 'inactive',
        sourceId: configGroup.merchantSourceId ? configGroup.merchantSourceId.toString() : '',
      });
    }
  }, [configGroup]);

  const handleGroupConfigSave = async () => {
    if (!configGroup) return;
    try {
      const result = await updateGroupConfig(configGroup.id, {
        name: groupConfigForm.name,
        status: groupConfigForm.status === 'active' ? 1 : 0,
        merchantSourceId:
          groupConfigForm.sourceId && groupConfigForm.sourceId !== 'none' ? Number(groupConfigForm.sourceId) : null,
      });
      if (result.success) {
        setShowGroupConfigModal(false);
        closeGroupConfig();
        setGroupConfigForm({ name: '', status: '', sourceId: '' });
      }
    } catch (error) {
      console.error('Failed to save group config:', error);
      // In real app, show error toast
    }
  };

  const handleGroupConfigDelete = async () => {
    if (!configGroup) return;
    if (window.confirm(`Delete group "${configGroup.name}"? This will remove the group but not the merchants.`)) {
      try {
        const result = await deleteGroup(configGroup.id);
        if (result.success) {
          setShowGroupConfigModal(false);
          closeGroupConfig();
          setGroupConfigForm({ name: '', status: '', sourceId: '' });
        }
      } catch (error) {
        console.error('Failed to delete group:', error);
        // In real app, show error toast
      }
    }
  };

  const handleGroupConfigCancel = () => {
    setShowGroupConfigModal(false);
    closeGroupConfig();
    setGroupConfigForm({ name: '', status: '', sourceId: '' });
  };

  const handleRemoveMemberFromGroup = (memberId: number) => {
    if (!configGroup) return;

    const member = configGroup.members?.find(m => m.id === memberId);

    if (member?.isMerchantSource) {
      alert('Cannot remove source merchant from group');
      return;
    }

    if (window.confirm(`Remove ${member?.name} from ${configGroup.name}?`)) {
      setLoadingState(`remove-member-${memberId}`, true);

      setTimeout(() => {
        // In real app, this would be an API call
        console.log(`${member?.name} removed from group successfully`);

        // Update local state - in real app this would trigger a refetch
        if (configGroup?.members && configGroup.members.length) {
          configGroup.members = configGroup.members.filter((m: any) => m.id !== memberId);
          configGroup.membersCount = configGroup.members.length;
        }

        setLoadingState(`remove-member-${memberId}`, false);
      }, 1000);
    }
  };

  if (!configGroup) return null;

  return (
    <Dialog open={showGroupConfigModal} onOpenChange={setShowGroupConfigModal}>
      <DialogContent className="shadow-xl max-w-lg border-0" onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Group Configuration</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Configure settings for {configGroup.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Group Name Field */}
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-sm font-medium text-gray-700">
              Group Name
            </Label>
            <Input
              id="group-name"
              value={groupConfigForm.name}
              onChange={e => setGroupConfigForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
              className="w-full h-11"
            />
          </div>

          {/* Group Status Field */}
          <div className="space-y-2">
            <Label htmlFor="group-status" className="text-sm font-medium text-gray-700">
              Group Status
            </Label>
            <Select
              value={groupConfigForm.status}
              onValueChange={value => setGroupConfigForm(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="group-status" className="w-full h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Merchant Field */}
          <div className="space-y-2">
            <Label htmlFor="group-source" className="text-sm font-medium text-gray-700">
              Source Merchant
            </Label>
            <Select
              value={groupConfigForm.sourceId}
              onValueChange={value => setGroupConfigForm(prev => ({ ...prev, sourceId: value }))}
            >
              <SelectTrigger id="group-source" className="w-full h-11">
                <SelectValue placeholder="Select source merchant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Source</SelectItem>
                {configGroup.members?.map((member: any) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group Members Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Group Members ({configGroup.members?.length || 0})
            </Label>
            <div className="border rounded-lg">
              <ScrollArea className="h-48 p-3">
                {configGroup.members && configGroup.members.length > 0 ? (
                  <div className="space-y-2">
                    {configGroup.members.map(member => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          member.isMerchantSource ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{member.isMerchantSource ? '⭐' : '📍'}</span>
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {member.name}
                                {member.isMerchantSource && (
                                  <span className="ml-2 text-xs text-amber-600">(Source)</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {member.code} • {member.productsCount} products
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMemberFromGroup(member.id)}
                          disabled={member.isMerchantSource || loadingStates[`remove-member-${member.id}`]}
                          className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        >
                          {loadingStates[`remove-member-${member.id}`] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserMinus className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No members in this group</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            variant="destructive"
            onClick={handleGroupConfigDelete}
            disabled={loadingStates['delete-group']}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loadingStates['delete-group'] ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </>
            )}
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleGroupConfigCancel}
              className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 px-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGroupConfigSave}
              disabled={loadingStates['save-group-config']}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loadingStates['save-group-config'] ? (
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

export default GroupConfigModal;

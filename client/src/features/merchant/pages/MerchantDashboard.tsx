// client/src/features/merchant/pages/MerchantDashboard.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModalStore, useUiStore } from '@/lib/stores/merchant';
import { Package, Plus, Search, Users } from 'lucide-react';
import React, { useState } from 'react';
import { GroupCard, GroupConfigModal, MerchantCard, MerchantConfigModal, SelectionPanel } from '../components';
import { useGroups } from '../hooks/useGroups';
import { useMerchants } from '../hooks/useMerchants';

const MerchantDashboard: React.FC = () => {
  // Hook integration
  const { registeredMerchants, selectedMerchant, selectMerchant, clearSelectionMerchant, openMerchantConfig } =
    useMerchants();
  const { groups, selectedGroup, selectGroup, clearSelectionGroup, openGroupConfig } = useGroups();

  // Zustand stores
  const {
    showAddMerchantModal,
    setShowAddMerchantModal,
    showCreateGroupModal,
    setShowCreateGroupModal,
    setShowMerchantConfigModal,
    setShowGroupConfigModal,
  } = useModalStore();

  // Loading states for better UX
  const { loadingStates, setLoadingState } = useUiStore();
  const { merchantsPage, setMerchantsPage, groupsPage, setGroupsPage } = useUiStore();

  const [activeTab, setActiveTab] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const itemsPerPage = 6;

  // Stats from aggregated data
  const ungroupedMerchants = registeredMerchants.filter(merchant => merchant.groupId === null);
  const stats = {
    totalMerchants: ungroupedMerchants.length,
    totalGroups: groups.length,
  };

  const getTemplateSourceName = (sourceId: number | null) => {
    if (!sourceId) return 'Not set';
    const sourceMerchant = registeredMerchants.find(m => m.id === sourceId);
    return sourceMerchant?.name || 'Unknown';
  };

  // Enhanced selection logic with loading states
  const handleMerchantSelect = (merchant: any) => {
    setLoadingState(`merchant-${merchant.id}`, true);

    setTimeout(() => {
      selectMerchant(merchant);
      selectGroup(null);
      setLoadingState(`merchant-${merchant.id}`, false);
    }, 300);
  };

  const handleGroupSelect = async (group: any) => {
    setLoadingState(`group-${group.id}`, true);

    try {
      await selectGroup(group);
      selectMerchant(null);
    } catch (error) {
      console.error('Failed to select group:', error);
    } finally {
      setLoadingState(`group-${group.id}`, false);
    }
  };

  // Action handlers with loading states
  const handleActionClick = (actionKey: string, callback: () => void) => {
    setLoadingState(actionKey, true);

    setTimeout(() => {
      callback();
      setLoadingState(actionKey, false);
    }, 1000);
  };

  // Config modal handlers
  const handleConfigClick = (merchant: any, e: React.MouseEvent) => {
    e.stopPropagation();
    openMerchantConfig(merchant);
    setShowMerchantConfigModal(true);
  };

  // Group config modal handlers
  const handleGroupConfigClick = async (group: any, e: React.MouseEvent) => {
    e.stopPropagation();

    setLoadingState(`config-${group.id}`, true);

    try {
      await openGroupConfig(group);
      setShowGroupConfigModal(true);
    } catch (error) {
      console.error('Failed to open group config:', error);
    } finally {
      setLoadingState(`config-${group.id}`, false);
    }
  };

  // Pagination helpers
  const paginateMerchants = () => {
    const filtered = registeredMerchants
      .filter(merchant => merchant.groupId === null)
      .filter(
        merchant =>
          merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.code.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const startIndex = (merchantsPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const paginateGroups = () => {
    const filtered = groups.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const startIndex = (groupsPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalMerchantsPages = Math.ceil(ungroupedMerchants.length / itemsPerPage);
  const totalGroupsPages = Math.ceil(groups.length / itemsPerPage);

  const filteredMerchants = paginateMerchants();
  const filteredGroups = paginateGroups();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchant Management</h1>
        <p className="text-gray-600">Select merchants and manage product mapping workflow</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalMerchants}</div>
            <div className="text-sm text-blue-700 font-medium">Total Merchants</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalGroups}</div>
            <div className="text-sm text-purple-700 font-medium">Total Groups</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search merchants or groups..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 min-w-[300px] shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddMerchantModal(true)}
            className="shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Merchant
          </Button>
          <Button
            onClick={() => setShowCreateGroupModal(true)}
            className="shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Users className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 shadow-sm">
          <TabsTrigger value="individual">Merchant Management</TabsTrigger>
          <TabsTrigger value="groups">Group Management</TabsTrigger>
        </TabsList>

        {/* Merchants Management Tab */}
        <TabsContent value="individual" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.map(merchant => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                isSelected={selectedMerchant?.id === merchant.id}
                isLoading={loadingStates[`merchant-${merchant.id}`] || false}
                onSelect={handleMerchantSelect}
                onConfig={handleConfigClick}
              />
            ))}
          </div>

          {filteredMerchants.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No merchants found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or add new merchants to get started</p>
              <Button
                onClick={() => setShowAddMerchantModal(true)}
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Merchant
              </Button>
            </div>
          )}

          {/* Merchants Pagination */}
          {filteredMerchants.length > 0 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                {(() => {
                  const startIndex = (merchantsPage - 1) * itemsPerPage + 1;
                  const endIndex = Math.min(merchantsPage * itemsPerPage, ungroupedMerchants.length);

                  return startIndex === endIndex
                    ? `Showing ${startIndex} of ${ungroupedMerchants.length} merchants`
                    : `Showing ${startIndex} to ${endIndex} of ${ungroupedMerchants.length} merchants`;
                })()}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMerchantsPage(Math.max(1, merchantsPage - 1))}
                  disabled={merchantsPage === 1}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm font-medium">
                  Page {merchantsPage} of {totalMerchantsPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMerchantsPage(Math.min(totalMerchantsPages, merchantsPage + 1))}
                  disabled={merchantsPage === totalMerchantsPages}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Group Management Tab */}
        <TabsContent value="groups" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                isSelected={selectedGroup?.id === group.id}
                isLoading={loadingStates[`group-${group.id}`] || false}
                getTemplateSourceName={getTemplateSourceName}
                onSelect={handleGroupSelect}
                onConfig={handleGroupConfigClick}
              />
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or create your first group</p>
              <Button
                onClick={() => setShowCreateGroupModal(true)}
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                Create First Group
              </Button>
            </div>
          )}

          {/* Groups Pagination */}
          {filteredGroups.length > 0 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                Showing {(groupsPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(groupsPage * itemsPerPage, filteredGroups.length)} of {filteredGroups.length} groups
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGroupsPage(Math.max(1, groupsPage - 1))}
                  disabled={groupsPage === 1}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm font-medium">
                  Page {groupsPage} of {totalGroupsPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGroupsPage(Math.min(totalGroupsPages, groupsPage + 1))}
                  disabled={groupsPage === totalGroupsPages}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selection Panel - Extracted Component */}
      <SelectionPanel
        selectedMerchant={selectedMerchant}
        selectedGroup={selectedGroup}
        loadingStates={loadingStates}
        getTemplateSourceName={getTemplateSourceName}
        onActionClick={handleActionClick}
        onClearMerchantSelection={clearSelectionMerchant}
        onClearGroupSelection={clearSelectionGroup}
      />

      {/* Add Merchant Modal - TODO */}
      <Dialog open={showAddMerchantModal} onOpenChange={setShowAddMerchantModal}>
        <DialogContent className="shadow-xl">
          <DialogHeader>
            <DialogTitle>Add Merchant</DialogTitle>
            <DialogDescription>TODO: Implementation for add merchant modal</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This will be implemented in the next phase with proper form handling, API integration, and data
              validation.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddMerchantModal(false)}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowAddMerchantModal(false)}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              TODO: Implement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal - TODO */}
      <Dialog open={showCreateGroupModal} onOpenChange={setShowCreateGroupModal}>
        <DialogContent className="shadow-xl">
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
            <DialogDescription>TODO: Implementation for create group wizard modal</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This will be implemented as a multi-step wizard with merchant selection, group naming, and template source
              configuration.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateGroupModal(false)}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowCreateGroupModal(false)}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              TODO: Implement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Config Modal */}
      <GroupConfigModal />

      {/* Merchant Config Modal */}
      <MerchantConfigModal />
    </div>
  );
};

export default MerchantDashboard;

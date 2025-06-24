// client/src/lib/stores/merchant/group.store.ts

import type { GroupSummary, GroupWithMembers, UpdateGroupRequest } from '@guesense-dash/shared';
import { create } from 'zustand';

interface GroupState {
  // Data State
  groups: GroupSummary[];

  // Data Management Actions
  setGroups: (groups: GroupSummary[]) => void;
  updateGroup: (groupId: number, data: Omit<UpdateGroupRequest, 'id'>) => void;
  removeGroup: (groupId: number) => void;

  // UI Selection State
  selectedGroup: GroupWithMembers | null;
  setSelectedGroup: (group: GroupWithMembers | null) => void;
  configGroup: GroupWithMembers | null;
  setConfigGroup: (group: GroupWithMembers | null) => void;
}

const initialState = {
  groups: [],
};

export const useGroupStore = create<GroupState>(set => ({
  ...initialState,

  setGroups: groups => set({ groups }),
  updateGroup: (groupId, data) =>
    set(state => ({
      groups: state.groups.map(group => {
        if (group.id === groupId) {
          const updated = {
            ...group,
            ...data,
          };
          return updated;
        }
        return group;
      }),
    })),
  removeGroup: groupId => set(state => ({ groups: state.groups.filter(group => group.id !== groupId) })),

  selectedGroup: null,
  setSelectedGroup: group => set({ selectedGroup: group }),
  configGroup: null,
  setConfigGroup: group => set({ configGroup: group }),
}));

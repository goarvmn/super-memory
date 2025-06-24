// client/src/features/merchant/components/cards/GroupCard.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupSummary } from '@guesense-dash/shared';
import { Settings, Users } from 'lucide-react';
import React from 'react';

interface GroupCardProps {
  group: GroupSummary;
  isSelected: boolean;
  isLoading: boolean;
  getTemplateSourceName: (sourceId: number | null) => string;
  onSelect: (group: GroupSummary) => void;
  onConfig: (group: GroupSummary, e: React.MouseEvent) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isSelected,
  isLoading,
  getTemplateSourceName,
  onSelect,
  onConfig,
}) => {
  const getGroupStatusBadge = () => {
    if (group.status === 1) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
            Inactive
          </Badge>
        </div>
      );
    }
  };

  return (
    <Card
      className={`shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border-2 transform hover:scale-[1.02] ${
        isSelected ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' : 'hover:border-blue-300'
      } ${isLoading ? 'opacity-75' : ''}`}
      onClick={() => onSelect(group)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">{group.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{group.membersCount} members</p>
          </div>
          <div className="ml-2 flex-shrink-0">{getGroupStatusBadge()}</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Template Source:</span>
            <span className="font-medium text-xs truncate ml-2">{getTemplateSourceName(group.merchantSourceId)}</span>
          </div>

          <div className="flex gap-2 pt-3">
            <Button
              size="sm"
              className="flex-1 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={e => {
                e.stopPropagation();
                onSelect(group);
              }}
            >
              <Users className="w-4 h-4 mr-1" />
              Open Group
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={e => onConfig(group, e)}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

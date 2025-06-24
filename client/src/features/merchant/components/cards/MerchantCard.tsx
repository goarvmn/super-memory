// client/src/features/merchant/components/cards/MerchantCard.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MerchantRegistryWithStats } from '@guesense-dash/shared';
import { CheckCircle2, Clock, Package2, Settings } from 'lucide-react';
import React from 'react';

interface MerchantCardProps {
  merchant: MerchantRegistryWithStats;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (merchant: MerchantRegistryWithStats) => void;
  onConfig: (merchant: MerchantRegistryWithStats, e: React.MouseEvent) => void;
}

export const MerchantCard: React.FC<MerchantCardProps> = ({ merchant, isSelected, isLoading, onSelect, onConfig }) => {
  const getStatusBadge = () => {
    if (merchant.registryStatus === 1) {
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
      onClick={() => onSelect(merchant)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">{merchant.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">ID: {merchant.code}</p>
          </div>
          <div className="ml-2 flex-shrink-0">{getStatusBadge()}</div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Package2 className="w-4 h-4 mr-2 text-blue-600" />
              <span>Total Products:</span>
            </div>
            <span className="font-medium">{merchant.productsCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
              <span>Synced:</span>
            </div>
            <span className="font-medium text-green-600">{merchant.syncedCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-orange-600" />
              <span>Pending:</span>
            </div>
            <span className="font-medium text-orange-600">{merchant.pendingCount}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={e => onConfig(merchant, e)}
            className="px-3 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
            <span className="ml-2">Config</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

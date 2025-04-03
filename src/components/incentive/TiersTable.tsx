
import React from 'react';
import { Tier } from '@/types/incentiveTypes';
import TierRow from './TierRow';

interface TiersTableProps {
  tiers: Tier[];
  currencySymbol: string;
  updateTier: (index: number, field: keyof Tier, value: string | number) => void;
  removeTier: (index: number) => void;
}

const TiersTable: React.FC<TiersTableProps> = ({
  tiers,
  currencySymbol,
  updateTier,
  removeTier
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 border border-blue-200">
        <p className="font-medium">Tier Calculation Logic:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>New tier's "From" value starts at previous tier's "To" value</li>
          <li>New tier's "To" value defaults to 100 more than its "From" value</li>
          <li>All values can be manually edited to meet your requirements</li>
        </ul>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-app-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-app-gray-200">
            <thead>
              <tr className="bg-app-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 uppercase tracking-wider">From ({currencySymbol})</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 uppercase tracking-wider">To ({currencySymbol})</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 uppercase tracking-wider">Commission Rate (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-app-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-app-gray-200">
              {tiers.map((tier, index) => (
                <TierRow 
                  key={index}
                  tier={tier}
                  index={index}
                  currencySymbol={currencySymbol}
                  updateTier={updateTier}
                  removeTier={removeTier}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TiersTable;

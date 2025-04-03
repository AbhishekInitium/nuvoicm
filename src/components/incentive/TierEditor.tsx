
import React from 'react';
import { Trash2, Percent } from 'lucide-react';
import { Tier } from '@/types/incentiveTypes';

interface TierEditorProps {
  tier: Tier;
  index: number;
  updateTier: (index: number, field: keyof Tier, value: number) => void;
  removeTier: (index: number) => void;
  currency: string;
  isReadOnly?: boolean;
}

const TierEditor: React.FC<TierEditorProps> = ({
  tier,
  index,
  updateTier,
  removeTier,
  currency,
  isReadOnly = false
}) => {
  return (
    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-app-gray-50 bg-opacity-30'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="relative">
          <input 
            type="text" 
            className="form-input pl-8 py-2"
            value={tier.from === 0 && index > 0 ? '' : tier.from}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              updateTier(index, 'from', value ? parseInt(value) : 0);
            }}
            disabled={isReadOnly || index > 0} // First tier's "from" can be edited, others are derived
            placeholder="Enter amount"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-app-gray-400">{currency}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="relative">
          <input 
            type="text" 
            className="form-input pl-8 py-2"
            value={tier.to === 0 ? '' : tier.to}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              updateTier(index, 'to', value ? parseInt(value) : 0);
            }}
            disabled={isReadOnly}
            placeholder="Enter amount"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-app-gray-400">{currency}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="relative">
          <input 
            type="text" 
            className="form-input pl-8 py-2"
            value={tier.rate === 0 ? '' : tier.rate}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              updateTier(index, 'rate', value ? parseInt(value) : 0);
            }}
            disabled={isReadOnly}
            placeholder="Enter rate"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Percent size={16} className="text-app-gray-400" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        {index === 0 ? (
          <span className="text-app-gray-400">-</span>
        ) : (
          !isReadOnly && (
            <button 
              className="text-app-red hover:text-opacity-80 transition-colors duration-200"
              onClick={() => removeTier(index)}
            >
              <Trash2 size={18} />
            </button>
          )
        )}
      </td>
    </tr>
  );
};

export default TierEditor;

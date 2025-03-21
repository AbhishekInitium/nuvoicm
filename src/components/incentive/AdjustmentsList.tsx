
import React from 'react';
import { PlusCircle, Plus } from 'lucide-react';
import ActionButton from '../ui-custom/ActionButton';
import { Adjustment } from '@/types/incentiveTypes';
import AdjustmentForm from './AdjustmentForm';

interface AdjustmentsListProps {
  adjustments: Adjustment[];
  dbFields: string[];
  onAddAdjustment: () => void;
  onUpdateAdjustment: (index: number, field: keyof Adjustment, value: string | number) => void;
  onRemoveAdjustment: (index: number) => void;
}

const AdjustmentsList: React.FC<AdjustmentsListProps> = ({
  adjustments,
  dbFields,
  onAddAdjustment,
  onUpdateAdjustment,
  onRemoveAdjustment
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-app-gray-700">Adjustment Factors</h3>
        <ActionButton 
          variant="outline"
          size="sm"
          onClick={onAddAdjustment}
        >
          <PlusCircle size={16} className="mr-1" /> Add Adjustment
        </ActionButton>
      </div>
      
      {adjustments.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-app-gray-500">No adjustment factors defined yet</p>
          <button
            className="mt-4 text-app-blue hover:text-app-blue-dark font-medium flex items-center justify-center mx-auto"
            onClick={onAddAdjustment}
          >
            <Plus size={18} className="mr-1" /> Add your first adjustment factor
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {adjustments.map((adjustment, index) => (
            <AdjustmentForm
              key={index}
              adjustment={adjustment}
              index={index}
              dbFields={dbFields}
              onUpdate={onUpdateAdjustment}
              onRemove={onRemoveAdjustment}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default AdjustmentsList;


import React from 'react';

interface QualificationInputProps {
  primaryMetric: string;
  minQualification: number;
  currencySymbol: string;
  onMinQualificationChange: (value: number) => void;
}

const QualificationInput: React.FC<QualificationInputProps> = ({
  primaryMetric,
  minQualification,
  currencySymbol,
  onMinQualificationChange
}) => {
  const getQualificationLabel = () => {
    return primaryMetric === 'revenue' 
      ? `Minimum Qualification (${currencySymbol})` 
      : 'Minimum Qualification (Units)';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-app-gray-700 mb-2">{getQualificationLabel()}</label>
      <div className="relative">
        <input 
          type="text" 
          className="form-input pl-8"
          value={minQualification || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            onMinQualificationChange(value ? parseInt(value) : 0);
          }}
          placeholder="Enter minimum qualification"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {primaryMetric === 'revenue' ? (
            <span className="text-app-gray-400">{currencySymbol}</span>
          ) : (
            <span className="text-app-gray-400 text-sm">#</span>
          )}
        </div>
      </div>
      <p className="text-sm text-app-gray-500 mt-2">Minimum performance required to qualify for commission</p>
    </div>
  );
};

export default QualificationInput;

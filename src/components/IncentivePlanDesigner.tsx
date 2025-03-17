
import React, { useState } from 'react';
import { PlayCircle, Save } from 'lucide-react';
import SectionPanel from './ui-custom/SectionPanel';
import ActionButton from './ui-custom/ActionButton';
import { useToast } from "@/hooks/use-toast";

// Import constants and types
import { DEFAULT_PLAN } from '@/constants/incentiveConstants';
import { IncentivePlan } from '@/types/incentiveTypes';

// Import components
import ExistingSchemeSelector from './incentive/ExistingSchemeSelector';
import BasicInformation from './incentive/BasicInformation';
import ParticipantsSection from './incentive/ParticipantsSection';
import CommissionStructure from './incentive/CommissionStructure';
import MeasurementRules from './incentive/MeasurementRules';
import CreditRules from './incentive/CreditRules';
import CustomRules from './incentive/CustomRules';

const IncentivePlanDesigner: React.FC = () => {
  const { toast } = useToast();
  
  const [showExistingSchemes, setShowExistingSchemes] = useState(false);
  const [plan, setPlan] = useState<IncentivePlan>(DEFAULT_PLAN);

  const updatePlan = (section: string, value: any) => {
    setPlan({
      ...plan,
      [section]: value
    });
  };

  const copyExistingScheme = (schemeId: number) => {
    // In a real app, this would fetch the scheme from the backend
    const selectedScheme = {
      id: schemeId,
      name: `Copy of ${plan.name}`,
      description: plan.description
    };
    
    // In a real implementation, we would get the full scheme data
    // For now, just update the name and description
    updatePlan('name', `Copy of ${selectedScheme.name}`);
    updatePlan('description', selectedScheme.description);
  };

  const savePlan = () => {
    console.log('Saving plan:', plan);
    toast({
      title: "Success",
      description: "Plan saved successfully!",
      variant: "default"
    });
  };

  const simulatePlan = () => {
    console.log('Simulating plan:', plan);
    toast({
      title: "Redirecting",
      description: "Opening simulation module...",
      variant: "default"
    });
  };

  return (
    <div className="py-12 sm:py-16 px-4 md:px-8 min-h-screen">
      <header className="mb-12 text-center">
        <div className="inline-block mb-2 chip-label">Design</div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-app-gray-900 tracking-tight mb-3">
          Incentive Plan Designer
        </h1>
        <p className="text-app-gray-500 max-w-2xl mx-auto">
          Create and customize your sales incentive structure with precision and clarity
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-6">
          <ExistingSchemeSelector 
            open={showExistingSchemes}
            setOpen={setShowExistingSchemes}
            onSchemeCopy={copyExistingScheme}
          />
        </div>

        <SectionPanel title="Basic Information" defaultExpanded={true}>
          <BasicInformation 
            plan={plan} 
            updatePlan={updatePlan} 
          />
        </SectionPanel>
        
        <SectionPanel 
          title="Participants" 
          badge={
            <div className="chip chip-blue">{plan.participants.length}</div>
          }
        >
          <ParticipantsSection 
            participants={plan.participants} 
            updatePlan={updatePlan} 
          />
        </SectionPanel>
        
        <SectionPanel title="Commission Structure">
          <CommissionStructure 
            tiers={plan.commissionStructure.tiers} 
            currency={plan.currency}
            updateCommissionStructure={(tiers) => updatePlan('commissionStructure', { tiers })} 
          />
        </SectionPanel>
        
        <SectionPanel title="Measurement Rules">
          <MeasurementRules 
            measurementRules={plan.measurementRules}
            revenueBase={plan.revenueBase}
            currency={plan.currency}
            updateMeasurementRules={(updatedRules) => updatePlan('measurementRules', updatedRules)}
          />
        </SectionPanel>
        
        <SectionPanel title="Credit Rules">
          <CreditRules 
            levels={plan.creditRules.levels}
            updateCreditRules={(levels) => updatePlan('creditRules', { levels })}
          />
        </SectionPanel>
        
        <SectionPanel 
          title="Custom Rules" 
          badge={
            <div className="chip chip-purple">{plan.customRules.length}</div>
          }
        >
          <CustomRules 
            customRules={plan.customRules}
            currency={plan.currency}
            updateCustomRules={(rules) => updatePlan('customRules', rules)}
          />
        </SectionPanel>
        
        <div className="mt-10 flex justify-end space-x-4">
          <ActionButton
            variant="outline" 
            size="lg"
            onClick={simulatePlan}
          >
            <PlayCircle size={18} className="mr-2" /> Simulate
          </ActionButton>
          
          <ActionButton
            variant="primary" 
            size="lg"
            onClick={savePlan}
          >
            <Save size={18} className="mr-2" /> Save Plan
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default IncentivePlanDesigner;


import React, { useState } from 'react';
import NavBar from '@/components/layout/NavBar';
import Container from '@/components/layout/Container';
import IncentivePlanDesigner from '@/components/IncentivePlanDesigner';
import { useToast } from "@/hooks/use-toast";
import { IncentivePlanWithStatus } from '@/services/incentive/incentivePlanService';
import { DEFAULT_PLAN } from '@/constants/incentiveConstants';
import { IncentivePlan, PrimaryMetric } from '@/types/incentiveTypes';

import SchemeOptionsScreen from '@/components/incentive/SchemeOptionsScreen';
import DesignerNavigation from '@/components/incentive/DesignerNavigation';
import SchemeSelectionDialog from '@/components/incentive/SchemeSelectionDialog';

const IncentiveDesigner = () => {
  const { toast } = useToast();
  const [showInitialOptions, setShowInitialOptions] = useState(true);
  const [showExistingSchemes, setShowExistingSchemes] = useState(false);
  const [planTemplate, setPlanTemplate] = useState<IncentivePlan | null>(null);

  const handleCreateNewScheme = () => {
    setPlanTemplate({
      ...DEFAULT_PLAN,
      participants: [],
      salesQuota: 0,
      name: '',
      description: ''
    });
    setShowInitialOptions(false);
  };

  const handleCopyExistingScheme = (scheme: IncentivePlanWithStatus) => {
    // Default metrics to use if none are found
    const defaultMetrics: PrimaryMetric[] = [{ name: 'revenue', description: 'Net Revenue' }];
    
    const fixedMeasurementRules = {
      ...scheme.measurementRules,
      primaryMetrics: Array.isArray(scheme.measurementRules?.primaryMetrics) && 
                     scheme.measurementRules.primaryMetrics.length > 0
        ? scheme.measurementRules.primaryMetrics 
        : defaultMetrics
    };
    
    const planData: IncentivePlan = {
      name: `Copy of ${scheme.name}`,
      description: scheme.description,
      effectiveStart: scheme.effectiveStart,
      effectiveEnd: scheme.effectiveEnd,
      currency: scheme.currency,
      revenueBase: scheme.revenueBase,
      participants: scheme.participants,
      commissionStructure: scheme.commissionStructure,
      measurementRules: fixedMeasurementRules,
      creditRules: scheme.creditRules,
      customRules: scheme.customRules,
      salesQuota: typeof scheme.salesQuota === 'string' ? parseInt(scheme.salesQuota) || 0 : scheme.salesQuota
    };
    
    setPlanTemplate(planData);
    setShowExistingSchemes(false);
    setShowInitialOptions(false);
    
    toast({
      title: "Plan Loaded",
      description: `Loaded plan: ${scheme.name}`,
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-app-gray-50 to-white">
      <NavBar />
      <Container maxWidth="full">
        <DesignerNavigation 
          onBack={!showInitialOptions ? () => setShowInitialOptions(true) : undefined}
          showBackToDashboard={showInitialOptions}
        />
        
        {showInitialOptions ? (
          <SchemeOptionsScreen 
            onCreateNewScheme={handleCreateNewScheme}
            onOpenExistingSchemes={() => setShowExistingSchemes(true)}
          />
        ) : (
          <IncentivePlanDesigner 
            initialPlan={planTemplate} 
            onBack={() => setShowInitialOptions(true)} 
          />
        )}
        
        <SchemeSelectionDialog 
          open={showExistingSchemes}
          setOpen={setShowExistingSchemes}
          onSchemeCopy={handleCopyExistingScheme}
        />
      </Container>
    </div>
  );
};

export default IncentiveDesigner;

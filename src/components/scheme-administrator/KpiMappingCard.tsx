import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus, X, Database, Download } from 'lucide-react';
import { KPIFieldMapping } from '@/services/database/types/kpiTypes';
import KpiMappingForm from '@/components/scheme-administrator/KpiMappingForm';
import KpiMappingList from '@/components/scheme-administrator/KpiMappingList';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SchemeHeader from '@/components/scheme-administrator/SchemeHeader';

interface KpiMappingCardProps {
  kpiMappings: KPIFieldMapping[];
  isLoadingMappings: boolean;
  createKpiMapping: (kpiMapping: KPIFieldMapping) => void;
  updateKpiMapping: (id: string, kpiMapping: KPIFieldMapping) => void;
  deleteKpiMapping: (id: string) => void;
  editingKpi: KPIFieldMapping | null;
  startEditingKpi: (kpi: KPIFieldMapping) => void;
  cancelEditingKpi: () => void;
  isCreatingKpi: boolean;
  isUpdatingKpi: boolean;
  isUsingInMemoryStorage?: boolean;
}

const KpiMappingCard: React.FC<KpiMappingCardProps> = ({
  kpiMappings,
  isLoadingMappings,
  createKpiMapping,
  updateKpiMapping,
  deleteKpiMapping,
  editingKpi,
  startEditingKpi,
  cancelEditingKpi,
  isCreatingKpi,
  isUpdatingKpi,
  isUsingInMemoryStorage = false
}) => {
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'list' | 'json'>('list');
  const { toast } = useToast();
  
  // Calculation base state
  const [calculationBase, setCalculationBase] = useState({
    adminId: "scheme-" + new Date().getTime(),
    adminName: "New Scheme Administrator",
    calculationBase: "Sales Orders",
    createdAt: new Date().toISOString()
  });

  const handleKpiSubmit = (kpiMapping: KPIFieldMapping) => {
    if (editingKpi && editingKpi._id) {
      // Update existing KPI mapping
      updateKpiMapping(editingKpi._id, kpiMapping);
      toast({
        title: "Updating KPI mapping",
        description: "Please wait while we update the KPI mapping...",
      });
    } else {
      // Create new KPI mapping
      createKpiMapping(kpiMapping);
      toast({
        title: "Creating KPI mapping",
        description: "Please wait while we create the new KPI mapping...",
      });
    }
    // We'll keep the form open until we get confirmation of success/failure
  };

  const handleDeleteKpi = (id: string) => {
    if (window.confirm('Are you sure you want to delete this KPI mapping?')) {
      deleteKpiMapping(id);
      toast({
        title: "Deleting KPI mapping",
        description: "Please wait while we delete the KPI mapping...",
      });
      
      // If currently editing this KPI, cancel the edit
      if (editingKpi && editingKpi._id === id) {
        cancelEditingKpi();
        setShowForm(false);
      }
    }
  };

  const handleEditKpi = (kpi: KPIFieldMapping) => {
    startEditingKpi(kpi);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    cancelEditingKpi();
    setShowForm(false);
  };

  // Toggle form visibility and reset editing state
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      cancelEditingKpi();
    }
  };

  // Handle calculation base changes
  const handleCalcBaseChange = (newValues: Partial<typeof calculationBase>) => {
    setCalculationBase(prev => ({ ...prev, ...newValues }));
  };

  // Group mappings by section for JSON preview
  const groupedJson = {
    adminId: calculationBase.adminId,
    adminName: calculationBase.adminName,
    calculationBase: calculationBase.calculationBase,
    createdAt: calculationBase.createdAt,
    baseData: kpiMappings
      .filter(m => m.section === 'BASE_DATA')
      .map(mapping => ({
        kpi: mapping.kpiName,
        description: mapping.description,
        sourceType: mapping.sourceType,
        sourceField: mapping.sourceField,
        dataType: mapping.dataType,
        api: mapping.api || ""
      })),
    qualificationFields: kpiMappings
      .filter(m => m.section === 'QUAL_CRI')
      .map(mapping => ({
        kpi: mapping.kpiName,
        description: mapping.description,
        sourceType: mapping.sourceType,
        sourceField: mapping.sourceField,
        dataType: mapping.dataType,
        api: mapping.api || ""
      })),
    adjustmentFields: kpiMappings
      .filter(m => m.section === 'ADJ_CRI')
      .map(mapping => ({
        kpi: mapping.kpiName,
        description: mapping.description,
        sourceType: mapping.sourceType,
        sourceField: mapping.sourceField,
        dataType: mapping.dataType,
        api: mapping.api || ""
      })),
    exclusionFields: kpiMappings
      .filter(m => m.section === 'EX_CRI')
      .map(mapping => ({
        kpi: mapping.kpiName,
        description: mapping.description,
        sourceType: mapping.sourceType,
        sourceField: mapping.sourceField,
        dataType: mapping.dataType,
        api: mapping.api || ""
      })),
    customRules: kpiMappings
      .filter(m => m.section === 'CUSTOM_RULES')
      .map(mapping => ({
        kpi: mapping.kpiName,
        description: mapping.description,
        sourceType: mapping.sourceType,
        sourceField: mapping.sourceField,
        dataType: mapping.dataType,
        api: mapping.api || ""
      }))
  };

  // Function to download JSON
  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(groupedJson, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "scheme_configuration.json");
    document.body.appendChild(downloadAnchorNode); // required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "JSON Downloaded",
      description: "Scheme configuration has been downloaded as JSON",
    });
  };

  // Reset form on successful create or update
  React.useEffect(() => {
    if (!isCreatingKpi && !isUpdatingKpi) {
      // Only close form if we were previously creating or updating
      setShowForm(false);
    }
    
    // Update base field when KPI mappings change
    if (kpiMappings && kpiMappings.length > 0) {
      const baseDataKpi = kpiMappings.find(m => m.section === 'BASE_DATA');
      if (baseDataKpi && !calculationBase.baseField) {
        setCalculationBase(prev => ({
          ...prev,
          baseField: baseDataKpi.kpiName
        }));
      }
    }
  }, [isCreatingKpi, isUpdatingKpi, kpiMappings]);

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <div>
            <CardTitle>KPI Mapping Configuration</CardTitle>
            <CardDescription>
              Define KPI fields that will be available to scheme designers
            </CardDescription>
          </div>
          {isUsingInMemoryStorage && (
            <Badge variant="destructive" className="ml-2 flex items-center">
              <Database size={14} className="mr-1" /> In-Memory
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={downloadJson}
            className="flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export JSON
          </Button>
          <Button 
            onClick={toggleForm} 
            className="flex items-center"
            variant={showForm ? "secondary" : "default"}
          >
            {showForm ? (
              <>
                <X size={16} className="mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Add New KPI
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SchemeHeader 
          calculationBase={calculationBase}
          onChange={handleCalcBaseChange}
        />
        
        {showForm && (
          <div className="mb-8 mt-6">
            <h3 className="text-lg font-medium mb-4">
              {editingKpi ? `Edit KPI: ${editingKpi.kpiName}` : 'New KPI Mapping'}
            </h3>
            <KpiMappingForm 
              onSubmit={handleKpiSubmit}
              initialData={editingKpi}
              isSaving={isCreatingKpi || isUpdatingKpi}
              onCancel={handleCancelEdit}
              mode={editingKpi ? 'edit' : 'create'}
            />
          </div>
        )}
        
        <Tabs defaultValue="list" value={view} onValueChange={(v) => setView(v as 'list' | 'json')} className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="json">JSON Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <KpiMappingList 
              mappings={kpiMappings}
              isLoading={isLoadingMappings}
              onDelete={handleDeleteKpi}
              onEdit={handleEditKpi}
              isUsingInMemoryStorage={isUsingInMemoryStorage}
            />
          </TabsContent>
          
          <TabsContent value="json">
            <div className="border rounded bg-gray-50 p-4 overflow-auto max-h-[600px]">
              <pre className="text-xs">
                {JSON.stringify(groupedJson, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KpiMappingCard;

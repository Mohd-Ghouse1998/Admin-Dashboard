import React, { useState } from 'react';
import { Check, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OCPITariff } from '../../types/tariff.types';

// Use OCPITariff directly instead of creating a separate interface
// This ensures consistency with the rest of the application

interface TariffWizardProps {
  steps: React.ReactNode[];
  stepTitles: string[];
  onComplete: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

const TariffWizard: React.FC<TariffWizardProps> = ({
  steps,
  stepTitles,
  onComplete,
  onCancel,
  isSubmitting,
  isEditMode
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{isEditMode ? 'Edit Tariff' : 'Create New Tariff'}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Modify your existing tariff' 
                : 'Configure pricing for your charging stations'}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </CardHeader>

      {/* Step progress */}
      <div className="px-6">
        <div className="flex mb-4">
          {stepTitles.map((title, index) => (
            <React.Fragment key={title}>
              <div 
                className={`flex items-center ${index === 0 ? 'pl-0' : ''}`}
                onClick={() => setCurrentStep(index)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                    ${index <= currentStep ? 'border-primary bg-primary text-primary-foreground' : 'border-muted bg-muted text-muted-foreground'}`}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span 
                  className={`ml-2 text-sm ${index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                >
                  {title}
                </span>
              </div>
              {index < stepTitles.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 self-center mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      <CardContent>
        {steps[currentStep]}
      </CardContent>

      {/* Navigation buttons */}
      <CardFooter className="flex justify-between">
        <div>
          {!isFirstStep && (
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          {isLastStep ? (
            <Button 
              type="submit"
              form="tariff-form"
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update Tariff' : 'Create Tariff'}
            </Button>
          ) : (
            <Button 
              onClick={goToNextStep}
              disabled={isSubmitting}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TariffWizard;

// components/guide/JoyrideWrapper.tsx
import React, { useState } from 'react';
import Joyride, { CallBackProps, Step } from 'react-joyride';

interface CustomStep extends Step {
  disableNext?: boolean;
}

interface JoyrideWrapperProps {
  steps: CustomStep[];
  run?: boolean;
  onFinish?: () => void;
}

const JoyrideWrapper: React.FC<JoyrideWrapperProps> = ({ steps, run = false, onFinish }) => {
  const [walkthroughActive, setWalkthroughActive] = useState(run);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action } = data;

    if (status === 'finished' || status === 'skipped') {
      setWalkthroughActive(false);
      onFinish?.();
    }

    if (action === 'next' || action === 'update') {
      setCurrentStepIndex(index);
    }
  };

  const currentStep = steps[currentStepIndex] || {};

  return (
    <Joyride
      steps={steps}
      run={walkthroughActive}
      continuous
      showSkipButton
      disableCloseOnEsc
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#2563eb',
          textColor: '#000',
          zIndex: 1000,
        },
        buttonNext: currentStep.disableNext ? { display: 'none' } : {},
      }}
    />
  );
};

export default JoyrideWrapper;

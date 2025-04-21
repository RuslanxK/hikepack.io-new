import React, { useEffect, useState } from 'react';
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

  const currentStep = steps[currentStepIndex];

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

  // detect if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!currentStep?.target || typeof currentStep.target !== 'string') return;
  
    const el = document.querySelector(currentStep.target);
    if (!el) return;
  
    const handleClick = () => {
      setWalkthroughActive(false);
      onFinish?.();
    };
  
    el.addEventListener('click', handleClick);
    return () => {
      el.removeEventListener('click', handleClick);
    };
  }, [currentStep, onFinish]);
  

  return (
    <Joyride
      steps={steps}
      run={walkthroughActive}
      continuous
      showSkipButton
      disableCloseOnEsc
      disableScrolling={true}
      callback={handleJoyrideCallback}
      spotlightPadding={8}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          primaryColor: '#058373', // your Tailwind primary
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // darker in dark mode
          textColor: isDarkMode ? '#ffffff' : '#000000',
          arrowColor: isDarkMode ? '#1f2937' : '#ffffff',
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          borderRadius: 8,
          padding: '16px',
          boxShadow: '0 2px 15px rgba(0,0,0,0.15)',
        },
        buttonNext: currentStep?.disableNext ? { display: 'none' } : undefined,
        spotlight: {
          boxShadow: isDarkMode ? '0 0 0 4px rgb(3, 255, 159)'  : '0 0 0 4px #058373',        
          backgroundColor: 'transparent',
          borderRadius: 8,
        },
      }}
    />
  );
};

export default JoyrideWrapper;

// guide/steps.ts
import { Step } from 'react-joyride';

export interface StepConfig {
  target: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  disableBeacon?: boolean;
  disableInteraction?: boolean;
  disableScrolling?: boolean;
  spotlightClicks?: boolean;
  disableNext?: boolean;
}

export const getSteps = (configs: StepConfig[]): Step[] => {
  return configs.map((config) => ({
    ...config,
    placement: config.placement || 'bottom',
    disableBeacon: config.disableBeacon ?? true,
  }));
};

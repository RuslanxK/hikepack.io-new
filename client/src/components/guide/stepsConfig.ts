// guide/stepsConfig.ts
import { StepConfig } from './steps';

export const homeStepsConfig: StepConfig[] = [
  {
    target: '.add-trip-button',
    content: 'Click here to add your trip!',
    disableInteraction: false, // allow interaction to prevent overlay issues
    disableScrolling: true,
    spotlightClicks: true,    
    disableNext: true,
    placement: 'bottom',
  },
];

export const tripStepsConfig: StepConfig[] = [
  {
    target: '.add-bag-button',
    content: 'Click here to add your bag.',
    disableInteraction: false, // allow interaction to prevent overlay issues
    disableScrolling: true,
    spotlightClicks: true,    
    disableNext: true,
    placement: 'bottom',
  }
];


export const bagStepsConfig: StepConfig[] = [

  {
    target: '.add-category-button',
    content: 'Add a new category to your bag.',
    disableInteraction: false, // allow interaction to prevent overlay issues
    disableScrolling: true,
    spotlightClicks: true,    
    disableNext: true,
    placement: 'bottom',
  },
];

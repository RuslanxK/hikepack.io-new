import ReactGA from 'react-ga4';

export const initGA = () => {
  if (import.meta.env.MODE === 'production') {
    ReactGA.initialize(`${import.meta.env.VITE_GA4_ID}`)
  }
};

export const trackPage = (url: string) => {
  if (import.meta.env.MODE === 'production') {
    ReactGA.send({ hitType: 'pageview', page: url });
  }
};

interface EventParams {
  category: string;
  action: string;
  label?: string;
}

export const trackEvent = ({ category, action, label }: EventParams) => {
  if (import.meta.env.MODE === 'production') {
    ReactGA.event({ category, action, label });
  }
};

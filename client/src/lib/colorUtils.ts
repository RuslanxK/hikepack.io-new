export const getRandomMidLightColor = (): string => {
  const randomChannel = () => Math.floor(Math.random() * 100) + 100; // Values between 100-200
  return `#${randomChannel().toString(16).padStart(2, '0')}${randomChannel().toString(16).padStart(2, '0')}${randomChannel().toString(16).padStart(2, '0')}`;
};

export const DEMO_ACCESS_KEY = 'barbershop-demo-access';

export const DEMO_CREDENTIALS = {
  email: 'demo@barbearia.com',
  password: 'demo123456',
};

export const hasDemoAccess = () =>
  sessionStorage.getItem(DEMO_ACCESS_KEY) === 'true';

export const enableDemoAccess = () =>
  sessionStorage.setItem(DEMO_ACCESS_KEY, 'true');

export const clearDemoAccess = () =>
  sessionStorage.removeItem(DEMO_ACCESS_KEY);

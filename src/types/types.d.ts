import Resources from './Resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'en';
    resources: Resources;
  }
}

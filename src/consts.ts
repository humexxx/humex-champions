import packageJson from '../package.json';
export const VERSION = import.meta.env.VITE_APP_VERSION || packageJson.version;

export const MULTIPLE_GRAPH_COLORS = [
  '#4e79a7',
  '#f28e2c',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc949',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab',
];

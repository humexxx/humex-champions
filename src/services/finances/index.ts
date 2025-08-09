import { ENV } from 'src/consts';
import { financialPlansService } from './personalFinancesService';
import { mockFinancialPlansService } from './mockFinancialPlansService';

export const createFinancialPlansService = (forceMock: boolean = false) => {
  return ENV.USE_MOCKED_DATA || forceMock
    ? mockFinancialPlansService
    : financialPlansService;
};

export const defaultFinancialPlansService = createFinancialPlansService();

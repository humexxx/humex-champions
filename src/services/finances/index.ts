import { USE_MOCKED_DATA } from 'src/consts';
import { financialPlansService } from './personalFinancesService';
import { mockFinancialPlansService } from './mockFinancialPlansService';

export const createFinancialPlansService = (forceMock: boolean = false) => {
  return USE_MOCKED_DATA || forceMock
    ? mockFinancialPlansService
    : financialPlansService;
};

export const defaultFinancialPlansService = createFinancialPlansService();

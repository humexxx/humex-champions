import { ENV } from 'src/consts';
import { financialPlansService } from './personalFinancesService';
import { mockFinancialPlansService } from './mockFinancialPlansService';
import { portfolioService, mockPortfolioService } from './portfolioService';

export const createFinancialPlansService = (forceMock: boolean = false) => {
  return ENV.USE_MOCKED_DATA || forceMock
    ? mockFinancialPlansService
    : financialPlansService;
};

export const createPortfolioService = (forceMock: boolean = false) => {
  return ENV.USE_MOCKED_DATA || forceMock
    ? mockPortfolioService
    : portfolioService;
};

export {
  financialPlansService,
  mockFinancialPlansService,
  portfolioService,
  mockPortfolioService,
};

export const defaultFinancialPlansService = createFinancialPlansService();

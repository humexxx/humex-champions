interface Resources {
  "en": {
    "lang": "en-US",
    "languages": {
      "en": "English",
      "es": "Spanish"
    },
    "commonValidations": {
      "required": "Required field",
      "positiveNumber": "Field must be greater than 0",
      "type": "Invalid type"
    },
    "dashboard": {
      "title": "Dashboard",
      "totalSavings": "Total Savings",
      "totalFatBurn": "Total Fat Burn",
      "totalDailyGoalsStreak": "Total Daily Goals Streak",
      "totalPLTrading": "Total P/L Trading"
    },
    "finances": {
      "title": "Finances",
      "financialSummary": "Financial Summary",
      "summaryDescription": "Here you could include a brief summary of personal finances, such as current balance, portfolio performance, etc.",
      "personalFinances": {
        "title": "Personal Finances",
        "description": "Manage your personal finances and keep track of your expenses and income.",
        "addPlan": "Add Plan",
        "addPlanHint": "Main plan should have data",
        "header": {
          "debts": {
            "title": "Debts",
            "total": "Total",
            "minimumPayment": "Min. Payment",
            "interest": "Weighted Interest",
            "noDebts": "No debts found.",
            "dialog": {
              "title": "Edit monthly debt",
              "pendingDebt": "Pending Debt",
              "minPayment": "Min. Payment",
              "anualInterest": "Anual Interest",
              "startDate": "Start Date"
            }
          },
          "incomes": {
            "title": "Income",
            "total": "Total",
            "month": "month",
            "sources": "Sources",
            "noIncome": "No income found.",
            "dialog": {
              "title": "Edit monthly income",
              "period": "Period",
              "amount": "Amount",
              "startDate": "Start Date",
              "periods": {
                "weekly": "Weekly",
                "monthly": "Monthly",
                "yearly": "Yearly"
              }
            }
          },
          "fixedExpenses": {
            "title": "Fixed Expenses",
            "total": "Total",
            "fixedMonthlyDebt": "Fixed Debt",
            "fixedMonthlyDebtHint": "Monthly minimum payment of debts required to avoid penalties.",
            "noFixedExpenses": "No fixed expenses found.",
            "dialog": {
              "title": "Edit fixed expense",
              "name": "Name",
              "expenseType": "Expense Type",
              "amount": "Amount",
              "startDate": "Start Date",
              "expenseTypes": {
                "primary": "Primary",
                "secondary": "Secondary"
              }
            }
          }
        },
        "graph": {
          "estimatedTimeToSavings": "Estimated time to have more savings than debts: {{months}} months.",
          "moreThanYear": "It will take more than a year to have more savings than debts.",
          "savings": "Savings",
          "debts": "Debts",
          "month": "Month"
        },
        "debtConfirmationDialog": {
          "title": "Debt Confirmation",
          "totalPreviousDebt": "Total Previous Debt",
          "totalNewDebt": "Total New Debt",
          "newDebt": "New Debt",
          "previousDebt": "Previous Debt",
          "confirm": "Confirm",
          "description": "A new debts estimate has been calculated based on the anual interest rates, the minimum payments, the incomes, the fixed expenses and the payment strategy. Please confirm the new debts."
        }
      },
      "tradingJournal": {
        "title": "Trading Journal",
        "description": "Keep a record of your trading activities and analyze your performance.",
        "editPanel": {
          "pl": "P/L",
          "instrument": "Instrument",
          "delete": "Delete",
          "addTrade": "Add Trade",
          "submit": "Submit",
          "summary": "Some summary data for the month / week"
        },
        "summaryPanel": {
          "title": "Weekly Summary",
          "trades": "Number of Trades",
          "amount": "Amount in USD",
          "monthlyGrowth": "Monthly Growth"
        }
      },
      "portfolio": {
        "title": "Portfolio",
        "description": "Manage your investment portfolio and monitor its performance."
      }
    },
    "health": {
      "title": "Health"
    },
    "goals": {
      "title": "Goals"
    },
    "entretaiment": {
      "title": "Entretaiment"
    },
    "members": {
      "title": "Members"
    },
    "groups": {
      "title": "Groups"
    }
  }
}

export default Resources;

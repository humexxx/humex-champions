interface Resources {
  "en": {
    "lang": "en-US",
    "languages": {
      "en": "English",
      "es": "Spanish",
      "pt": "Portuguese"
    },
    "common": {
      "confirm": "Confirm",
      "cancel": "Cancel",
      "infinite": "Infinite",
      "years": "Years",
      "add": "Add",
      "save": "Save",
      "submit": "Submit",
      "total": "Total",
      "value": "Value"
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
      "description": "Here you could include a brief summary of personal finances, such as current balance, portfolio performance, etc.",
      "personalFinances": {
        "title": "Personal Finances",
        "description": "Manage your personal finances and keep track of your expenses and income.",
        "addPlan": "Add Plan",
        "addPlanHint": "Main plan should have data",
        "header": {
          "debts": {
            "title": "Debts",
            "total": "Total",
            "minimumPayment": "Min. payment",
            "interest": "Weighted interest",
            "noDebts": "No debts found.",
            "dialog": {
              "debt": "Debt",
              "name": "Name",
              "title": "Edit monthly debt",
              "pendingDebt": "Pending Debt",
              "minPayment": "Min. Payment",
              "anualInterest": "Anual Interest",
              "startDate": "Start Date",
              "addDebt": "Add Debt",
              "save": "Save",
              "cancel": "Cancel"
            }
          },
          "incomes": {
            "title": "Income",
            "total": "Total",
            "month": "month",
            "nextExtraordinaryPayment": "Next extraordinary payment",
            "noIncome": "No income found.",
            "dialog": {
              "title": "Edit monthly income",
              "period": "Period",
              "amount": "Amount",
              "startDate": "Start Date",
              "periods": {
                "single": "Single",
                "weekly": "Weekly",
                "monthly": "Monthly",
                "yearly": "Yearly"
              },
              "name": "Name",
              "date": "Date",
              "addIncome": "Add Income",
              "save": "Save",
              "cancel": "Cancel",
              "useTrading": "Use Trading",
              "useTradingHint": "Use the total P/L from the trading journal as income at the end of the month.",
              "income": "Income",
              "yearlyOn": "Yearly on"
            }
          },
          "fixedExpenses": {
            "title": "Fixed Expenses",
            "total": "Total",
            "fixedMonthlyDebt": "Fixed debt",
            "fixedMonthlyDebtHint": "Monthly minimum payment of debts required to avoid penalties.",
            "noFixedExpenses": "No fixed expenses found.",
            "dialog": {
              "title": "Edit fixed expense",
              "name": "Name",
              "expenseType": "Expense Type",
              "amount": "Amount",
              "date": "Date",
              "expenseTypes": {
                "primary": "Primary",
                "secondary": "Secondary",
                "single": "Single"
              },
              "addFixedExpense": "Add Fixed Expense",
              "save": "Save",
              "cancel": "Cancel",
              "fixedExpense": "Fixed Expense"
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
          "confirm": "Confirm",
          "description": "A new debts estimate has been calculated based on the anual interest rates, the minimum payments, the incomes, the fixed expenses and the payment strategy. Please confirm the new debts."
        }
      },
      "tradingJournal": {
        "title": "Trading Journal",
        "description": "Keep a record of your trading activities and analyze your performance.",
        "day": "Day",
        "week": "Week",
        "month": "Month",
        "formIsDirtyTitle": "Unsaved changes",
        "formIsDirtyDescription": "You have unsaved changes. Are you sure you want to proceed?",
        "editPanel": {
          "pl": "P/L",
          "instrument": "Instrument",
          "delete": "Delete",
          "addTrade": "Add Trade",
          "submit": "Submit",
          "summary": "Some summary data for the month / week",
          "hint": "You can add a trade by clicking the button below."
        },
        "summaryPanel": {
          "title": "Weekly Summary",
          "trades": "Number of Trades",
          "amount": "Amount in USD",
          "monthlyGrowth": "Monthly Growth"
        },
        "balanceTracker": {
          "balanceStart": "Balance Start",
          "balanceEnd": "Balance End",
          "transactionDialog": {
            "title": "Transaction",
            "description": "Add a transaction to your balance tracker.",
            "amount": "Amount",
            "notes": "Notes",
            "types": {
              "deposit": "Deposit",
              "withdrawal": "Withdrawal"
            },
            "type": "Type"
          }
        },
        "operationsHistory": {
          "columns": {
            "operation": "Operation",
            "amount": "Amount",
            "date": "Date"
          }
        },
        "operationsHistoryChart": {
          "filters": {
            "profit": "Profit",
            "balance": "Balance"
          }
        }
      },
      "portfolio": {
        "title": "Portfolio",
        "description": "Manage your investment portfolio and monitor its performance.",
        "predicted": "Predicted",
        "createPortfolio": {
          "title": "Create Portfolio",
          "description": "Create a new portfolio to keep track of your investments.",
          "amount": "Amount",
          "instrument": "Instrument",
          "instrumentPlaceholder": "Select an instrument",
          "allocation": "Allocation"
        }
      },
      "compound-calculator": {
        "title": "Compound Interest Calculator",
        "description": "Calculate the future value of an investment based on the compound interest formula.",
        "inputs": {
          "initialInvestment": "Initial Investment",
          "monthlyContribution": "Monthly Contribution",
          "interestRate": "Interest Rate"
        },
        "investment": "Investment",
        "addInvestment": "Add investment plan",
        "maxInvestments": "Maximum number of investments reached."
      }
    },
    "health": {
      "title": "Health",
      "summary": "Health Summary",
      "description": "Health is a tool to help you keep track of your health goals and habits.",
      "trainingProgram": {
        "title": "Training Program",
        "description": "Create a training program to keep track of your workouts."
      },
      "nutrition": {
        "title": "Nutrition",
        "description": "Create a nutrition plan to keep track of your meals."
      },
      "calculator": {
        "title": "Calculator",
        "description": "Calculate your BMI, BMR, TDEE and more."
      }
    },
    "uplift": {
      "title": "Uplift",
      "summary": "Uplift Summary",
      "description": "Uplift is a tool to help you keep track of your daily goals and long-term goals.",
      "planner": {
        "title": "Planner",
        "description": "Plan your week and keep track of your daily goals.",
        "form": {
          "newTask": "New Task"
        }
      },
      "pathway": {
        "title": "Pathway",
        "description": "Create a pathway to keep track of your long-term goals."
      }
    },
    "entertainment": {
      "title": "Entretaiment",
      "summary": "Entretaiment Summary",
      "description": "Entretaiment is a tool to help you keep track of your favorite movies, series, books, etc.",
      "youtube": {
        "title": "YouTube",
        "description": "Create a list of your favorite YouTube channels."
      },
      "trips": {
        "title": "Trips",
        "description": "Create a list of your favorite trips."
      }
    },
    "members": {
      "title": "Members"
    },
    "groups": {
      "title": "Groups"
    },
    "settings": {
      "title": "Settings",
      "description": "Manage your account settings.",
      "selectTimezone": "Select Timezone",
      "googleLoggedIn": "Google account has been linked",
      "googleLoggedOut": "Click the button to link your Google account. This will allow you to update your calendar"
    },
    "admin": {
      "title": "Admin",
      "confirmDialog": {
        "title": "Confirm Action",
        "description": "Are you sure you want to perform this action?"
      },
      "options": {
        "personalFinancesDescription": "Run a new monthly calculation for the personal finances.",
        "portfolioDescription": "Run a quarterly calculation for the portfolio.",
        "checklistDescription": "Run a new daily calculation for the checklist."
      }
    }
  }
}

export default Resources;

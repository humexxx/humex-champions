interface Resources {
  "en": {
    "lang": "en-US",
    "languages": {
      "en": "English",
      "es": "Spanish"
    },
    "common": {
      "confirm": "Confirm",
      "cancel": "Cancel"
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
        "description": "Manage your investment portfolio and monitor its performance."
      },
      "compound-calculator": {
        "title": "Compound Interest Calculator",
        "description": "Calculate the future value of an investment based on the compound interest formula."
      }
    },
    "health": {
      "title": "Health"
    },
    "uplift": {
      "title": "Uplift",
      "summary": "Uplift Summary",
      "description": "Uplift is a tool to help you keep track of your daily goals and long-term goals.",
      "checklist": {
        "title": "Checklist",
        "description": "Create a checklist to keep track of your daily goals."
      },
      "pathway": {
        "title": "Pathway",
        "description": "Create a pathway to keep track of your long-term goals."
      }
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

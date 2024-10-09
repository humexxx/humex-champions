interface Resources {
  "en": {
    "lang": "en-US",
    "languages": {
      "en": "English",
      "es": "Spanish"
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
      "checklist": {
        "title": "Checklist",
        "description": "Create a checklist to keep track of your daily goals.",
        "list": {
          "newItem": "New Item",
          "fromYesterday": "from Yesterday"
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
      "selectTimezone": "Select Timezone"
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
  },
  "es": {
    "lang": "es-ES",
    "languages": {
      "en": "Inglés",
      "es": "Español"
    },
    "common": {
      "confirm": "Confirmar",
      "cancel": "Cancelar",
      "infinite": "Infinito",
      "years": "Años",
      "add": "Agregar",
      "save": "Guardar",
      "submit": "Enviar",
      "total": "Total",
      "value": "Valor"
    },
    "commonValidations": {
      "required": "Campo requerido",
      "positiveNumber": "El campo debe ser mayor que 0",
      "type": "Tipo inválido"
    },
    "dashboard": {
      "title": "Tablero",
      "totalSavings": "Ahorros Totales",
      "totalFatBurn": "Quema Total de Grasa",
      "totalDailyGoalsStreak": "Racha Total de Metas Diarias",
      "totalPLTrading": "Total P/L del Trading"
    },
    "finances": {
      "title": "Finanzas",
      "financialSummary": "Resumen Financiero",
      "summaryDescription": "Aquí puedes incluir un breve resumen de las finanzas personales, como el saldo actual, el rendimiento de la cartera, etc.",
      "personalFinances": {
        "title": "Finanzas Personales",
        "description": "Gestiona tus finanzas personales y realiza un seguimiento de tus gastos e ingresos.",
        "addPlan": "Agregar Plan",
        "addPlanHint": "El plan principal debe tener datos",
        "header": {
          "debts": {
            "title": "Deudas",
            "total": "Total",
            "minimumPayment": "Pago Mín.",
            "interest": "Interés Ponderado",
            "noDebts": "No se encontraron deudas.",
            "dialog": {
              "debt": "Deuda",
              "name": "Nombre",
              "title": "Editar deuda mensual",
              "pendingDebt": "Deuda Pendiente",
              "minPayment": "Pago Mín.",
              "anualInterest": "Interés Anual",
              "startDate": "Fecha de Inicio",
              "addDebt": "Agregar Deuda",
              "save": "Guardar",
              "cancel": "Cancelar"
            }
          },
          "incomes": {
            "title": "Ingresos",
            "total": "Total",
            "month": "mes",
            "nextExtraordinaryPayment": "Próximo pago extraordinario",
            "noIncome": "No se encontraron ingresos.",
            "dialog": {
              "title": "Editar ingreso mensual",
              "period": "Período",
              "amount": "Monto",
              "startDate": "Fecha de Inicio",
              "periods": {
                "single": "Único",
                "weekly": "Semanal",
                "monthly": "Mensual",
                "yearly": "Anual"
              },
              "name": "Nombre",
              "date": "Fecha",
              "addIncome": "Agregar Ingreso",
              "save": "Guardar",
              "cancel": "Cancelar",
              "useTrading": "Usar Trading",
              "useTradingHint": "Usar el total P/L del diario de trading como ingreso al final del mes.",
              "income": "Ingreso",
              "yearlyOn": "Anual en"
            }
          },
          "fixedExpenses": {
            "title": "Gastos Fijos",
            "total": "Total",
            "fixedMonthlyDebt": "Deuda fija",
            "fixedMonthlyDebtHint": "Pago mínimo mensual de deudas requerido para evitar penalizaciones.",
            "noFixedExpenses": "No se encontraron gastos fijos.",
            "dialog": {
              "title": "Editar gasto fijo",
              "name": "Nombre",
              "expenseType": "Tipo de Gasto",
              "amount": "Monto",
              "date": "Fecha",
              "expenseTypes": {
                "primary": "Primario",
                "secondary": "Secundario",
                "single": "Único"
              },
              "addFixedExpense": "Agregar Gasto Fijo",
              "save": "Guardar",
              "cancel": "Cancelar",
              "fixedExpense": "Gasto Fijo"
            }
          }
        },
        "graph": {
          "estimatedTimeToSavings": "Tiempo estimado para tener más ahorros que deudas: {{months}} meses.",
          "moreThanYear": "Tomará más de un año tener más ahorros que deudas.",
          "savings": "Ahorros",
          "debts": "Deudas",
          "month": "Mes"
        },
        "debtConfirmationDialog": {
          "title": "Confirmación de Deuda",
          "totalPreviousDebt": "Total Deuda Anterior",
          "totalNewDebt": "Total Nueva Deuda",
          "newDebt": "Nueva Deuda",
          "confirm": "Confirmar",
          "description": "Se ha calculado una nueva estimación de deudas basada en las tasas de interés anuales, los pagos mínimos, los ingresos, los gastos fijos y la estrategia de pago. Por favor, confirma las nuevas deudas."
        }
      },
      "tradingJournal": {
        "title": "Diario de Trading",
        "description": "Lleva un registro de tus actividades de trading y analiza tu rendimiento.",
        "day": "Día",
        "week": "Semana",
        "month": "Mes",
        "formIsDirtyTitle": "Cambios no guardados",
        "formIsDirtyDescription": "Tienes cambios no guardados. ¿Estás seguro de que quieres continuar?",
        "editPanel": {
          "pl": "P/L",
          "instrument": "Instrumento",
          "delete": "Eliminar",
          "addTrade": "Agregar Trade",
          "submit": "Enviar",
          "summary": "Algunos datos resumen para el mes / semana",
          "hint": "Puedes agregar un trade haciendo clic en el botón de abajo."
        },
        "summaryPanel": {
          "title": "Resumen Semanal",
          "trades": "Número de Trades",
          "amount": "Monto en USD",
          "monthlyGrowth": "Crecimiento Mensual"
        },
        "balanceTracker": {
          "balanceStart": "Saldo Inicial",
          "balanceEnd": "Saldo Final",
          "transactionDialog": {
            "title": "Transacción",
            "description": "Agrega una transacción a tu rastreador de saldo.",
            "amount": "Monto",
            "notes": "Notas",
            "types": {
              "deposit": "Depósito",
              "withdrawal": "Retiro"
            },
            "type": "Tipo"
          }
        },
        "operationsHistory": {
          "columns": {
            "operation": "Operación",
            "amount": "Monto",
            "date": "Fecha"
          }
        },
        "operationsHistoryChart": {
          "filters": {
            "profit": "Beneficio",
            "balance": "Saldo"
          }
        }
      },
      "portfolio": {
        "title": "Cartera",
        "description": "Gestiona tu cartera de inversiones y monitorea su rendimiento.",
        "predicted": "Predicho",
        "createPortfolio": {
          "title": "Crear Cartera",
          "description": "Crea una nueva cartera para realizar un seguimiento de tus inversiones.",
          "amount": "Monto",
          "instrument": "Instrumento",
          "instrumentPlaceholder": "Selecciona un instrumento",
          "allocation": "Asignación"
        }
      },
      "compound-calculator": {
        "title": "Calculadora de Interés Compuesto",
        "description": "Calcula el valor futuro de una inversión basada en la fórmula del interés compuesto.",
        "inputs": {
          "initialInvestment": "Inversión Inicial",
          "monthlyContribution": "Contribución Mensual",
          "interestRate": "Tasa de Interés"
        },
        "investment": "Inversión",
        "addInvestment": "Agregar plan de inversión",
        "maxInvestments": "Se ha alcanzado el número máximo de inversiones."
      }
    },
    "health": {
      "title": "Salud",
      "summary": "Resumen de Salud",
      "description": "La salud es una herramienta para ayudarte a realizar un seguimiento de tus objetivos y hábitos de salud.",
      "trainingProgram": {
        "title": "Programa de Entrenamiento",
        "description": "Crea un programa de entrenamiento para llevar un seguimiento de tus entrenamientos."
      },
      "nutrition": {
        "title": "Nutrición",
        "description": "Crea un plan de nutrición para llevar un seguimiento de tus comidas."
      },
      "calculator": {
        "title": "Calculadora",
        "description": "Calcula tu IMC, BMR, TDEE y más."
      }
    },
    "uplift": {
      "title": "Uplift",
      "summary": "Resumen de Uplift",
      "description": "Uplift es una herramienta para ayudarte a llevar un seguimiento de tus metas diarias y a largo plazo.",
      "checklist": {
        "title": "Lista de Verificación",
        "description": "Crea una lista de verificación para llevar un seguimiento de tus metas diarias.",
        "list": {
          "newItem": "Nuevo Ítem",
          "fromYesterday": "de Ayer"
        }
      },
      "pathway": {
        "title": "Camino",
        "description": "Planifica tus metas a largo plazo.",
        "addGoal": "Agregar Meta",
        "goal": {
          "title": "Título de la Meta",
          "description": "Descripción de la Meta",
          "dueDate": "Fecha de Vencimiento",
          "completion": "Porcentaje de Cumplimiento"
        }
      }
    }
  }
}

export default Resources;

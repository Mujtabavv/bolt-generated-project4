function calculateFinancialHealthScore(income, essentialExpenses, discretionarySpending, savings, debts, investments) {
      const totalExpenses = essentialExpenses + discretionarySpending + debts;
      const savingsRate = (savings / income) * 100;
      const debtToIncomeRatio = (debts / income) * 100;
      const investmentRate = (investments / income) * 100;
      let score = 50;
      if (income <= 0) {
        return 0;
      }
      score += Math.min(savingsRate * 0.5, 25);
      score -= Math.min(debtToIncomeRatio * 0.5, 25);
      score += Math.min(investmentRate * 0.5, 25);
      score = Math.max(0, Math.min(100, score));
      return Math.round(score);
    }
    function recommendBudget(income, essentialExpenses, discretionarySpending, savings, debts, investments) {
      const totalExpenses = essentialExpenses + discretionarySpending + debts;
      const remainingIncome = income - totalExpenses - savings - investments;
      const budget = {
        essentialExpenses: (essentialExpenses / income) * 100,
        discretionarySpending: (discretionarySpending / income) * 100,
        savings: (savings / income) * 100,
        debts: (debts / income) * 100,
        investments: (investments / income) * 100,
        remaining: (remainingIncome / income) * 100,
      };
      return budget;
    }
    function analyzeFinancialGoals(income, savings, financialGoal, timeFrameInYears) {
      const months = timeFrameInYears * 12;
      const requiredSavingsPerMonth = financialGoal / months;
      const currentSavingsPerMonth = savings;
      const savingsDifference = requiredSavingsPerMonth - currentSavingsPerMonth;
      let advice = "";
      if (savingsDifference > 0) {
        advice = `To reach your goal of $${financialGoal} in ${timeFrameInYears} years, you need to save an additional $${savingsDifference.toFixed(2)} per month. Consider reducing discretionary spending or increasing your income.`;
      } else {
        advice = `You are on track to reach your goal of $${financialGoal} in ${timeFrameInYears} years. Keep up the good work!`;
      }
      return advice;
    }
    function recommendInvestment(income, financialGoal, riskTolerance) {
      let investmentAdvice = "";
      if (riskTolerance === "low") {
        investmentAdvice = "Consider low-risk investments such as bonds or high-yield savings accounts.";
      } else if (riskTolerance === "medium") {
        investmentAdvice = "Consider a diversified portfolio with a mix of stocks and bonds.";
      } else if (riskTolerance === "high") {
        investmentAdvice = "Consider high-growth investments such as stocks or real estate.";
      } else {
        investmentAdvice = "Please provide a valid risk tolerance (low, medium, or high).";
      }
      return investmentAdvice;
    }
    module.exports = {
      calculateFinancialHealthScore,
      recommendBudget,
      analyzeFinancialGoals,
      recommendInvestment,
    };

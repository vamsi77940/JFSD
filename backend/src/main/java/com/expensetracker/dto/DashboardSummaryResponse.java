package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private BigDecimal availableBalance;
    private BigDecimal totalMonthlyIncome;
    private BigDecimal totalMonthlyExpenses;
    private BigDecimal remainingMonthlyBudget;
    private BigDecimal dailyAverageSpending;
    private BigDecimal monthlyBudgetLimit;
    private BigDecimal monthlyBudgetTotal;
    private Double budgetUsagePercent;
    private List<ExpenseResponse> recentExpenses;
    private List<IncomeResponse> recentIncome;
    private List<CategoryBreakdownItem> categoryBreakdown;
    private List<SpendingTrendItem> spendingTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdownItem {
        private String categoryName;
        private String color;
        private BigDecimal amount;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpendingTrendItem {
        private String date;
        private String displayDate;
        private BigDecimal amount;
    }
}

package com.expensetracker.service;

import com.expensetracker.dto.DashboardSummaryResponse;
import com.expensetracker.dto.DashboardSummaryResponse.CategoryBreakdownItem;
import com.expensetracker.dto.DashboardSummaryResponse.SpendingTrendItem;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.dto.IncomeResponse;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.Income;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final BudgetRepository budgetRepository;
    private final AuthService authService;
    private final EntityMapper entityMapper;

    public DashboardSummaryResponse getSummary() {
        User user = authService.getCurrentAuthenticatedUser();
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        YearMonth currentYearMonth = YearMonth.from(today);
        LocalDate startOfMonth = currentYearMonth.atDay(1);
        LocalDate endOfMonth = currentYearMonth.atEndOfMonth();
        String monthStr = currentYearMonth.toString();

        BigDecimal lifetimeIncome = incomeRepository.sumTotalLifetimeIncome(user.getId());
        BigDecimal lifetimeExpenses = expenseRepository.sumTotalLifetimeExpenses(user.getId());
        BigDecimal availableBalance = lifetimeIncome.subtract(lifetimeExpenses);

        BigDecimal monthIncome = incomeRepository.sumIncomeByDateRange(user.getId(), startOfMonth, endOfMonth);
        BigDecimal monthExpenses = expenseRepository.sumExpensesByDateRange(user.getId(), startOfMonth, endOfMonth);

        BigDecimal monthlyBudgetLimit = budgetRepository
                .findByUserIdAndBudgetMonthAndCategoryIsNull(user.getId(), monthStr)
                .map(b -> b.getAmount())
                .orElse(BigDecimal.ZERO);

        BigDecimal remainingBudget = monthlyBudgetLimit.compareTo(BigDecimal.ZERO) > 0
                ? monthlyBudgetLimit.subtract(monthExpenses)
                : BigDecimal.ZERO;

        int dayOfMonth = Math.max(1, today.getDayOfMonth());
        BigDecimal dailyAverage = monthExpenses.divide(BigDecimal.valueOf(dayOfMonth), 2, RoundingMode.HALF_UP);

        Double usagePercent = monthlyBudgetLimit.compareTo(BigDecimal.ZERO) > 0
                ? monthExpenses.divide(monthlyBudgetLimit, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;

        // Recent expenses (up to 5)
        List<Expense> allUserExpenses = expenseRepository.findByUserIdOrderByExpenseDateDesc(user.getId());
        List<ExpenseResponse> recentExpenses = allUserExpenses.stream()
                .limit(5)
                .map(entityMapper::toExpenseResponse)
                .toList();

        // Recent income (up to 5)
        List<Income> allUserIncome = incomeRepository.findByUserIdOrderByIncomeDateDesc(user.getId());
        List<IncomeResponse> recentIncome = allUserIncome.stream()
                .limit(5)
                .map(entityMapper::toIncomeResponse)
                .toList();

        // Month expenses for breakdown
        List<Expense> currentMonthExpensesList = expenseRepository
                .findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(user.getId(), startOfMonth, endOfMonth);

        Map<Long, BigDecimal> categoryTotalMap = new HashMap<>();
        Map<Long, String> categoryNameMap = new HashMap<>();
        Map<Long, String> categoryColorMap = new HashMap<>();

        for (Expense exp : currentMonthExpensesList) {
            if (exp.getCategory() != null) {
                Long catId = exp.getCategory().getId();
                categoryTotalMap.put(catId, categoryTotalMap.getOrDefault(catId, BigDecimal.ZERO).add(exp.getAmount()));
                categoryNameMap.put(catId, exp.getCategory().getName());
                categoryColorMap.put(catId, exp.getCategory().getColor() != null ? exp.getCategory().getColor() : "#8b5cf6");
            }
        }

        List<CategoryBreakdownItem> categoryBreakdown = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : categoryTotalMap.entrySet()) {
            BigDecimal amount = entry.getValue();
            Double percentage = (monthExpenses.compareTo(BigDecimal.ZERO) > 0)
                    ? amount.divide(monthExpenses, 4, RoundingMode.HALF_UP).doubleValue() * 100
                    : 0.0;

            categoryBreakdown.add(CategoryBreakdownItem.builder()
                    .categoryName(categoryNameMap.get(entry.getKey()))
                    .color(categoryColorMap.get(entry.getKey()))
                    .amount(amount)
                    .percentage(Math.round(percentage * 10.0) / 10.0)
                    .build());
        }
        categoryBreakdown.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));

        // 7-day spending trends
        List<SpendingTrendItem> spendingTrends = new ArrayList<>();
        LocalDate weekAgo = today.minusDays(6);
        List<Expense> last7DaysExpenses = expenseRepository
                .findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(user.getId(), weekAgo, today);

        Map<LocalDate, BigDecimal> dailyTotals = new HashMap<>();
        for (Expense exp : last7DaysExpenses) {
            dailyTotals.put(exp.getExpenseDate(),
                    dailyTotals.getOrDefault(exp.getExpenseDate(), BigDecimal.ZERO).add(exp.getAmount()));
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            BigDecimal dayAmount = dailyTotals.getOrDefault(d, BigDecimal.ZERO);
            spendingTrends.add(SpendingTrendItem.builder()
                    .date(d.toString())
                    .displayDate(d.format(dtf))
                    .amount(dayAmount)
                    .build());
        }

        return DashboardSummaryResponse.builder()
                .availableBalance(availableBalance)
                .totalMonthlyIncome(monthIncome)
                .totalMonthlyExpenses(monthExpenses)
                .remainingMonthlyBudget(remainingBudget)
                .dailyAverageSpending(dailyAverage)
                .monthlyBudgetLimit(monthlyBudgetLimit)
                .monthlyBudgetTotal(monthlyBudgetLimit)
                .budgetUsagePercent(usagePercent)
                .recentExpenses(recentExpenses)
                .recentIncome(recentIncome)
                .categoryBreakdown(categoryBreakdown)
                .spendingTrends(spendingTrends)
                .build();
    }
}

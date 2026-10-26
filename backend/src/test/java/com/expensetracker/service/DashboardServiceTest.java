package com.expensetracker.service;

import com.expensetracker.dto.DashboardSummaryResponse;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.IncomeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private AuthService authService;

    @Spy
    private EntityMapper entityMapper;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void summaryCalculationsUseOnlyTheAuthenticatedUsersTotals() {
        User user = User.builder().id(1L).build();
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        when(authService.getCurrentAuthenticatedUser()).thenReturn(user);
        when(incomeRepository.sumTotalLifetimeIncome(1L)).thenReturn(new BigDecimal("600.00"));
        when(expenseRepository.sumTotalLifetimeExpenses(1L)).thenReturn(new BigDecimal("250.00"));
        when(incomeRepository.sumIncomeByDateRange(1L, today.withDayOfMonth(1), today.withDayOfMonth(1).plusMonths(1).minusDays(1)))
                .thenReturn(new BigDecimal("100.00"));
        when(expenseRepository.sumExpensesByDateRange(1L, today.withDayOfMonth(1), today.withDayOfMonth(1).plusMonths(1).minusDays(1)))
                .thenReturn(new BigDecimal("30.00"));
        when(budgetRepository.findByUserIdAndBudgetMonthAndCategoryIsNull(1L, YearMonth.from(today).toString()))
                .thenReturn(Optional.of(Budget.builder().amount(new BigDecimal("200.00")).build()));
        when(expenseRepository.findByUserIdOrderByExpenseDateDesc(1L)).thenReturn(List.of());
        when(incomeRepository.findByUserIdOrderByIncomeDateDesc(1L)).thenReturn(List.of());
        when(expenseRepository.findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(
                eq(1L), any(LocalDate.class), any(LocalDate.class))).thenReturn(List.of());

        DashboardSummaryResponse summary = dashboardService.getSummary();

        assertEquals(new BigDecimal("350.00"), summary.getAvailableBalance());
        assertEquals(new BigDecimal("100.00"), summary.getTotalMonthlyIncome());
        assertEquals(new BigDecimal("30.00"), summary.getTotalMonthlyExpenses());
        assertEquals(new BigDecimal("170.00"), summary.getRemainingMonthlyBudget());
        assertEquals(new BigDecimal("30.00").divide(
                BigDecimal.valueOf(today.getDayOfMonth()), 2, java.math.RoundingMode.HALF_UP),
                summary.getDailyAverageSpending());
        assertEquals(15.0, summary.getBudgetUsagePercent());
        assertEquals(7, summary.getSpendingTrends().size());
    }
}

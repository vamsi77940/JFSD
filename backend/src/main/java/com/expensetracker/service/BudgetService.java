package com.expensetracker.service;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final AuthService authService;
    private final CategoryService categoryService;
    private final EntityMapper entityMapper;

    public List<BudgetResponse> getUserBudgets(String month) {
        User user = authService.getCurrentAuthenticatedUser();
        String targetMonth = (month != null && !month.trim().isEmpty())
                ? month.trim()
                : YearMonth.now(ZoneId.of("Asia/Kolkata")).toString();

        YearMonth ym = parseMonth(targetMonth);
        LocalDate startOfMonth = ym.atDay(1);
        LocalDate endOfMonth = ym.atEndOfMonth();

        List<Budget> budgets = budgetRepository.findByUserIdAndBudgetMonth(user.getId(), targetMonth);

        return budgets.stream().map(budget -> {
            BigDecimal spent;
            if (budget.getCategory() != null) {
                spent = expenseRepository.sumCategoryExpenses(
                        user.getId(), budget.getCategory().getId(), startOfMonth, endOfMonth);
            } else {
                spent = expenseRepository.sumExpensesByDateRange(
                        user.getId(), startOfMonth, endOfMonth);
            }
            return entityMapper.toBudgetResponse(budget, spent);
        }).toList();
    }

    @Transactional
    public BudgetResponse setBudget(BudgetRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        String month = request.getMonth().trim();

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryService.validateAndGetCategory(request.getCategoryId(), user.getId());
        }

        Optional<Budget> existingOpt = (category != null)
                ? budgetRepository.findByUserIdAndBudgetMonthAndCategoryId(user.getId(), month, category.getId())
                : budgetRepository.findByUserIdAndBudgetMonthAndCategoryIsNull(user.getId(), month);

        Budget budgetToSave;
        if (existingOpt.isPresent()) {
            budgetToSave = existingOpt.get();
            budgetToSave.setAmount(request.getAmount());
        } else {
            budgetToSave = Budget.builder()
                    .budgetMonth(month)
                    .category(category)
                    .amount(request.getAmount())
                    .user(user)
                    .build();
        }

        Budget saved = budgetRepository.save(budgetToSave);

        YearMonth ym = parseMonth(month);
        LocalDate startOfMonth = ym.atDay(1);
        LocalDate endOfMonth = ym.atEndOfMonth();
        BigDecimal spent = (saved.getCategory() != null)
                ? expenseRepository.sumCategoryExpenses(user.getId(), saved.getCategory().getId(), startOfMonth, endOfMonth)
                : expenseRepository.sumExpensesByDateRange(user.getId(), startOfMonth, endOfMonth);

        return entityMapper.toBudgetResponse(saved, spent);
    }

    @Transactional
    public void deleteBudget(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Budget existing = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + id));

        // Enforce user ownership
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Access denied to budget");
        }

        budgetRepository.delete(existing);
    }

    private YearMonth parseMonth(String month) {
        try {
            return YearMonth.parse(month);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Budget month must be a valid month in YYYY-MM format");
        }
    }
}

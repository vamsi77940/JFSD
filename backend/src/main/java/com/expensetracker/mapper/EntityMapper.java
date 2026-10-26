package com.expensetracker.mapper;

import com.expensetracker.dto.*;
import com.expensetracker.entity.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EntityMapper {

    public UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .currency(user.getCurrency())
                .timezone(user.getTimezone())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public ExpenseResponse toExpenseResponse(Expense expense) {
        if (expense == null) return null;
        Long categoryId = expense.getCategory() != null ? expense.getCategory().getId() : null;
        String categoryName = expense.getCategory() != null ? expense.getCategory().getName() : "Uncategorized";
        String categoryColor = expense.getCategory() != null ? expense.getCategory().getColor() : "#8b5cf6";
        String categoryIcon = expense.getCategory() != null ? expense.getCategory().getIcon() : "Tags";
        Long userId = expense.getUser() != null ? expense.getUser().getId() : null;

        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .categoryId(categoryId)
                .categoryName(categoryName)
                .categoryColor(categoryColor)
                .categoryIcon(categoryIcon)
                .paymentMethod(expense.getPaymentMethod())
                .expenseDate(expense.getExpenseDate())
                .date(expense.getExpenseDate())
                .notes(expense.getNotes())
                .userId(userId)
                .createdAt(expense.getCreatedAt())
                .build();
    }

    public IncomeResponse toIncomeResponse(Income income) {
        if (income == null) return null;
        Long userId = income.getUser() != null ? income.getUser().getId() : null;
        String sourceLabel = income.getSource() != null ? income.getSource().name() : "";

        return IncomeResponse.builder()
                .id(income.getId())
                .title(income.getTitle())
                .amount(income.getAmount())
                .source(income.getSource())
                .sourceLabel(sourceLabel)
                .incomeDate(income.getIncomeDate())
                .date(income.getIncomeDate())
                .notes(income.getNotes())
                .userId(userId)
                .createdAt(income.getCreatedAt())
                .build();
    }

    public BudgetResponse toBudgetResponse(Budget budget, BigDecimal spent) {
        if (budget == null) return null;
        Long categoryId = budget.getCategory() != null ? budget.getCategory().getId() : null;
        String categoryName = budget.getCategory() != null ? budget.getCategory().getName() : "Overall Monthly Budget";
        Long userId = budget.getUser() != null ? budget.getUser().getId() : null;

        return BudgetResponse.builder()
                .id(budget.getId())
                .month(budget.getBudgetMonth())
                .budgetMonth(budget.getBudgetMonth())
                .categoryId(categoryId)
                .categoryName(categoryName)
                .amount(budget.getAmount())
                .spent(spent != null ? spent : BigDecimal.ZERO)
                .userId(userId)
                .createdAt(budget.getCreatedAt())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        Long userId = category.getUser() != null ? category.getUser().getId() : null;

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isCustom(category.getIsCustom())
                .userId(userId)
                .createdAt(category.getCreatedAt())
                .build();
    }

    public SavingsGoalResponse toSavingsGoalResponse(SavingsGoal goal) {
        if (goal == null) return null;
        return SavingsGoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .targetDate(goal.getTargetDate())
                .userId(goal.getUser() != null ? goal.getUser().getId() : null)
                .createdAt(goal.getCreatedAt())
                .build();
    }
}

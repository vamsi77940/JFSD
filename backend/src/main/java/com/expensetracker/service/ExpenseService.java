package com.expensetracker.service;

import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AuthService authService;
    private final CategoryService categoryService;
    private final EntityMapper entityMapper;

    public List<ExpenseResponse> getUserExpenses() {
        User user = authService.getCurrentAuthenticatedUser();
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(user.getId())
                .stream()
                .map(entityMapper::toExpenseResponse)
                .toList();
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Category category = categoryService.validateAndGetCategory(request.getCategoryId(), user.getId());

        Expense expense = Expense.builder()
                .title(request.getTitle().trim())
                .amount(request.getAmount())
                .category(category)
                .paymentMethod(request.getPaymentMethod())
                .expenseDate(request.getExpenseDate())
                .notes(request.getNotes())
                .user(user)
                .build();

        Expense saved = expenseRepository.save(expense);
        return entityMapper.toExpenseResponse(saved);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense record not found with id: " + id));

        // Enforce user ownership
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Access denied to expense record");
        }

        // Validate that user has access to the target category
        Category category = categoryService.validateAndGetCategory(request.getCategoryId(), user.getId());

        existing.setTitle(request.getTitle().trim());
        existing.setAmount(request.getAmount());
        existing.setCategory(category);
        existing.setPaymentMethod(request.getPaymentMethod());
        existing.setExpenseDate(request.getExpenseDate());
        existing.setNotes(request.getNotes());

        Expense updated = expenseRepository.save(existing);
        return entityMapper.toExpenseResponse(updated);
    }

    @Transactional
    public void deleteExpense(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense record not found with id: " + id));

        // Enforce user ownership
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Access denied to expense record");
        }

        expenseRepository.delete(existing);
    }
}

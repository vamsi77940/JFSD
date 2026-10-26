package com.expensetracker.service;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.entity.Budget;

import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private AuthService authService;

    @Mock
    private CategoryService categoryService;

    @Spy
    private EntityMapper entityMapper;

    @InjectMocks
    private BudgetService budgetService;

    @Test
    void testDeleteBudget_DifferentUser_ThrowsSecurityException() {
        User loggedInUser = User.builder().id(1L).email("user1@example.in").build();
        User ownerUser = User.builder().id(2L).email("user2@example.in").build();

        Budget budget = Budget.builder()
                .id(10L)
                .budgetMonth("2026-10")
                .amount(new BigDecimal("20000.00"))
                .user(ownerUser)
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(loggedInUser);
        when(budgetRepository.findById(10L)).thenReturn(Optional.of(budget));

        assertThrows(SecurityException.class, () -> budgetService.deleteBudget(10L));
        verify(budgetRepository, never()).delete(any());
    }

    @Test
    void testSetBudget_UnauthorizedCategory_ThrowsSecurityException() {
        User loggedInUser = User.builder().id(1L).email("user1@example.in").build();

        BudgetRequest request = BudgetRequest.builder()
                .month("2026-10")
                .categoryId(99L)
                .amount(new BigDecimal("5000.00"))
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(loggedInUser);
        when(categoryService.validateAndGetCategory(99L, 1L))
                .thenThrow(new SecurityException("Unauthorized: Category does not belong to the current user"));

        assertThrows(SecurityException.class, () -> budgetService.setBudget(request));
        verify(budgetRepository, never()).save(any());
    }

    @Test
    void testGetUserBudgets_InvalidCalendarMonth_ThrowsBadRequestError() {
        User loggedInUser = User.builder().id(1L).build();
        when(authService.getCurrentAuthenticatedUser()).thenReturn(loggedInUser);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> budgetService.getUserBudgets("2026-13"));

        assertEquals("Budget month must be a valid month in YYYY-MM format", error.getMessage());
        verifyNoInteractions(budgetRepository);
    }
}

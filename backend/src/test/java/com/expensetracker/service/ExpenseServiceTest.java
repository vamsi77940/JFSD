package com.expensetracker.service;

import com.expensetracker.dto.ExpenseRequest;

import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private AuthService authService;

    @Mock
    private CategoryService categoryService;

    @Spy
    private EntityMapper entityMapper;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    void testUpdateExpense_DifferentUser_ThrowsSecurityException() {
        User loggedInUser = User.builder().id(1L).email("user1@example.in").build();
        User ownerUser = User.builder().id(2L).email("user2@example.in").build();

        Expense expense = Expense.builder()
                .id(100L)
                .title("Original Title")
                .amount(new BigDecimal("500.00"))
                .user(ownerUser)
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(loggedInUser);
        when(expenseRepository.findById(100L)).thenReturn(Optional.of(expense));

        ExpenseRequest request = ExpenseRequest.builder()
                .title("Hacked Title")
                .amount(new BigDecimal("100.00"))
                .categoryId(1L)
                .expenseDate(LocalDate.now())
                .build();

        assertThrows(SecurityException.class, () -> expenseService.updateExpense(100L, request));
        verify(expenseRepository, never()).save(any());
    }

    @Test
    void testDeleteExpense_DifferentUser_ThrowsSecurityException() {
        User loggedInUser = User.builder().id(1L).email("user1@example.in").build();
        User ownerUser = User.builder().id(2L).email("user2@example.in").build();

        Expense expense = Expense.builder()
                .id(100L)
                .title("Hostel Rent")
                .amount(new BigDecimal("5000.00"))
                .user(ownerUser)
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(loggedInUser);
        when(expenseRepository.findById(100L)).thenReturn(Optional.of(expense));

        assertThrows(SecurityException.class, () -> expenseService.deleteExpense(100L));
        verify(expenseRepository, never()).delete(any());
    }
}

package com.expensetracker.service;

import com.expensetracker.entity.Income;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.IncomeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncomeServiceTest {

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private AuthService authService;

    @Spy
    private EntityMapper entityMapper;

    @InjectMocks
    private IncomeService incomeService;

    @Test
    void updateIncome_rejectsAnotherUsersRecord() {
        User currentUser = User.builder().id(1L).build();
        Income otherUsersIncome = Income.builder()
                .id(2L)
                .user(User.builder().id(3L).build())
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(incomeRepository.findById(2L)).thenReturn(Optional.of(otherUsersIncome));

        assertThrows(SecurityException.class, () -> incomeService.updateIncome(2L, null));
        verify(incomeRepository, never()).save(any());
    }

    @Test
    void deleteIncome_rejectsAnotherUsersRecord() {
        User currentUser = User.builder().id(1L).build();
        Income otherUsersIncome = Income.builder()
                .id(2L)
                .user(User.builder().id(3L).build())
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(incomeRepository.findById(2L)).thenReturn(Optional.of(otherUsersIncome));

        assertThrows(SecurityException.class, () -> incomeService.deleteIncome(2L));
        verify(incomeRepository, never()).delete(any());
    }
}

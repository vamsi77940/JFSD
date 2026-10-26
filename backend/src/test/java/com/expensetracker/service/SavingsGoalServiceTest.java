package com.expensetracker.service;

import com.expensetracker.entity.SavingsGoal;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.SavingsGoalRepository;
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
class SavingsGoalServiceTest {

    @Mock
    private SavingsGoalRepository savingsGoalRepository;

    @Mock
    private AuthService authService;

    @Spy
    private EntityMapper entityMapper;

    @InjectMocks
    private SavingsGoalService savingsGoalService;

    @Test
    void updateGoal_rejectsAnotherUsersGoal() {
        User currentUser = User.builder().id(1L).build();
        SavingsGoal otherUsersGoal = SavingsGoal.builder()
                .id(2L)
                .user(User.builder().id(3L).build())
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(savingsGoalRepository.findById(2L)).thenReturn(Optional.of(otherUsersGoal));

        assertThrows(SecurityException.class, () -> savingsGoalService.updateGoal(2L, null));
        verify(savingsGoalRepository, never()).save(any());
    }

    @Test
    void deleteGoal_rejectsAnotherUsersGoal() {
        User currentUser = User.builder().id(1L).build();
        SavingsGoal otherUsersGoal = SavingsGoal.builder()
                .id(2L)
                .user(User.builder().id(3L).build())
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(savingsGoalRepository.findById(2L)).thenReturn(Optional.of(otherUsersGoal));

        assertThrows(SecurityException.class, () -> savingsGoalService.deleteGoal(2L));
        verify(savingsGoalRepository, never()).delete(any());
    }
}

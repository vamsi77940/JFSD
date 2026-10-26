package com.expensetracker.service;

import com.expensetracker.dto.SavingsGoalRequest;
import com.expensetracker.dto.SavingsGoalResponse;
import com.expensetracker.entity.SavingsGoal;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.SavingsGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final AuthService authService;
    private final EntityMapper entityMapper;

    public List<SavingsGoalResponse> getUserGoals() {
        User user = authService.getCurrentAuthenticatedUser();
        return savingsGoalRepository.findByUserIdOrderByTargetDateAsc(user.getId())
                .stream()
                .map(entityMapper::toSavingsGoalResponse)
                .toList();
    }

    @Transactional
    public SavingsGoalResponse createGoal(SavingsGoalRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        SavingsGoal goal = SavingsGoal.builder()
                .title(request.getTitle().trim())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount())
                .targetDate(request.getTargetDate())
                .user(user)
                .build();
        return entityMapper.toSavingsGoalResponse(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse updateGoal(Long id, SavingsGoalRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        SavingsGoal goal = getOwnedGoal(id, user);
        goal.setTitle(request.getTitle().trim());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentAmount(request.getCurrentAmount());
        goal.setTargetDate(request.getTargetDate());
        return entityMapper.toSavingsGoalResponse(savingsGoalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        savingsGoalRepository.delete(getOwnedGoal(id, user));
    }

    private SavingsGoal getOwnedGoal(Long id, User user) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Savings goal not found with id: " + id));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Access denied to savings goal");
        }
        return goal;
    }
}

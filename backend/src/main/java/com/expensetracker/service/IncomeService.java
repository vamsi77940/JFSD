package com.expensetracker.service;

import com.expensetracker.dto.IncomeRequest;
import com.expensetracker.dto.IncomeResponse;
import com.expensetracker.entity.Income;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final AuthService authService;
    private final EntityMapper entityMapper;

    public List<IncomeResponse> getUserIncome() {
        User user = authService.getCurrentAuthenticatedUser();
        return incomeRepository.findByUserIdOrderByIncomeDateDesc(user.getId())
                .stream()
                .map(entityMapper::toIncomeResponse)
                .toList();
    }

    @Transactional
    public IncomeResponse createIncome(IncomeRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Income income = Income.builder()
                .title(request.getTitle().trim())
                .amount(request.getAmount())
                .source(request.getSource())
                .incomeDate(request.getIncomeDate())
                .notes(request.getNotes())
                .user(user)
                .build();

        Income saved = incomeRepository.save(income);
        return entityMapper.toIncomeResponse(saved);
    }

    @Transactional
    public IncomeResponse updateIncome(Long id, IncomeRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Income existing = incomeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Income record not found with id: " + id));

        // Enforce user ownership
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Access denied to income record");
        }

        existing.setTitle(request.getTitle().trim());
        existing.setAmount(request.getAmount());
        existing.setSource(request.getSource());
        existing.setIncomeDate(request.getIncomeDate());
        existing.setNotes(request.getNotes());

        Income updated = incomeRepository.save(existing);
        return entityMapper.toIncomeResponse(updated);
    }

    @Transactional
    public void deleteIncome(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Income existing = incomeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Income record not found with id: " + id));

        // Enforce user ownership
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Access denied to income record");
        }

        incomeRepository.delete(existing);
    }
}

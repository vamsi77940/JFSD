package com.expensetracker.repository;

import com.expensetracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndBudgetMonth(Long userId, String budgetMonth);

    Optional<Budget> findByUserIdAndBudgetMonthAndCategoryId(Long userId, String budgetMonth, Long categoryId);

    Optional<Budget> findByUserIdAndBudgetMonthAndCategoryIsNull(Long userId, String budgetMonth);
}

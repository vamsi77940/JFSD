package com.expensetracker.dto;

import com.expensetracker.entity.Expense.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private String title;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private PaymentMethod paymentMethod;
    private LocalDate expenseDate;
    private LocalDate date;
    private String notes;
    private Long userId;
    private LocalDateTime createdAt;
}

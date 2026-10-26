package com.expensetracker.dto;

import com.expensetracker.entity.Income.IncomeSource;
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
public class IncomeResponse {
    private Long id;
    private String title;
    private BigDecimal amount;
    private IncomeSource source;
    private String sourceLabel;
    private LocalDate incomeDate;
    private LocalDate date;
    private String notes;
    private Long userId;
    private LocalDateTime createdAt;
}

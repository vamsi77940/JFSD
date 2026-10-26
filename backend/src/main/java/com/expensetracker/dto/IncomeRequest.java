package com.expensetracker.dto;

import com.expensetracker.entity.Income.IncomeSource;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeRequest {

    @NotBlank(message = "Income title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Income source is required")
    @Builder.Default
    private IncomeSource source = IncomeSource.SALARY;

    @NotNull(message = "Income date is required")
    @JsonAlias({"date", "incomeDate"})
    private LocalDate incomeDate;

    private String notes;
}

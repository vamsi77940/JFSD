package com.expensetracker.dto;

import com.expensetracker.entity.Category.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 60, message = "Category name cannot exceed 60 characters")
    private String name;

    @Builder.Default
    private CategoryType type = CategoryType.EXPENSE;

    @Builder.Default
    private String icon = "Tags";

    @Builder.Default
    private String color = "#8b5cf6";
}

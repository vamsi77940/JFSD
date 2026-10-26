package com.expensetracker.dto;

import com.expensetracker.entity.Category.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private CategoryType type;
    private String icon;
    private String color;
    private Boolean isCustom;
    private Long userId;
    private LocalDateTime createdAt;
}

package com.expensetracker.service;

import com.expensetracker.dto.CategoryRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuthService authService;
    private final EntityMapper entityMapper;

    public List<CategoryResponse> getAllCategories() {
        User user = authService.getCurrentAuthenticatedUser();
        return categoryRepository.findSystemAndUserCategories(user.getId())
                .stream()
                .map(entityMapper::toCategoryResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Category category = Category.builder()
                .name(request.getName().trim())
                .type(request.getType() != null ? request.getType() : Category.CategoryType.EXPENSE)
                .icon(request.getIcon() != null ? request.getIcon() : "Tags")
                .color(request.getColor() != null ? request.getColor() : "#8b5cf6")
                .isCustom(true)
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        return entityMapper.toCategoryResponse(saved);
    }

    @Transactional
    public void deleteCategory(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));

        // Enforce user ownership: System categories cannot be deleted
        if (!Boolean.TRUE.equals(category.getIsCustom()) || category.getUser() == null) {
            throw new SecurityException("Default system categories cannot be deleted");
        }

        // Prevent cross-user access: Cannot delete category belonging to another user
        if (!category.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Cannot delete category belonging to another user");
        }

        categoryRepository.delete(category);
    }

    public Category validateAndGetCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));

        // System category or user's own category
        if (Boolean.TRUE.equals(category.getIsCustom())) {
            if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
                throw new SecurityException("Unauthorized: Category does not belong to the current user");
            }
        }
        return category;
    }
}

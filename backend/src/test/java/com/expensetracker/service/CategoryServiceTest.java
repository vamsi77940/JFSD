package com.expensetracker.service;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuthService authService;

    @Spy
    private EntityMapper entityMapper;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void testDeleteCategory_SystemCategory_ThrowsSecurityException() {
        User loggedInUser = User.builder().id(1L).email("user1@example.in").build();

        Category systemCat = Category.builder()
                .id(1L)
                .name("Food & Dining")
                .isCustom(false)
                .user(null)
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(loggedInUser);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(systemCat));

        assertThrows(SecurityException.class, () -> categoryService.deleteCategory(1L));
        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void testDeleteCategory_DifferentUser_ThrowsSecurityException() {
        User loggedInUser = User.builder().id(1L).email("user1@example.in").build();
        User ownerUser = User.builder().id(2L).email("user2@example.in").build();

        Category customCat = Category.builder()
                .id(50L)
                .name("Crypto Trading")
                .isCustom(true)
                .user(ownerUser)
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(loggedInUser);
        when(categoryRepository.findById(50L)).thenReturn(Optional.of(customCat));

        assertThrows(SecurityException.class, () -> categoryService.deleteCategory(50L));
        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void testDeleteCategory_OwnCustomCategory_Success() {
        User loggedInUser = User.builder().id(1L).email("user1@example.in").build();

        Category customCat = Category.builder()
                .id(50L)
                .name("My Custom Category")
                .isCustom(true)
                .user(loggedInUser)
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(loggedInUser);
        when(categoryRepository.findById(50L)).thenReturn(Optional.of(customCat));

        assertDoesNotThrow(() -> categoryService.deleteCategory(50L));
        verify(categoryRepository, times(1)).delete(customCat);
    }
}

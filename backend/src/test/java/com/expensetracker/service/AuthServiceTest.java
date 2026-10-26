package com.expensetracker.service;

import com.expensetracker.dto.AuthResponse;
import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtTokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Spy
    private EntityMapper entityMapper;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testRegisterUser_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .username("testuser")
                .email("test@example.in")
                .password("Password@123")
                .fullName("Test User")
                .build();

        when(userRepository.existsByEmail("test@example.in")).thenReturn(false);
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encoded_pass");

        User savedUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.in")
                .password("encoded_pass")
                .fullName("Test User")
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateToken(1L, "test@example.in")).thenReturn("mock_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock_token", response.getToken());
        assertEquals("test@example.in", response.getUser().getEmail());
        assertEquals("Test User", response.getUser().getFullName());
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.in")
                .password("Password@123")
                .build();

        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.in")
                .password("encoded_pass")
                .fullName("Test User")
                .build();

        when(userRepository.findByEmail("test@example.in")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password@123", "encoded_pass")).thenReturn(true);
        when(tokenProvider.generateToken(1L, "test@example.in")).thenReturn("mock_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_token", response.getToken());
        assertEquals("testuser", response.getUser().getUsername());
    }

    @Test
    void testLogin_InvalidPassword_ThrowsException() {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.in")
                .password("WrongPassword")
                .build();

        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.in")
                .password("encoded_pass")
                .build();

        when(userRepository.findByEmail("test@example.in")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "encoded_pass")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void testLogin_UnknownEmail_ThrowsBadCredentialsException() {
        LoginRequest request = LoginRequest.builder()
                .email("missing@example.in")
                .password("Password@123")
                .build();

        when(userRepository.findByEmail("missing@example.in")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("missing@example.in")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void testGetCurrentAuthenticatedUser_FromSecurityContext() {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("user@example.in", null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        User user = User.builder()
                .id(5L)
                .username("user5")
                .email("user@example.in")
                .fullName("User Five")
                .build();

        when(userRepository.findByEmail("user@example.in")).thenReturn(Optional.of(user));

        User currentUser = authService.getCurrentAuthenticatedUser();

        assertNotNull(currentUser);
        assertEquals(5L, currentUser.getId());
        assertEquals("user@example.in", currentUser.getEmail());
    }

    @Test
    void testGetCurrentAuthenticatedUser_Unauthenticated_ThrowsSecurityException() {
        SecurityContextHolder.clearContext();

        assertThrows(SecurityException.class, () -> authService.getCurrentAuthenticatedUser());
    }
}

package com.expensetracker.service;

import com.expensetracker.dto.AuthResponse;
import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.dto.UserDto;
import com.expensetracker.entity.User;
import com.expensetracker.mapper.EntityMapper;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EntityMapper entityMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .currency("INR")
                .timezone("Asia/Kolkata")
                .build();

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail());
        return AuthResponse.builder()
                .token(token)
                .user(entityMapper.toUserDto(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(request.getEmail().trim()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .user(entityMapper.toUserDto(user))
                .build();
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new SecurityException("User is not authenticated");
        }

        String principalName = authentication.getName();
        return userRepository.findByEmail(principalName.toLowerCase())
                .or(() -> userRepository.findByUsername(principalName))
                .orElseThrow(() -> new SecurityException("Authenticated user not found: " + principalName));
    }

    public UserDto getCurrentUserDto() {
        return entityMapper.toUserDto(getCurrentAuthenticatedUser());
    }

    @Transactional
    public UserDto updateProfile(UserDto updateRequest) {
        User user = getCurrentAuthenticatedUser();
        if (updateRequest.getFullName() != null && !updateRequest.getFullName().trim().isEmpty()) {
            user.setFullName(updateRequest.getFullName().trim());
        }
        if (updateRequest.getCurrency() != null && !updateRequest.getCurrency().trim().isEmpty()) {
            user.setCurrency(updateRequest.getCurrency().trim());
        }
        if (updateRequest.getTimezone() != null && !updateRequest.getTimezone().trim().isEmpty()) {
            user.setTimezone(updateRequest.getTimezone().trim());
        }
        User updated = userRepository.save(user);
        return entityMapper.toUserDto(updated);
    }
}

package com.expensetracker.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String SECRET =
            "unit_test_secret_which_is_at_least_256_bits_and_not_used_outside_tests";

    @Test
    void generatedTokenValidatesAndContainsEmail() {
        JwtTokenProvider provider = createProvider(60_000);
        String token = provider.generateToken(7L, "user@example.in");

        assertTrue(provider.validateToken(token));
        assertEquals("user@example.in", provider.getEmailFromToken(token));
    }

    @Test
    void expiredAndMalformedTokensAreRejected() {
        JwtTokenProvider expiredProvider = createProvider(-1);
        String expiredToken = expiredProvider.generateToken(7L, "user@example.in");
        JwtTokenProvider validProvider = createProvider(60_000);

        assertFalse(validProvider.validateToken(expiredToken));
        assertFalse(validProvider.validateToken("not-a-jwt"));
    }

    private JwtTokenProvider createProvider(long expirationMs) {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", expirationMs);
        provider.validateSecret();
        return provider;
    }
}

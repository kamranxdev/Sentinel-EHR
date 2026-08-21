package com.sentinel.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.sentinel.security.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

public class TenantContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
                if (principal.getOrganizationId() != null) {
                    TenantContext.setCurrentOrganizationId(principal.getOrganizationId());
                }
                if (principal.getId() != null) {
                    TenantContext.setCurrentUserId(principal.getId());
                }
            }

            // Also check headers as optional fallback
            String orgHeader = request.getHeader("X-Organization-ID");
            if (orgHeader != null && !orgHeader.isBlank()) {
                try {
                    TenantContext.setCurrentOrganizationId(UUID.fromString(orgHeader));
                } catch (IllegalArgumentException ignored) {}
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}

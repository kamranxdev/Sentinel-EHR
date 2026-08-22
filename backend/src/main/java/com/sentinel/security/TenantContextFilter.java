package com.sentinel.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.sentinel.security.security.UserPrincipal;
import com.sentinel.identity.repository.UserOrganizationRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;
import org.springframework.security.access.AccessDeniedException;

import java.io.IOException;
import java.util.UUID;

@Component
public class TenantContextFilter extends OncePerRequestFilter {

    private final UserOrganizationRepository userOrganizationRepository;
    private final OrganizationRepository organizationRepository;

    public TenantContextFilter(UserOrganizationRepository userOrganizationRepository,
                               OrganizationRepository organizationRepository) {
        this.userOrganizationRepository = userOrganizationRepository;
        this.organizationRepository = organizationRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            try {
                if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
                    if (principal.getId() != null) {
                        TenantContext.setCurrentUserId(principal.getId());
                    }
                    UUID organizationId = resolveAuthorizedOrganization(principal, request.getHeader("X-Organization-ID"));
                    if (organizationId != null) {
                        TenantContext.setCurrentOrganizationId(organizationId);
                    }
                }
            } catch (AccessDeniedException ex) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, ex.getMessage());
                return;
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private UUID resolveAuthorizedOrganization(UserPrincipal principal, String requestedOrganizationId) {
        if (requestedOrganizationId != null && !requestedOrganizationId.isBlank()) {
            if ("PATIENT_PORTAL".equalsIgnoreCase(requestedOrganizationId)
                    || "SYSTEM_WIDE".equalsIgnoreCase(requestedOrganizationId)
                    || "ALL".equalsIgnoreCase(requestedOrganizationId)) {
                return principal.getOrganizationId();
            }
            final UUID organizationId;
            try {
                organizationId = UUID.fromString(requestedOrganizationId);
            } catch (IllegalArgumentException ex) {
                return principal.getOrganizationId();
            }

            boolean isSuperAdmin = principal.getRoles() != null && principal.getRoles().contains("SUPER_ADMIN");
            boolean isPatient = principal.getRoles() != null && principal.getRoles().contains("PATIENT");
            boolean isActiveMember = userOrganizationRepository
                    .existsByUserIdAndOrganizationIdAndStatus(principal.getId(), organizationId, "ACTIVE");
            if (!isSuperAdmin && !isPatient && !isActiveMember) {
                throw new AccessDeniedException("You are not a member of the requested organization");
            }
            if (isSuperAdmin && !organizationRepository.existsById(organizationId)) {
                throw new AccessDeniedException("Requested organization does not exist");
            }
            return organizationId;
        }

        if (principal.getOrganizationId() != null) {
            return principal.getOrganizationId();
        }
        return userOrganizationRepository.findFirstByUserIdAndStatusOrderByJoinedAtAsc(principal.getId(), "ACTIVE")
                .map(membership -> membership.getOrganization().getId())
                .orElse(null);
    }
}

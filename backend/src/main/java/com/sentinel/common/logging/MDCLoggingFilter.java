package com.sentinel.common.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MDCLoggingFilter extends OncePerRequestFilter {

    public static final String TRACE_ID_MDC_KEY = "traceId";
    public static final String USER_ID_MDC_KEY = "userId";
    public static final String CLIENT_IP_MDC_KEY = "clientIp";
    public static final String HTTP_METHOD_MDC_KEY = "httpMethod";
    public static final String REQUEST_URI_MDC_KEY = "requestUri";

    private static final String HEADER_REQUEST_ID = "X-Request-ID";
    private static final String HEADER_CORRELATION_ID = "X-Correlation-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String traceId = extractOrGenerateTraceId(request);
            String clientIp = extractClientIp(request);
            
            MDC.put(TRACE_ID_MDC_KEY, traceId);
            MDC.put(CLIENT_IP_MDC_KEY, clientIp);
            MDC.put(HTTP_METHOD_MDC_KEY, request.getMethod());
            MDC.put(REQUEST_URI_MDC_KEY, request.getRequestURI());

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                MDC.put(USER_ID_MDC_KEY, auth.getName());
            } else {
                MDC.put(USER_ID_MDC_KEY, "ANONYMOUS");
            }

            response.setHeader(HEADER_REQUEST_ID, traceId);

            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }

    private String extractOrGenerateTraceId(HttpServletRequest request) {
        String reqId = request.getHeader(HEADER_REQUEST_ID);
        if (!StringUtils.hasText(reqId)) {
            reqId = request.getHeader(HEADER_CORRELATION_ID);
        }
        if (StringUtils.hasText(reqId)) {
            return reqId;
        }
        return UUID.randomUUID().toString().substring(0, 8);
    }

    public static String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            String[] ips = xForwardedFor.split(",");
            if (ips.length > 0) {
                return ips[0].trim();
            }
        }
        
        String remoteAddr = request.getRemoteAddr();
        return StringUtils.hasText(remoteAddr) ? remoteAddr : "127.0.0.1";
    }
}

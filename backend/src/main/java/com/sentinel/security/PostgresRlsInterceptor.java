package com.sentinel.security;

import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PostgresRlsInterceptor implements StatementInspector {

    @Override
    public String inspect(String sql) {
        UUID orgId = TenantContext.getCurrentOrganizationId();
        UUID userId = TenantContext.getCurrentUserId();

        if (orgId != null || userId != null) {
            StringBuilder prefix = new StringBuilder();
            if (orgId != null) {
                prefix.append("SET LOCAL app.current_org_id = '").append(orgId).append("'; ");
            }
            if (userId != null) {
                prefix.append("SET LOCAL app.current_user_id = '").append(userId).append("'; ");
            }
            return prefix.toString() + sql;
        }

        return sql;
    }
}

package com.sentinel.system.controller;

import com.sentinel.audit.repository.AuditLogRepository;
import com.sentinel.common.response.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformController {

    private final long startTime = System.currentTimeMillis();
    
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final AuditLogRepository auditLogRepository;

    @Autowired
    public PlatformController(JdbcTemplate jdbcTemplate, DataSource dataSource, AuditLogRepository auditLogRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("uptimeSeconds", (System.currentTimeMillis() - startTime) / 1000);
        
        Map<String, Object> services = new HashMap<>();
        
        // Database
        Map<String, String> db = new HashMap<>();
        long dbStart = System.currentTimeMillis();
        try {
            jdbcTemplate.execute("SELECT 1");
            long dbLatency = System.currentTimeMillis() - dbStart;
            db.put("status", "ONLINE");
            if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
                com.zaxxer.hikari.HikariDataSource hikari = (com.zaxxer.hikari.HikariDataSource) dataSource;
                db.put("details", dbLatency + "ms | Max Pool Size: " + hikari.getMaximumPoolSize());
            } else {
                db.put("details", dbLatency + "ms | Connection Active");
            }
        } catch (Exception e) {
            db.put("status", "OFFLINE");
            db.put("details", "Connection Failed: " + e.getMessage());
        }
        services.put("database", db);
        
        // Audit
        Map<String, String> audit = new HashMap<>();
        try {
            long count = auditLogRepository.count();
            audit.put("status", "IMMUTABLE");
            audit.put("details", count + " Secure Records");
        } catch (Exception e) {
            audit.put("status", "OFFLINE");
            audit.put("details", "Audit Engine Error: " + e.getMessage());
        }
        services.put("audit", audit);
        
        // FHIR
        Map<String, String> fhir = new HashMap<>();
        try {
            Class.forName("ca.uhn.fhir.context.FhirContext");
            fhir.put("status", "INTEROP");
            fhir.put("details", "HAPI FHIR R4 Ready");
        } catch (Exception e) {
            fhir.put("status", "OFFLINE");
            fhir.put("details", "FHIR Gateway Unavailable");
        }
        services.put("fhir", fhir);
        
        // Core
        Map<String, String> core = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();
        long usedMem = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);
        long maxMem = runtime.maxMemory() / (1024 * 1024);
        core.put("status", "ONLINE");
        core.put("details", "Mem: " + usedMem + "MB / " + maxMem + "MB | Java " + System.getProperty("java.version"));
        services.put("core", core);
        
        data.put("services", services);
        
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}

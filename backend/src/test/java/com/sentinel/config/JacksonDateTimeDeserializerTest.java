package com.sentinel.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.scheduling.dto.CreateAppointmentRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

public class JacksonDateTimeDeserializerTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        JacksonConfig config = new JacksonConfig();
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
        objectMapper = config.objectMapper(builder);
    }

    @Test
    public void testDeserializeOffsetDateTime_WithoutOffset() throws Exception {
        // This was the exact error from the user: "2026-08-17T09:00:00"
        String json = "{\"startsAt\":\"2026-08-17T09:00:00\"}";
        CreateAppointmentRequest request = objectMapper.readValue(json, CreateAppointmentRequest.class);

        assertNotNull(request);
        assertNotNull(request.getStartsAt());
        assertEquals(2026, request.getStartsAt().getYear());
        assertEquals(8, request.getStartsAt().getMonthValue());
        assertEquals(17, request.getStartsAt().getDayOfMonth());
        assertEquals(9, request.getStartsAt().getHour());
        assertEquals(0, request.getStartsAt().getMinute());
        assertEquals(0, request.getStartsAt().getSecond());
    }

    @Test
    public void testDeserializeOffsetDateTime_WithoutSeconds() throws Exception {
        String json = "{\"startsAt\":\"2026-08-17T09:00\"}";
        CreateAppointmentRequest request = objectMapper.readValue(json, CreateAppointmentRequest.class);

        assertNotNull(request);
        assertNotNull(request.getStartsAt());
        assertEquals(2026, request.getStartsAt().getYear());
        assertEquals(8, request.getStartsAt().getMonthValue());
        assertEquals(17, request.getStartsAt().getDayOfMonth());
        assertEquals(9, request.getStartsAt().getHour());
    }

    @Test
    public void testDeserializeOffsetDateTime_WithUtcOffset() throws Exception {
        String json = "{\"startsAt\":\"2026-08-17T09:00:00Z\"}";
        CreateAppointmentRequest request = objectMapper.readValue(json, CreateAppointmentRequest.class);

        assertNotNull(request);
        assertNotNull(request.getStartsAt());
        assertEquals(ZoneOffset.UTC, request.getStartsAt().getOffset());
        assertEquals(9, request.getStartsAt().getHour());
    }

    @Test
    public void testDeserializeOffsetDateTime_WithSpecificOffset() throws Exception {
        String json = "{\"startsAt\":\"2026-08-17T09:00:00+05:30\"}";
        CreateAppointmentRequest request = objectMapper.readValue(json, CreateAppointmentRequest.class);

        assertNotNull(request);
        assertNotNull(request.getStartsAt());
        assertEquals(ZoneOffset.ofHoursMinutes(5, 30), request.getStartsAt().getOffset());
    }

    @Test
    public void testDeserializeOffsetDateTime_WithSpaceSeparator() throws Exception {
        String json = "{\"startsAt\":\"2026-08-17 09:00:00\"}";
        CreateAppointmentRequest request = objectMapper.readValue(json, CreateAppointmentRequest.class);

        assertNotNull(request);
        assertNotNull(request.getStartsAt());
        assertEquals(9, request.getStartsAt().getHour());
    }

    @Test
    public void testDeserializeOffsetDateTime_DateOnly() throws Exception {
        String json = "{\"startsAt\":\"2026-08-17\"}";
        CreateAppointmentRequest request = objectMapper.readValue(json, CreateAppointmentRequest.class);

        assertNotNull(request);
        assertNotNull(request.getStartsAt());
        assertEquals(2026, request.getStartsAt().getYear());
        assertEquals(8, request.getStartsAt().getMonthValue());
        assertEquals(17, request.getStartsAt().getDayOfMonth());
    }

    @Test
    public void testDeserializeLocalDateTime_Flexible() throws Exception {
        record TestLdt(LocalDateTime time) {}

        TestLdt r1 = objectMapper.readValue("{\"time\":\"2026-08-17T09:00:00\"}", TestLdt.class);
        assertEquals(2026, r1.time().getYear());
        assertEquals(9, r1.time().getHour());

        TestLdt r2 = objectMapper.readValue("{\"time\":\"2026-08-17T09:00:00Z\"}", TestLdt.class);
        assertNotNull(r2.time());

        TestLdt r3 = objectMapper.readValue("{\"time\":\"2026-08-17 09:00:00\"}", TestLdt.class);
        assertEquals(9, r3.time().getHour());
    }

    @Test
    public void testDeserializeLocalDate_Flexible() throws Exception {
        record TestLd(LocalDate date) {}

        TestLd r1 = objectMapper.readValue("{\"date\":\"2026-08-17\"}", TestLd.class);
        assertEquals(LocalDate.of(2026, 8, 17), r1.date());

        TestLd r2 = objectMapper.readValue("{\"date\":\"2026-08-17T09:00:00Z\"}", TestLd.class);
        assertEquals(LocalDate.of(2026, 8, 17), r2.date());
    }
}

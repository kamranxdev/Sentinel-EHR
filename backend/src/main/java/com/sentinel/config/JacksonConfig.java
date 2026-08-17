package com.sentinel.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAccessor;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        SimpleModule module = createSimpleDateTimeModule();
        ObjectMapper objectMapper = builder.createXmlMapper(false).build();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.registerModule(module);
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.disable(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return objectMapper;
    }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            builder.modules(new JavaTimeModule(), createSimpleDateTimeModule());
            builder.deserializerByType(OffsetDateTime.class, new FlexibleOffsetDateTimeDeserializer());
            builder.deserializerByType(LocalDateTime.class, new FlexibleLocalDateTimeDeserializer());
            builder.deserializerByType(Instant.class, new FlexibleInstantDeserializer());
            builder.deserializerByType(LocalDate.class, new FlexibleLocalDateDeserializer());
            builder.featuresToDisable(
                    SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
                    DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE,
                    DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES
            );
        };
    }

    private static SimpleModule createSimpleDateTimeModule() {
        SimpleModule module = new SimpleModule("SentinelDateTimeModule");
        module.addDeserializer(OffsetDateTime.class, new FlexibleOffsetDateTimeDeserializer());
        module.addDeserializer(LocalDateTime.class, new FlexibleLocalDateTimeDeserializer());
        module.addDeserializer(Instant.class, new FlexibleInstantDeserializer());
        module.addDeserializer(LocalDate.class, new FlexibleLocalDateDeserializer());
        return module;
    }

    public static class FlexibleOffsetDateTimeDeserializer extends JsonDeserializer<OffsetDateTime> {
        @Override
        public OffsetDateTime deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            String text = parser.getText();
            if (text == null || text.trim().isEmpty()) {
                return null;
            }
            text = text.trim();

            if (text.matches("^-?\\d+$")) {
                long val = Long.parseLong(text);
                Instant instant = (val > 100000000000L || val < -100000000000L)
                        ? Instant.ofEpochMilli(val)
                        : Instant.ofEpochSecond(val);
                return instant.atZone(ZoneId.systemDefault()).toOffsetDateTime();
            }

            if (text.contains(" ") && !text.contains("T")) {
                text = text.replace(' ', 'T');
            }

            try {
                return OffsetDateTime.parse(text);
            } catch (DateTimeParseException ignored) {}

            try {
                TemporalAccessor parsed = DateTimeFormatter.ISO_DATE_TIME.parseBest(
                        text,
                        OffsetDateTime::from,
                        ZonedDateTime::from,
                        LocalDateTime::from,
                        LocalDate::from
                );
                if (parsed instanceof OffsetDateTime odt) {
                    return odt;
                } else if (parsed instanceof ZonedDateTime zdt) {
                    return zdt.toOffsetDateTime();
                } else if (parsed instanceof LocalDateTime ldt) {
                    return ldt.atZone(ZoneId.systemDefault()).toOffsetDateTime();
                } else if (parsed instanceof LocalDate ld) {
                    return ld.atStartOfDay(ZoneId.systemDefault()).toOffsetDateTime();
                }
            } catch (DateTimeParseException ignored) {}

            try {
                return LocalDateTime.parse(text).atZone(ZoneId.systemDefault()).toOffsetDateTime();
            } catch (DateTimeParseException ignored) {}

            try {
                return Instant.parse(text).atZone(ZoneId.systemDefault()).toOffsetDateTime();
            } catch (DateTimeParseException ignored) {}

            try {
                return LocalDate.parse(text).atStartOfDay(ZoneId.systemDefault()).toOffsetDateTime();
            } catch (DateTimeParseException e) {
                throw new InvalidFormatException(parser, "Cannot parse OffsetDateTime from: " + text, text, OffsetDateTime.class);
            }
        }
    }

    public static class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            String text = parser.getText();
            if (text == null || text.trim().isEmpty()) {
                return null;
            }
            text = text.trim();

            if (text.matches("^-?\\d+$")) {
                long val = Long.parseLong(text);
                Instant instant = (val > 100000000000L || val < -100000000000L)
                        ? Instant.ofEpochMilli(val)
                        : Instant.ofEpochSecond(val);
                return instant.atZone(ZoneId.systemDefault()).toLocalDateTime();
            }

            if (text.contains(" ") && !text.contains("T")) {
                text = text.replace(' ', 'T');
            }

            try {
                return LocalDateTime.parse(text);
            } catch (DateTimeParseException ignored) {}

            try {
                TemporalAccessor parsed = DateTimeFormatter.ISO_DATE_TIME.parseBest(
                        text,
                        OffsetDateTime::from,
                        ZonedDateTime::from,
                        LocalDateTime::from,
                        LocalDate::from
                );
                if (parsed instanceof LocalDateTime ldt) {
                    return ldt;
                } else if (parsed instanceof OffsetDateTime odt) {
                    return odt.atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
                } else if (parsed instanceof ZonedDateTime zdt) {
                    return zdt.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
                } else if (parsed instanceof LocalDate ld) {
                    return ld.atStartOfDay();
                }
            } catch (DateTimeParseException ignored) {}

            try {
                return OffsetDateTime.parse(text).atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
            } catch (DateTimeParseException ignored) {}

            try {
                return Instant.parse(text).atZone(ZoneId.systemDefault()).toLocalDateTime();
            } catch (DateTimeParseException ignored) {}

            try {
                return LocalDate.parse(text).atStartOfDay();
            } catch (DateTimeParseException e) {
                throw new InvalidFormatException(parser, "Cannot parse LocalDateTime from: " + text, text, LocalDateTime.class);
            }
        }
    }

    public static class FlexibleInstantDeserializer extends JsonDeserializer<Instant> {
        @Override
        public Instant deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            String text = parser.getText();
            if (text == null || text.trim().isEmpty()) {
                return null;
            }
            text = text.trim();

            if (text.matches("^-?\\d+$")) {
                long val = Long.parseLong(text);
                return (val > 100000000000L || val < -100000000000L)
                        ? Instant.ofEpochMilli(val)
                        : Instant.ofEpochSecond(val);
            }

            if (text.contains(" ") && !text.contains("T")) {
                text = text.replace(' ', 'T');
            }

            try {
                return Instant.parse(text);
            } catch (DateTimeParseException ignored) {}

            try {
                return OffsetDateTime.parse(text).toInstant();
            } catch (DateTimeParseException ignored) {}

            try {
                TemporalAccessor parsed = DateTimeFormatter.ISO_DATE_TIME.parseBest(
                        text,
                        OffsetDateTime::from,
                        ZonedDateTime::from,
                        LocalDateTime::from,
                        LocalDate::from
                );
                if (parsed instanceof OffsetDateTime odt) {
                    return odt.toInstant();
                } else if (parsed instanceof ZonedDateTime zdt) {
                    return zdt.toInstant();
                } else if (parsed instanceof LocalDateTime ldt) {
                    return ldt.atZone(ZoneId.systemDefault()).toInstant();
                } else if (parsed instanceof LocalDate ld) {
                    return ld.atStartOfDay(ZoneId.systemDefault()).toInstant();
                }
            } catch (DateTimeParseException ignored) {}

            try {
                return LocalDateTime.parse(text).atZone(ZoneId.systemDefault()).toInstant();
            } catch (DateTimeParseException ignored) {}

            try {
                return LocalDate.parse(text).atStartOfDay(ZoneId.systemDefault()).toInstant();
            } catch (DateTimeParseException e) {
                throw new InvalidFormatException(parser, "Cannot parse Instant from: " + text, text, Instant.class);
            }
        }
    }

    public static class FlexibleLocalDateDeserializer extends JsonDeserializer<LocalDate> {
        @Override
        public LocalDate deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            String text = parser.getText();
            if (text == null || text.trim().isEmpty()) {
                return null;
            }
            text = text.trim();

            if (text.matches("^-?\\d+$")) {
                long val = Long.parseLong(text);
                Instant instant = (val > 100000000000L || val < -100000000000L)
                        ? Instant.ofEpochMilli(val)
                        : Instant.ofEpochSecond(val);
                return instant.atZone(ZoneId.systemDefault()).toLocalDate();
            }

            try {
                return LocalDate.parse(text);
            } catch (DateTimeParseException ignored) {}

            if (text.contains(" ") && !text.contains("T")) {
                text = text.replace(' ', 'T');
            }

            try {
                TemporalAccessor parsed = DateTimeFormatter.ISO_DATE_TIME.parseBest(
                        text,
                        LocalDate::from,
                        LocalDateTime::from,
                        OffsetDateTime::from,
                        ZonedDateTime::from
                );
                if (parsed instanceof LocalDate ld) {
                    return ld;
                } else if (parsed instanceof LocalDateTime ldt) {
                    return ldt.toLocalDate();
                } else if (parsed instanceof OffsetDateTime odt) {
                    return odt.toLocalDate();
                } else if (parsed instanceof ZonedDateTime zdt) {
                    return zdt.toLocalDate();
                }
            } catch (DateTimeParseException ignored) {}

            try {
                return LocalDateTime.parse(text).toLocalDate();
            } catch (DateTimeParseException ignored) {}

            try {
                return OffsetDateTime.parse(text).toLocalDate();
            } catch (DateTimeParseException ignored) {}

            try {
                return Instant.parse(text).atZone(ZoneId.systemDefault()).toLocalDate();
            } catch (DateTimeParseException e) {
                throw new InvalidFormatException(parser, "Cannot parse LocalDate from: " + text, text, LocalDate.class);
            }
        }
    }
}


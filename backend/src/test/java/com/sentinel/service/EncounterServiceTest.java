package com.sentinel.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.encounters.service.EncounterService;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class EncounterServiceTest {

    private EncounterRepository encounterRepository;
    private PatientRepository patientRepository;
    private UserRepository userRepository;

    private EncounterService encounterService;

    private Patient testPatient;
    private User testProvider;
    private Encounter testEncounter;

    @BeforeEach
    public void setUp() {
        encounterRepository = mock(EncounterRepository.class);
        patientRepository = mock(PatientRepository.class);
        userRepository = mock(UserRepository.class);

        encounterService = new EncounterService(encounterRepository, patientRepository, userRepository);

        testPatient = new Patient();
        testPatient.setId(1L);
        testPatient.setFullName("Kamran Khan");

        testProvider = new User();
        testProvider.setId(10L);
        testProvider.setUsername("doctor_mahtab");
        testProvider.setFullName("Dr. Mahtab");

        testEncounter = new Encounter();
        testEncounter.setId(100L);
        testEncounter.setPatient(testPatient);
        testEncounter.setAttendingProvider(testProvider);
        testEncounter.setEncounterType("AMBULATORY");
        testEncounter.setStatus("ACTIVE");
        testEncounter.setEncounterDate(LocalDateTime.now());
    }

    @Test
    public void testGetEncountersByPatientId_ReturnsList() {
        when(encounterRepository.findByPatientIdOrderByEncounterDateDesc(1L))
                .thenReturn(List.of(testEncounter));

        List<Encounter> encounters = encounterService.getEncountersByPatientId(1L);

        assertNotNull(encounters);
        assertEquals(1, encounters.size());
        assertEquals("AMBULATORY", encounters.get(0).getEncounterType());
        verify(encounterRepository, times(1)).findByPatientIdOrderByEncounterDateDesc(1L);
    }

    @Test
    public void testGetEncounterById_Found() {
        when(encounterRepository.findById(100L)).thenReturn(Optional.of(testEncounter));

        Optional<Encounter> result = encounterService.getEncounterById(100L);

        assertTrue(result.isPresent());
        assertEquals(100L, result.get().getId());
    }

    @Test
    public void testGetEncounterById_NotFound() {
        when(encounterRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Encounter> result = encounterService.getEncounterById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    public void testCreateEncounter_WithImplicitProvider() {
        Encounter input = new Encounter();
        input.setPatient(testPatient);
        input.setEncounterType("INPATIENT");

        when(userRepository.findByUsername("doctor_mahtab")).thenReturn(Optional.of(testProvider));
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(i -> {
            Encounter saved = i.getArgument(0);
            saved.setId(200L);
            return saved;
        });

        Encounter created = encounterService.createEncounter(input, "doctor_mahtab");

        assertNotNull(created);
        assertEquals(200L, created.getId());
        assertEquals(testPatient, created.getPatient());
        assertEquals(testProvider, created.getAttendingProvider());
        verify(encounterRepository, times(1)).save(any(Encounter.class));
    }

    @Test
    public void testCreateEncounter_WithExplicitProvider() {
        User otherProvider = new User();
        otherProvider.setId(20L);
        otherProvider.setUsername("doctor_rajesh");

        Encounter input = new Encounter();
        input.setPatient(testPatient);
        input.setAttendingProvider(otherProvider); // explicit provider set

        when(userRepository.findByUsername("doctor_mahtab")).thenReturn(Optional.of(testProvider));
        when(userRepository.findById(20L)).thenReturn(Optional.of(otherProvider));
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(i -> i.getArgument(0));

        Encounter created = encounterService.createEncounter(input, "doctor_mahtab");

        assertEquals(otherProvider, created.getAttendingProvider());
    }

    @Test
    public void testCreateEncounter_MissingPatientId_ThrowsException() {
        Encounter input = new Encounter();
        // no patient set

        assertThrows(IllegalArgumentException.class,
                () -> encounterService.createEncounter(input, "doctor_mahtab"));

        verify(encounterRepository, never()).save(any());
    }

    @Test
    public void testCreateEncounter_PatientNotFound_ThrowsException() {
        Encounter input = new Encounter();
        input.setPatient(testPatient);

        when(userRepository.findByUsername("doctor_mahtab")).thenReturn(Optional.of(testProvider));
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> encounterService.createEncounter(input, "doctor_mahtab"));
    }

    @Test
    public void testUpdateEncounter_UpdatesFieldsPartially() {
        Encounter update = new Encounter();
        update.setClinicalNotes("Patient responding to treatment");
        update.setStatus("COMPLETED");

        when(encounterRepository.findById(100L)).thenReturn(Optional.of(testEncounter));
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(i -> i.getArgument(0));

        Encounter updated = encounterService.updateEncounter(100L, update);

        assertEquals("Patient responding to treatment", updated.getClinicalNotes());
        assertEquals("COMPLETED", updated.getStatus());
        verify(encounterRepository, times(1)).save(testEncounter);
    }

    @Test
    public void testUpdateEncounter_NotFound_ThrowsException() {
        when(encounterRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> encounterService.updateEncounter(999L, new Encounter()));
    }
}

package com.sentinel.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.nursing.entity.EmarRecord;
import com.sentinel.nursing.entity.TriageEwsRecord;
import com.sentinel.nursing.repository.EmarRecordRepository;
import com.sentinel.nursing.repository.TriageEwsRepository;
import com.sentinel.nursing.service.NursingService;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class NursingServiceTest {

    private TriageEwsRepository triageEwsRepository;
    private EmarRecordRepository emarRecordRepository;
    private PatientRepository patientRepository;
    private UserRepository userRepository;

    private NursingService nursingService;

    private Patient testPatient;
    private User testNurse;

    @BeforeEach
    public void setUp() {
        triageEwsRepository = mock(TriageEwsRepository.class);
        emarRecordRepository = mock(EmarRecordRepository.class);
        patientRepository = mock(PatientRepository.class);
        userRepository = mock(UserRepository.class);

        nursingService = new NursingService(triageEwsRepository, emarRecordRepository, patientRepository, userRepository);

        testPatient = new Patient();
        testPatient.setId(1L);
        testPatient.setFullName("Kamran Khan");

        testNurse = new User();
        testNurse.setId(5L);
        testNurse.setUsername("nurse_priya");
        testNurse.setFullName("Nurse Priya");
    }

    // --- TRIAGE TESTS ---

    @Test
    public void testSubmitTriage_Success() {
        TriageEwsRecord record = new TriageEwsRecord();
        record.setPatient(testPatient);
        record.setTriagePriority("HIGH");

        when(userRepository.findByUsername("nurse_priya")).thenReturn(Optional.of(testNurse));
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));
        when(triageEwsRepository.save(any(TriageEwsRecord.class))).thenAnswer(i -> {
            TriageEwsRecord saved = i.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        TriageEwsRecord saved = nursingService.submitTriage(record, "nurse_priya");

        assertNotNull(saved);
        assertEquals(10L, saved.getId());
        assertEquals(testNurse, saved.getRecordedBy());
        assertEquals(testPatient, saved.getPatient());
        assertEquals("HIGH", saved.getTriagePriority());
        verify(triageEwsRepository, times(1)).save(any(TriageEwsRecord.class));
    }

    @Test
    public void testSubmitTriage_MissingPatientId_ThrowsException() {
        TriageEwsRecord record = new TriageEwsRecord();
        // no patient set

        assertThrows(IllegalArgumentException.class,
                () -> nursingService.submitTriage(record, "nurse_priya"));

        verify(triageEwsRepository, never()).save(any());
    }

    @Test
    public void testSubmitTriage_StaffNotFound_ThrowsException() {
        TriageEwsRecord record = new TriageEwsRecord();
        record.setPatient(testPatient);

        when(userRepository.findByUsername("unknown_nurse")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> nursingService.submitTriage(record, "unknown_nurse"));

        verify(triageEwsRepository, never()).save(any());
    }

    @Test
    public void testSubmitTriage_PatientNotFound_ThrowsException() {
        TriageEwsRecord record = new TriageEwsRecord();
        record.setPatient(testPatient);

        when(userRepository.findByUsername("nurse_priya")).thenReturn(Optional.of(testNurse));
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> nursingService.submitTriage(record, "nurse_priya"));

        verify(triageEwsRepository, never()).save(any());
    }

    @Test
    public void testGetTriageRecordsForPatient_ReturnsList() {
        TriageEwsRecord record = new TriageEwsRecord();
        record.setId(10L);
        record.setPatient(testPatient);
        record.setTriagePriority("MEDIUM");

        when(triageEwsRepository.findByPatientIdOrderByRecordedAtDesc(1L)).thenReturn(List.of(record));

        List<TriageEwsRecord> records = nursingService.getTriageRecordsForPatient(1L);

        assertNotNull(records);
        assertEquals(1, records.size());
        assertEquals("MEDIUM", records.get(0).getTriagePriority());
    }

    // --- eMAR TESTS ---

    @Test
    public void testRecordEmarAdministration_Success() {
        EmarRecord emar = new EmarRecord();
        emar.setPatient(testPatient);
        emar.setMedicationName("Lisinopril");
        emar.setDose("10mg");

        when(userRepository.findByUsername("nurse_priya")).thenReturn(Optional.of(testNurse));
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));
        when(emarRecordRepository.save(any(EmarRecord.class))).thenAnswer(i -> {
            EmarRecord saved = i.getArgument(0);
            saved.setId(20L);
            return saved;
        });

        EmarRecord saved = nursingService.recordEmarAdministration(emar, "nurse_priya");

        assertNotNull(saved);
        assertEquals(20L, saved.getId());
        assertEquals(testNurse, saved.getAdministeredBy());
        assertEquals(testPatient, saved.getPatient());
        assertEquals("Lisinopril", saved.getMedicationName());
        verify(emarRecordRepository, times(1)).save(any(EmarRecord.class));
    }

    @Test
    public void testRecordEmarAdministration_MissingPatientId_ThrowsException() {
        EmarRecord emar = new EmarRecord();
        // no patient set

        assertThrows(IllegalArgumentException.class,
                () -> nursingService.recordEmarAdministration(emar, "nurse_priya"));

        verify(emarRecordRepository, never()).save(any());
    }

    @Test
    public void testRecordEmarAdministration_NurseNotFound_ThrowsException() {
        EmarRecord emar = new EmarRecord();
        emar.setPatient(testPatient);

        when(userRepository.findByUsername("unknown_nurse")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> nursingService.recordEmarAdministration(emar, "unknown_nurse"));

        verify(emarRecordRepository, never()).save(any());
    }

    @Test
    public void testGetEmarHistoryForPatient_ReturnsList() {
        EmarRecord emar = new EmarRecord();
        emar.setId(20L);
        emar.setPatient(testPatient);
        emar.setMedicationName("Metformin");

        when(emarRecordRepository.findByPatientIdOrderByAdministeredAtDesc(1L)).thenReturn(List.of(emar));

        List<EmarRecord> records = nursingService.getEmarHistoryForPatient(1L);

        assertNotNull(records);
        assertEquals(1, records.size());
        assertEquals("Metformin", records.get(0).getMedicationName());
    }
}

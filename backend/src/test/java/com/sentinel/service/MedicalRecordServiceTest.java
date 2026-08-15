package com.sentinel.service;

import com.sentinel.encounters.entity.MedicalRecord;
import com.sentinel.encounters.repository.MedicalRecordRepository;
import com.sentinel.encounters.service.MedicalRecordService;
import com.sentinel.common.exception.ResourceNotFoundException;
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

public class MedicalRecordServiceTest {

    private MedicalRecordRepository recordRepository;
    private PatientRepository patientRepository;
    private UserRepository userRepository;

    private MedicalRecordService medicalRecordService;

    private Patient testPatient;
    private User testDoctor;
    private MedicalRecord testRecord;

    @BeforeEach
    public void setUp() {
        recordRepository = mock(MedicalRecordRepository.class);
        patientRepository = mock(PatientRepository.class);
        userRepository = mock(UserRepository.class);

        medicalRecordService = new MedicalRecordService(recordRepository, patientRepository, userRepository);

        testPatient = new Patient();
        testPatient.setId(1L);
        testPatient.setFullName("Kamran Khan");

        testDoctor = new User();
        testDoctor.setId(10L);
        testDoctor.setUsername("doctor_mahtab");
        testDoctor.setFullName("Dr. Mahtab");

        testRecord = new MedicalRecord();
        testRecord.setId(50L);
        testRecord.setPatient(testPatient);
        testRecord.setDoctor(testDoctor);
        testRecord.setDiagnosis("Hypertension");
    }

    @Test
    public void testGetRecordsByPatientId_ReturnsList() {
        when(recordRepository.findByPatientIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(testRecord));

        List<MedicalRecord> records = medicalRecordService.getRecordsByPatientId(1L);

        assertNotNull(records);
        assertEquals(1, records.size());
        assertEquals("Hypertension", records.get(0).getDiagnosis());
        verify(recordRepository, times(1)).findByPatientIdOrderByCreatedAtDesc(1L);
    }

    @Test
    public void testGetRecordById_Found() {
        when(recordRepository.findById(50L)).thenReturn(Optional.of(testRecord));

        Optional<MedicalRecord> result = medicalRecordService.getRecordById(50L);

        assertTrue(result.isPresent());
        assertEquals(50L, result.get().getId());
    }

    @Test
    public void testGetRecordById_NotFound() {
        when(recordRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<MedicalRecord> result = medicalRecordService.getRecordById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    public void testCreateRecord_Success() {
        MedicalRecord input = new MedicalRecord();
        input.setPatient(testPatient);
        input.setDiagnosis("Type 2 Diabetes");

        when(userRepository.findByUsername("doctor_mahtab")).thenReturn(Optional.of(testDoctor));
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));
        when(recordRepository.save(any(MedicalRecord.class))).thenAnswer(i -> {
            MedicalRecord saved = i.getArgument(0);
            saved.setId(99L);
            return saved;
        });

        MedicalRecord created = medicalRecordService.createRecord(input, "doctor_mahtab");

        assertNotNull(created);
        assertEquals(99L, created.getId());
        assertEquals(testPatient, created.getPatient());
        assertEquals(testDoctor, created.getDoctor());
        assertEquals("Type 2 Diabetes", created.getDiagnosis());
        verify(recordRepository, times(1)).save(any(MedicalRecord.class));
    }

    @Test
    public void testCreateRecord_MissingPatientId_ThrowsException() {
        MedicalRecord input = new MedicalRecord();
        // no patient set

        assertThrows(IllegalArgumentException.class,
                () -> medicalRecordService.createRecord(input, "doctor_mahtab"));

        verify(recordRepository, never()).save(any());
    }

    @Test
    public void testCreateRecord_DoctorNotFound_ThrowsException() {
        MedicalRecord input = new MedicalRecord();
        input.setPatient(testPatient);

        when(userRepository.findByUsername("unknown_doctor")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> medicalRecordService.createRecord(input, "unknown_doctor"));

        verify(recordRepository, never()).save(any());
    }

    @Test
    public void testCreateRecord_PatientNotFound_ThrowsException() {
        MedicalRecord input = new MedicalRecord();
        input.setPatient(testPatient);

        when(userRepository.findByUsername("doctor_mahtab")).thenReturn(Optional.of(testDoctor));
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> medicalRecordService.createRecord(input, "doctor_mahtab"));

        verify(recordRepository, never()).save(any());
    }

    @Test
    public void testSaveRecord_DelegatesToRepository() {
        when(recordRepository.save(testRecord)).thenReturn(testRecord);

        MedicalRecord saved = medicalRecordService.saveRecord(testRecord);

        assertNotNull(saved);
        assertEquals(50L, saved.getId());
        verify(recordRepository, times(1)).save(testRecord);
    }
}

package com.sentinel.patient.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.dto.*;
import com.sentinel.patient.entity.*;
import com.sentinel.patient.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientContactService {

    private final PatientAddressRepository addressRepository;
    private final PatientPhoneNumberRepository phoneRepository;
    private final PatientEmailAddressRepository emailRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final PatientRepository patientRepository;

    public PatientContactService(PatientAddressRepository addressRepository,
                                 PatientPhoneNumberRepository phoneRepository,
                                 PatientEmailAddressRepository emailRepository,
                                 EmergencyContactRepository emergencyContactRepository,
                                 PatientRepository patientRepository) {
        this.addressRepository = addressRepository;
        this.phoneRepository = phoneRepository;
        this.emailRepository = emailRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.patientRepository = patientRepository;
    }

    // Address
    public PatientAddressResponseDTO addAddress(UUID patientId, CreateAddressRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientAddress address = new PatientAddress();
        address.setPatient(patient);
        address.setAddressType(request.getAddressType() != null ? request.getAddressType() : "HOME");
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        if (request.getCountryCode() != null) address.setCountryCode(request.getCountryCode());
        address.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);

        PatientAddress saved = addressRepository.save(address);
        return mapAddressToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientAddressResponseDTO> getAddresses(UUID patientId) {
        return addressRepository.findByPatientId(patientId).stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());
    }

    public PatientAddressResponseDTO updateAddress(UUID addressId, UpdateAddressRequest request) {
        PatientAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (request.getAddressType() != null) address.setAddressType(request.getAddressType());
        if (request.getAddressLine1() != null) address.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) address.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());
        if (request.getCountryCode() != null) address.setCountryCode(request.getCountryCode());
        if (request.getIsPrimary() != null) address.setIsPrimary(request.getIsPrimary());

        PatientAddress saved = addressRepository.save(address);
        return mapAddressToDTO(saved);
    }

    public void deleteAddress(UUID addressId) {
        addressRepository.deleteById(addressId);
    }

    // Phone
    public PatientPhoneResponseDTO addPhone(UUID patientId, CreatePhoneRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientPhoneNumber phone = new PatientPhoneNumber();
        phone.setPatient(patient);
        phone.setPhoneType(request.getPhoneType() != null ? request.getPhoneType() : "MOBILE");
        phone.setPhoneNumber(request.getPhoneNumber());
        phone.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);

        PatientPhoneNumber saved = phoneRepository.save(phone);
        return mapPhoneToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientPhoneResponseDTO> getPhones(UUID patientId) {
        return phoneRepository.findByPatientId(patientId).stream()
                .map(this::mapPhoneToDTO)
                .collect(Collectors.toList());
    }

    // Email
    public PatientEmailResponseDTO addEmail(UUID patientId, CreateEmailRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientEmailAddress email = new PatientEmailAddress();
        email.setPatient(patient);
        email.setEmailType(request.getEmailType() != null ? request.getEmailType() : "PERSONAL");
        email.setEmail(request.getEmail());
        email.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);

        PatientEmailAddress saved = emailRepository.save(email);
        return mapEmailToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientEmailResponseDTO> getEmails(UUID patientId) {
        return emailRepository.findByPatientId(patientId).stream()
                .map(this::mapEmailToDTO)
                .collect(Collectors.toList());
    }

    // Emergency Contact
    public EmergencyContactResponseDTO addEmergencyContact(UUID patientId, CreateEmergencyContactRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        EmergencyContact contact = new EmergencyContact();
        contact.setPatient(patient);
        contact.setName(request.getName());
        contact.setRelationship(request.getRelationship());
        contact.setPhone(request.getPhone());
        contact.setAlternatePhone(request.getAltPhone());
        contact.setEmail(request.getEmail());
        contact.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);

        EmergencyContact saved = emergencyContactRepository.save(contact);
        return mapContactToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<EmergencyContactResponseDTO> getEmergencyContacts(UUID patientId) {
        return emergencyContactRepository.findByPatientId(patientId).stream()
                .map(this::mapContactToDTO)
                .collect(Collectors.toList());
    }

    public EmergencyContactResponseDTO updateEmergencyContact(UUID contactId, UpdateEmergencyContactRequest request) {
        EmergencyContact contact = emergencyContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency contact not found with id: " + contactId));

        if (request.getName() != null) contact.setName(request.getName());
        if (request.getRelationship() != null) contact.setRelationship(request.getRelationship());
        if (request.getPhone() != null) contact.setPhone(request.getPhone());
        if (request.getAltPhone() != null) contact.setAlternatePhone(request.getAltPhone());
        if (request.getEmail() != null) contact.setEmail(request.getEmail());
        if (request.getIsPrimary() != null) contact.setIsPrimary(request.getIsPrimary());

        EmergencyContact saved = emergencyContactRepository.save(contact);
        return mapContactToDTO(saved);
    }

    public void deleteEmergencyContact(UUID contactId) {
        emergencyContactRepository.deleteById(contactId);
    }

    private PatientAddressResponseDTO mapAddressToDTO(PatientAddress a) {
        PatientAddressResponseDTO dto = new PatientAddressResponseDTO();
        dto.setId(a.getId());
        if (a.getPatient() != null) dto.setPatientId(a.getPatient().getId());
        dto.setAddressType(a.getAddressType());
        dto.setAddressLine1(a.getAddressLine1());
        dto.setAddressLine2(a.getAddressLine2());
        dto.setCity(a.getCity());
        dto.setState(a.getState());
        dto.setPostalCode(a.getPostalCode());
        dto.setCountryCode(a.getCountryCode());
        dto.setIsPrimary(a.getIsPrimary());
        return dto;
    }

    private PatientPhoneResponseDTO mapPhoneToDTO(PatientPhoneNumber p) {
        PatientPhoneResponseDTO dto = new PatientPhoneResponseDTO();
        dto.setId(p.getId());
        if (p.getPatient() != null) dto.setPatientId(p.getPatient().getId());
        dto.setPhoneType(p.getPhoneType());
        dto.setPhoneNumber(p.getPhoneNumber());
        dto.setIsPrimary(p.getIsPrimary());
        return dto;
    }

    private PatientEmailResponseDTO mapEmailToDTO(PatientEmailAddress e) {
        PatientEmailResponseDTO dto = new PatientEmailResponseDTO();
        dto.setId(e.getId());
        if (e.getPatient() != null) dto.setPatientId(e.getPatient().getId());
        dto.setEmailType(e.getEmailType());
        dto.setEmail(e.getEmail());
        dto.setIsPrimary(e.getIsPrimary());
        return dto;
    }

    private EmergencyContactResponseDTO mapContactToDTO(EmergencyContact c) {
        EmergencyContactResponseDTO dto = new EmergencyContactResponseDTO();
        dto.setId(c.getId());
        if (c.getPatient() != null) dto.setPatientId(c.getPatient().getId());
        dto.setName(c.getName());
        dto.setRelationship(c.getRelationship());
        dto.setPhone(c.getPhone());
        dto.setAltPhone(c.getAlternatePhone());
        dto.setEmail(c.getEmail());
        dto.setIsPrimary(c.getIsPrimary());
        return dto;
    }
}

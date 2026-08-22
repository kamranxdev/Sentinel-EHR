package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.AddCareTeamMemberRequest;
import com.sentinel.clinical.dto.CareTeamResponseDTO;
import com.sentinel.clinical.dto.CreateCareTeamRequest;
import com.sentinel.clinical.dto.InpatientCareResponseDTO;
import com.sentinel.clinical.entity.Admission;
import com.sentinel.clinical.entity.CareTeam;
import com.sentinel.clinical.entity.CareTeamMember;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.entity.EncounterLocation;
import com.sentinel.clinical.entity.EncounterParticipant;
import com.sentinel.clinical.repository.AdmissionRepository;
import com.sentinel.clinical.repository.CareTeamMemberRepository;
import com.sentinel.clinical.repository.CareTeamRepository;
import com.sentinel.clinical.repository.EncounterLocationRepository;
import com.sentinel.clinical.repository.EncounterParticipantRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.PractitionerRepository;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Bed;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CareTeamService {

    private final CareTeamRepository careTeamRepository;
    private final CareTeamMemberRepository careTeamMemberRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterParticipantRepository encounterParticipantRepository;
    private final EncounterLocationRepository encounterLocationRepository;
    private final AdmissionRepository admissionRepository;
    private final PractitionerRepository practitionerRepository;
    private final UserRepository userRepository;

    public CareTeamService(CareTeamRepository careTeamRepository,
                           CareTeamMemberRepository careTeamMemberRepository,
                           EncounterRepository encounterRepository,
                           EncounterParticipantRepository encounterParticipantRepository,
                           EncounterLocationRepository encounterLocationRepository,
                           AdmissionRepository admissionRepository,
                           PractitionerRepository practitionerRepository,
                           UserRepository userRepository) {
        this.careTeamRepository = careTeamRepository;
        this.careTeamMemberRepository = careTeamMemberRepository;
        this.encounterRepository = encounterRepository;
        this.encounterParticipantRepository = encounterParticipantRepository;
        this.encounterLocationRepository = encounterLocationRepository;
        this.admissionRepository = admissionRepository;
        this.practitionerRepository = practitionerRepository;
        this.userRepository = userRepository;
    }

    public CareTeamResponseDTO createCareTeam(UUID encounterId, CreateCareTeamRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        CareTeam careTeam = new CareTeam();
        careTeam.setOrganization(encounter.getOrganization());
        careTeam.setPatient(encounter.getPatient());
        careTeam.setEncounter(encounter);
        careTeam.setName(request != null && request.getName() != null ? request.getName() : "Care Team for Encounter " + encounter.getEncounterNumber());
        careTeam.setStatus("ACTIVE");
        careTeam.setCreatedAt(OffsetDateTime.now());

        CareTeam saved = careTeamRepository.save(careTeam);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<CareTeamResponseDTO> getEncounterCareTeams(UUID encounterId) {
        return careTeamRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CareTeamResponseDTO addMember(UUID careTeamId, AddCareTeamMemberRequest request) {
        CareTeam careTeam = careTeamRepository.findById(careTeamId)
                .orElseThrow(() -> new ResourceNotFoundException("Care team not found with id: " + careTeamId));

        CareTeamMember member = new CareTeamMember();
        member.setCareTeam(careTeam);
        member.setRole(request.getRole() != null ? request.getRole() : "PRIMARY_CARE");
        member.setStartedAt(OffsetDateTime.now());

        if (request.getPractitionerId() != null) {
            Practitioner practitioner = practitionerRepository.findById(request.getPractitionerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found with id: " + request.getPractitionerId()));
            member.setPractitioner(practitioner);
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            member.setUser(user);
        }

        careTeamMemberRepository.save(member);
        return mapToDTO(careTeam);
    }

    public CareTeamResponseDTO addEncounterMember(UUID encounterId, AddCareTeamMemberRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        CareTeam careTeam = careTeamRepository.findFirstByEncounterId(encounterId).orElseGet(() -> {
            CareTeam ct = new CareTeam();
            ct.setOrganization(encounter.getOrganization());
            ct.setPatient(encounter.getPatient());
            ct.setEncounter(encounter);
            ct.setName("Care Team for " + (encounter.getPatient() != null ? encounter.getPatient().getFullName() : "Encounter"));
            ct.setStatus("ACTIVE");
            ct.setCreatedAt(OffsetDateTime.now());
            return careTeamRepository.save(ct);
        });

        return addMember(careTeam.getId(), request);
    }


    public void removeMember(UUID careTeamId, UUID memberId) {
        CareTeamMember member = careTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Care team member not found with id: " + memberId));
        careTeamMemberRepository.delete(member);
    }

    @Transactional(readOnly = true)
    public List<InpatientCareResponseDTO> getPractitionerInpatients(UUID practitionerId, UUID userId, UUID organizationId, String roleFilter) {
        List<String> excludedStatuses = List.of("DISCHARGED", "COMPLETED", "CANCELLED");

        List<Encounter> candidateEncounters;
        if (organizationId != null) {
            candidateEncounters = encounterRepository.findByOrganizationIdAndStatusNotIn(organizationId, excludedStatuses);
        } else {
            candidateEncounters = encounterRepository.findAll().stream()
                    .filter(e -> !excludedStatuses.contains(e.getStatus()))
                    .collect(Collectors.toList());
        }

        List<InpatientCareResponseDTO> results = new ArrayList<>();

        for (Encounter enc : candidateEncounters) {
            boolean isInpatientType = "INPATIENT".equalsIgnoreCase(enc.getEncounterType()) || "OBSERVATION".equalsIgnoreCase(enc.getEncounterType());
            Optional<Admission> admOpt = admissionRepository.findByEncounterId(enc.getId());
            Optional<EncounterLocation> locOpt = encounterLocationRepository.findActiveByEncounterId(enc.getId());

            if (!isInpatientType && admOpt.isEmpty() && locOpt.isEmpty()) {
                continue;
            }

            List<CareTeam> careTeams = careTeamRepository.findByEncounterId(enc.getId());
            if (careTeams.isEmpty() && enc.getPatient() != null) {
                careTeams = careTeamRepository.findByPatientId(enc.getPatient().getId());
            }

            List<CareTeamMember> allMembers = new ArrayList<>();
            for (CareTeam ct : careTeams) {
                allMembers.addAll(careTeamMemberRepository.findByCareTeamIdAndEndedAtIsNull(ct.getId()));
            }

            List<EncounterParticipant> participants = encounterParticipantRepository.findByEncounterIdAndPeriodEndIsNull(enc.getId());

            boolean isMatch = false;
            String determinedRole = null;
            boolean isAttending = false;
            boolean isPrimaryNurse = false;

            if (practitionerId == null && userId == null) {
                isMatch = true;
                determinedRole = "CARE_TEAM";
            } else {
                if (enc.getAttendingPractitioner() != null) {
                    if ((userId != null && enc.getAttendingPractitioner().getId().equals(userId)) ||
                        (practitionerId != null && enc.getAttendingPractitioner().getId().equals(practitionerId))) {
                        isMatch = true;
                        isAttending = true;
                        determinedRole = "ATTENDING_PHYSICIAN";
                    }
                }

                for (CareTeamMember m : allMembers) {
                    if (userId != null && m.getUser() != null && m.getUser().getId().equals(userId)) {
                        isMatch = true;
                        determinedRole = m.getRole();
                        if (isAttendingRole(m.getRole())) isAttending = true;
                        if (isNurseRole(m.getRole())) isPrimaryNurse = true;
                    } else if (practitionerId != null && m.getPractitioner() != null && m.getPractitioner().getId().equals(practitionerId)) {
                        isMatch = true;
                        determinedRole = m.getRole();
                        if (isAttendingRole(m.getRole())) isAttending = true;
                        if (isNurseRole(m.getRole())) isPrimaryNurse = true;
                    }
                }

                for (EncounterParticipant p : participants) {
                    if ((userId != null && p.getPractitioner() != null && p.getPractitioner().getId().equals(userId)) ||
                        (practitionerId != null && p.getPractitioner() != null && p.getPractitioner().getId().equals(practitionerId))) {
                        isMatch = true;
                        if (determinedRole == null) {
                            determinedRole = p.getParticipantRole();
                        }
                        if (isAttendingRole(p.getParticipantRole())) isAttending = true;
                        if (isNurseRole(p.getParticipantRole())) isPrimaryNurse = true;
                    }
                }
            }

            if (!isMatch) {
                continue;
            }

            if (roleFilter != null && !roleFilter.isBlank() && !"ALL".equalsIgnoreCase(roleFilter)) {
                if (determinedRole != null && !determinedRole.equalsIgnoreCase(roleFilter)) {
                    continue;
                }
            }

            InpatientCareResponseDTO dto = new InpatientCareResponseDTO();
            dto.setEncounterId(enc.getId());
            dto.setEncounterNumber(enc.getEncounterNumber());
            dto.setEncounterType(enc.getEncounterType());
            dto.setEncounterStatus(enc.getStatus());
            dto.setMyRole(determinedRole != null ? determinedRole : (isAttending ? "ATTENDING_PHYSICIAN" : (isPrimaryNurse ? "PRIMARY_NURSE" : "CARE_TEAM")));
            dto.setIsAttending(isAttending);
            dto.setIsPrimaryNurse(isPrimaryNurse);

            Patient pat = enc.getPatient();
            if (pat != null) {
                dto.setPatientId(pat.getId());
                dto.setPatientCode(pat.getPatientCode());
                dto.setFullName(pat.getFullName());
                dto.setGender(pat.getGender());
                dto.setDateOfBirth(pat.getDateOfBirth());
                if (pat.getPerson() != null) {
                    dto.setPhoneNumber(pat.getPerson().getPhone());
                }
            }

            if (admOpt.isPresent()) {
                Admission adm = admOpt.get();
                dto.setAdmissionId(adm.getId());
                dto.setAdmissionDate(adm.getAdmittedAt());
                dto.setAdmissionDiagnosis(adm.getAdmitReason() != null ? adm.getAdmitReason() : enc.getReasonForVisit());
                dto.setAdmissionType(adm.getAdmissionType());
                dto.setAdmissionSource(adm.getAdmissionSource());
                dto.setLengthOfStayDays(adm.getLengthOfStayDays());
            } else {
                dto.setAdmissionDate(enc.getStartedAt());
                dto.setAdmissionDiagnosis(enc.getReasonForVisit() != null ? enc.getReasonForVisit() : enc.getChiefComplaint());
                dto.setAdmissionType(enc.getAdmissionType() != null ? enc.getAdmissionType() : "EMERGENCY");
                dto.setAdmissionSource(enc.getAdmissionSource());
            }

            if (dto.getAdmissionDiagnosis() == null || dto.getAdmissionDiagnosis().isBlank()) {
                dto.setAdmissionDiagnosis("Inpatient Observation & Clinical Care");
            }

            if (locOpt.isPresent()) {
                EncounterLocation loc = locOpt.get();
                Bed bed = loc.getBed();
                if (bed != null) {
                    dto.setBedId(bed.getId());
                    dto.setBedCode(bed.getBedCode() != null ? bed.getBedCode() : bed.getBedNumber());
                    dto.setBedNumber(bed.getBedNumber());
                    dto.setBedType(bed.getBedType());
                    if (bed.getWard() != null) {
                        dto.setWardId(bed.getWard().getId());
                        dto.setWardName(bed.getWard().getName());
                    }
                    if (bed.getRoom() != null) {
                        dto.setRoomNumber(bed.getRoom().getRoomNumber());
                    }
                }
            }
            if (dto.getBedCode() == null) {
                dto.setBedCode("Bed-" + enc.getId().toString().substring(0, 4).toUpperCase());
                dto.setWardName("Inpatient Ward");
            }

            if (!careTeams.isEmpty()) {
                CareTeam mainTeam = careTeams.get(0);
                dto.setCareTeamId(mainTeam.getId());
                dto.setCareTeamName(mainTeam.getName());
            }

            List<InpatientCareResponseDTO.CareTeamMemberInfoDTO> memberDTOs = new ArrayList<>();
            if (enc.getAttendingPractitioner() != null) {
                User att = enc.getAttendingPractitioner();
                memberDTOs.add(new InpatientCareResponseDTO.CareTeamMemberInfoDTO(
                        UUID.randomUUID(),
                        null,
                        att.getId(),
                        att.getFullName(),
                        "Attending Physician",
                        "PHYSICIAN",
                        "Internal Medicine",
                        att.getEmail(),
                        enc.getStartedAt()
                ));
            }

            for (CareTeamMember m : allMembers) {
                String memberName = "Care Team Member";
                String email = null;
                UUID pId = null;
                UUID uId = null;
                String specialty = null;

                if (m.getPractitioner() != null) {
                    pId = m.getPractitioner().getId();
                    specialty = m.getPractitioner().getPrimarySpecialty();
                    if (m.getPractitioner().getPerson() != null) {
                        memberName = m.getPractitioner().getPerson().getFullName();
                    }
                }
                if (m.getUser() != null) {
                    uId = m.getUser().getId();
                    email = m.getUser().getEmail();
                    if (m.getUser().getPerson() != null) {
                        memberName = m.getUser().getPerson().getFullName();
                    }
                }

                String roleStr = m.getRole() != null ? m.getRole() : "CARE_TEAM";
                String roleCat = "PHYSICIAN";
                if (roleStr.toUpperCase().contains("NURSE")) {
                    roleCat = "NURSE";
                } else if (roleStr.toUpperCase().contains("CONSULT")) {
                    roleCat = "SPECIALIST";
                } else if (roleStr.toUpperCase().contains("PHARM")) {
                    roleCat = "ALLIED_HEALTH";
                }

                boolean duplicate = false;
                for (InpatientCareResponseDTO.CareTeamMemberInfoDTO existing : memberDTOs) {
                    if ((uId != null && uId.equals(existing.getUserId())) ||
                        (pId != null && pId.equals(existing.getPractitionerId()))) {
                        duplicate = true;
                        break;
                    }
                }
                if (!duplicate) {
                    memberDTOs.add(new InpatientCareResponseDTO.CareTeamMemberInfoDTO(
                            m.getId(),
                            pId,
                            uId,
                            memberName,
                            formatRoleName(roleStr),
                            roleCat,
                            specialty != null ? specialty : "General Medicine",
                            email,
                            m.getStartedAt()
                    ));
                }
            }

            for (EncounterParticipant p : participants) {
                if (p.getPractitioner() != null) {
                    User u = p.getPractitioner();
                    boolean duplicate = false;
                    for (InpatientCareResponseDTO.CareTeamMemberInfoDTO existing : memberDTOs) {
                        if (u.getId().equals(existing.getUserId())) {
                            duplicate = true;
                            break;
                        }
                    }
                    if (!duplicate) {
                        String roleStr = p.getParticipantRole();
                        String roleCat = roleStr.toUpperCase().contains("NURSE") ? "NURSE" : "PHYSICIAN";
                        memberDTOs.add(new InpatientCareResponseDTO.CareTeamMemberInfoDTO(
                                p.getId(),
                                null,
                                u.getId(),
                                u.getFullName(),
                                formatRoleName(roleStr),
                                roleCat,
                                "General Care",
                                u.getEmail(),
                                p.getPeriodStart()
                        ));
                    }
                }
            }

            dto.setCareTeamMembers(memberDTOs);

            int ewsVal = 0;
            if (enc.getAcuity() != null && enc.getAcuity().matches("\\d+")) {
                ewsVal = Integer.parseInt(enc.getAcuity());
            }
            dto.setEwsScore(ewsVal);
            dto.setAcuityLevel(ewsVal >= 5 ? "CRITICAL" : (ewsVal >= 3 ? "OBSERVED" : "STABLE"));
            dto.setCodeStatus("FULL_CODE");
            dto.setFallRisk(ewsVal >= 3 ? "HIGH" : "LOW");
            dto.setIsolation("NONE");

            results.add(dto);
        }

        return results;
    }

    private boolean isAttendingRole(String role) {
        if (role == null) return false;
        String r = role.toUpperCase();
        return r.contains("ATTENDING") || r.contains("PRIMARY_CARE") || r.equals("PRIMARY");
    }

    private boolean isNurseRole(String role) {
        if (role == null) return false;
        String r = role.toUpperCase();
        return r.contains("NURSE");
    }

    private String formatRoleName(String role) {
        if (role == null) return "Care Team Member";
        switch (role.toUpperCase()) {
            case "ATTENDING_PHYSICIAN":
            case "ATTENDING":
                return "Attending Physician";
            case "PRIMARY":
            case "PRIMARY_CARE":
                return "Primary Attending";
            case "CONSULTING_PHYSICIAN":
            case "CONSULTANT":
                return "Consulting Specialist";
            case "PRIMARY_NURSE":
                return "Primary Bedside Nurse";
            case "CHARGE_NURSE":
                return "Charge Nurse";
            case "NURSE":
            case "STAFF_NURSE":
                return "Staff Nurse";
            case "TRIAGE_NURSE":
                return "Triage Nurse";
            case "PHARMACIST":
                return "Clinical Pharmacist";
            default:
                return role.replace("_", " ");
        }
    }

    public CareTeamResponseDTO mapToDTO(CareTeam ct) {
        CareTeamResponseDTO dto = new CareTeamResponseDTO();
        dto.setId(ct.getId());
        if (ct.getPatient() != null) dto.setPatientId(ct.getPatient().getId());
        if (ct.getEncounter() != null) dto.setEncounterId(ct.getEncounter().getId());
        dto.setName(ct.getName());
        dto.setStatus(ct.getStatus());
        dto.setCreatedAt(ct.getCreatedAt());

        List<CareTeamMember> members = careTeamMemberRepository.findByCareTeamId(ct.getId());
        dto.setMembers(members.stream()
                .map(m -> new CareTeamResponseDTO.MemberDTO(
                        m.getId(),
                        m.getPractitioner() != null ? m.getPractitioner().getId() : null,
                        m.getPractitioner() != null && m.getPractitioner().getPerson() != null ? m.getPractitioner().getPerson().getFullName() : null,
                        m.getUser() != null ? m.getUser().getId() : null,
                        m.getUser() != null ? m.getUser().getEmail() : null,
                        m.getRole(),
                        m.getStartedAt(),
                        m.getEndedAt()
                ))
                .collect(Collectors.toList()));

        return dto;
    }
}


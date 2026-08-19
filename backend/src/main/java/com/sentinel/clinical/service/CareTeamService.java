package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.AddCareTeamMemberRequest;
import com.sentinel.clinical.dto.CareTeamResponseDTO;
import com.sentinel.clinical.dto.CreateCareTeamRequest;
import com.sentinel.clinical.entity.CareTeam;
import com.sentinel.clinical.entity.CareTeamMember;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.CareTeamMemberRepository;
import com.sentinel.clinical.repository.CareTeamRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.PractitionerRepository;
import com.sentinel.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CareTeamService {

    private final CareTeamRepository careTeamRepository;
    private final CareTeamMemberRepository careTeamMemberRepository;
    private final EncounterRepository encounterRepository;
    private final PractitionerRepository practitionerRepository;
    private final UserRepository userRepository;

    public CareTeamService(CareTeamRepository careTeamRepository,
                           CareTeamMemberRepository careTeamMemberRepository,
                           EncounterRepository encounterRepository,
                           PractitionerRepository practitionerRepository,
                           UserRepository userRepository) {
        this.careTeamRepository = careTeamRepository;
        this.careTeamMemberRepository = careTeamMemberRepository;
        this.encounterRepository = encounterRepository;
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

    public void removeMember(UUID careTeamId, UUID memberId) {
        CareTeamMember member = careTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Care team member not found with id: " + memberId));
        careTeamMemberRepository.delete(member);
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

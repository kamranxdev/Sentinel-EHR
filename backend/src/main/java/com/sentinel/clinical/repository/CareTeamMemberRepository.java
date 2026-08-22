package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.CareTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CareTeamMemberRepository extends JpaRepository<CareTeamMember, UUID> {
    List<CareTeamMember> findByCareTeamId(UUID careTeamId);
    List<CareTeamMember> findByUserId(UUID userId);
    List<CareTeamMember> findByPractitionerId(UUID practitionerId);
    List<CareTeamMember> findByCareTeamIdAndEndedAtIsNull(UUID careTeamId);
}


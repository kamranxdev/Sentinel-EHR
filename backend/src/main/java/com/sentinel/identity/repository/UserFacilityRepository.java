package com.sentinel.identity.repository;

import com.sentinel.identity.entity.UserFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserFacilityRepository extends JpaRepository<UserFacility, UUID> {
    List<UserFacility> findByUserId(UUID userId);
    List<UserFacility> findByFacilityId(UUID facilityId);
    Optional<UserFacility> findByUserIdAndFacilityId(UUID userId, UUID facilityId);
}

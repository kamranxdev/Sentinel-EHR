package com.sentinel.laboratory.repository;

import com.sentinel.laboratory.entity.SpecimenCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpecimenCollectionRepository extends JpaRepository<SpecimenCollection, UUID> {
    List<SpecimenCollection> findBySpecimenId(UUID specimenId);
}

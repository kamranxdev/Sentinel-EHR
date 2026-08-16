package com.sentinel.imaging.repository;

import com.sentinel.imaging.entity.ImagingInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImagingInstanceRepository extends JpaRepository<ImagingInstance, UUID> {
    List<ImagingInstance> findBySeriesId(UUID seriesId);
    Optional<ImagingInstance> findBySopInstanceUid(String sopInstanceUid);
}

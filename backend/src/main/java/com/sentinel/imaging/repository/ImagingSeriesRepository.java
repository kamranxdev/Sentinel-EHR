package com.sentinel.imaging.repository;

import com.sentinel.imaging.entity.ImagingSeries;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImagingSeriesRepository extends JpaRepository<ImagingSeries, UUID> {
    List<ImagingSeries> findByStudyId(UUID studyId);
    Optional<ImagingSeries> findBySeriesInstanceUid(String seriesInstanceUid);
}

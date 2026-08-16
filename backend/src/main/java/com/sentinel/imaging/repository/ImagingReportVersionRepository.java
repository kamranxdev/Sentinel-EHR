package com.sentinel.imaging.repository;

import com.sentinel.imaging.entity.ImagingReportVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImagingReportVersionRepository extends JpaRepository<ImagingReportVersion, UUID> {
    List<ImagingReportVersion> findByReportIdOrderByVersionNumberDesc(UUID reportId);
}

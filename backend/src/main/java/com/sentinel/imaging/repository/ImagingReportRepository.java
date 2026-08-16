package com.sentinel.imaging.repository;

import com.sentinel.imaging.entity.ImagingReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImagingReportRepository extends JpaRepository<ImagingReport, UUID> {
    List<ImagingReport> findByStudyId(UUID studyId);
}

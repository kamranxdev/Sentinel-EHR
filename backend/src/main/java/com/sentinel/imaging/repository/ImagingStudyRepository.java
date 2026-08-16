package com.sentinel.imaging.repository;

import com.sentinel.imaging.entity.ImagingStudy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImagingStudyRepository extends JpaRepository<ImagingStudy, UUID> {
    List<ImagingStudy> findByPatientId(UUID patientId);
    List<ImagingStudy> findByImagingOrderId(Long imagingOrderId);
    Optional<ImagingStudy> findByStudyInstanceUid(String studyInstanceUid);
    Optional<ImagingStudy> findByAccessionNumber(String accessionNumber);
}

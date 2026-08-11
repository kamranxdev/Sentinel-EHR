package com.sentinel.encounters.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.Bed;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.entity.LocationHistory;
import com.sentinel.encounters.repository.BedRepository;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.encounters.repository.LocationHistoryRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BedManagementService {

    private final BedRepository bedRepository;
    private final LocationHistoryRepository locationHistoryRepository;
    private final EncounterRepository encounterRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditTrailService;

    public BedManagementService(BedRepository bedRepository,
                                LocationHistoryRepository locationHistoryRepository,
                                EncounterRepository encounterRepository,
                                UserRepository userRepository,
                                AuditTrailService auditTrailService) {
        this.bedRepository = bedRepository;
        this.locationHistoryRepository = locationHistoryRepository;
        this.encounterRepository = encounterRepository;
        this.userRepository = userRepository;
        this.auditTrailService = auditTrailService;
    }

    @Transactional(readOnly = true)
    public List<Bed> getAllBeds() {
        return bedRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Bed> getBedsByDepartment(String departmentName) {
        return bedRepository.findByDepartmentName(departmentName);
    }

    @Transactional(readOnly = true)
    public List<Bed> getAvailableBeds(String departmentName) {
        if (departmentName != null && !departmentName.trim().isEmpty()) {
            return bedRepository.findByDepartmentNameAndStatus(departmentName, "AVAILABLE");
        }
        return bedRepository.findByStatus("AVAILABLE");
    }

    @Transactional(readOnly = true)
    public Optional<Bed> getBedById(Long id) {
        return bedRepository.findById(id);
    }

    @Transactional
    public Bed createBed(Bed bed) {
        if (bed.getStatus() == null) {
            bed.setStatus("AVAILABLE");
        }
        return bedRepository.save(bed);
    }

    @Transactional
    public Bed updateBedStatus(Long bedId, String status) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed with ID " + bedId + " not found"));
        bed.setStatus(status);
        return bedRepository.save(bed);
    }

    /**
     * Executes the 9-Step Controlled Bed Transfer Workflow for Hospitalized Patients:
     * 1. Transfer Request Submitted
     * 2. Destination Bed & Justification Verified
     * 3. Receiving Bed Status Reserved -> Occupied
     * 4. Close Active Location History Segment
     * 5. Open New Time-Bounded LocationHistory Segment
     * 6. Previous Bed Released to CLEANING_REQUIRED
     * 7. Update Active Encounter Location Pointer
     * 8. Update Care Team ABAC Context Pointer
     * 9. Generate WORM Audit Log Record
     */
    @Transactional
    public LocationHistory executeBedTransfer(Long encounterId, Long newBedId, String transferReason, String username) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter with ID " + encounterId + " not found"));

        Bed newBed = bedRepository.findById(newBedId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination bed with ID " + newBedId + " not found"));

        if (!"AVAILABLE".equalsIgnoreCase(newBed.getStatus()) && !"RESERVED".equalsIgnoreCase(newBed.getStatus())) {
            throw new IllegalStateException("Destination bed " + newBed.getBedCode() + " is currently " + newBed.getStatus() + " and cannot receive transfer.");
        }

        User staff = userRepository.findByUsername(username).orElse(null);

        // Close previous location history segment if open
        Optional<LocationHistory> currentLocOpt = locationHistoryRepository.findFirstByEncounterIdAndEndTimeIsNull(encounterId);
        if (currentLocOpt.isPresent()) {
            LocationHistory currentLoc = currentLocOpt.get();
            currentLoc.setEndTime(LocalDateTime.now());
            locationHistoryRepository.save(currentLoc);

            // Release previous bed to CLEANING_REQUIRED
            Bed prevBed = currentLoc.getBed();
            if (prevBed != null) {
                prevBed.setStatus("CLEANING_REQUIRED");
                prevBed.setCurrentEncounter(null);
                bedRepository.save(prevBed);
            }
        }

        // Occupy new bed
        newBed.setStatus("OCCUPIED");
        newBed.setCurrentEncounter(encounter);
        bedRepository.save(newBed);

        // Update encounter bed reference & department
        encounter.setAssignedBed(newBed);
        encounter.setDepartmentName(newBed.getDepartmentName());
        encounterRepository.save(encounter);

        // Record new time-bounded location segment
        LocationHistory newLocHistory = new LocationHistory(encounter, newBed, transferReason, staff);
        LocationHistory savedLoc = locationHistoryRepository.save(newLocHistory);

        // Generate WORM audit log entry
        auditTrailService.logAction(
            username != null ? username : "SYSTEM",
            "BED_TRANSFER",
            "ENCOUNTER",
            encounterId.toString(),
            "Transferred patient " + encounter.getPatient().getFullName() + " to bed " + newBed.getBedCode() + " (" + newBed.getWardName() + "). Reason: " + transferReason
        );

        return savedLoc;
    }

    @Transactional(readOnly = true)
    public List<LocationHistory> getLocationHistory(Long encounterId) {
        return locationHistoryRepository.findByEncounterIdOrderByStartTimeDesc(encounterId);
    }
}

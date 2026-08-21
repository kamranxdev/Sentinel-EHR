package com.sentinel.billing.repository;

import com.sentinel.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByPatientIdOrderByIssuedAtDesc(UUID patientId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT i FROM Invoice i WHERE :orgId IS NULL OR EXISTS (SELECT po FROM PatientOrganization po WHERE po.patient = i.patient AND po.organization.id = :orgId) ORDER BY i.issuedAt DESC")
    List<Invoice> findByOrganizationId(@Param("orgId") UUID orgId);
}

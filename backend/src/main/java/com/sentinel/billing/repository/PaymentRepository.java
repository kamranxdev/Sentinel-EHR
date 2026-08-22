package com.sentinel.billing.repository;

import com.sentinel.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByPatientIdOrderByPaidAtDesc(UUID patientId);
    List<Payment> findByInvoiceId(UUID invoiceId);

    @Query("SELECT p FROM Payment p WHERE :orgId IS NULL OR EXISTS (SELECT po FROM PatientOrganization po WHERE po.patient = p.patient AND po.organization.id = :orgId) ORDER BY p.paidAt DESC")
    List<Payment> findByOrganizationId(@Param("orgId") UUID orgId);
}

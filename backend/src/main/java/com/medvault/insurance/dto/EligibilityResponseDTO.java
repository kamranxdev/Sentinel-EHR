package com.medvault.insurance.dto;

import java.time.LocalDate;
import java.util.List;

public class EligibilityResponseDTO {
    private String transactionControlNumber; // e.g. X12-271-998231
    private String status; // ACTIVE, INACTIVE, PENDING_VERIFICATION
    private String payerName;
    private String planType; // PPO, HMO, EPO, POS
    private String subscriberId;
    private String groupNumber;
    private LocalDate effectiveDate;
    private LocalDate expirationDate;
    
    // Financial Breakdown
    private double primaryCareCopay;
    private double specialistCopay;
    private double urgentCareCopay;
    private double emergencyRoomCopay;
    
    private double individualDeductibleTotal;
    private double individualDeductibleMet;
    private double individualDeductibleRemaining;
    
    private double coinsurancePercentagePayer; // e.g. 80.0
    private double coinsurancePercentagePatient; // e.g. 20.0
    
    private double outOfPocketMaxTotal;
    private double outOfPocketMaxMet;
    
    private boolean referralRequired;
    private boolean preAuthRequired;
    private List<String> coverageAlerts;

    public EligibilityResponseDTO() {}

    public String getTransactionControlNumber() { return transactionControlNumber; }
    public void setTransactionControlNumber(String transactionControlNumber) { this.transactionControlNumber = transactionControlNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public String getSubscriberId() { return subscriberId; }
    public void setSubscriberId(String subscriberId) { this.subscriberId = subscriberId; }

    public String getGroupNumber() { return groupNumber; }
    public void setGroupNumber(String groupNumber) { this.groupNumber = groupNumber; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }

    public double getPrimaryCareCopay() { return primaryCareCopay; }
    public void setPrimaryCareCopay(double primaryCareCopay) { this.primaryCareCopay = primaryCareCopay; }

    public double getSpecialistCopay() { return specialistCopay; }
    public void setSpecialistCopay(double specialistCopay) { this.specialistCopay = specialistCopay; }

    public double getUrgentCareCopay() { return urgentCareCopay; }
    public void setUrgentCareCopay(double urgentCareCopay) { this.urgentCareCopay = urgentCareCopay; }

    public double getEmergencyRoomCopay() { return emergencyRoomCopay; }
    public void setEmergencyRoomCopay(double emergencyRoomCopay) { this.emergencyRoomCopay = emergencyRoomCopay; }

    public double getIndividualDeductibleTotal() { return individualDeductibleTotal; }
    public void setIndividualDeductibleTotal(double individualDeductibleTotal) { this.individualDeductibleTotal = individualDeductibleTotal; }

    public double getIndividualDeductibleMet() { return individualDeductibleMet; }
    public void setIndividualDeductibleMet(double individualDeductibleMet) { this.individualDeductibleMet = individualDeductibleMet; }

    public double getIndividualDeductibleRemaining() { return individualDeductibleRemaining; }
    public void setIndividualDeductibleRemaining(double individualDeductibleRemaining) { this.individualDeductibleRemaining = individualDeductibleRemaining; }

    public double getCoinsurancePercentagePayer() { return coinsurancePercentagePayer; }
    public void setCoinsurancePercentagePayer(double coinsurancePercentagePayer) { this.coinsurancePercentagePayer = coinsurancePercentagePayer; }

    public double getCoinsurancePercentagePatient() { return coinsurancePercentagePatient; }
    public void setCoinsurancePercentagePatient(double coinsurancePercentagePatient) { this.coinsurancePercentagePatient = coinsurancePercentagePatient; }

    public double getOutOfPocketMaxTotal() { return outOfPocketMaxTotal; }
    public void setOutOfPocketMaxTotal(double outOfPocketMaxTotal) { this.outOfPocketMaxTotal = outOfPocketMaxTotal; }

    public double getOutOfPocketMaxMet() { return outOfPocketMaxMet; }
    public void setOutOfPocketMaxMet(double outOfPocketMaxMet) { this.outOfPocketMaxMet = outOfPocketMaxMet; }

    public boolean isReferralRequired() { return referralRequired; }
    public void setReferralRequired(boolean referralRequired) { this.referralRequired = referralRequired; }

    public boolean isPreAuthRequired() { return preAuthRequired; }
    public void setPreAuthRequired(boolean preAuthRequired) { this.preAuthRequired = preAuthRequired; }

    public List<String> getCoverageAlerts() { return coverageAlerts; }
    public void setCoverageAlerts(List<String> coverageAlerts) { this.coverageAlerts = coverageAlerts; }
}

package com.medvault.insurance.dto;

public class EligibilityInquiryDTO {
    private Long patientId;
    private String subscriberId;
    private String payerName;
    private String groupNumber;
    private String serviceTypeCode; // 30 = Health Benefit Plan Coverage, 1 = Medical Care
    private String providerNpi;

    public EligibilityInquiryDTO() {}

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getSubscriberId() { return subscriberId; }
    public void setSubscriberId(String subscriberId) { this.subscriberId = subscriberId; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getGroupNumber() { return groupNumber; }
    public void setGroupNumber(String groupNumber) { this.groupNumber = groupNumber; }

    public String getServiceTypeCode() { return serviceTypeCode; }
    public void setServiceTypeCode(String serviceTypeCode) { this.serviceTypeCode = serviceTypeCode; }

    public String getProviderNpi() { return providerNpi; }
    public void setProviderNpi(String providerNpi) { this.providerNpi = providerNpi; }
}

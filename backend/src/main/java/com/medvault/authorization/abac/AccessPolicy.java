package com.medvault.authorization.abac;

public class AccessPolicy {
    private String policyId;
    private String name;
    private String resource;
    private String action;
    private String conditionSpel;
    private boolean enabled;

    public AccessPolicy() {}

    public AccessPolicy(String policyId, String name, String resource, String action, String conditionSpel, boolean enabled) {
        this.policyId = policyId;
        this.name = name;
        this.resource = resource;
        this.action = action;
        this.conditionSpel = conditionSpel;
        this.enabled = enabled;
    }

    public String getPolicyId() {
        return policyId;
    }

    public void setPolicyId(String policyId) {
        this.policyId = policyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getConditionSpel() {
        return conditionSpel;
    }

    public void setConditionSpel(String conditionSpel) {
        this.conditionSpel = conditionSpel;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}

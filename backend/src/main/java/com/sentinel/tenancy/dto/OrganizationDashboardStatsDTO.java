package com.sentinel.tenancy.dto;

/**
 * Tenant-scoped operational metrics for the organization administrator workspace.
 * Values are calculated from persisted records, never supplied by the client.
 */
public class OrganizationDashboardStatsDTO {
    private long totalStaff;
    private long activePractitioners;
    private long totalDepartments;
    private long totalWards;
    private long totalBeds;
    private long occupiedBeds;
    private double occupancyRate;
    private long registeredPatients;
    private long appointments;
    private long completedAppointments;
    private long activeEncounters;

    public long getTotalStaff() { return totalStaff; }
    public void setTotalStaff(long totalStaff) { this.totalStaff = totalStaff; }
    public long getActivePractitioners() { return activePractitioners; }
    public void setActivePractitioners(long activePractitioners) { this.activePractitioners = activePractitioners; }
    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }
    public long getTotalWards() { return totalWards; }
    public void setTotalWards(long totalWards) { this.totalWards = totalWards; }
    public long getTotalBeds() { return totalBeds; }
    public void setTotalBeds(long totalBeds) { this.totalBeds = totalBeds; }
    public long getOccupiedBeds() { return occupiedBeds; }
    public void setOccupiedBeds(long occupiedBeds) { this.occupiedBeds = occupiedBeds; }
    public double getOccupancyRate() { return occupancyRate; }
    public void setOccupancyRate(double occupancyRate) { this.occupancyRate = occupancyRate; }
    public long getRegisteredPatients() { return registeredPatients; }
    public void setRegisteredPatients(long registeredPatients) { this.registeredPatients = registeredPatients; }
    public long getAppointments() { return appointments; }
    public void setAppointments(long appointments) { this.appointments = appointments; }
    public long getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }
    public long getActiveEncounters() { return activeEncounters; }
    public void setActiveEncounters(long activeEncounters) { this.activeEncounters = activeEncounters; }
}

package com.sentinel.patient.dto;

public class UpdateDietaryHistoryRequest {
    private String dietType;
    private String dietaryRestrictions;
    private String foodPreferences;
    private String nutritionalNotes;

    public UpdateDietaryHistoryRequest() {}

    public String getDietType() { return dietType; }
    public void setDietType(String dietType) { this.dietType = dietType; }
    public String getDietaryRestrictions() { return dietaryRestrictions; }
    public void setDietaryRestrictions(String dietaryRestrictions) { this.dietaryRestrictions = dietaryRestrictions; }
    public String getFoodPreferences() { return foodPreferences; }
    public void setFoodPreferences(String foodPreferences) { this.foodPreferences = foodPreferences; }
    public String getNutritionalNotes() { return nutritionalNotes; }
    public void setNutritionalNotes(String nutritionalNotes) { this.nutritionalNotes = nutritionalNotes; }
}

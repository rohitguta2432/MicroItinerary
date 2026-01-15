package com.microitinerary.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "packing_items")
public class PackingItem extends BaseEntity {
    @Column(nullable = false)
    private UUID tripId;
    
    @Column(nullable = false)
    private String label;
    
    private boolean isPacked = false;
    private String category;
    
    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public boolean isPacked() { return isPacked; }
    public void setPacked(boolean packed) { isPacked = packed; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}

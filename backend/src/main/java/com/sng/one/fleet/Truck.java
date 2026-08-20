package com.sng.one.fleet;

import com.sng.one.identity.AppUser;
import com.sng.one.location.Location;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "trucks")
public class Truck {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String registration;
    @Column(name = "vehicle_code", nullable = false, unique = true)
    private String vehicleCode;
    private String make;
    private String model;
    @Column(name = "capacity_kg")
    private BigDecimal capacityKg;
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private AppUser driver;
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
    @Column(name = "odometer_km")
    private int odometerKm;
    @Column(name = "last_service_km")
    private Integer lastServiceKm;
    @Column(name = "next_service_km")
    private Integer nextServiceKm;
    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;
    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;
    @Column(name = "licence_expiry")
    private LocalDate licenceExpiry;
    @Column(name = "insurance_expiry")
    private LocalDate insuranceExpiry;
    @Column(nullable = false)
    private String status;

    public boolean assignable() {
        return "AVAILABLE".equals(status) || "ASSIGNED".equals(status) || "DELIVERED".equals(status);
    }

    public boolean serviceDueSoon(int warningKm) {
        if (nextServiceKm == null) return false;
        return nextServiceKm - odometerKm <= warningKm;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRegistration() { return registration; }
    public void setRegistration(String registration) { this.registration = registration; }
    public String getVehicleCode() { return vehicleCode; }
    public void setVehicleCode(String vehicleCode) { this.vehicleCode = vehicleCode; }
    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public BigDecimal getCapacityKg() { return capacityKg; }
    public void setCapacityKg(BigDecimal capacityKg) { this.capacityKg = capacityKg; }
    public AppUser getDriver() { return driver; }
    public void setDriver(AppUser driver) { this.driver = driver; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public int getOdometerKm() { return odometerKm; }
    public void setOdometerKm(int odometerKm) { this.odometerKm = odometerKm; }
    public Integer getLastServiceKm() { return lastServiceKm; }
    public void setLastServiceKm(Integer lastServiceKm) { this.lastServiceKm = lastServiceKm; }
    public Integer getNextServiceKm() { return nextServiceKm; }
    public void setNextServiceKm(Integer nextServiceKm) { this.nextServiceKm = nextServiceKm; }
    public LocalDate getLastServiceDate() { return lastServiceDate; }
    public void setLastServiceDate(LocalDate lastServiceDate) { this.lastServiceDate = lastServiceDate; }
    public LocalDate getNextServiceDate() { return nextServiceDate; }
    public void setNextServiceDate(LocalDate nextServiceDate) { this.nextServiceDate = nextServiceDate; }
    public LocalDate getLicenceExpiry() { return licenceExpiry; }
    public void setLicenceExpiry(LocalDate licenceExpiry) { this.licenceExpiry = licenceExpiry; }
    public LocalDate getInsuranceExpiry() { return insuranceExpiry; }
    public void setInsuranceExpiry(LocalDate insuranceExpiry) { this.insuranceExpiry = insuranceExpiry; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

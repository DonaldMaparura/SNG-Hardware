package com.sng.one.fleet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TruckRepository extends JpaRepository<Truck, Long> {
    Optional<Truck> findByVehicleCode(String vehicleCode);
}

interface TripRepository extends JpaRepository<Trip, Long> {
    @Query("select t from Trip t left join fetch t.cargo c left join fetch c.product where t.id = :id")
    Optional<Trip> findDetailed(Long id);

    List<Trip> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    @Query("select t from Trip t left join fetch t.truck left join fetch t.driver order by t.createdAt desc")
    List<Trip> findAllHeader();
}

interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByTruckOrderByDateDesc(Truck truck);
}

interface ProofOfDeliveryRepository extends JpaRepository<ProofOfDelivery, Long> {
    Optional<ProofOfDelivery> findByTrip(Trip trip);
}

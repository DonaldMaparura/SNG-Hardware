package com.sng.one.fleet;

import com.sng.one.accounting.AccountingService;
import com.sng.one.audit.AuditService;
import com.sng.one.common.BusinessException;
import com.sng.one.common.SequenceService;
import com.sng.one.transfer.StockTransfer;
import com.sng.one.security.CurrentUser;
import com.sng.one.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FleetService {
    private final TruckRepository trucks;
    private final TripRepository trips;
    private final MaintenanceRecordRepository maintenance;
    private final ProofOfDeliveryRepository pods;
    private final CurrentUser currentUser;
    private final AccountingService accounting;
    private final AuditService audit;
    private final SequenceService sequences;

    public FleetService(TruckRepository trucks, TripRepository trips, MaintenanceRecordRepository maintenance,
                        ProofOfDeliveryRepository pods, CurrentUser currentUser, AccountingService accounting,
                        AuditService audit, SequenceService sequences) {
        this.trucks = trucks;
        this.trips = trips;
        this.maintenance = maintenance;
        this.pods = pods;
        this.currentUser = currentUser;
        this.accounting = accounting;
        this.audit = audit;
        this.sequences = sequences;
    }

    public record MaintenanceIn(String type, LocalDate date, Integer odometerKm, String supplier,
                                String description, BigDecimal cost, String invoiceRef,
                                Integer nextServiceKm, LocalDate nextServiceDate, boolean takeOutOfService) {}
    public record PodIn(String recipient, String notes, String signatureData, String photoUrl) {}

    public List<Map<String, Object>> listTripDtos(Long driverId) {
        if (driverId != null) {
            return trips.findByDriverIdOrderByCreatedAtDesc(driverId).stream().map(this::tripDto).toList();
        }
        return trips.findAllHeader().stream().map(this::tripDto).toList();
    }

    public List<Map<String, Object>> listTrucks() {
        return trucks.findAll().stream().map(this::truckDto).toList();
    }

    public long dueServiceCount() {
        return trucks.findAll().stream().filter(t -> t.serviceDueSoon(5000)).count();
    }

    public Map<String, Long> statusCounts() {
        return trucks.findAll().stream().collect(java.util.stream.Collectors.groupingBy(Truck::getStatus, java.util.stream.Collectors.counting()));
    }

    public Map<String, Object> truckDto(Truck t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("registration", t.getRegistration());
        m.put("vehicleCode", t.getVehicleCode());
        m.put("make", t.getMake());
        m.put("model", t.getModel());
        m.put("capacityKg", t.getCapacityKg());
        m.put("driver", t.getDriver() == null ? null : t.getDriver().getFullName());
        m.put("odometerKm", t.getOdometerKm());
        m.put("lastServiceKm", t.getLastServiceKm());
        m.put("nextServiceKm", t.getNextServiceKm());
        m.put("remainingKm", t.getNextServiceKm() == null ? null : t.getNextServiceKm() - t.getOdometerKm());
        m.put("serviceDueSoon", t.serviceDueSoon(5000));
        m.put("licenceExpiry", t.getLicenceExpiry());
        m.put("insuranceExpiry", t.getInsuranceExpiry());
        m.put("status", t.getStatus());
        m.put("assignable", t.assignable());
        return m;
    }

    @Transactional
    public Map<String, Object> recordMaintenance(Long truckId, MaintenanceIn in) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        Truck truck = trucks.findById(truckId).orElseThrow(() -> new BusinessException("Truck not found", 404));
        MaintenanceRecord rec = new MaintenanceRecord();
        rec.setTruck(truck);
        rec.setType(in.type());
        rec.setDate(in.date() == null ? LocalDate.now() : in.date());
        rec.setOdometerKm(in.odometerKm() == null ? truck.getOdometerKm() : in.odometerKm());
        rec.setSupplier(in.supplier());
        rec.setDescription(in.description());
        rec.setCost(in.cost() == null ? BigDecimal.ZERO : in.cost());
        rec.setInvoiceRef(in.invoiceRef());
        rec.setNextServiceKm(in.nextServiceKm());
        rec.setNextServiceDate(in.nextServiceDate());
        maintenance.save(rec);
        if (in.odometerKm() != null) truck.setOdometerKm(in.odometerKm());
        if (in.nextServiceKm() != null) {
            truck.setLastServiceKm(truck.getOdometerKm());
            truck.setNextServiceKm(in.nextServiceKm());
        }
        truck.setLastServiceDate(rec.getDate());
        truck.setNextServiceDate(in.nextServiceDate());
        truck.setStatus(in.takeOutOfService() ? "MAINTENANCE" : truck.getStatus());
        trucks.save(truck);
        if (rec.getCost().compareTo(BigDecimal.ZERO) > 0) {
            accounting.post("Truck maintenance " + truck.getVehicleCode(), "MAINTENANCE", rec.getId(), List.of(
                    AccountingService.Line.dr("5200", rec.getCost(), rec.getType()),
                    AccountingService.Line.cr("1000", rec.getCost(), "Paid")
            ));
        }
        audit.record(p, "TRUCK_MAINTENANCE", "Truck", truck.getVehicleCode(), truck.getStatus(),
                rec.getType() + " " + rec.getCost(), null, in.description(), "APP");
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", rec.getId());
        m.put("type", rec.getType());
        m.put("cost", rec.getCost());
        m.put("truck", rec.getTruck().getVehicleCode());
        return m;
    }

    @Transactional
    public Map<String, Object> driverAction(Long tripId, String action) {
        currentUser.assertWritable();
        Trip trip = trips.findDetailed(tripId).orElseThrow(() -> new BusinessException("Trip not found", 404));
        UserPrincipal p = currentUser.require();
        if ("DRIVER".equals(p.getRole()) && (trip.getDriver() == null || !trip.getDriver().getId().equals(p.getId()))) {
            throw new BusinessException("This trip is not assigned to you", 403);
        }
        switch (action) {
            case "START" -> {
                trip.setStatus("IN_TRANSIT");
                trip.setStartedAt(Instant.now());
                trip.getTruck().setStatus("IN_TRANSIT");
            }
            case "ARRIVED" -> {
                trip.setStatus("ARRIVED");
                trip.setArrivedAt(Instant.now());
            }
            case "DELIVERED" -> {
                trip.setStatus("DELIVERED");
                trip.setDeliveredAt(Instant.now());
                trip.getTruck().setStatus("DELIVERED");
            }
            default -> throw new BusinessException("Unknown trip action");
        }
        trucks.save(trip.getTruck());
        return tripDto(trips.save(trip));
    }

    @Transactional
    public Map<String, Object> pod(Long tripId, PodIn in) {
        currentUser.assertWritable();
        Trip trip = trips.findById(tripId).orElseThrow(() -> new BusinessException("Trip not found", 404));
        ProofOfDelivery pod = pods.findByTrip(trip).orElseGet(ProofOfDelivery::new);
        pod.setTrip(trip);
        pod.setRecipient(in.recipient());
        pod.setNotes(in.notes());
        pod.setSignatureData(in.signatureData());
        pod.setPhotoUrl(in.photoUrl());
        pod.setReference(sequences.next("pod", "POD-", 6));
        pod.setDeliveredAt(Instant.now());
        driverAction(tripId, "DELIVERED");
        pods.save(pod);
        return Map.of("reference", pod.getReference(), "recipient", pod.getRecipient() == null ? "" : pod.getRecipient());
    }

    @Transactional
    public void createTransferTrip(StockTransfer transfer) {
        Trip trip = new Trip();
        trip.setReference(sequences.next("trip", "TRIP-", 5));
        trip.setTruck(transfer.getTruck());
        trip.setDriver(transfer.getDriver());
        trip.setFromLocation(transfer.getFromLocation());
        trip.setToLocation(transfer.getToLocation());
        trip.setTransfer(transfer);
        trip.setTripType("TRANSFER");
        trip.setStatus("ASSIGNED");
        for (StockTransfer.CargoItem item : transfer.cargoItems()) {
            TripCargo c = new TripCargo();
            c.setTrip(trip);
            c.setProduct(item.product());
            c.setQuantity(item.quantity());
            trip.getCargo().add(c);
        }
        trips.save(trip);
    }

    @Transactional
    public void completeTransferTrip(Long transferId) {
        trips.findAllHeader().stream()
                .filter(tr -> tr.getTransfer() != null && tr.getTransfer().getId().equals(transferId))
                .findFirst()
                .ifPresent(tr -> {
                    tr.setStatus("DELIVERED");
                    tr.setDeliveredAt(Instant.now());
                    trips.save(tr);
                });
    }

    public List<Map<String, Object>> maintenanceFor(Truck t) {
        return maintenance.findByTruckOrderByDateDesc(t).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("type", r.getType());
            m.put("date", r.getDate());
            m.put("odometerKm", r.getOdometerKm() == null ? 0 : r.getOdometerKm());
            m.put("cost", r.getCost());
            m.put("description", r.getDescription() == null ? "" : r.getDescription());
            m.put("supplier", r.getSupplier() == null ? "" : r.getSupplier());
            return m;
        }).toList();
    }

    public Map<String, Object> tripDto(Trip t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("reference", t.getReference());
        m.put("status", t.getStatus());
        m.put("type", t.getTripType());
        m.put("truck", t.getTruck().getVehicleCode());
        m.put("driver", t.getDriver() == null ? null : t.getDriver().getFullName());
        m.put("from", t.getFromLocation() == null ? null : t.getFromLocation().getName());
        m.put("to", t.getToLocation() == null ? null : t.getToLocation().getName());
        m.put("startedAt", t.getStartedAt());
        m.put("arrivedAt", t.getArrivedAt());
        m.put("deliveredAt", t.getDeliveredAt());
        m.put("cargo", t.getCargo() == null ? List.of() : t.getCargo().stream().map(c -> Map.of(
                "sku", c.getProduct().getSku(), "name", c.getProduct().getName(), "qty", c.getQuantity()
        )).toList());
        return m;
    }
}

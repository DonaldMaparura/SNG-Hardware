package com.sng.one.fleet;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TruckRulesTest {
    @Test
    void serviceDueSoonWhenWithinWarningDistance() {
        Truck t = new Truck();
        t.setOdometerKm(126420);
        t.setNextServiceKm(130000);
        assertTrue(t.serviceDueSoon(5000));
        assertEquals(3580, t.getNextServiceKm() - t.getOdometerKm());
    }

    @Test
    void maintenanceTrucksAreNotAssignable() {
        Truck t = new Truck();
        t.setStatus("MAINTENANCE");
        assertFalse(t.assignable());
        t.setStatus("OUT_OF_SERVICE");
        assertFalse(t.assignable());
        t.setStatus("AVAILABLE");
        assertTrue(t.assignable());
    }
}

package com.sng.one.timber;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TimberCutCalculatorTest {
    @Test
    void twoCutsOnSixMetreWithKerfProducesReusableOffcut() {
        var result = TimberCutCalculator.calculate(
                new BigDecimal("6.000"),
                new BigDecimal("3"),
                List.of(new TimberCutCalculator.Piece(new BigDecimal("2.400"), 1),
                        new TimberCutCalculator.Piece(new BigDecimal("2.400"), 1)),
                new BigDecimal("0.900"));
        assertEquals(0, new BigDecimal("0.006").compareTo(result.kerfTotalM()));
        assertEquals(0, new BigDecimal("4.806").compareTo(result.usedM()));
        assertEquals(0, new BigDecimal("1.194").compareTo(result.remainingM()));
        assertTrue(result.reusableOffcut());
        assertEquals(0, BigDecimal.ZERO.compareTo(result.wasteM()));
    }

    @Test
    void smallOffcutIsWaste() {
        var result = TimberCutCalculator.calculate(
                new BigDecimal("6.000"),
                new BigDecimal("3"),
                List.of(
                        new TimberCutCalculator.Piece(new BigDecimal("1.500"), 1),
                        new TimberCutCalculator.Piece(new BigDecimal("1.500"), 1),
                        new TimberCutCalculator.Piece(new BigDecimal("1.000"), 1),
                        new TimberCutCalculator.Piece(new BigDecimal("1.000"), 1)
                ),
                new BigDecimal("1.200"));
        assertTrue(result.remainingM().compareTo(new BigDecimal("1.200")) < 0);
        assertFalse(result.reusableOffcut());
        assertTrue(result.wasteM().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void oversizedCutListRejected() {
        assertThrows(IllegalArgumentException.class, () -> TimberCutCalculator.calculate(
                new BigDecimal("6.000"), new BigDecimal("3"),
                List.of(new TimberCutCalculator.Piece(new BigDecimal("5.000"), 2)),
                new BigDecimal("0.900")));
    }
}

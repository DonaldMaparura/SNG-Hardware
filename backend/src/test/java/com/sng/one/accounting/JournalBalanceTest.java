package com.sng.one.accounting;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JournalBalanceTest {
    @Test
    void posPatternBalances() {
        BigDecimal sale = new BigDecimal("100.00");
        BigDecimal cogs = new BigDecimal("70.00");
        List<AccountingService.Line> lines = List.of(
                AccountingService.Line.dr("1000", sale, "Cash"),
                AccountingService.Line.cr("4000", sale, "Sales"),
                AccountingService.Line.dr("5000", cogs, "COGS"),
                AccountingService.Line.cr("1400", cogs, "Inventory")
        );
        BigDecimal dr = lines.stream().map(AccountingService.Line::debit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cr = lines.stream().map(AccountingService.Line::credit).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, dr.compareTo(cr));
        assertEquals(0, new BigDecimal("170.00").compareTo(dr));
    }

    @Test
    void tillVarianceIsCountedMinusExpected() {
        BigDecimal opening = new BigDecimal("200");
        BigDecimal cashSales = new BigDecimal("4123");
        BigDecimal expected = opening.add(cashSales);
        BigDecimal counted = new BigDecimal("4310");
        assertEquals(0, new BigDecimal("-13").compareTo(counted.subtract(expected)));
    }
}

package com.sng.one.timber;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public final class TimberCutCalculator {
    private TimberCutCalculator() {}

    public record Piece(BigDecimal lengthM, int quantity) {}

    public record Result(
            BigDecimal originalM,
            BigDecimal cutsTotalM,
            BigDecimal kerfTotalM,
            BigDecimal usedM,
            BigDecimal remainingM,
            boolean reusableOffcut,
            BigDecimal wasteM,
            BigDecimal utilisation,
            int cutCount
    ) {}

    public static Result calculate(BigDecimal originalM, BigDecimal kerfMm, List<Piece> pieces, BigDecimal reusableThresholdM) {
        if (originalM == null || originalM.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Original length must be positive");
        }
        BigDecimal kerfM = kerfMm.divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP);
        BigDecimal cuts = BigDecimal.ZERO;
        int cutCount = 0;
        for (Piece p : pieces) {
            cuts = cuts.add(p.lengthM().multiply(BigDecimal.valueOf(p.quantity())));
            cutCount += p.quantity();
        }
        int kerfCuts = Math.max(cutCount, 0);
        BigDecimal kerfTotal = kerfM.multiply(BigDecimal.valueOf(kerfCuts));
        BigDecimal used = cuts.add(kerfTotal);
        BigDecimal remaining = originalM.subtract(used);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Cut list exceeds available length including kerf");
        }
        boolean reusable = remaining.compareTo(reusableThresholdM) >= 0 && remaining.compareTo(BigDecimal.ZERO) > 0;
        BigDecimal waste = reusable ? BigDecimal.ZERO : remaining;
        BigDecimal offcut = reusable ? remaining : BigDecimal.ZERO;
        BigDecimal utilisation = cuts.divide(originalM, 4, RoundingMode.HALF_UP);
        return new Result(originalM, cuts, kerfTotal, used, remaining, reusable, waste, utilisation, cutCount);
    }

    public static List<BigDecimal> visualSegments(List<Piece> pieces, BigDecimal offcutM) {
        List<BigDecimal> segs = new ArrayList<>();
        for (Piece p : pieces) {
            for (int i = 0; i < p.quantity(); i++) segs.add(p.lengthM());
        }
        if (offcutM != null && offcutM.compareTo(BigDecimal.ZERO) > 0) segs.add(offcutM);
        return segs;
    }
}

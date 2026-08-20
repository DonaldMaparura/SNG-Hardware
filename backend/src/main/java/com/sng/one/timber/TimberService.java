package com.sng.one.timber;

import com.sng.one.audit.AuditService;
import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductRepository;
import com.sng.one.common.BusinessException;
import com.sng.one.common.SequenceService;
import com.sng.one.customer.CustomerRepository;
import com.sng.one.inventory.InventoryService;
import com.sng.one.location.Location;
import com.sng.one.security.CurrentUser;
import com.sng.one.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TimberService {
    private final TimberCutJobRepository jobs;
    private final ProductRepository products;
    private final InventoryService inventory;
    private final SequenceService sequences;
    private final CurrentUser currentUser;
    private final CustomerRepository customers;
    private final AuditService audit;
    private final BigDecimal reusableThreshold;
    private final BigDecimal defaultKerf;

    public TimberService(TimberCutJobRepository jobs, ProductRepository products, InventoryService inventory,
                         SequenceService sequences, CurrentUser currentUser, CustomerRepository customers,
                         AuditService audit,
                         @Value("${sng.timber.reusable-offcut-m}") BigDecimal reusableThreshold,
                         @Value("${sng.timber.default-kerf-mm}") BigDecimal defaultKerf) {
        this.jobs = jobs;
        this.products = products;
        this.inventory = inventory;
        this.sequences = sequences;
        this.currentUser = currentUser;
        this.customers = customers;
        this.audit = audit;
        this.reusableThreshold = reusableThreshold;
        this.defaultKerf = defaultKerf;
    }

    public record PieceIn(BigDecimal lengthM, int quantity) {}
    public record CreateIn(Long locationId, String sourceSku, BigDecimal sourceQty, BigDecimal originalLengthM,
                           BigDecimal kerfMm, Long customerId, String notes, List<PieceIn> pieces) {}

    public Map<String, Object> preview(CreateIn in) {
        TimberCutCalculator.Result r = calc(in);
        List<TimberCutCalculator.Piece> pieces = pieces(in);
        BigDecimal remainingShown = r.reusableOffcut() ? r.remainingM() : r.wasteM();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("originalM", r.originalM());
        m.put("cutsTotalM", r.cutsTotalM());
        m.put("kerfTotalM", r.kerfTotalM());
        m.put("usedM", r.usedM());
        m.put("remainingM", r.remainingM());
        m.put("reusableOffcut", r.reusableOffcut());
        m.put("wasteM", r.wasteM());
        m.put("utilisation", r.utilisation());
        m.put("segments", TimberCutCalculator.visualSegments(pieces, remainingShown));
        return m;
    }

    @Transactional
    public TimberCutJob create(CreateIn in) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        TimberCutCalculator.Result r = calc(in);
        Product source = products.findBySkuIgnoreCase(in.sourceSku())
                .orElseThrow(() -> new BusinessException("Source timber not found"));
        TimberCutJob job = new TimberCutJob();
        job.setReference(sequences.next("timber", "CUT-", 6));
        job.setLocation(inventory.requireLocation(in.locationId()));
        job.setSourceProduct(source);
        job.setSourceQty(in.sourceQty() == null ? BigDecimal.ONE : in.sourceQty());
        job.setOriginalLengthM(in.originalLengthM());
        job.setKerfMm(in.kerfMm() == null ? defaultKerf : in.kerfMm());
        job.setUsedM(r.usedM());
        job.setKerfTotalM(r.kerfTotalM());
        job.setOffcutM(r.reusableOffcut() ? r.remainingM() : BigDecimal.ZERO);
        job.setWasteM(r.wasteM());
        job.setUtilisation(r.utilisation());
        job.setOffcutReusable(r.reusableOffcut());
        job.setStatus("REQUESTED");
        job.setNotes(in.notes());
        job.setCreatedBy(inventory.requireUser(p.getId()));
        if (in.customerId() != null) customers.findById(in.customerId()).ifPresent(job::setCustomer);
        int i = 0;
        for (PieceIn piece : in.pieces()) {
            TimberCutPiece tp = new TimberCutPiece();
            tp.setJob(job);
            tp.setLengthM(piece.lengthM());
            tp.setQuantity(piece.quantity() <= 0 ? 1 : piece.quantity());
            tp.setSortOrder(i++);
            job.getPieces().add(tp);
        }
        jobs.save(job);
        audit.record(p, "TIMBER_CUT_CREATE", "TimberCutJob", job.getReference(), null, job.getReference(),
                job.getLocation().getId(), null, "APP");
        return job;
    }

    @Transactional
    public TimberCutJob complete(Long id) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        TimberCutJob job = jobs.findDetailed(id).orElseThrow(() -> new BusinessException("Cut job not found", 404));
        Location loc = job.getLocation();
        inventory.move(job.getSourceProduct(), loc, null, job.getSourceQty(),
                "TIMBER_CUT_SOURCE", "TIMBER_CUT", job.getId(), p.getId(), "Consumed for cutting", job.getReference());
        for (TimberCutPiece piece : job.getPieces()) {
            Product out = findLengthSku(job.getSourceProduct(), piece.getLengthM());
            inventory.move(out, null, loc, BigDecimal.valueOf(piece.getQuantity()),
                    "TIMBER_CUT_OUTPUT", "TIMBER_CUT", job.getId(), p.getId(),
                    piece.getLengthM() + "m piece", job.getReference());
        }
        if (Boolean.TRUE.equals(job.getOffcutReusable()) && job.getOffcutM().compareTo(BigDecimal.ZERO) > 0) {
            Product offcut = products.findBySkuIgnoreCase("TIM-PINE-38-114-OFFCUT")
                    .orElse(job.getSourceProduct());
            inventory.move(offcut, null, loc, job.getOffcutM(),
                    "TIMBER_CUT_OUTPUT", "TIMBER_CUT", job.getId(), p.getId(),
                    "Reusable offcut " + job.getOffcutM() + "m", job.getReference());
        }
        job.setStatus("COMPLETED");
        job.setCompletedAt(Instant.now());
        job.setOperator(inventory.requireUser(p.getId()));
        audit.record(p, "TIMBER_CUT_COMPLETE", "TimberCutJob", job.getReference(),
                "source " + job.getSourceProduct().getSku(), "completed", loc.getId(), null, "APP");
        return jobs.save(job);
    }

    @Transactional
    public TimberCutJob setStatus(Long id, String status) {
        currentUser.assertWritable();
        TimberCutJob job = jobs.findById(id).orElseThrow(() -> new BusinessException("Cut job not found", 404));
        job.setStatus(status);
        return jobs.save(job);
    }

    private TimberCutCalculator.Result calc(CreateIn in) {
        return TimberCutCalculator.calculate(
                in.originalLengthM(),
                in.kerfMm() == null ? defaultKerf : in.kerfMm(),
                pieces(in),
                reusableThreshold);
    }

    private List<TimberCutCalculator.Piece> pieces(CreateIn in) {
        List<TimberCutCalculator.Piece> list = new ArrayList<>();
        for (PieceIn p : in.pieces()) {
            list.add(new TimberCutCalculator.Piece(p.lengthM(), p.quantity() <= 0 ? 1 : p.quantity()));
        }
        return list;
    }

    public List<Map<String, Object>> list() {
        return jobs.findAllHeader().stream().map(this::dto).toList();
    }

    public Map<String, Object> get(Long id) {
        return dto(jobs.findDetailed(id).orElseThrow(() -> new BusinessException("Cut job not found", 404)));
    }

    private Product findLengthSku(Product source, BigDecimal lengthM) {
        int mm = lengthM.multiply(new BigDecimal("1000")).intValue();
        String sku = "TIM-PINE-38-114-" + mm;
        return products.findBySkuIgnoreCase(sku).orElse(source);
    }

    public Map<String, Object> dto(TimberCutJob job) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", job.getId());
        m.put("reference", job.getReference());
        m.put("status", job.getStatus());
        m.put("sourceSku", job.getSourceProduct().getSku());
        m.put("sourceName", job.getSourceProduct().getName());
        m.put("location", job.getLocation().getName());
        m.put("originalLengthM", job.getOriginalLengthM());
        m.put("kerfMm", job.getKerfMm());
        m.put("kerfTotalM", job.getKerfTotalM());
        m.put("usedM", job.getUsedM());
        m.put("offcutM", job.getOffcutM());
        m.put("wasteM", job.getWasteM());
        m.put("utilisation", job.getUtilisation());
        m.put("offcutReusable", job.getOffcutReusable());
        m.put("customer", job.getCustomer() == null ? null : job.getCustomer().getName());
        m.put("pieces", job.getPieces() == null ? List.of() : job.getPieces().stream().map(p -> Map.of(
                "lengthM", p.getLengthM(), "quantity", p.getQuantity()
        )).toList());
        List<BigDecimal> segs = new ArrayList<>();
        if (job.getPieces() != null) {
            for (TimberCutPiece p : job.getPieces()) {
                for (int i = 0; i < p.getQuantity(); i++) segs.add(p.getLengthM());
            }
        }
        BigDecimal rem = Boolean.TRUE.equals(job.getOffcutReusable()) ? job.getOffcutM() : job.getWasteM();
        if (rem != null && rem.compareTo(BigDecimal.ZERO) > 0) segs.add(rem);
        m.put("segments", segs);
        return m;
    }
}

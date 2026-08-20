package com.sng.one.accounting;

import com.sng.one.common.BusinessException;
import com.sng.one.common.SequenceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AccountingService {
    private final GlAccountRepository accounts;
    private final JournalRepository journals;
    private final SequenceService sequences;

    public AccountingService(GlAccountRepository accounts, JournalRepository journals, SequenceService sequences) {
        this.accounts = accounts;
        this.journals = journals;
        this.sequences = sequences;
    }

    public record Line(String accountCode, BigDecimal debit, BigDecimal credit, String memo) {
        public static Line dr(String code, BigDecimal amt, String memo) {
            return new Line(code, nz(amt), BigDecimal.ZERO, memo);
        }
        public static Line cr(String code, BigDecimal amt, String memo) {
            return new Line(code, BigDecimal.ZERO, nz(amt), memo);
        }
        private static BigDecimal nz(BigDecimal v) {
            return (v == null ? BigDecimal.ZERO : v).setScale(2, RoundingMode.HALF_UP);
        }
    }

    @Transactional
    public Journal post(String description, String sourceType, Long sourceId, List<Line> lines) {
        BigDecimal dr = BigDecimal.ZERO;
        BigDecimal cr = BigDecimal.ZERO;
        Journal j = new Journal();
        j.setReference(sequences.next("journal", "JNL-", 6));
        j.setDescription(description);
        j.setSourceType(sourceType);
        j.setSourceId(sourceId);
        j.setPosted(true);
        for (Line line : lines) {
            if (line.debit().signum() == 0 && line.credit().signum() == 0) continue;
            GlAccount acc = accounts.findByCode(line.accountCode())
                    .orElseThrow(() -> new BusinessException("GL account missing: " + line.accountCode()));
            JournalLine jl = new JournalLine();
            jl.setJournal(j);
            jl.setAccount(acc);
            jl.setDebit(line.debit());
            jl.setCredit(line.credit());
            jl.setMemo(line.memo());
            j.getLines().add(jl);
            dr = dr.add(line.debit());
            cr = cr.add(line.credit());
        }
        if (dr.compareTo(cr) != 0) {
            throw new BusinessException("Journal does not balance. Debit " + dr + " Credit " + cr);
        }
        if (j.getLines().isEmpty()) {
            throw new BusinessException("Journal has no lines");
        }
        return journals.save(j);
    }

    @Transactional
    public Journal reverse(Long journalId) {
        Journal original = journals.findDetailed(journalId)
                .orElseThrow(() -> new BusinessException("Journal not found", 404));
        if (original.isReversed()) throw new BusinessException("Journal already reversed");
        original.setReversed(true);
        journals.save(original);
        List<Line> lines = original.getLines().stream()
                .map(l -> new Line(l.getAccount().getCode(), l.getCredit(), l.getDebit(), "Reversal of " + original.getReference()))
                .toList();
        Journal rev = post("Reversal of " + original.getReference() + " — " + original.getDescription(),
                original.getSourceType(), original.getSourceId(), lines);
        rev.setReversalOf(original);
        return journals.save(rev);
    }

    public List<Map<String, Object>> listMaps() {
        return journals.findAllDetailed().stream().map(this::toMap).toList();
    }

    public Map<String, Object> reverseMap(Long id) {
        return toMap(reverse(id));
    }

    public Map<String, Object> trialBalance() {
        Map<String, Object> out = new LinkedHashMap<>();
        for (GlAccount acc : accounts.findAll()) {
            out.put(acc.getCode() + " " + acc.getName(), Map.of("debit", BigDecimal.ZERO, "credit", BigDecimal.ZERO));
        }
        for (Journal j : journals.findAllDetailed()) {
            for (var l : j.getLines()) {
                String k = l.getAccount().getCode() + " " + l.getAccount().getName();
                @SuppressWarnings("unchecked")
                Map<String, BigDecimal> v = (Map<String, BigDecimal>) out.get(k);
                if (v == null) {
                    v = new LinkedHashMap<>();
                    v.put("debit", BigDecimal.ZERO);
                    v.put("credit", BigDecimal.ZERO);
                    out.put(k, v);
                }
                Map<String, Object> next = new LinkedHashMap<>();
                BigDecimal d = (v.get("debit") == null ? BigDecimal.ZERO : v.get("debit")).add(l.getDebit());
                BigDecimal c = (v.get("credit") == null ? BigDecimal.ZERO : v.get("credit")).add(l.getCredit());
                next.put("debit", d);
                next.put("credit", c);
                out.put(k, next);
            }
        }
        return out;
    }

    public Map<String, Object> toMap(Journal j) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", j.getId());
        m.put("reference", j.getReference());
        m.put("description", j.getDescription());
        m.put("sourceType", j.getSourceType());
        m.put("sourceId", j.getSourceId());
        m.put("posted", j.isPosted());
        m.put("reversed", j.isReversed());
        m.put("createdAt", j.getCreatedAt());
        m.put("lines", j.getLines().stream().map(l -> Map.of(
                "account", l.getAccount().getCode() + " " + l.getAccount().getName(),
                "debit", l.getDebit(), "credit", l.getCredit(), "memo", l.getMemo() == null ? "" : l.getMemo()
        )).toList());
        return m;
    }

    public GlAccount require(String code) {
        return accounts.findByCode(code).orElseThrow(() -> new BusinessException("Missing GL " + code));
    }
}

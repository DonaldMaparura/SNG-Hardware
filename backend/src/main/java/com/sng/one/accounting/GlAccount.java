package com.sng.one.accounting;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gl_accounts")
public class GlAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String code;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String type;
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private GlAccount parent;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}

@Entity
@Table(name = "journals")
class Journal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String reference;
    @Column(nullable = false)
    private String description;
    @Column(name = "source_type")
    private String sourceType;
    @Column(name = "source_id")
    private Long sourceId;
    private boolean posted = true;
    private boolean reversed;
    @ManyToOne
    @JoinColumn(name = "reversal_of")
    private Journal reversalOf;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    @OneToMany(mappedBy = "journal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JournalLine> lines = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public boolean isPosted() { return posted; }
    public void setPosted(boolean posted) { this.posted = posted; }
    public boolean isReversed() { return reversed; }
    public void setReversed(boolean reversed) { this.reversed = reversed; }
    public Journal getReversalOf() { return reversalOf; }
    public void setReversalOf(Journal reversalOf) { this.reversalOf = reversalOf; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<JournalLine> getLines() { return lines; }
}

@Entity
@Table(name = "journal_lines")
class JournalLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "journal_id")
    private Journal journal;
    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id")
    private GlAccount account;
    private BigDecimal debit = BigDecimal.ZERO;
    private BigDecimal credit = BigDecimal.ZERO;
    private String memo;

    public Journal getJournal() { return journal; }
    public void setJournal(Journal journal) { this.journal = journal; }
    public GlAccount getAccount() { return account; }
    public void setAccount(GlAccount account) { this.account = account; }
    public BigDecimal getDebit() { return debit; }
    public void setDebit(BigDecimal debit) { this.debit = debit; }
    public BigDecimal getCredit() { return credit; }
    public void setCredit(BigDecimal credit) { this.credit = credit; }
    public String getMemo() { return memo; }
    public void setMemo(String memo) { this.memo = memo; }
}

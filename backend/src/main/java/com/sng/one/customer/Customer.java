package com.sng.one.customer;

import com.sng.one.identity.AppUser;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "user_id")
    private AppUser user;
    @Column(name = "account_code", nullable = false, unique = true)
    private String accountCode;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String type;
    private String email;
    private String phone;
    @Column(name = "credit_limit")
    private BigDecimal creditLimit = BigDecimal.ZERO;
    private BigDecimal outstanding = BigDecimal.ZERO;
    private boolean active = true;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public BigDecimal availableCredit() {
        return creditLimit.subtract(outstanding == null ? BigDecimal.ZERO : outstanding);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }
    public BigDecimal getOutstanding() { return outstanding; }
    public void setOutstanding(BigDecimal outstanding) { this.outstanding = outstanding; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

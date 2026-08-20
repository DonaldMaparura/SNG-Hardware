package com.sng.one.audit;

import com.sng.one.identity.AppUser;
import com.sng.one.location.Location;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;
    @Column(nullable = false)
    private String action;
    @Column(nullable = false)
    private String entity;
    @Column(name = "entity_id")
    private String entityId;
    @Column(name = "before_json")
    private String beforeJson;
    @Column(name = "after_json")
    private String afterJson;
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
    private String reason;
    @Column(name = "session_info")
    private String sessionInfo;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntity() { return entity; }
    public void setEntity(String entity) { this.entity = entity; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getBeforeJson() { return beforeJson; }
    public void setBeforeJson(String beforeJson) { this.beforeJson = beforeJson; }
    public String getAfterJson() { return afterJson; }
    public void setAfterJson(String afterJson) { this.afterJson = afterJson; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getSessionInfo() { return sessionInfo; }
    public void setSessionInfo(String sessionInfo) { this.sessionInfo = sessionInfo; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

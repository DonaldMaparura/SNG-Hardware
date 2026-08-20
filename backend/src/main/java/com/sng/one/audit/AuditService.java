package com.sng.one.audit;

import com.sng.one.identity.AppUserRepository;
import com.sng.one.location.LocationRepository;
import com.sng.one.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {
    private final AuditLogRepository logs;
    private final AppUserRepository users;
    private final LocationRepository locations;

    public AuditService(AuditLogRepository logs, AppUserRepository users, LocationRepository locations) {
        this.logs = logs;
        this.users = users;
        this.locations = locations;
    }

    @Transactional
    public void record(UserPrincipal principal, String action, String entity, String entityId,
                       String before, String after, Long locationId, String reason, String session) {
        AuditLog log = new AuditLog();
        if (principal != null) {
            users.findById(principal.getId()).ifPresent(log::setUser);
        }
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setBeforeJson(before);
        log.setAfterJson(after);
        if (locationId != null) {
            locations.findById(locationId).ifPresent(log::setLocation);
        }
        log.setReason(reason);
        log.setSessionInfo(session);
        logs.save(log);
    }

    @Transactional
    public void record(Long userId, String action, String entity, String entityId, String before, String after, Long locationId, String reason) {
        AuditLog log = new AuditLog();
        if (userId != null) users.findById(userId).ifPresent(log::setUser);
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setBeforeJson(before);
        log.setAfterJson(after);
        if (locationId != null) locations.findById(locationId).ifPresent(log::setLocation);
        log.setReason(reason);
        logs.save(log);
    }
}

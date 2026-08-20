package com.sng.one.security;

import com.sng.one.common.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    public UserPrincipal require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BusinessException("Not authenticated", 401);
        }
        return principal;
    }

    public UserPrincipal orNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    public void assertWritable() {
        UserPrincipal p = require();
        if (RoleCodeAccess.isReadOnly(p.getRole())) {
            throw new BusinessException("Auditor access is read-only", 403);
        }
    }

    public void assertLocation(Long locationId) {
        UserPrincipal p = require();
        if (!p.canAccessLocation(locationId)) {
            throw new BusinessException("You are not authorised for this location", 403);
        }
    }
}

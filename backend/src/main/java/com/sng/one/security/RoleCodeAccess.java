package com.sng.one.security;

import com.sng.one.identity.RoleCode;

public final class RoleCodeAccess {
    private RoleCodeAccess() {}

    public static boolean isEnterprise(String role) {
        return RoleCode.ADMIN.name().equals(role)
                || RoleCode.GENERAL_MANAGER.name().equals(role)
                || RoleCode.FINANCE_CONTROLLER.name().equals(role)
                || RoleCode.AUDITOR.name().equals(role);
    }

    public static boolean isReadOnly(String role) {
        return RoleCode.AUDITOR.name().equals(role);
    }
}

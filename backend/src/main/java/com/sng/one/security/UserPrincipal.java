package com.sng.one.security;

import com.sng.one.identity.AppUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String email;
    private final String password;
    private final String fullName;
    private final String role;
    private final boolean active;
    private final Long homeLocationId;
    private final Set<Long> locationIds;

    public UserPrincipal(AppUser user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.fullName = user.getFullName();
        this.role = user.getRoleCode();
        this.active = user.isActive();
        this.homeLocationId = user.getHomeLocation() == null ? null : user.getHomeLocation().getId();
        this.locationIds = user.getLocations().stream().map(l -> l.getId()).collect(Collectors.toSet());
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
    public Long getHomeLocationId() { return homeLocationId; }
    public Set<Long> getLocationIds() { return locationIds; }

    public boolean canAccessLocation(Long locationId) {
        if (locationId == null) return true;
        if (RoleCodeAccess.isEnterprise(role)) return true;
        return locationIds.contains(locationId);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return active; }
}

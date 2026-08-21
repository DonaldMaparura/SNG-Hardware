package com.sng.one.identity;

import com.sng.one.common.BusinessException;
import com.sng.one.security.JwtService;
import com.sng.one.security.UserPrincipal;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final AppUserRepository users;
    private final boolean demoOneClick;
    private final String demoPassword;

    public AuthController(AuthenticationManager authManager, JwtService jwtService, AppUserRepository users,
                          @Value("${sng.demo-one-click:false}") boolean demoOneClick,
                          @Value("${sng.demo-password:SngOne2026!}") String demoPassword) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.users = users;
        this.demoOneClick = demoOneClick;
        this.demoPassword = demoPassword;
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    @PostMapping("/demo")
    public Map<String, Object> demo(@RequestBody Map<String, String> body) {
        if (!demoOneClick) {
            throw new BusinessException("Demo login is not enabled", 404);
        }
        String role = body.getOrDefault("role", "").toUpperCase();
        String email = switch (role) {
            case "GENERAL_MANAGER", "GM" -> "gm@sng.one";
            case "OPERATIONS_MANAGER" -> "ops@sng.one";
            case "DIRECTOR" -> "director@sng.one";
            case "BRANCH_MANAGER" -> "harare.manager@sng.one";
            case "WAREHOUSE_MANAGER" -> "warehouse.manager@sng.one";
            case "STORE_OPERATOR", "CASHIER" -> "cashier@sng.one";
            case "DRIVER" -> "driver@sng.one";
            case "FINANCE", "FINANCE_CONTROLLER" -> "finance@sng.one";
            case "AUDITOR" -> "auditor@sng.one";
            case "CUSTOMER", "TRADE" -> "abc@construction.zw";
            default -> throw new BusinessException("Unknown demo role");
        };
        return login(new LoginRequest(email, demoPassword));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        UserPrincipal p = (UserPrincipal) auth.getPrincipal();
        String token = jwtService.issue(p.getUsername(), p.getRole(), p.getId());
        return Map.of(
                "token", token,
                "user", me(p)
        );
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        UserPrincipal p = (UserPrincipal) authentication.getPrincipal();
        return me(p);
    }

    private Map<String, Object> me(UserPrincipal p) {
        var user = users.findWithLocationsById(p.getId()).orElseThrow();
        return Map.of(
                "id", p.getId(),
                "email", p.getUsername(),
                "fullName", p.getFullName(),
                "role", p.getRole(),
                "homeLocationId", p.getHomeLocationId() == null ? 0 : p.getHomeLocationId(),
                "homeLocationName", user.getHomeLocation() == null ? "" : user.getHomeLocation().getName(),
                "locationIds", p.getLocationIds()
        );
    }
}

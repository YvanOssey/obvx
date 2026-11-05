package OBVX.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Le compte administrateur est unique et défini par l'hébergeur (variable ADMIN_EMAIL).
 * Il est réservé à la gestion de la boutique : pas d'inscription, pas de commande,
 * connexion uniquement par la page /admin/login.
 */
@Component
public class AdminAccess {

    private final String adminEmail;

    public AdminAccess(@Value("${app.admin.email:}") String email) {
        this.adminEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    public boolean isConfigured() {
        return !adminEmail.isEmpty();
    }

    public String email() {
        return adminEmail;
    }

    public boolean isAdmin(String email) {
        return isConfigured() && email != null && adminEmail.equals(email.trim().toLowerCase(Locale.ROOT));
    }
}

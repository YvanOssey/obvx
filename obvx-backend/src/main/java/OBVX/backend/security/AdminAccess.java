package OBVX.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Les administrateurs sont listés dans la variable ADMIN_EMAILS (séparés par des virgules).
 * Aucun écran ne permet de devenir admin : seul l'hébergeur peut modifier cette liste.
 */
@Component
public class AdminAccess {

    private final Set<String> adminEmails;

    public AdminAccess(@Value("${app.admin-emails:}") List<String> emails) {
        this.adminEmails = emails.stream()
                .map(email -> email.trim().toLowerCase(Locale.ROOT))
                .filter(email -> !email.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    public boolean isAdmin(String email) {
        return email != null && adminEmails.contains(email.toLowerCase(Locale.ROOT));
    }
}

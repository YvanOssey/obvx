package OBVX.backend.config;

import OBVX.backend.entity.User;
import OBVX.backend.repository.UserRepository;
import OBVX.backend.security.AdminAccess;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crée ou met à jour le compte administrateur au démarrage, à partir de
 * ADMIN_EMAIL et ADMIN_PASSWORD. Pour changer le mot de passe admin (ou en cas d'oubli),
 * il suffit de modifier ADMIN_PASSWORD chez l'hébergeur et de redémarrer.
 */
@Slf4j
@Component
public class AdminBootstrap implements CommandLineRunner {

    static final int MIN_PASSWORD_LENGTH = 12;

    private final AdminAccess adminAccess;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminPassword;

    public AdminBootstrap(AdminAccess adminAccess,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.admin.password:}") String adminPassword) {
        this.adminAccess = adminAccess;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPassword = adminPassword == null ? "" : adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!adminAccess.isConfigured()) {
            log.warn("ADMIN_EMAIL non défini : l'espace admin est inaccessible.");
            return;
        }

        User admin = userRepository.findByEmail(adminAccess.email()).orElse(null);

        if (adminPassword.isBlank()) {
            if (admin == null) {
                log.warn("ADMIN_PASSWORD non défini : le compte admin n'a pas été créé.");
            }
            return;
        }
        if (adminPassword.length() < MIN_PASSWORD_LENGTH) {
            log.error("ADMIN_PASSWORD trop court ({} caractères minimum) : ignoré, compte admin inchangé.",
                    MIN_PASSWORD_LENGTH);
            return;
        }

        if (admin == null) {
            userRepository.save(User.builder()
                    .firstName("Admin")
                    .lastName("OBVX")
                    .email(adminAccess.email())
                    .password(passwordEncoder.encode(adminPassword))
                    .build());
            log.info("Compte administrateur créé.");
        } else if (!passwordEncoder.matches(adminPassword, admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(adminPassword));
            log.info("Mot de passe administrateur mis à jour depuis ADMIN_PASSWORD.");
        }
    }
}

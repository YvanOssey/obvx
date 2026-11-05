package OBVX.backend.config;

import OBVX.backend.entity.User;
import OBVX.backend.repository.UserRepository;
import OBVX.backend.security.AdminAccess;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminBootstrapTest {

    private static final String EMAIL = "admin@obvx.dev";
    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private final UserRepository repository = mock(UserRepository.class);

    private AdminBootstrap bootstrap(String email, String password) {
        return new AdminBootstrap(new AdminAccess(email), repository, encoder, password);
    }

    @Test
    void creeLeCompteAdminSiAbsent() {
        when(repository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        bootstrap("Admin@OBVX.dev ", "un-mot-de-passe-solide").run();

        verify(repository).save(argThat(u ->
                u.getEmail().equals(EMAIL) && encoder.matches("un-mot-de-passe-solide", u.getPassword())));
    }

    @Test
    void remplaceLeMotDePasseQuandAdminPasswordChange() {
        User admin = User.builder().email(EMAIL).firstName("Admin").lastName("OBVX")
                .password(encoder.encode("ancien-mot-de-passe")).build();
        when(repository.findByEmail(EMAIL)).thenReturn(Optional.of(admin));

        bootstrap(EMAIL, "nouveau-mot-de-passe").run();

        assertTrue(encoder.matches("nouveau-mot-de-passe", admin.getPassword()));
        assertFalse(encoder.matches("ancien-mot-de-passe", admin.getPassword()));
    }

    @Test
    void ignoreUnMotDePasseTropCourt() {
        User admin = User.builder().email(EMAIL).password(encoder.encode("ancien-mot-de-passe")).build();
        when(repository.findByEmail(EMAIL)).thenReturn(Optional.of(admin));

        bootstrap(EMAIL, "court").run();

        assertTrue(encoder.matches("ancien-mot-de-passe", admin.getPassword()));
        verify(repository, never()).save(any());
    }

    @Test
    void neFaitRienSansAdminEmail() {
        bootstrap("", "un-mot-de-passe-solide").run();

        verifyNoInteractions(repository);
    }
}

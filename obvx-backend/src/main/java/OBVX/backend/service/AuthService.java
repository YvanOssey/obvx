package OBVX.backend.service;

import OBVX.backend.dto.request.LoginRequest;
import OBVX.backend.dto.request.RegisterRequest;
import OBVX.backend.dto.response.AuthResponse;
import OBVX.backend.entity.User;
import OBVX.backend.exception.ApiException;
import OBVX.backend.repository.UserRepository;
import OBVX.backend.security.AdminAccess;
import OBVX.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String BAD_CREDENTIALS = "Email ou mot de passe incorrect";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AdminAccess adminAccess;

    public AuthResponse register(RegisterRequest request) {

        String email = normalize(request.getEmail());

        // L'email admin est réservé : même message que pour un email déjà pris
        if (adminAccess.isAdmin(email) || userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        // Connecté directement après l'inscription
        return toResponse(userRepository.save(user), true);
    }

    /** Connexion client : le compte admin passe par adminLogin (page /admin/login). */
    public AuthResponse login(LoginRequest request) {
        return authenticate(request, false);
    }

    /** Connexion à l'espace admin : seul le compte ADMIN_EMAIL est accepté. */
    public AuthResponse adminLogin(LoginRequest request) {
        return authenticate(request, true);
    }

    private AuthResponse authenticate(LoginRequest request, boolean adminArea) {
        String email = normalize(request.getEmail());
        User user = userRepository.findByEmail(email).orElse(null);

        // Mot de passe toujours vérifié (même durée de réponse), message identique dans tous les cas
        boolean passwordOk = user != null && passwordEncoder.matches(request.getPassword(), user.getPassword());
        boolean rightArea = adminAccess.isAdmin(email) == adminArea;
        if (!passwordOk || !rightArea) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS);
        }

        return toResponse(user, true);
    }

    public AuthResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session expirée, reconnecte-toi"));
        return toResponse(user, false);
    }

    private AuthResponse toResponse(User user, boolean withToken) {
        return AuthResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .token(withToken ? jwtService.generateToken(user.getEmail()) : null)
                .admin(adminAccess.isAdmin(user.getEmail()))
                .build();
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

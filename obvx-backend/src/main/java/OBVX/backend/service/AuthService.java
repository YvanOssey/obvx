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

        if (userRepository.existsByEmail(email)) {
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

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(normalize(request.getEmail()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
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

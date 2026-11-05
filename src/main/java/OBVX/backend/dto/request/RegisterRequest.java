package OBVX.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 60, message = "Prénom trop long")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 60, message = "Nom trop long")
    private String lastName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    @Size(max = 120, message = "Email trop long")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, max = 72, message = "Le mot de passe doit faire au moins 8 caractères")
    private String password;
}

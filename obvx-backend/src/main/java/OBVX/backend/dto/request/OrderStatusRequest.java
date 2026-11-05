package OBVX.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record OrderStatusRequest(
        @NotBlank(message = "Statut manquant")
        String status
) {
}

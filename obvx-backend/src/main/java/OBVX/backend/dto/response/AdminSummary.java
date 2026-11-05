package OBVX.backend.dto.response;

import java.util.Map;

/**
 * Chiffres clés du tableau de bord.
 *
 * @param countByStatus nombre de commandes par statut
 * @param revenue       total des commandes non annulées, en FCFA
 * @param totalOrders   nombre total de commandes
 */
public record AdminSummary(Map<String, Long> countByStatus, long revenue, long totalOrders) {
}

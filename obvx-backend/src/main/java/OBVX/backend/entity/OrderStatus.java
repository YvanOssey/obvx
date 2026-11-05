package OBVX.backend.entity;

/** Étapes d'une commande, dans l'ordre (le nom est stocké tel quel en base). */
public enum OrderStatus {
    EN_ATTENTE,
    CONFIRMEE,
    EXPEDIEE,
    LIVREE,
    ANNULEE
}

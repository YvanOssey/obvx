package OBVX.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant createdAt;

    /** Total en FCFA, calculé côté serveur. */
    @Column(nullable = false)
    private Integer total;

    @Column(nullable = false)
    @Builder.Default
    private String status = OrderStatus.EN_ATTENTE.name();

    // Coordonnées de livraison (nullables pour les commandes passées avant leur ajout)
    @Column(length = 30)
    private String phone;

    @Column(length = 300)
    private String address;

    @Column(length = 500)
    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 50)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}

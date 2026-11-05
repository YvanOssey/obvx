package OBVX.backend.repository;

import OBVX.backend.entity.CustomerOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = "items")
    List<CustomerOrder> findByUserEmailOrderByCreatedAtDesc(String email);

    /**
     * Commandes pour l'admin, les plus récentes d'abord.
     * Filtres optionnels (chaîne vide = pas de filtre) : statut, et recherche dans le nom,
     * l'email ou le téléphone du client, ou le numéro exact de commande.
     * Les articles sont chargés ensuite par lots (@BatchSize) pour garder une pagination en base.
     */
    @EntityGraph(attributePaths = "user")
    @Query(value = """
            select o from CustomerOrder o join o.user u
            where (:status = '' or o.status = :status)
              and (:search = ''
                   or lower(u.email) like :search
                   or lower(concat(u.firstName, ' ', u.lastName)) like :search
                   or o.phone like :search
                   or cast(o.id as string) = :exactId)
            order by o.createdAt desc
            """,
            countQuery = """
            select count(o) from CustomerOrder o join o.user u
            where (:status = '' or o.status = :status)
              and (:search = ''
                   or lower(u.email) like :search
                   or lower(concat(u.firstName, ' ', u.lastName)) like :search
                   or o.phone like :search
                   or cast(o.id as string) = :exactId)
            """)
    Page<CustomerOrder> searchForAdmin(@Param("status") String status,
                                       @Param("search") String search,
                                       @Param("exactId") String exactId,
                                       Pageable pageable);

    /** Pour chaque statut : nombre de commandes et montant total. */
    @Query("select o.status, count(o), coalesce(sum(o.total), 0) from CustomerOrder o group by o.status")
    List<Object[]> summarizeByStatus();
}

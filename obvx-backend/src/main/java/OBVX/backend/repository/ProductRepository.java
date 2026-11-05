package OBVX.backend.repository;

import OBVX.backend.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {

    // Charge les tailles dans la même requête (évite une requête par produit)
    @EntityGraph(attributePaths = "sizes")
    List<Product> findByActiveTrueOrderByNewArrivalDescNameAsc();

    @EntityGraph(attributePaths = "sizes")
    Optional<Product> findByIdAndActiveTrue(String id);
}

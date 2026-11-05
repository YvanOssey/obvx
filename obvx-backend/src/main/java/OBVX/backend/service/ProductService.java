package OBVX.backend.service;

import OBVX.backend.dto.response.ProductResponse;
import OBVX.backend.exception.ApiException;
import OBVX.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> findAll() {
        return productRepository.findByActiveTrueOrderByNewArrivalDescNameAsc().stream()
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse findById(String id) {
        return productRepository.findByIdAndActiveTrue(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Produit introuvable"));
    }
}

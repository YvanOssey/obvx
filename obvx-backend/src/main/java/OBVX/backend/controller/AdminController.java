package OBVX.backend.controller;

import OBVX.backend.dto.request.OrderStatusRequest;
import OBVX.backend.dto.request.ProductRequest;
import OBVX.backend.dto.response.AdminOrderResponse;
import OBVX.backend.dto.response.AdminProductResponse;
import OBVX.backend.dto.response.AdminSummary;
import OBVX.backend.dto.response.PageResponse;
import OBVX.backend.service.AdminOrderService;
import OBVX.backend.service.AdminProductService;
import OBVX.backend.service.ImageUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/** Espace d'administration : réservé au compte ADMIN_EMAIL (voir SecurityConfig et AdminBootstrap). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminOrderService adminOrderService;
    private final AdminProductService adminProductService;
    private final ImageUploadService imageUploadService;

    // ---- Commandes ----

    @GetMapping("/summary")
    public AdminSummary summary() {
        return adminOrderService.summary();
    }

    @GetMapping("/orders")
    public PageResponse<AdminOrderResponse> orders(
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminOrderService.search(status, q, page, size);
    }

    @PatchMapping("/orders/{id}/status")
    public AdminOrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusRequest request) {
        return adminOrderService.updateStatus(id, request.status());
    }

    // ---- Produits ----

    @GetMapping("/products")
    public List<AdminProductResponse> products() {
        return adminProductService.findAll();
    }

    @PostMapping("/products")
    public ResponseEntity<AdminProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminProductService.create(request));
    }

    @PutMapping("/products/{id}")
    public AdminProductResponse updateProduct(@PathVariable String id, @Valid @RequestBody ProductRequest request) {
        return adminProductService.update(id, request);
    }

    // ---- Photos ----

    @GetMapping("/uploads/status")
    public Map<String, Boolean> uploadStatus() {
        return Map.of("enabled", imageUploadService.isEnabled());
    }

    @PostMapping(path = "/uploads", consumes = "multipart/form-data")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        return Map.of("url", imageUploadService.upload(file));
    }
}

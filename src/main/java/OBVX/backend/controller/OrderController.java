package OBVX.backend.controller;

import OBVX.backend.dto.request.OrderRequest;
import OBVX.backend.dto.response.OrderResponse;
import OBVX.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(
            Authentication authentication,
            @Valid @RequestBody OrderRequest request
    ) {
        OrderResponse order = orderService.create(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/me")
    public List<OrderResponse> mine(Authentication authentication) {
        return orderService.findMine(authentication.getName());
    }
}

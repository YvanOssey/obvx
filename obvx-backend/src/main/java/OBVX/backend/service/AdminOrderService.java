package OBVX.backend.service;

import OBVX.backend.dto.response.AdminOrderResponse;
import OBVX.backend.dto.response.AdminSummary;
import OBVX.backend.dto.response.PageResponse;
import OBVX.backend.entity.CustomerOrder;
import OBVX.backend.entity.OrderStatus;
import OBVX.backend.exception.ApiException;
import OBVX.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private static final int MAX_PAGE_SIZE = 100;

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public PageResponse<AdminOrderResponse> search(String status, String query, int page, int size) {
        String statusFilter = status == null || status.isBlank() ? "" : parseStatus(status).name();
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        String search = q.isEmpty() ? "" : "%" + q.replace("%", "").replace("_", "") + "%";
        String exactId = q.replaceFirst("^#", "");

        var result = orderRepository.searchForAdmin(statusFilter, search, exactId,
                PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, MAX_PAGE_SIZE))));
        return PageResponse.of(result, AdminOrderResponse::from);
    }

    @Transactional
    public AdminOrderResponse updateStatus(Long id, String status) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Commande introuvable"));
        order.setStatus(parseStatus(status).name());
        return AdminOrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public AdminSummary summary() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            counts.put(s.name(), 0L);
        }
        long revenue = 0;
        long total = 0;
        for (Object[] row : orderRepository.summarizeByStatus()) {
            String status = (String) row[0];
            long count = ((Number) row[1]).longValue();
            long amount = ((Number) row[2]).longValue();
            counts.merge(status, count, Long::sum);
            total += count;
            if (!OrderStatus.ANNULEE.name().equals(status)) {
                revenue += amount;
            }
        }
        return new AdminSummary(counts, revenue, total);
    }

    private static OrderStatus parseStatus(String status) {
        try {
            return OrderStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Statut inconnu : " + status);
        }
    }
}

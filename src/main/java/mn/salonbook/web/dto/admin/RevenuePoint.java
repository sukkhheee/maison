package mn.salonbook.web.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenuePoint(
    LocalDate date,
    BigDecimal revenue,
    long bookingCount
) {
}

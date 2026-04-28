package mn.salonbook.web.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyStatsResponse(
    LocalDate date,
    BigDecimal todayRevenue,
    long todayBookingCount,
    BigDecimal pendingPayments,
    long pendingPaymentCount,
    long newClientsToday,
    String currency
) {
}

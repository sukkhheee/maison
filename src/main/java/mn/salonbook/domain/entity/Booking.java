package mn.salonbook.domain.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mn.salonbook.domain.enums.BookingStatus;
import mn.salonbook.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A customer's appointment with a Staff member for one or more Services.
 *
 * <p><b>Conflict-detection contract:</b> {@code startTime} is provided by the client;
 * {@code endTime} is computed by the BookingService as {@code startTime + sum(service.durationMinutes)}.
 * Both are persisted so the overlap query is a pure column-vs-column comparison and can use a
 * composite index on (staff_id, start_time, end_time, status).
 *
 * <p>Two bookings overlap iff:  {@code a.startTime < b.endTime AND a.endTime > b.startTime}.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "bookings",
    indexes = {
        @Index(name = "idx_bookings_salon", columnList = "salon_id"),
        @Index(name = "idx_bookings_client", columnList = "client_id"),
        // Composite index that powers the conflict-detection query in BookingService.
        @Index(name = "idx_bookings_staff_window", columnList = "staff_id,start_time,end_time,status")
    }
)
public class Booking extends TenantAwareEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_booking_staff"))
    private Staff staff;

    /** The customer who placed the booking — a User with role CLIENT. */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_booking_client"))
    private User client;

    @NotNull
    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @NotNull
    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    /** Snapshot of the price at booking time (sum of selected services). */
    @PositiveOrZero
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "MNT";

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 16)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(length = 1000)
    private String notes;

    /* ------------------------------------------------------------------ */
    /* QPay integration                                                    */
    /* ------------------------------------------------------------------ */

    /** QPay invoice id returned from {@code POST /invoice}. */
    @Column(name = "qpay_invoice_id", length = 64)
    private String qpayInvoiceId;

    /** QR-encodable string (qPay deep link). Persisted so we can re-show it. */
    @Column(name = "qpay_qr_text", length = 1024)
    private String qpayQrText;

    @Column(name = "qpay_invoice_created_at")
    private Instant qpayInvoiceCreatedAt;

    /** QPay payment id received in the webhook callback. */
    @Column(name = "qpay_payment_id", length = 64)
    private String qpayPaymentId;

    @Column(name = "qpay_paid_at")
    private Instant qpayPaidAt;

    /**
     * Many-to-many: a booking can include multiple services (e.g. cut + color),
     * and a service can appear in many bookings.
     * Cascade is intentionally limited — we never delete services through bookings.
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "booking_services",
        joinColumns = @JoinColumn(name = "booking_id",
            foreignKey = @ForeignKey(name = "fk_booking_services_booking")),
        inverseJoinColumns = @JoinColumn(name = "service_id",
            foreignKey = @ForeignKey(name = "fk_booking_services_service")),
        indexes = {
            @Index(name = "idx_booking_services_booking", columnList = "booking_id"),
            @Index(name = "idx_booking_services_service", columnList = "service_id")
        }
    )
    @Builder.Default
    private Set<ServiceItem> services = new HashSet<>();

    /** Convenience for the conflict checker — only these block the slot. */
    public boolean blocksSlot() {
        return status == BookingStatus.PENDING || status == BookingStatus.CONFIRMED;
    }
}

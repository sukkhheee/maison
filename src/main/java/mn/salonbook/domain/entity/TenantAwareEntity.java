package mn.salonbook.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class TenantAwareEntity extends BaseEntity {

    /**
     * Discriminator column for multi-tenancy.
     * Every tenant-scoped query MUST filter by this column.
     * Stored as a plain column (not a FK association) so it can be set
     * automatically by a TenantContext interceptor without loading the Salon.
     */
    @Column(name = "salon_id", nullable = false, updatable = false)
    private Long salonId;
}

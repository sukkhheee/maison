package mn.salonbook.repository;

import jakarta.persistence.LockModeType;
import mn.salonbook.domain.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByExternalIdAndSalonId(String externalId, Long salonId);

    List<Staff> findAllBySalonIdAndActiveTrue(Long salonId);

    /**
     * Pessimistic write lock used by BookingService to serialize concurrent
     * booking creates against the same staff row. Prevents the classic
     * read-then-insert race where two threads both see no conflict and both
     * insert overlapping bookings.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Staff s WHERE s.id = :id AND s.salonId = :salonId")
    Optional<Staff> findByIdAndSalonIdForUpdate(@Param("id") Long id,
                                                @Param("salonId") Long salonId);
}

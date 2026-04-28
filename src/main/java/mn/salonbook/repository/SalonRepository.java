package mn.salonbook.repository;

import mn.salonbook.domain.entity.Salon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalonRepository extends JpaRepository<Salon, Long> {
    Optional<Salon> findBySlugAndActiveTrue(String slug);

    boolean existsBySlug(String slug);

    /** Public directory listing — sorted alphabetically for stable display. */
    List<Salon> findAllByActiveTrueOrderByNameAsc();
}

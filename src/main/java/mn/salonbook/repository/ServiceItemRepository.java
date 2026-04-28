package mn.salonbook.repository;

import mn.salonbook.domain.entity.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {

    List<ServiceItem> findAllByExternalIdInAndSalonId(List<String> externalIds, Long salonId);

    List<ServiceItem> findAllBySalonIdAndActiveTrue(Long salonId);
}

package com.sentinel.billing.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.billing.dto.CreatePriceListItemRequest;
import com.sentinel.billing.dto.CreatePriceListRequest;
import com.sentinel.billing.dto.PriceListItemResponseDTO;
import com.sentinel.billing.dto.PriceListResponseDTO;
import com.sentinel.billing.entity.PriceList;
import com.sentinel.billing.entity.PriceListItem;
import com.sentinel.billing.repository.PriceListItemRepository;
import com.sentinel.billing.repository.PriceListRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.entity.Facility;
import com.sentinel.tenancy.repository.FacilityRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PriceListService {

    private final PriceListRepository priceListRepository;
    private final PriceListItemRepository priceListItemRepository;
    private final OrganizationRepository organizationRepository;
    private final FacilityRepository facilityRepository;
    private final AuditService auditService;

    public PriceListService(PriceListRepository priceListRepository,
                            PriceListItemRepository priceListItemRepository,
                            OrganizationRepository organizationRepository,
                            FacilityRepository facilityRepository,
                            AuditService auditService) {
        this.priceListRepository = priceListRepository;
        this.priceListItemRepository = priceListItemRepository;
        this.organizationRepository = organizationRepository;
        this.facilityRepository = facilityRepository;
        this.auditService = auditService;
    }

    public PriceListResponseDTO createPriceList(UUID facilityId, CreatePriceListRequest request) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));

        PriceList priceList = new PriceList();
        priceList.setOrganization(facility.getOrganization());
        priceList.setName(request.getName());
        priceList.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        priceList.setActive(true);

        PriceList saved = priceListRepository.save(priceList);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PRICE_LIST_CREATED", "Created price list " + saved.getName());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PriceListResponseDTO> getFacilityPriceLists(UUID facilityId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));

        return priceListRepository.findByOrganizationId(facility.getOrganization().getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PriceListItemResponseDTO addItem(UUID priceListId, CreatePriceListItemRequest request) {
        PriceList priceList = priceListRepository.findById(priceListId)
                .orElseThrow(() -> new ResourceNotFoundException("Price list not found with id: " + priceListId));

        PriceListItem item = new PriceListItem();
        item.setPriceList(priceList);
        item.setServiceType(request.getServiceType());
        item.setServiceCode(request.getServiceCode());
        item.setDescription(request.getDescription());
        item.setAmount(request.getAmount());

        PriceListItem saved = priceListItemRepository.save(item);
        return mapItemToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PriceListItemResponseDTO> getPriceListItems(UUID priceListId) {
        return priceListItemRepository.findByPriceListId(priceListId).stream()
                .map(this::mapItemToDTO)
                .collect(Collectors.toList());
    }

    public PriceListResponseDTO mapToDTO(PriceList p) {
        PriceListResponseDTO dto = new PriceListResponseDTO();
        dto.setId(p.getId());
        if (p.getOrganization() != null) dto.setOrganizationId(p.getOrganization().getId());
        dto.setName(p.getName());
        dto.setCurrency(p.getCurrency());
        dto.setActive(p.getActive());
        return dto;
    }

    public PriceListItemResponseDTO mapItemToDTO(PriceListItem i) {
        PriceListItemResponseDTO dto = new PriceListItemResponseDTO();
        dto.setId(i.getId());
        if (i.getPriceList() != null) dto.setPriceListId(i.getPriceList().getId());
        dto.setServiceType(i.getServiceType());
        dto.setServiceCode(i.getServiceCode());
        dto.setDescription(i.getDescription());
        dto.setAmount(i.getAmount());
        return dto;
    }
}

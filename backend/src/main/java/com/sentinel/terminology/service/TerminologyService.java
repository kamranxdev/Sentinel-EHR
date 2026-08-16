package com.sentinel.terminology.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.terminology.dto.CodeSystemResponseDTO;
import com.sentinel.terminology.dto.CreateCodeSystemRequest;
import com.sentinel.terminology.dto.CreateTerminologyCodeRequest;
import com.sentinel.terminology.dto.TerminologyCodeResponseDTO;
import com.sentinel.terminology.entity.CodeSystem;
import com.sentinel.terminology.entity.TerminologyCode;
import com.sentinel.terminology.repository.CodeSystemRepository;
import com.sentinel.terminology.repository.TerminologyCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TerminologyService {

    private final CodeSystemRepository codeSystemRepository;
    private final TerminologyCodeRepository terminologyCodeRepository;

    public TerminologyService(CodeSystemRepository codeSystemRepository,
                              TerminologyCodeRepository terminologyCodeRepository) {
        this.codeSystemRepository = codeSystemRepository;
        this.terminologyCodeRepository = terminologyCodeRepository;
    }

    public CodeSystemResponseDTO createCodeSystem(CreateCodeSystemRequest request) {
        CodeSystem cs = new CodeSystem();
        cs.setCode(request.getCode());
        cs.setName(request.getName());
        cs.setUri(request.getUri());
        cs.setVersion(request.getVersion());
        CodeSystem saved = codeSystemRepository.save(cs);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<CodeSystemResponseDTO> getAllCodeSystems() {
        return codeSystemRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TerminologyCodeResponseDTO createCode(UUID systemId, CreateTerminologyCodeRequest request) {
        CodeSystem cs = codeSystemRepository.findById(systemId)
                .orElseThrow(() -> new ResourceNotFoundException("Code system not found with id: " + systemId));

        TerminologyCode tc = new TerminologyCode();
        tc.setCodeSystem(cs);
        tc.setCode(request.getCode());
        tc.setDisplay(request.getDisplay());
        tc.setParentCode(request.getParentCode());
        tc.setValidFrom(request.getValidFrom());
        tc.setValidTo(request.getValidTo());
        tc.setActive(request.getActive() != null ? request.getActive() : true);

        TerminologyCode saved = terminologyCodeRepository.save(tc);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<TerminologyCodeResponseDTO> getCodesBySystem(UUID systemId) {
        return terminologyCodeRepository.findByCodeSystemId(systemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TerminologyCodeResponseDTO> searchCodes(String query) {
        return terminologyCodeRepository.searchCodes(query).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CodeSystemResponseDTO mapToDTO(CodeSystem cs) {
        CodeSystemResponseDTO dto = new CodeSystemResponseDTO();
        dto.setId(cs.getId());
        dto.setCode(cs.getCode());
        dto.setName(cs.getName());
        dto.setUri(cs.getUri());
        dto.setVersion(cs.getVersion());
        return dto;
    }

    public TerminologyCodeResponseDTO mapToDTO(TerminologyCode tc) {
        TerminologyCodeResponseDTO dto = new TerminologyCodeResponseDTO();
        dto.setId(tc.getId());
        if (tc.getCodeSystem() != null) {
            dto.setCodeSystemId(tc.getCodeSystem().getId());
            dto.setCodeSystemCode(tc.getCodeSystem().getCode());
        }
        dto.setCode(tc.getCode());
        dto.setDisplay(tc.getDisplay());
        dto.setParentCode(tc.getParentCode());
        dto.setValidFrom(tc.getValidFrom());
        dto.setValidTo(tc.getValidTo());
        dto.setActive(tc.getActive());
        return dto;
    }
}

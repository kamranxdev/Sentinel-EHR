package com.sentinel.authorization.rbac;

import com.sentinel.users.entity.Role;
import com.sentinel.users.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RbacService {

    private final RoleRepository roleRepository;

    public RbacService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Optional<Role> getRoleByName(String name) {
        return roleRepository.findByName(name);
    }
}

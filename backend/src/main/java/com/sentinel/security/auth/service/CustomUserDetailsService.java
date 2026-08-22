package com.sentinel.security.auth.service;

import com.sentinel.security.security.UserPrincipal;
import com.sentinel.security.entity.Permission;
import com.sentinel.security.entity.Role;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Set<GrantedAuthority> authorities = new HashSet<>();
        Set<String> roleNames = new HashSet<>();
        Set<String> permissionCodes = new HashSet<>();

        for (Role role : user.getRoles()) {
            roleNames.add(role.getName());
            authorities.add(new SimpleGrantedAuthority(role.getName()));
            if (!role.getName().startsWith("ROLE_")) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            }

            if (role.getPermissions() != null) {
                for (Permission permission : role.getPermissions()) {
                    permissionCodes.add(permission.getCode());
                    authorities.add(new SimpleGrantedAuthority(permission.getCode()));
                    if (!permission.getCode().startsWith("ROLE_")) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + permission.getCode()));
                    }
                }
            }
        }


        return new UserPrincipal(
                user.getId(),
                null,
                user.getEmail(),
                user.getPassword(),
                user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail(),
                null,
                authorities,
                roleNames,
                permissionCodes);
    }
}

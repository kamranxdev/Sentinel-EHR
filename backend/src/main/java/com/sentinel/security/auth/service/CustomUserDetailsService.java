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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + username));

        Set<GrantedAuthority> authorities = new HashSet<>();
        Set<String> roleNames = new HashSet<>();
        Set<String> permissionCodes = new HashSet<>();

        for (Role role : user.getRoles()) {
            roleNames.add(role.getName());
            authorities.add(new SimpleGrantedAuthority(role.getName()));

            if (role.getPermissions() != null) {
                for (Permission permission : role.getPermissions()) {
                    permissionCodes.add(permission.getCode());
                    authorities.add(new SimpleGrantedAuthority(permission.getCode()));
                }
            }
        }

        return new UserPrincipal(
                user.getId(),
                null,
                user.getUsername(),
                user.getPassword(),
                user.getEmail(),
                user.getPerson() != null ? user.getPerson().getFullName() : user.getUsername(),
                null,
                authorities,
                roleNames,
                permissionCodes);
    }
}

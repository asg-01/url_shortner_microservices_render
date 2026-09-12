package com.amritansh.urlcreationservice.repository;

import com.amritansh.urlcreationservice.entity.WebAuthnCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WebAuthnCredentialRepository
        extends JpaRepository<WebAuthnCredential, Long> {

    Optional<WebAuthnCredential> findByCredentialId(String credentialId);

    boolean existsByCredentialId(String credentialId);

    void deleteByUserId(Long userId);
}
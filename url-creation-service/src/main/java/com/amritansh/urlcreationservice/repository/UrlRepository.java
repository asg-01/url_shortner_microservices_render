package com.amritansh.urlcreationservice.repository;

import com.amritansh.urlcreationservice.entity.ShortUrl;
import com.amritansh.urlcreationservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UrlRepository extends JpaRepository<ShortUrl, Long> {

    boolean existsByUserAndOriginalUrlHash(
            User user,
            String originalUrlHash
    );

    boolean existsByUserAndOriginalUrlHashAndIdNot(
            User user,
            String originalUrlHash,
            Long id
    );

    Optional<ShortUrl> findByShortCode(String shortCode);

    List<ShortUrl> findByUser(User user);

    long countByUser(User user);

    Optional<ShortUrl> findByIdAndUser(Long id, User user);
}
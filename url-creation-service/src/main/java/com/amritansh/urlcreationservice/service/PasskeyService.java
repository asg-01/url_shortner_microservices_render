package com.amritansh.urlcreationservice.service;

import com.amritansh.urlcreationservice.entity.User;
import com.amritansh.urlcreationservice.entity.WebAuthnCredential;
import com.amritansh.urlcreationservice.repository.UserRepository;
import com.amritansh.urlcreationservice.repository.WebAuthnCredentialRepository;

import com.webauthn4j.WebAuthnAuthenticationManager;
import com.webauthn4j.WebAuthnRegistrationManager;
import com.webauthn4j.converter.AttestationObjectConverter;
import com.webauthn4j.converter.CollectedClientDataConverter;
import com.webauthn4j.converter.util.ObjectConverter;
import com.webauthn4j.credential.CredentialRecordImpl;

import com.webauthn4j.data.AuthenticationData;
import com.webauthn4j.data.AuthenticationParameters;
import com.webauthn4j.data.PublicKeyCredentialParameters;
import com.webauthn4j.data.PublicKeyCredentialType;
import com.webauthn4j.data.RegistrationData;
import com.webauthn4j.data.RegistrationParameters;

import com.webauthn4j.data.attestation.AttestationObject;
import com.webauthn4j.data.attestation.statement.COSEAlgorithmIdentifier;

import com.webauthn4j.data.client.CollectedClientData;
import com.webauthn4j.data.client.Origin;
import com.webauthn4j.data.client.challenge.DefaultChallenge;

import com.webauthn4j.server.ServerProperty;
import com.webauthn4j.util.Base64UrlUtil;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PasskeyService {

    private static final Duration CHALLENGE_TTL =
            Duration.ofMinutes(5);

    private final UserRepository userRepository;
    private final WebAuthnCredentialRepository credentialRepository;
    private final StringRedisTemplate redisTemplate;
    private final JwtService jwtService;

    private final WebAuthnRegistrationManager registrationManager;
    private final WebAuthnAuthenticationManager authenticationManager;

    private final ObjectConverter objectConverter;
    private final AttestationObjectConverter attestationObjectConverter;
    private final CollectedClientDataConverter collectedClientDataConverter;

    private final SecureRandom secureRandom = new SecureRandom();

    private final String rpId;
    private final String origin;

    public PasskeyService(
            UserRepository userRepository,
            WebAuthnCredentialRepository credentialRepository,
            StringRedisTemplate redisTemplate,
            JwtService jwtService
    ) {

        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.redisTemplate = redisTemplate;
        this.jwtService = jwtService;

        this.objectConverter = new ObjectConverter();

        /*
         * WebAuthn4J 0.31.x does not have a no-argument
         * constructor for WebAuthnRegistrationManager.
         *
         * Use the official non-strict factory.
         */
        this.registrationManager =
                WebAuthnRegistrationManager
                        .createNonStrictWebAuthnRegistrationManager(
                                objectConverter
                        );

        /*
         * WebAuthnAuthenticationManager DOES have
         * a no-argument constructor.
         */
        this.authenticationManager =
                new WebAuthnAuthenticationManager();

        this.attestationObjectConverter =
                new AttestationObjectConverter(
                        objectConverter
                );

        this.collectedClientDataConverter =
                new CollectedClientDataConverter(
                        objectConverter
                );

        this.rpId =
                System.getenv().getOrDefault(
                        "WEBAUTHN_RP_ID",
                        "localhost"
                );

        this.origin =
                System.getenv().getOrDefault(
                        "WEBAUTHN_ORIGIN",
                        "http://localhost:5173"
                );
    }

    // =========================================================
    // REGISTRATION OPTIONS
    // =========================================================

    public Map<String, Object> createRegistrationOptions(
            String email
    ) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        byte[] challengeBytes =
                new byte[32];

        secureRandom.nextBytes(
                challengeBytes
        );

        String challenge =
                Base64UrlUtil.encodeToString(
                        challengeBytes
                );

        String challengeId =
                UUID.randomUUID().toString();

        redisTemplate.opsForValue().set(
                registrationChallengeKey(
                        user.getId(),
                        challengeId
                ),
                challenge,
                CHALLENGE_TTL
        );

        Map<String, Object> options =
                new LinkedHashMap<>();

        options.put(
                "challenge",
                challenge
        );

        // -----------------------------------------------------
        // Relying Party
        // -----------------------------------------------------

        Map<String, Object> rp =
                new LinkedHashMap<>();

        rp.put(
                "name",
                "URL Shortener"
        );

        rp.put(
                "id",
                rpId
        );

        options.put(
                "rp",
                rp
        );

        // -----------------------------------------------------
        // User
        // -----------------------------------------------------

        Map<String, Object> userObject =
                new LinkedHashMap<>();

        String userId =
                Base64UrlUtil.encodeToString(
                        (
                                "user-" +
                                        user.getId()
                        ).getBytes(
                                StandardCharsets.UTF_8
                        )
                );

        userObject.put(
                "id",
                userId
        );

        userObject.put(
                "name",
                user.getEmail()
        );

        userObject.put(
                "displayName",
                user.getUsername()
        );

        options.put(
                "user",
                userObject
        );

        // -----------------------------------------------------
        // Supported public-key algorithms
        // -----------------------------------------------------

        List<Map<String, Object>> algorithms =
                new ArrayList<>();

        Map<String, Object> es256 =
                new LinkedHashMap<>();

        es256.put(
                "type",
                "public-key"
        );

        es256.put(
                "alg",
                -7
        );

        algorithms.add(
                es256
        );

        Map<String, Object> rs256 =
                new LinkedHashMap<>();

        rs256.put(
                "type",
                "public-key"
        );

        rs256.put(
                "alg",
                -257
        );

        algorithms.add(
                rs256
        );

        options.put(
                "pubKeyCredParams",
                algorithms
        );

        // -----------------------------------------------------
        // Authenticator selection
        // -----------------------------------------------------

        Map<String, Object> authenticatorSelection =
                new LinkedHashMap<>();

        authenticatorSelection.put(
                "residentKey",
                "required"
        );

        authenticatorSelection.put(
                "requireResidentKey",
                true
        );

        authenticatorSelection.put(
                "userVerification",
                "required"
        );

        options.put(
                "authenticatorSelection",
                authenticatorSelection
        );

        options.put(
                "timeout",
                60000
        );

        options.put(
                "attestation",
                "none"
        );

        options.put(
                "challengeId",
                challengeId
        );

        return options;
    }

    // =========================================================
    // REGISTER PASSKEY
    // =========================================================

    public void register(
            String email,
            String challengeId,
            String credentialJson
    ) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        String challenge =
                redisTemplate.opsForValue().get(
                        registrationChallengeKey(
                                user.getId(),
                                challengeId
                        )
                );

        if (challenge == null) {

            throw new RuntimeException(
                    "Invalid or expired passkey challenge"
            );
        }

        RegistrationData registrationData;

        try {

            ServerProperty serverProperty =
                    ServerProperty.builder()
                            .origin(
                                    new Origin(origin)
                            )
                            .rpId(
                                    rpId
                            )
                            .challenge(
                                    new DefaultChallenge(
                                            challenge
                                    )
                            )
                            .build();

            List<PublicKeyCredentialParameters>
                    algorithms =
                    List.of(
                            new PublicKeyCredentialParameters(
                                    PublicKeyCredentialType.PUBLIC_KEY,
                                    COSEAlgorithmIdentifier.ES256
                            ),
                            new PublicKeyCredentialParameters(
                                    PublicKeyCredentialType.PUBLIC_KEY,
                                    COSEAlgorithmIdentifier.RS256
                            )
                    );

            RegistrationParameters parameters =
                    new RegistrationParameters(
                            serverProperty,
                            algorithms,
                            true,
                            true
                    );

            /*
             * WebAuthn4J 0.31.x:
             *
             * RegistrationManager uses parse(String),
             * not parseRegistrationResponseJSON().
             */
            registrationData =
                    registrationManager.parse(
                            credentialJson
                    );

            registrationManager.verify(
                    registrationData,
                    parameters
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Passkey registration verification failed",
                    e
            );
        }

        AttestationObject attestationObject =
                registrationData
                        .getAttestationObject();

        if (attestationObject == null) {

            throw new RuntimeException(
                    "Invalid passkey attestation"
            );
        }

        if (
                attestationObject
                        .getAuthenticatorData()
                        .getAttestedCredentialData()
                        == null
        ) {

            throw new RuntimeException(
                    "Passkey credential data missing"
            );
        }

        byte[] credentialId =
                attestationObject
                        .getAuthenticatorData()
                        .getAttestedCredentialData()
                        .getCredentialId();

        String credentialIdString =
                Base64UrlUtil.encodeToString(
                        credentialId
                );

        if (
                credentialRepository
                        .existsByCredentialId(
                                credentialIdString
                        )
        ) {

            throw new RuntimeException(
                    "This passkey is already registered"
            );
        }

        String attestationObjectString =
                attestationObjectConverter
                        .convertToBase64urlString(
                                attestationObject
                        );

        CollectedClientData clientData =
                registrationData
                        .getCollectedClientData();

        if (clientData == null) {

            throw new RuntimeException(
                    "Client data missing"
            );
        }

        String clientDataString =
                collectedClientDataConverter
                        .convertToBase64UrlString(
                                clientData
                        );

        WebAuthnCredential credential =
                new WebAuthnCredential();

        credential.setUser(
                user
        );

        credential.setCredentialId(
                credentialIdString
        );

        credential.setAttestationObject(
                attestationObjectString
        );

        credential.setClientData(
                clientDataString
        );

        credential.setSignatureCounter(
                attestationObject
                        .getAuthenticatorData()
                        .getSignCount()
        );

        credentialRepository.save(
                credential
        );

        // Challenge is single-use.
        redisTemplate.delete(
                registrationChallengeKey(
                        user.getId(),
                        challengeId
                )
        );
    }

    // =========================================================
    // AUTHENTICATION OPTIONS
    // =========================================================

    public Map<String, Object>
    createAuthenticationOptions() {

        byte[] challengeBytes =
                new byte[32];

        secureRandom.nextBytes(
                challengeBytes
        );

        String challenge =
                Base64UrlUtil.encodeToString(
                        challengeBytes
                );

        String challengeId =
                UUID.randomUUID().toString();

        redisTemplate.opsForValue().set(
                authenticationChallengeKey(
                        challengeId
                ),
                challenge,
                CHALLENGE_TTL
        );

        Map<String, Object> options =
                new LinkedHashMap<>();

        options.put(
                "challenge",
                challenge
        );

        options.put(
                "rpId",
                rpId
        );

        options.put(
                "userVerification",
                "required"
        );

        options.put(
                "timeout",
                60000
        );

        options.put(
                "challengeId",
                challengeId
        );

        return options;
    }

    // =========================================================
    // AUTHENTICATE WITH PASSKEY
    // =========================================================

    public String authenticate(
            String challengeId,
            String credentialJson
    ) {

        String challenge =
                redisTemplate.opsForValue().get(
                        authenticationChallengeKey(
                                challengeId
                        )
                );

        if (challenge == null) {

            throw new RuntimeException(
                    "Invalid or expired passkey challenge"
            );
        }

        AuthenticationData authenticationData;

        try {

            /*
             * WebAuthn4J 0.31.x:
             *
             * AuthenticationManager uses parse(String),
             * not parseAuthenticationResponseJSON().
             */
            authenticationData =
                    authenticationManager.parse(
                            credentialJson
                    );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid passkey response",
                    e
            );
        }

        byte[] credentialId =
                authenticationData
                        .getCredentialId();

        if (credentialId == null) {

            throw new RuntimeException(
                    "Credential ID missing"
            );
        }

        String credentialIdString =
                Base64UrlUtil.encodeToString(
                        credentialId
                );

        WebAuthnCredential storedCredential =
                credentialRepository
                        .findByCredentialId(
                                credentialIdString
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Passkey not registered"
                                )
                        );

        // -----------------------------------------------------
        // Rebuild stored WebAuthn credential
        // -----------------------------------------------------

        AttestationObject attestationObject =
                attestationObjectConverter.convert(
                        storedCredential
                                .getAttestationObject()
                );

        if (attestationObject == null) {

            throw new RuntimeException(
                    "Stored passkey credential is invalid"
            );
        }

        CollectedClientData clientData =
                collectedClientDataConverter.convert(
                        storedCredential
                                .getClientData()
                );

        if (clientData == null) {

            throw new RuntimeException(
                    "Stored client data is invalid"
            );
        }

        CredentialRecordImpl credentialRecord =
                new CredentialRecordImpl(
                        attestationObject,
                        clientData,
                        null,
                        null
                );

        credentialRecord.setCounter(
                storedCredential
                        .getSignatureCounter()
        );

        try {

            ServerProperty serverProperty =
                    ServerProperty.builder()
                            .origin(
                                    new Origin(origin)
                            )
                            .rpId(
                                    rpId
                            )
                            .challenge(
                                    new DefaultChallenge(
                                            challenge
                                    )
                            )
                            .build();

            AuthenticationParameters parameters =
                    new AuthenticationParameters(
                            serverProperty,
                            credentialRecord,
                            null,
                            true,
                            true
                    );

            authenticationManager.verify(
                    authenticationData,
                    parameters
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Passkey authentication failed",
                    e
            );
        }

        // -----------------------------------------------------
        // Update authenticator counter
        // -----------------------------------------------------

        if (
                authenticationData
                        .getAuthenticatorData() != null
        ) {

            long newCounter =
                    authenticationData
                            .getAuthenticatorData()
                            .getSignCount();

            storedCredential.setSignatureCounter(
                    newCounter
            );

            credentialRepository.save(
                    storedCredential
            );
        }

        // Challenge is single-use.
        redisTemplate.delete(
                authenticationChallengeKey(
                        challengeId
                )
        );

        User user =
                storedCredential.getUser();

        /*
         * Passkey authentication ends exactly like
         * password authentication:
         *
         * User -> JwtService -> existing JWT
         */
        return jwtService.generateToken(
                user
        );
    }

    // =========================================================
    // SERVER PROPERTY
    // =========================================================

    private ServerProperty createServerProperty(
            String challenge
    ) {

        return ServerProperty.builder()
                .origin(
                        new Origin(origin)
                )
                .rpId(
                        rpId
                )
                .challenge(
                        new DefaultChallenge(
                                challenge
                        )
                )
                .build();
    }

    // =========================================================
    // REDIS KEYS
    // =========================================================

    private String registrationChallengeKey(
            Long userId,
            String challengeId
    ) {

        return "passkey:registration:"
                + userId
                + ":"
                + challengeId;
    }

    private String authenticationChallengeKey(
            String challengeId
    ) {

        return "passkey:authentication:"
                + challengeId;
    }
}
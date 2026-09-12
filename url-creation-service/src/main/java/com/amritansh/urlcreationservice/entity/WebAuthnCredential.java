package com.amritansh.urlcreationservice.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "webauthn_credentials",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_webauthn_credential_id",
                        columnNames = "credential_id"
                )
        }
)
public class WebAuthnCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "credential_id", nullable = false, unique = true, length = 512)
    private String credentialId;

    @Lob
    @Column(name = "attestation_object", nullable = false, columnDefinition = "LONGTEXT")
    private String attestationObject;

    @Lob
    @Column(name = "client_data", nullable = false, columnDefinition = "LONGTEXT")
    private String clientData;

    @Column(name = "signature_counter", nullable = false)
    private long signatureCounter;

    public WebAuthnCredential() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getCredentialId() {
        return credentialId;
    }

    public String getAttestationObject() {
        return attestationObject;
    }

    public String getClientData() {
        return clientData;
    }

    public long getSignatureCounter() {
        return signatureCounter;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setCredentialId(String credentialId) {
        this.credentialId = credentialId;
    }

    public void setAttestationObject(String attestationObject) {
        this.attestationObject = attestationObject;
    }

    public void setClientData(String clientData) {
        this.clientData = clientData;
    }

    public void setSignatureCounter(long signatureCounter) {
        this.signatureCounter = signatureCounter;
    }
}
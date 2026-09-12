package com.amritansh.urlcreationservice.dto;

public class PasskeyCredentialRequest {

    private String challengeId;
    private String credential;

    public PasskeyCredentialRequest() {
    }

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public String getCredential() {
        return credential;
    }

    public void setCredential(String credential) {
        this.credential = credential;
    }
}
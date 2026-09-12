// Helper functions for WebAuthn Base64URL conversions

export function base64urlToBuffer(base64url) {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function prepareRegistrationOptions(options) {
  // If the browser natively supports parsing from JSON, use it.
  if (window.PublicKeyCredential && typeof window.PublicKeyCredential.parseCreationOptionsFromJSON === 'function') {
    return window.PublicKeyCredential.parseCreationOptionsFromJSON(options);
  }
  
  // Otherwise, manually convert
  const pk = { ...options };
  pk.challenge = base64urlToBuffer(pk.challenge);
  pk.user.id = base64urlToBuffer(pk.user.id);
  
  if (pk.excludeCredentials) {
    pk.excludeCredentials = pk.excludeCredentials.map(c => ({
      ...c,
      id: base64urlToBuffer(c.id)
    }));
  }
  
  return pk;
}

export function prepareLoginOptions(options) {
  // If the browser natively supports parsing from JSON, use it.
  if (window.PublicKeyCredential && typeof window.PublicKeyCredential.parseRequestOptionsFromJSON === 'function') {
    return window.PublicKeyCredential.parseRequestOptionsFromJSON(options);
  }
  
  // Otherwise, manually convert
  const pk = { ...options };
  pk.challenge = base64urlToBuffer(pk.challenge);
  
  if (pk.allowCredentials) {
    pk.allowCredentials = pk.allowCredentials.map(c => ({
      ...c,
      id: base64urlToBuffer(c.id)
    }));
  }
  
  return pk;
}

export function credentialToJSON(credential) {
  // If browser supports toJSON natively
  if (typeof credential.toJSON === 'function') {
    return credential.toJSON();
  }
  
  // Manual conversion
  if (credential instanceof PublicKeyCredential) {
    const result = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: credential.type,
      clientExtensionResults: credential.getClientExtensionResults()
    };

    if (credential.response instanceof AuthenticatorAttestationResponse) {
      result.response = {
        clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
        attestationObject: bufferToBase64url(credential.response.attestationObject),
      };
      if (credential.response.getTransports) {
        result.response.transports = credential.response.getTransports();
      }
    } else if (credential.response instanceof AuthenticatorAssertionResponse) {
      result.response = {
        clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
        authenticatorData: bufferToBase64url(credential.response.authenticatorData),
        signature: bufferToBase64url(credential.response.signature),
      };
      if (credential.response.userHandle) {
        result.response.userHandle = bufferToBase64url(credential.response.userHandle);
      }
    }
    return result;
  }
  
  return null;
}

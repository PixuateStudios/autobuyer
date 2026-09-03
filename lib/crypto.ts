import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import nacl from "tweetnacl";
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from "tweetnacl-util";

nacl.setPRNG((x, n) => {
  const bytes = Crypto.getRandomBytes(n);
  for (let i = 0; i < n; i += 1) {
    x[i] = bytes[i];
  }
});

export type KeyPair = {
  publicKey: string;
  secretKey: string;
};

export type WrappedKey = {
  nonce: string;
  ciphertext: string;
  from: string;
};

const secretPath = (uid: string) => `aq.e2e.secret.${uid}`;

export async function loadOrCreateKeys(uid: string): Promise<KeyPair> {
  const existing = await SecureStore.getItemAsync(secretPath(uid));
  if (existing) {
    const secretKey = decodeBase64(existing);
    const pair = nacl.box.keyPair.fromSecretKey(secretKey);
    return {
      publicKey: encodeBase64(pair.publicKey),
      secretKey: encodeBase64(pair.secretKey),
    };
  }

  const pair = nacl.box.keyPair();
  const keys = {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: encodeBase64(pair.secretKey),
  };
  await SecureStore.setItemAsync(secretPath(uid), keys.secretKey);
  return keys;
}

export function conversationIdFor(a: string, b: string) {
  return [a, b].sort().join("_");
}

export function randomConvKey() {
  return encodeBase64(nacl.randomBytes(nacl.secretbox.keyLength));
}

export function wrapKeyFor(convKeyB64: string, recipientPublicB64: string, senderSecretB64: string, senderId: string): WrappedKey {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const boxed = nacl.box(
    decodeBase64(convKeyB64),
    nonce,
    decodeBase64(recipientPublicB64),
    decodeBase64(senderSecretB64)
  );
  if (!boxed) {
    throw new Error("Could not wrap conversation key");
  }
  return {
    nonce: encodeBase64(nonce),
    ciphertext: encodeBase64(boxed),
    from: senderId,
  };
}

export function unwrapKey(wrapped: WrappedKey, senderPublicB64: string, recipientSecretB64: string) {
  const opened = nacl.box.open(
    decodeBase64(wrapped.ciphertext),
    decodeBase64(wrapped.nonce),
    decodeBase64(senderPublicB64),
    decodeBase64(recipientSecretB64)
  );
  if (!opened) {
    throw new Error("Could not unwrap conversation key");
  }
  return encodeBase64(opened);
}

export function encryptText(plaintext: string, convKeyB64: string) {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const boxed = nacl.secretbox(decodeUTF8(plaintext), nonce, decodeBase64(convKeyB64));
  return {
    nonce: encodeBase64(nonce),
    ciphertext: encodeBase64(boxed),
  };
}

export function decryptText(nonceB64: string, ciphertextB64: string, convKeyB64: string) {
  const opened = nacl.secretbox.open(
    decodeBase64(ciphertextB64),
    decodeBase64(nonceB64),
    decodeBase64(convKeyB64)
  );
  if (!opened) {
    throw new Error("Could not decrypt message");
  }
  return encodeUTF8(opened);
}

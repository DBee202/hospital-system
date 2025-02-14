const {
  generateKeyPairSync,
  publicEncrypt,
  privateDecrypt,
} = require("crypto");

const crypto = require("crypto");

module.exports.generateKeys = () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
};

module.exports.encryptNote = (patientPublicKey, doctorPublicKey, note) => {
  // Generate a random AES key
  const aesKey = crypto.randomBytes(32); // 256-bit key

  // Encrypt note using AES
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  let encryptedNote = cipher.update(note, "utf8", "hex");
  encryptedNote += cipher.final("hex");

  // Encrypt AES key with both patient and doctor public keys
  const encryptedAESKeyForPatient = publicEncrypt(
    patientPublicKey,
    aesKey
  ).toString("base64");
  const encryptedAESKeyForDoctor = publicEncrypt(
    doctorPublicKey,
    aesKey
  ).toString("base64");

  return {
    encryptedNote,
    iv: iv.toString("hex"), // Store IV for decryption
    encryptedAESKeyForPatient,
    encryptedAESKeyForDoctor,
  };
};

module.exports.decryptNote = (
  privateKey,
  encryptedNote,
  iv,
  encryptedAESKey
) => {
  // Decrypt AES key using private key
  const aesKey = privateDecrypt(
    privateKey,
    Buffer.from(encryptedAESKey, "base64")
  );

  // Decrypt note using AES
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    aesKey,
    Buffer.from(iv, "hex")
  );
  let decryptedNote = decipher.update(encryptedNote, "hex", "utf8");
  decryptedNote += decipher.final("utf8");

  return decryptedNote;
};

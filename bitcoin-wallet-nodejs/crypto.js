const crypto = require('crypto');
const asn = require('asn1.js');
const randomBytes = require('randombytes');
const { encoder } = require('js-encoding-utils');
const { Key } = require('js-crypto-key-utils');

const params = {
  hashes: {
    'SHA-256': { nodeName: 'sha256', hashSize: 32, maxInput: 61 },
    'SHA-384': { nodeName: 'sha384', hashSize: 48, maxInput: 125 },
    'SHA-512': { nodeName: 'sha512', hashSize: 64, maxInput: 125 },
    'SHA-1': { nodeName: 'sha1', hashSize: 20, maxInput: 61 },
  },
};

/**
 * OAEP Encoder
 * @param {Uint8Array} msg - Message.
 * @param {Uint8Array} label - Label.
 * @param {Number} k - Octet length of modulus length, i.e., n.
 * @param {String} hash - Name of hash function.
 * @return {Promise<Uint8Array>} - OAEP encoded message.
 */
async function oaepEncode(msg, label, k, hash = 'SHA-256') {
  const hashSize = params.hashes[hash].hashSize;

  let ps = new Uint8Array(k - msg.length - 2 * hashSize - 2);
  ps = ps.map(() => 0x00);

  const lHash = digest(label, hash);

  const db = new Uint8Array(k - hashSize - 1);
  db.set(lHash);
  db.set(ps, hashSize);
  db.set(new Uint8Array([0x01]), k - msg.length - hashSize - 2);
  db.set(msg, k - msg.length - hashSize - 1);

  const seed = await randomBytes(hashSize);

  const dbMask = await mgf1(seed, k - hashSize - 1, hash);

  const maskedDb = db.map((elem, idx) => 0xff & (elem ^ dbMask[idx]));

  const seedMask = await mgf1(maskedDb, hashSize, hash);

  const maskedSeed = seed.map((elem, idx) => 0xff & (elem ^ seedMask[idx]));

  const em = new Uint8Array(k);
  em.set(new Uint8Array([0x00]));
  em.set(maskedSeed, 1);
  em.set(maskedDb, hashSize + 1);

  return em;
}

/**
 * OAEP Decoder
 * @param {Uint8Array} em - OAEP encoded message.
 * @param {Uint8Array} label - Label.
 * @param {Number} k - Octet length of modulus length, i.e., n.
 * @param {String} hash - Name of hash function.
 * @return {Promise<Uint8Array>} - OAEP decoded message.
 * @throws {Error} - Throws if DecryptionError.
 */
async function oaepDecode(em, label, k, hash = 'SHA-256') {
  const hashSize = params.hashes[hash].hashSize;

  const lHash = digest(label, hash); // must be equal to lHashPrime

  const y = em[0]; // must be zero
  if (y !== 0x00) {
    throw new Error('DecryptionError');
  }

  const maskedSeed = em.slice(1, hashSize + 1);
  const maskedDb = em.slice(hashSize + 1, em.length);

  const seedMask = await mgf1(maskedDb, hashSize, hash);
  const seed = maskedSeed.map((elem, idx) => 0xff & (elem ^ seedMask[idx]));

  const dbMask = await mgf1(seed, k - hashSize - 1, hash);
  const db = maskedDb.map((elem, idx) => 0xff & (elem ^ dbMask[idx]));

  const lHashPrime = db.slice(0, hashSize);

  if (Buffer.from(lHashPrime).toString('base64') !== Buffer.from(lHash).toString('base64')) {
    throw new Error('DecryptionError');
  }

  let offset;
  for (let i = hashSize; i < db.length; i++) {
    if (db[i] !== 0x00) {
      offset = i;
      break;
    }
  }
  const separator = db[offset];
  if (separator !== 0x01) throw new Error('DecryptionError');

  return db.slice(offset + 1, db.length);
}

/**
 * Mask generation function 1 (MGF1)
 * @param {Uint8Array} seed - Seed.
 * @param {Number} len - Length of mask.
 * @param {String} [hash='SHA-256'] - Name of hash algorithm.
 * @return {Promise<Uint8Array>}: Generated mask.
 */
async function mgf1(seed, len, hash = 'SHA-256') {
  const hashSize = params.hashes[hash].hashSize;
  const blockLen = Math.ceil(len / hashSize);

  const t = new Uint8Array(blockLen * hashSize);

  for (let i = 0; i < blockLen; i++) {
    const c = i2osp(i, 4);
    const x = new Uint8Array(seed.length + 4);
    x.set(seed);
    x.set(c, seed.length);
    const y = digest(x, hash);
    t.set(y, i * hashSize);
  }
  return t.slice(0, len);
}

/**
 * I2OSP function
 * @param {Number} x - Number to be encoded to byte array in network byte order.
 * @param {Number} len - Length of byte array
 * @return {Uint8Array} - Encoded number.
 */
function i2osp(x, len) {
  const r = new Uint8Array(len);
  r.forEach((elem, idx) => {
    const y = 0xff & (x >> (idx * 8));
    r[len - idx - 1] = y;
  });
  return r;
}

function digest(msg, hash) {
  const alg = params.hashes[hash].nodeName;
  const cipher = crypto.createHash(alg);
  cipher.update(msg);
  return cipher.digest();
}

function pruneLeadingZeros(array) {
  if (!(array instanceof Uint8Array)) throw new Error('NonUint8Array');

  let offset = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] !== 0x00) break;
    offset++;
  }

  const returnArray = new Uint8Array(array.length - offset);
  returnArray.set(array.slice(offset, array.length));
  return returnArray;
}

/**
 * Convert RSA spki/pkcs8 public/private keys to JWK
 * @param privateKey
 * @return {*}
 */
function toJwk(privateKey) {
  // privateKeyAlgorithm.algorithm.parameters is always null Ox0500 in ASN.1
  // as shown in the Section 2.3.1 https://tools.ietf.org/html/rfc3279

  // overwrite nested binary object as parsed object
  const decoded = RSAPrivateKey.decode(privateKey, 'der');

  const privateKeyElems = {};
  privateKeyElems.modulus = decoded.modulus;

  // calculate key length from modulus n
  const nLen = privateKeyElems.modulus.byteLength();
  const len = nLen % 128 === 0 ? nLen : nLen + (128 - (nLen % 128)); // this is actual key length, e.g., 256 bytes

  // convert BN to Uint8Array
  privateKeyElems.modulus = new Uint8Array(privateKeyElems.modulus.toArray('be', len)); // n of length len
  privateKeyElems.publicExponent = new Uint8Array(
    decoded.publicExponent.toArray('be', decoded.publicExponent.byteLength())
  ); // e of arbitrary small length
  privateKeyElems.privateExponent = new Uint8Array(decoded.privateExponent.toArray('be', len)); // d of length len

  const keys = ['prime1', 'prime2', 'exponent1', 'exponent2', 'coefficient']; // elements of length len/2
  keys.forEach(key => {
    privateKeyElems[key] = new Uint8Array(decoded[key].toArray('be', len >> 1));
  });

  // prune leading zeros JWW RSA private key: https://tools.ietf.org/html/rfc7517
  return {
    kty: 'RSA',
    n: encoder.encodeBase64Url(pruneLeadingZeros(privateKeyElems.modulus)),
    e: encoder.encodeBase64Url(pruneLeadingZeros(privateKeyElems.publicExponent)),
    d: encoder.encodeBase64Url(pruneLeadingZeros(privateKeyElems.privateExponent)),
    p: encoder.encodeBase64Url(pruneLeadingZeros(privateKeyElems.prime1)),
    q: encoder.encodeBase64Url(pruneLeadingZeros(privateKeyElems.prime2)),
    dp: encoder.encodeBase64Url(pruneLeadingZeros(privateKeyElems.exponent1)),
    dq: encoder.encodeBase64Url(pruneLeadingZeros(privateKeyElems.exponent2)),
    qi: encoder.encodeBase64Url(pruneLeadingZeros(privateKeyElems.coefficient)),
  };
}

const oaepDecrypt = async (data, privateKeyBytes, hash = 'SHA-256', label = new Uint8Array([])) => {
  const privateJwk = toJwk(privateKeyBytes);
  // debug('oaepDecrypt', { privateJwk });

  const keyObj = new Key('jwk', privateJwk);
  if (!keyObj.isPrivate) {
    throw new Error('NotPrivateKeyForRSADecrypt');
  }
  const privatePem = await keyObj.export('pem');
  // debug('oaepDecrypt', { privatePem });

  const message = crypto.privateDecrypt({ key: privatePem, padding: crypto.constants.RSA_NO_PADDING }, data);
  const decrypted = await oaepDecode(
    new Uint8Array(message),
    label,
    encoder.decodeBase64Url(privateJwk.n).length,
    hash
  );

  return new Uint8Array(decrypted);
};

// https://tools.ietf.org/html/rfc3447
const RSAPublicKey = asn.define('RSAPublicKey', function() {
  this.seq().obj(
    this.key('modulus').int(), // n
    this.key('publicExponent').int() // e
  );
});

const RSAPrivateKey = asn.define('RSAPrivateKey', function() {
  this.seq().obj(
    this.key('version').int(), // 0
    this.key('modulus').int(), // n
    this.key('publicExponent').int(), // e
    this.key('privateExponent').int(), // d
    this.key('prime1').int(), // p
    this.key('prime2').int(), // q
    this.key('exponent1').int(), // d mod (p-1)
    this.key('exponent2').int(), // d mod (q-1)
    this.key('coefficient').int(), // (inverse of q) mod p
    this.key('otherPrimeInfos')
      .optional()
      .use(OtherPrimeInfos)
  );
});

const OtherPrimeInfos = asn.define('OtherPrimeInfos', function() {
  this.seqof(OtherPrimeInfo);
});

const OtherPrimeInfo = asn.define('OtherPrimeInfo', function() {
  this.seq().obj(this.key('prime').int(), this.key('exponent').int(), this.key('coefficient').int());
});

module.exports = {
  toJwk,
  oaepEncode,
  oaepDecode,
  oaepDecrypt,
  pruneLeadingZeros,
  RSAPublicKey,
  RSAPrivateKey,
};

const { subtle, getRandomValues } = require('crypto').webcrypto;

async function generateAesKey(length = 256) {
	const key = await subtle.generateKey(
		{
			name: 'AES-CBC',
			length,
		},
		true,
		['encrypt', 'decrypt']
	)

	return key
}

async function aesEncrypt(plaintext) {
  const ec = new TextEncoder();
  const key = await generateAesKey();
  const iv = getRandomValues(new Uint8Array(16));

  const ciphertext = await subtle.encrypt({
    name: 'AES-CBC',
    iv,
  }, key, ec.encode(plaintext));

  return {
    key,
    iv,
    ciphertext
  };
}

async function aesDecrypt(ciphertext, key, iv) {
  console.log(ciphertext)
  console.log(key)
  console.log(iv)
  const dec = new TextDecoder();
  const plaintext = await subtle.decrypt({
    name: 'AES-CBC',
    iv,
  }, key, ciphertext);

  return dec.decode(plaintext);
}

async function encrypt(text) {
    const encDetails = await aesEncrypt(text)
    //console.log(encDetails)
    return encDetails
}

async function decrypt(encrypted) {
    const decDetails = await aesDecrypt(encrypted.ciphertext, encrypted.key, encrypted.iv)
    //console.log(decDetails)
    return decDetails
}

encrypt('token goes here').then(encrypted => {
    decrypt(encrypted)
})
//const decrypted = decrypt(encrypted)

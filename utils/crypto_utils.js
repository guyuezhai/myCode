/**
 * 加密&解密工具集合.
 * @type {exports}
 */

const crypto = require( 'crypto' );

const cipherName = 'AES-128-ECB';
const secretKey = 'wuggwuggwuggwugg';
const iv = '';

const encrypt = function ( src ) {

    if ( !src ) {
        return null;
    }

    try {
        var encipher = crypto.createCipheriv( cipherName, secretKey, iv );
        return encipher.update( src, 'utf8', 'base64' ) + encipher.final( 'base64' );
    } catch ( e ) {
        console.error( '加密时出错: ', e.stack );
    }

    return null;
}

const decrypt = function ( data ) {

    if ( !data ) {
        return null;
    }

    try {
        var decipher = crypto.createDecipheriv( cipherName, secretKey, iv );
        return decipher.update( data, 'base64', 'utf8' ) + decipher.final( 'utf8' );
    } catch ( e ) {
        console.error( '解密时出错: ', e.stack );
    }

    return null;
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;

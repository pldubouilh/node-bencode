var Bencode = require( './bencode' )
var Dict = require( './dict' )

/**
 * Decodes bencoded data.
 *
 * @param  {Buffer} data
 * @param  {String} encoding
 * @return {Object|Array|Buffer|String|Number}
 */
function decode( data, encoding ) {

  decode.position = 0
  decode.encoding = encoding || null

  decode.data = Buffer.isBuffer( data ) ?
    data : new Buffer( data )

  return decode.next()

}

decode.position = 0
decode.data     = null
decode.encoding = null

decode.next = function() {

  switch( decode.data[ decode.position ] ) {
    case Bencode.DICT: return decode.dictionary(); break
    case Bencode.LIST: return decode.list(); break
    case Bencode.INT:  return decode.integer(); break
    default:           return decode.bytes(); break
  }

}

decode.find = function( chr ) {
  
  var index = decode.data.indexOf( chr, decode.position )
  if( index >= 0 ) return index
  
  throw new Error(
    'Invalid data: Missing delimiter "' +
    String.fromCharCode( chr ) + '" [0x' +
    chr.toString( 16 ) + ']'
  )
  
}

decode.dictionary = function() {

  var dict = new Dict()

  decode.position++

  while( decode.data[ decode.position ] !== Bencode.END ) {
    dict.binarySet( decode.bytes(), decode.next() )
  }

  decode.position++

  return dict

}

decode.list = function() {

  var lst = []

  decode.position++

  while( decode.data[ decode.position ] !== Bencode.END ) {
    lst.push( decode.next() )
  }

  decode.position++

  return lst

}

decode.integer = function() {

  var end = decode.find( Bencode.END )
  var number = decode.data.toString( 'ascii', decode.position + 1, end )

  decode.position += end + 1 - decode.position

  return parseInt( number, 10 )

}

decode.bytes = function() {

  var sep = decode.find( Bencode.START )
  var length = parseInt( decode.data.toString( 'ascii', decode.position, sep ), 10 )
  var end = ++sep + length

  decode.position = end

  return decode.encoding != null ?
    decode.data.toString( decode.encoding, sep, end ) :
    decode.data.slice( sep, end )

}

// Exports
module.exports = decode

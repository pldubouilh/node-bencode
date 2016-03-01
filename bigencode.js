var encode = require( './lib/encode' )
var decode = require( './lib/decode' )
var BigNumber = require( 'bignumber.js' )


// Patch decode.integer to return bignumbers
decode.integer = function() {

   var end    = decode.find( 0x65 )
   var end    = decode.find( 0x65 )
   var number = decode.data.toString( 'ascii', decode.position + 1, end )
   var number = decode.data.toString( 'ascii', decode.position + 1, end )

   decode.position += end + 1 - decode.position
   decode.position += end + 1 - decode.position

   return new BigNumber(number)
}

// Patch encode to treat bignumbers
encode._encode = function( buffers, data ) {

  if( Buffer.isBuffer(data) ) {
    buffers.push(new Buffer(data.length + ':'))
    buffers.push(data)
    return
  }
  else if(data.constructor.name === "BigNumber"){ // See typeof ?
    encode.largeInt( buffers, data )
    return
  }

  switch( typeof data ) {
    case 'string':
      encode.bytes( buffers, data )
      break
    case 'number':
      encode.number( buffers, data )
      break
    case 'object':
      data.constructor === Array
        ? encode.list( buffers, data )
        : encode.dict( buffers, data )
      break
  }
}

// Patch encode.number to cast numbers to bignumbers and display a message
encode.number = function( buffers, data ) {
  console.warn('WARNING: An integer has been provided, but this implementation is the large integers implementation. The number has been converted to a bignumber')
  console.trace()
  encode.largeInt(buffers, new BigNumber(data))
}

// Add large int parser
encode.largeInt = function( buffers, data ) {
  var val = Buffer(data.toString())
  buffers.push( new Buffer( 'i' + val + 'e' ))
}

module.exports = {
  encode: encode,
  decode: decode
}

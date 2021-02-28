let symbols
let symbolPosition
let inlinePosition
let error
let destination
let operand_1
let operator
let operand_2
document.oninput = function() {
          symbolPosition = 1
while   ( symbolPosition  <= symbols.length ) {
          symbol                                        = symbols[ position - 1 ]
if      ( symbol === '\n' )             newLinePosition = position
          inlinePosition =   position - newLinePosition
if      ( inlinePosition === 0                       ) error       = 0
else if ( inlinePosition === 1                       ) destination = symbol
else if ( inlinePosition === 2  && symbol !== ' '    ) error       = 1
else if ( inlinePosition === 3  && symbol === '#'    ) immediate   = 1
else if ( inlinePosition === 3  && symbol !== '='    ) error       = 1
else if ( immediate      === 1  && symbol === ' '    ) break
else if ( inlinePosition === 4  && symbol !== ' '    ) error       = 1
else if ( inlinePosition === 5                       ) operand_1   = symbol
else if ( inlinePosition === 6  && symbol !== ' '    ) error       = 1
else if ( inlinePosition === 7                       ) operator    = symbol
else if ( inlinePosition === 8  && symbol !== ' '    ) error       = 1
else if ( inlinePosition === 9                       ) operand_2   = symbol
else if ( inlinePosition === 10                      ) error       = 1
if      ( immediate      === 1  && symbol !== ' '    ) operand_1   = operand_1 + symbol
else if ( immediate      === 1  && symbol === '\n'   ) {
                 operand_1 = parseFloat( operand_1 )
if      ( isNan( operand_1 )                         ) error       = 1
          code.concat( [ 0x44 ], ( new DataView ( new Float64Array( [ operand_1 ] ) ).getFloat64[ 0 ], 1 ).buffer )
          code.concat( [ 0x24 ], ( new UInt8Array( [ destination.valueOf() ] ) )
}
else if (                          symbol === '\n'   ) {

}
}
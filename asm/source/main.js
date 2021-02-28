let code
let symbols
let symbolPosition
let symbol
let newLinePosition
let inlinePosition
let error
let immediate
let destination
let operand_1
let operator
let operand_2
let opcodes         = {             }
    opcodes [ '+' ] = [ 0xA0        ]
    opcodes [ '-' ] = [ 0xA1        ]
    opcodes [ '*' ] = [ 0xA2        ]
    opcodes [ '/' ] = [ 0xA3        ]
    opcodes [ '^' ] = [ 0xA4        ]
    opcodes [ '|' ] = [ 0xA5        ]
    opcodes [ '"' ] = [ 0xA6        ]
    opcodes [ '_' ] = [ 0xA0 , 0x9C ]
    opcodes [ '~' ] = [ 0xA0 , 0x9E ]
    opcodes [ '?' ] = [ 0xA0 , 0x9F ]
let dv                    =  new DataView ( new Float64Array ( 1 ) [ 'buffer' ] )
document [ 'getElementById' ] ( 'symbols' ) [ 'oninput' ]    =  function ( ) {
          code            =  [ ]
          symbols         = document [ 'getElementById' ] ( 'symbols' ) [ 'value' ]
                            localStorage    [ 'setItem' ] ( 'symbols' , symbols )
          symbolPosition  =  1
while   ( symbolPosition <=  symbols [ 'length' ] ) {
          symbol          =  symbols [                             symbolPosition - 1 ]
if      ( symbol         === '\n' )              newLinePosition = symbolPosition
          inlinePosition  =                    - newLinePosition + symbolPosition
if      ( inlinePosition === 0                     ) {
          error           =  0
          immediate       =  0
          destination     =  ' '
          operand_1       =  '0'
          operator        =  ' '
          operand_2       =  '0'
        }
else if ( inlinePosition === 1                     ) destination = symbol
else if ( inlinePosition === 2  && symbol !== ' '  ) error       = 1
else if ( inlinePosition === 3  && symbol === '$'  ) immediate   = 1
else if ( inlinePosition === 3  && symbol !== '='  ) error       = 1
else if (      immediate === 1  && symbol === ' '  ) error       = 1
else if ( inlinePosition === 4  && symbol !== ' '  ) error       = 1
else if ( inlinePosition === 5                     ) operand_1   = symbol
else if ( inlinePosition === 6  && symbol !== ' '  ) error       = 1
else if ( inlinePosition === 7                     ) operator    = symbol
else if ( inlinePosition === 8  && symbol !== ' '  ) error       = 1
else if ( inlinePosition === 9                     ) operand_2   = symbol
else if ( inlinePosition === 10                    ) error       = 1
if      (            opcodes [ operator ] ==  null ) error       = 1
if      (          error === 1                     ) return
else if (      immediate === 0  && symbol === '\n' ) {
code [ 'concat' ] ( [ 0x23 ] ,                     [ operand_1 [ 'charCodeAt' ] ( 0 ) ] ,
                    [ 0x23 ] ,                     [ operand_2 [ 'charCodeAt' ] ( 0 ) ] ,
                     opcodes [ operator ] )
        }
else if (      immediate === 1  && symbol !== ' '  ) operand_1   = operand_1 + symbol
else if (      immediate === 1  && symbol === '\n' ) {
                                                     operand_1   = parseFloat ( operand_1 )
                               dv [ 'setFloat64' ] ( operand_1   , 1 )
code [ 'concat' ] ( [ 0x44 ] , dv [ 'getFloat64' ] ( 0 , 1 ) [ 'buffer' ],
                    [ 0x24 ] ,    [  destination [ 'charCodeAt' ] ( 0 ) ] )
        }
        }
}
window [ 'onload' ] = function ( ) {
document [ 'getElementById' ] ( 'symbols' ) [ 'innerHTML' ] = localStorage [ 'getItem' ] ( 'symbols' )
}
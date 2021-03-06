let floatBuffer
let IEEE7542019
let opcodes
let code
let letters
let letterPosition
let letter
let newLinePosition
let inlinePosition
let destination
let error
let read
let write
let immediate
let operand_1
let operator
let operand_2
floatBuffer = new DataView(new Float64Array(1)['buffer'])
IEEE7542019 = function(value) {
 return floatBuffer['setFloat64'](parseFloat(value), 1)['getFloat64'](0, 1)['buffer']
}
opcodes      = {          }
opcodes['='] = [0x61, 0xb7]
opcodes['!'] = [0x62, 0xb7]
opcodes['<'] = [0x63, 0xb7]
opcodes['>'] = [0x64, 0xb7]
opcodes['['] = [0x65, 0xb7]
opcodes[']'] = [0x66, 0xb7]
opcodes['+'] = [0xA0      ]
opcodes['-'] = [0xA1      ]
opcodes['*'] = [0xA2      ]
opcodes['/'] = [0xA3      ]
opcodes['&'] = [0xA4      ]
opcodes['|'] = [0xA5      ]
opcodes['"'] = [0xA6      ]
opcodes['_'] = [0xA0, 0x9C]
opcodes['~'] = [0xA0, 0x9E]
opcodes['?'] = [0xA0, 0x9F]
document['getElementById']('letters')['oninput'] = function() {
 code            = []
 letters         = document['getElementById']('letters')
 letterPosition  = 1
 newLinePosition = 1
 localStorage['setItem']('letters', letters['value'])
 while (letterPosition <= letters['value']['length']) {
  letter = letters['value'][letterPosition - 1]
  if (letter === '\n') {
   newLinePosition = letterPosition
  }
  inlinePosition = letterPosition - newLinePosition
  if (inlinePosition === 0) {
   destination =  undefined
   error       =  0
   read        =  0
   write       =  0
   immediate   =  0
   write       =  0
   read_1      =  0
   read_2      =  0
   operand_1   = '0'
   operator    = '+'
   operand_2   = '0'
  }
  else if (inlinePosition === 1                  ) destination = letter
  else if (inlinePosition === 2 && letter !== ' ') error       = 1
  else if (inlinePosition === 3 && letter === '{') read        = 1
  else if (inlinePosition === 3 && letter === '}') write       = 1
  else if (inlinePosition === 3 && letter !== '=') error       = 1
  else if (inlinePosition === 4 && letter !== ' ') error       = 1
  else if (inlinePosition === 5 && letter === '$') immediate   = 1
  else if (inlinePosition === 5                  ) operand_1   = letter
  else if (inlinePosition === 6 && letter !== ' ') error       = 1
  else if (inlinePosition === 7                  ) operator    = letter
  else if (inlinePosition === 8 && letter !== ' ') error       = 1
  else if (inlinePosition === 9                  ) operand_2   = letter
  if (opcodes[operator] === undefined) {
   error = 1
  }
  if (destination !== undefined && error === 0 && (letter === '\n' || letterPosition === letters['length'])) {
   if (immediate === 1) {
    code['concat'](IEEE7542019(operand_1))
   }
   else {
    code['concat']([operand_1['charCodeAt'](0), 0x23, operand_2['charCodeAt'](0), 0x23, opcodes[operator]])
   }
   if      (read  === 1) {
    code['concat']([0xb4, 0x40, 0x2b, destination['charCodeAt'](0), 0x24])
   }
   else if (write === 1) {
    code['concat']([0xb4, 0x40, destination['charCodeAt'](0), 0x23, 0xb7])
   }
   else {
    code['concat']([destination['charCodeAt'](0), 0x24])
   }
  }
  else if (immediate === 1 && letter !== ' ' ) {
   operand_1 = operand_1 + letter
  }
  letterPosition = letterPosition + 1
 }
}
window['onload'] = function() {
 letters                  = document['getElementById']('letters')
 letters['innerHTML'    ] = localStorage['getItem']('letters')
 letters['oncut'        ] =
 letters['oncopy'       ] =
 letters['onpaste'      ] =
 letters['ondrag'       ] =
 letters['ondrop'       ] =
 letters['onpointermove'] =
 letters['oncontextmenu'] = function(event) { event['preventDefault']() }
 letters['onselect'     ] = function() { window['getSelection']()['collapseToStart']() }
}
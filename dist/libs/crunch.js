
var Crunch = (function() {
var Module = this;
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 1448;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });




































































/* memory initializer */ allocate([109,95,108,111,111,107,117,112,91,116,93,32,61,61,32,99,85,73,78,84,51,50,95,77,65,88,0,0,0,0,0,0,116,32,60,32,40,49,85,32,60,60,32,116,97,98,108,101,95,98,105,116,115,41,0,0,112,67,111,100,101,115,105,122,101,115,91,115,121,109,95,105,110,100,101,120,93,32,61,61,32,99,111,100,101,115,105,122,101,0,0,0,0,0,0,0,115,111,114,116,101,100,95,112,111,115,32,60,32,116,111,116,97,108,95,117,115,101,100,95,115,121,109,115,0,0,0,0,110,117,109,95,99,111,100,101,115,91,99,93,0,0,0,0,110,101,119,95,99,97,112,97,99,105,116,121,32,38,38,32,40,110,101,119,95,99,97,112,97,99,105,116,121,32,62,32,109,95,99,97,112,97,99,105,116,121,41,0,0,0,0,0,40,108,101,110,32,62,61,32,49,41,32,38,38,32,40,108,101,110,32,60,61,32,99,77,97,120,69,120,112,101,99,116,101,100,67,111,100,101,83,105,122,101,41,0,0,0,0,0,110,101,120,116,95,108,101,118,101,108,95,111,102,115,32,62,32,99,117,114,95,108,101,118,101,108,95,111,102,115,0,0,110,117,109,32,38,38,32,40,110,117,109,32,61,61,32,126,110,117,109,95,99,104,101,99,107,41,0,0,0,0,0,0,105,32,60,32,109,95,115,105,122,101,0,0,0,0,0,0,109,105,110,95,110,101,119,95,99,97,112,97,99,105,116,121,32,60,32,40,48,120,55,70,70,70,48,48,48,48,85,32,47,32,101,108,101,109,101,110,116,95,115,105,122,101,41,0,109,111,100,101,108,46,109,95,99,111,100,101,95,115,105,122,101,115,91,115,121,109,93,32,61,61,32,108,101,110,0,0,116,32,33,61,32,99,85,73,78,84,51,50,95,77,65,88,0,0,0,0,0,0,0,0,109,95,98,105,116,95,99,111,117,110,116,32,60,61,32,99,66,105,116,66,117,102,83,105,122,101,0,0,0,0,0,0,110,117,109,95,98,105,116,115,32,60,61,32,51,50,85,0,48,0,0,0,0,0,0,0,47,104,111,109,101,47,100,105,116,104,105,47,109,121,111,117,47,103,97,109,101,101,110,103,105,110,101,47,100,101,112,115,47,99,114,117,110,99,104,47,105,110,99,47,99,114,110,95,100,101,99,111,109,112,46,104,0,0,0,0,0,0,0,0,40,116,111,116,97,108,95,115,121,109,115,32,62,61,32,49,41,32,38,38,32,40,116,111,116,97,108,95,115,121,109,115,32,60,61,32,112,114,101,102,105,120,95,99,111,100,105,110,103,58,58,99,77,97,120,83,117,112,112,111,114,116,101,100,83,121,109,115,41,0,0,0,102,97,108,115,101,0,0,0,99,114,110,100,95,102,114,101,101,58,32,98,97,100,32,112,116,114,0,0,0,0,0,0,99,114,110,100,95,114,101,97,108,108,111,99,58,32,98,97,100,32,112,116,114,0,0,0,40,40,117,105,110,116,51,50,41,112,95,110,101,119,32,38,32,40,67,82,78,68,95,77,73,78,95,65,76,76,79,67,95,65,76,73,71,78,77,69,78,84,32,45,32,49,41,41,32,61,61,32,48,0,0,0,99,114,110,100,95,109,97,108,108,111,99,58,32,111,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,0,0,0,99,114,110,100,95,109,97,108,108,111,99,58,32,115,105,122,101,32,116,111,111,32,98,105,103,0,0,0,0,0,0,0,109,95,115,105,122,101,32,60,61,32,109,95,99,97,112,97,99,105,116,121,0,0,0,0,37,115,40,37,117,41,58,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,117,114,101,58,32,34,37,115,34,10,0,0,0,0,0,0,0,0,17,18,19,20,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15,16,0,0,0,1,2,2,3,3,3,3,4,0,0,0,0,0,0,1,1,0,1,0,1,0,0,1,2,1,2,0,0,0,1,0,2,1,0,2,0,0,1,2,3,2,0,0,0,0,0,0,0,0,2,3,4,5,6,7,1,0,2,3,1,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  
  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }
  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___gxx_personality_v0() {
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  var _llvm_memset_p0i8_i64=_memset;

  function _abort() {
      Module['abort']();
    }

  function ___errno_location() {
      return ___errno_state;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }






  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        var canvasContainer = canvas.parentNode;
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            var canvasContainer = canvas.parentNode;
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var NaN=+env.NaN;
  var Infinity=+env.Infinity;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_ii=env.invoke_ii;
  var invoke_vi=env.invoke_vi;
  var invoke_iiiiii=env.invoke_iiiiii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_iii=env.invoke_iii;
  var _snprintf=env._snprintf;
  var _abort=env._abort;
  var _fflush=env._fflush;
  var __reallyNegative=env.__reallyNegative;
  var _fputc=env._fputc;
  var _sysconf=env._sysconf;
  var _puts=env._puts;
  var ___setErrNo=env.___setErrNo;
  var _send=env._send;
  var _write=env._write;
  var _fputs=env._fputs;
  var _exit=env._exit;
  var _sprintf=env._sprintf;
  var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
  var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
  var ___cxa_is_number_type=env.___cxa_is_number_type;
  var _time=env._time;
  var __formatString=env.__formatString;
  var ___cxa_does_inherit=env.___cxa_does_inherit;
  var __ZSt9terminatev=env.__ZSt9terminatev;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var _pwrite=env._pwrite;
  var _sbrk=env._sbrk;
  var ___errno_location=env.___errno_location;
  var ___gxx_personality_v0=env.___gxx_personality_v0;
  var _mkport=env._mkport;
  var ___resumeException=env.___resumeException;
  var __exit=env.__exit;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
STACKTOP = (STACKTOP + 7)&-8;
  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}
function copyTempFloat(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
}
function copyTempDouble(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
  HEAP8[tempDoublePtr+4|0] = HEAP8[ptr+4|0];
  HEAP8[tempDoublePtr+5|0] = HEAP8[ptr+5|0];
  HEAP8[tempDoublePtr+6|0] = HEAP8[ptr+6|0];
  HEAP8[tempDoublePtr+7|0] = HEAP8[ptr+7|0];
}

function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}

function setTempRet1(value) {
  value = value|0;
  tempRet1 = value;
}

function setTempRet2(value) {
  value = value|0;
  tempRet2 = value;
}

function setTempRet3(value) {
  value = value|0;
  tempRet3 = value;
}

function setTempRet4(value) {
  value = value|0;
  tempRet4 = value;
}

function setTempRet5(value) {
  value = value|0;
  tempRet5 = value;
}

function setTempRet6(value) {
  value = value|0;
  tempRet6 = value;
}

function setTempRet7(value) {
  value = value|0;
  tempRet7 = value;
}

function setTempRet8(value) {
  value = value|0;
  tempRet8 = value;
}

function setTempRet9(value) {
  value = value|0;
  tempRet9 = value;
}
function runPostSets() {


}

function __ZN4crnd11crnd_assertEPKcS1_j($pExp,$pFile,$line){
 $pExp=($pExp)|0;
 $pFile=($pFile)|0;
 $line=($line)|0;
 var $buf=0,$1=0,$2=0,$3=0,label=0;
 var tempVarArgs=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+512)|0;
 $buf=((sp)|0);
 $1=(($buf)|0);
 $2=((_sprintf((($1)|0),((824)|0),(((tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,HEAP32[((tempVarArgs)>>2)]=$pFile,HEAP32[(((tempVarArgs)+(8))>>2)]=$line,HEAP32[(((tempVarArgs)+(16))>>2)]=$pExp,tempVarArgs))|0)))|0); STACKTOP=tempVarArgs;
 $3=((_puts((($1)|0)))|0);
 STACKTOP=sp;return;
}


function __ZN4crnd16elemental_vector17increase_capacityEjbjPFvPvS1_jE($this,$min_new_capacity,$grow_hint,$element_size,$pMover){
 $this=($this)|0;
 $min_new_capacity=($min_new_capacity)|0;
 $grow_hint=($grow_hint)|0;
 $element_size=($element_size)|0;
 $pMover=($pMover)|0;
 var $actual_size=0,$1=0,$2=0,$3=0,$4=0,$5=0,$8=0,$9=0,$12=0,$13=0,$16=0,$18=0,$new_capacity_0=0,$20=0,$22=0,$23=0,$26=0,$27=0,$29=0,$30=0;
 var $31=0,$32=0,$35=0,$36=0,$38=0,$39=0,$40=0,$41=0,$42=0,$46=0,$47=0,$49=0,$storemerge=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+8)|0;
 $actual_size=((sp)|0);
 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($this+8)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $5=($2>>>0)>($4>>>0);
 if ($5) {
  __ZN4crnd11crnd_assertEPKcS1_j(800,488,2119);
 }
 $8=(((2147418112)/(($element_size>>>0)))&-1);
 $9=($8>>>0)>($min_new_capacity>>>0);
 if (!($9)) {
  __ZN4crnd11crnd_assertEPKcS1_j(328,488,2120);
 }
 $12=((HEAP32[(($3)>>2)])|0);
 $13=($12>>>0)<($min_new_capacity>>>0);
 if (!($13)) {
  $_0=1;

  STACKTOP=sp;return (($_0)|0);
 }
 do {
  if ($grow_hint) {
   $16=((__ZN4crnd4math13is_power_of_2Ej($min_new_capacity))|0);
   if ($16) {
    $new_capacity_0=$min_new_capacity;
    break;
   }
   $18=((__ZN4crnd4math9next_pow2Ej($min_new_capacity))|0);
   $new_capacity_0=$18;
  } else {
   $new_capacity_0=$min_new_capacity;
  }
 } while(0);

 $20=($new_capacity_0|0)==0;
 if ($20) {
  label = 11;
 } else {
  $22=((HEAP32[(($3)>>2)])|0);
  $23=($new_capacity_0>>>0)>($22>>>0);
  if (!($23)) {
   label = 11;
  }
 }
 if ((label|0) == 11) {
  __ZN4crnd11crnd_assertEPKcS1_j(152,488,2129);
 }
 $26=(Math_imul($new_capacity_0,$element_size)|0);
 $27=($pMover|0)==0;
 do {
  if ($27) {
   $29=(($this)|0);
   $30=((HEAP32[(($29)>>2)])|0);
   $31=((__ZN4crnd12crnd_reallocEPvjPjb($30,$26,$actual_size,1))|0);
   $32=($31|0)==0;
   if ($32) {
    $_0=0;

    STACKTOP=sp;return (($_0)|0);
   } else {
    HEAP32[(($29)>>2)]=$31;
    break;
   }
  } else {
   $35=((__ZN4crnd11crnd_mallocEjPj($26,$actual_size))|0);
   $36=($35|0)==0;
   if ($36) {
    $_0=0;

    STACKTOP=sp;return (($_0)|0);
   }
   $38=(($this)|0);
   $39=((HEAP32[(($38)>>2)])|0);
   $40=((HEAP32[(($1)>>2)])|0);
   FUNCTION_TABLE_viii[($pMover)&1]($35,$39,$40);
   $41=((HEAP32[(($38)>>2)])|0);
   $42=($41|0)==0;
   if (!($42)) {
    __ZN4crnd9crnd_freeEPv($41);
   }
   HEAP32[(($38)>>2)]=$35;
  }
 } while(0);
 $46=((HEAP32[(($actual_size)>>2)])|0);
 $47=($46>>>0)>($26>>>0);
 if ($47) {
  $49=(((($46>>>0))/(($element_size>>>0)))&-1);
  $storemerge=$49;
 } else {
  $storemerge=$new_capacity_0;
 }

 HEAP32[(($3)>>2)]=$storemerge;
 $_0=1;

 STACKTOP=sp;return (($_0)|0);
}


function __ZN4crnd4math13is_power_of_2Ej($x){
 $x=($x)|0;
 var $1=0,$3=0,$4=0,$5=0,$7=0,label=0;

 $1=($x|0)==0;
 if ($1) {
  $7=0;
 } else {
  $3=((($x)-(1))|0);
  $4=$3&$x;
  $5=($4|0)==0;
  $7=$5;
 }

 return (($7)|0);
}


function __ZN4crnd4math9next_pow2Ej($val){
 $val=($val)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,label=0;

 $1=((($val)-(1))|0);
 $2=$1>>>16;
 $3=$2|$1;
 $4=$3>>>8;
 $5=$4|$3;
 $6=$5>>>4;
 $7=$6|$5;
 $8=$7>>>2;
 $9=$8|$7;
 $10=$9>>>1;
 $11=$10|$9;
 $12=((($11)+(1))|0);
 return (($12)|0);
}


function __ZN4crnd12crnd_reallocEPvjPjb($p,$size,$pActual_size,$movable){
 $p=($p)|0;
 $size=($size)|0;
 $pActual_size=($pActual_size)|0;
 $movable=($movable)|0;
 var $actual_size=0,$1=0,$2=0,$3=0,$6=0,$9=0,$10=0,$11=0,$12=0,$14=0,$16=0,$17=0,$18=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+8)|0;
 $actual_size=((sp)|0);
 $1=$p;
 $2=$1&7;
 $3=($2|0)==0;
 if (!($3)) {
  __ZN4crndL14crnd_mem_errorEPKc(656);
  $_0=0;

  STACKTOP=sp;return (($_0)|0);
 }
 $6=($size>>>0)>((2147418112)>>>0);
 if ($6) {
  __ZN4crndL14crnd_mem_errorEPKc(768);
  $_0=0;

  STACKTOP=sp;return (($_0)|0);
 }
 HEAP32[(($actual_size)>>2)]=$size;
 $9=((HEAP32[((928)>>2)])|0);
 $10=((HEAP32[((1448)>>2)])|0);
 $11=((FUNCTION_TABLE_iiiiii[($9)&3]($p,$size,$actual_size,$movable,$10))|0);
 $12=($pActual_size|0)==0;
 if (!($12)) {
  $14=((HEAP32[(($actual_size)>>2)])|0);
  HEAP32[(($pActual_size)>>2)]=$14;
 }
 $16=$11;
 $17=$16&7;
 $18=($17|0)==0;
 if ($18) {
  $_0=$11;

  STACKTOP=sp;return (($_0)|0);
 }
 __ZN4crnd11crnd_assertEPKcS1_j(680,488,2554);
 $_0=$11;

 STACKTOP=sp;return (($_0)|0);
}


function __ZN4crnd11crnd_mallocEjPj($size,$pActual_size){
 $size=($size)|0;
 $pActual_size=($pActual_size)|0;
 var $actual_size=0,$1=0,$2=0,$3=0,$_=0,$4=0,$7=0,$8=0,$9=0,$10=0,$12=0,$14=0,$15=0,$16=0,$or_cond=0,$19=0,$20=0,$21=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+8)|0;
 $actual_size=((sp)|0);
 $1=((($size)+(3))|0);
 $2=$1&-4;
 $3=($2|0)==0;
 $_=($3?4:$2);
 $4=($_>>>0)>((2147418112)>>>0);
 if ($4) {
  __ZN4crndL14crnd_mem_errorEPKc(768);
  $_0=0;

  STACKTOP=sp;return (($_0)|0);
 }
 HEAP32[(($actual_size)>>2)]=$_;
 $7=((HEAP32[((928)>>2)])|0);
 $8=((HEAP32[((1448)>>2)])|0);
 $9=((FUNCTION_TABLE_iiiiii[($7)&3](0,$_,$actual_size,1,$8))|0);
 $10=($pActual_size|0)==0;
 if (!($10)) {
  $12=((HEAP32[(($actual_size)>>2)])|0);
  HEAP32[(($pActual_size)>>2)]=$12;
 }
 $14=($9|0)==0;
 $15=((HEAP32[(($actual_size)>>2)])|0);
 $16=($15>>>0)<($_>>>0);
 $or_cond=$14|$16;
 if ($or_cond) {
  __ZN4crndL14crnd_mem_errorEPKc(736);
  $_0=0;

  STACKTOP=sp;return (($_0)|0);
 }
 $19=$9;
 $20=$19&7;
 $21=($20|0)==0;
 if ($21) {
  $_0=$9;

  STACKTOP=sp;return (($_0)|0);
 }
 __ZN4crnd11crnd_assertEPKcS1_j(680,488,2529);
 $_0=$9;

 STACKTOP=sp;return (($_0)|0);
}


function __ZN4crnd9crnd_freeEPv($p){
 $p=($p)|0;
 var $1=0,$3=0,$4=0,$5=0,$8=0,$9=0,$10=0,label=0;

 $1=($p|0)==0;
 if ($1) {
  return;
 }
 $3=$p;
 $4=$3&7;
 $5=($4|0)==0;
 if ($5) {
  $8=((HEAP32[((928)>>2)])|0);
  $9=((HEAP32[((1448)>>2)])|0);
  $10=((FUNCTION_TABLE_iiiiii[($8)&3]($p,0,0,1,$9))|0);
  return;
 } else {
  __ZN4crndL14crnd_mem_errorEPKc(632);
  return;
 }
}


function __ZN4crnd13prefix_coding14decoder_tables4initEjPKhj($this,$num_syms,$pCodesizes,$table_bits){
 $this=($this)|0;
 $num_syms=($num_syms)|0;
 $pCodesizes=($pCodesizes)|0;
 $table_bits=($table_bits)|0;
 var $min_codes=0,$num_codes=0,$sorted_positions=0,$1=0,$2=0,$or_cond=0,$4=0,$5=0,$i_0108=0,$6=0,$7=0,$8=0,$10=0,$11=0,$12=0,$13=0,$15=0,$16=0,$cur_code_0107=0,$total_used_syms_0106=0;
 var $max_code_size_0105=0,$min_code_size_0104=0,$i1_0103=0,$17=0,$18=0,$19=0,$21=0,$22=0,$24=0,$25=0,$26=0,$27=0,$28=0,$29=0,$30=0,$31=0,$32=0,$33=0,$34=0,$35=0;
 var $36=0,$37=0,$38=0,$39=0,$min_code_size_1=0,$max_code_size_1=0,$total_used_syms_1=0,$cur_code_1=0,$41=0,$42=0,$43=0,$45=0,$46=0,$47=0,$48=0,$50=0,$52=0,$53=0,$storemerge=0,$55=0;
 var $56=0,$57=0,$60=0,$61=0,$62=0,$64=0,$65=0,$66=0,$67=0,$68=0,$69=0,$i2_0100=0,$71=0,$72=0,$73=0,$74=0,$76=0,$77=0,$78=0,$81=0;
 var $82=0,$83=0,$84=0,$87=0,$88=0,$89=0,$91=0,$92=0,$93=0,$94=0,$95=0,$table_bits_=0,$96=0,$97=0,$99=0,$100=0,$101=0,$102=0,$103=0,$104=0;
 var $105=0,$106=0,$108=0,$109=0,$110=0,$113=0,$114=0,$116=0,$117=0,$118=0,$119=0,$120=0,$121=0,$122=0,$codesize_098=0,$124=0,$125=0,$126=0,$128=0,$129=0;
 var $130=0,$131=0,$132=0,$133=0,$134=0,$135=0,$136=0,$137=0,$138=0,$code_097=0,$140=0,$141=0,$142=0,$143=0,$144=0,$145=0,$146=0,$147=0,$148=0,$150=0;
 var $151=0,$j_096=0,$153=0,$154=0,$157=0,$158=0,$159=0,$160=0,$163=0,$164=0,$165=0,$166=0,$168=0,$169=0,$170=0,$171=0,$172=0,$173=0,$174=0,$175=0;
 var $176=0,$177=0,$178=0,$179=0,$180=0,$181=0,$182=0,$183=0,$184=0,$185=0,$186=0,$187=0,$188=0,$189=0,$190=0,$191=0,$192=0,$193=0,$194=0,$195=0;
 var $196=0,$197=0,$198=0,$199=0,$200=0,$201=0,$202=0,$203=0,$204=0,$205=0,$206=0,$207=0,$208=0,$209=0,$210=0,$211=0,$212=0,$213=0,$214=0,$215=0;
 var $216=0,$217=0,$218=0,$219=0,$220=0,$221=0,$222=0,$223=0,$224=0,$225=0,$226=0,$227=0,$228=0,$229=0,$230=0,$231=0,$232=0,$233=0,$234=0,$235=0;
 var $236=0,$237=0,$238=0,$239=0,$240=0,$241=0,$242=0,$243=0,$244=0,$245=0,$246=0,$247=0,$248=0,$249=0,$250=0,$251=0,$252=0,$253=0,$254=0,$255=0;
 var $i5_0=0,$256=0,$258=0,$259=0,$260=0,$261=0,$263=0,$264=0,$265=0,$j6_0=0,$267=0,$269=0,$270=0,$271=0,$272=0,$274=0,$275=0,$276=0,$277=0,$278=0;
 var $_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+208)|0;
 $min_codes=((sp)|0);
 $num_codes=(((sp)+(64))|0);
 $sorted_positions=(((sp)+(136))|0);
 $1=($num_syms|0)==0;
 $2=($table_bits>>>0)>((11)>>>0);
 $or_cond=$1|$2;
 if ($or_cond) {
  $_0=0;

  STACKTOP=sp;return (($_0)|0);
 }
 $4=(($this)|0);
 HEAP32[(($4)>>2)]=$num_syms;
 __ZN4crnd5utils11zero_objectIA17_jEEvRT_($num_codes);
 $5=($num_syms|0)==0;
 if ($5) {
  $i1_0103=1;$min_code_size_0104=-1;$max_code_size_0105=0;$total_used_syms_0106=0;$cur_code_0107=0;
 } else {
  $i_0108=0;
  while(1) {

   $6=(($pCodesizes+$i_0108)|0);
   $7=((HEAP8[($6)])|0);
   $8=(($7<<24)>>24)==0;
   if (!($8)) {
    $10=($7&255);
    $11=(($num_codes+($10<<2))|0);
    $12=((HEAP32[(($11)>>2)])|0);
    $13=((($12)+(1))|0);
    HEAP32[(($11)>>2)]=$13;
   }
   $15=((($i_0108)+(1))|0);
   $16=($15>>>0)<($num_syms>>>0);
   if ($16) {
    $i_0108=$15;
   } else {
    $i1_0103=1;$min_code_size_0104=-1;$max_code_size_0105=0;$total_used_syms_0106=0;$cur_code_0107=0;
    break;
   }
  }
 }
 while(1) {





  $17=(($num_codes+($i1_0103<<2))|0);
  $18=((HEAP32[(($17)>>2)])|0);
  $19=($18|0)==0;
  if ($19) {
   $21=((($i1_0103)-(1))|0);
   $22=(($this+28+($21<<2))|0);
   HEAP32[(($22)>>2)]=0;
   $cur_code_1=$cur_code_0107;$total_used_syms_1=$total_used_syms_0106;$max_code_size_1=$max_code_size_0105;$min_code_size_1=$min_code_size_0104;
  } else {
   $24=((__ZN4crnd4math7minimumIjEET_S2_S2_($min_code_size_0104,$i1_0103))|0);
   $25=((__ZN4crnd4math7maximumIjEET_S2_S2_($max_code_size_0105,$i1_0103))|0);
   $26=((($i1_0103)-(1))|0);
   $27=(($min_codes+($26<<2))|0);
   HEAP32[(($27)>>2)]=$cur_code_0107;
   $28=((($18)+($cur_code_0107))|0);
   $29=((($28)-(1))|0);
   $30=(($this+28+($26<<2))|0);
   $31=(((16)-($i1_0103))|0);
   $32=$29<<$31;
   $33=1<<$31;
   $34=((($33)-(1))|0);
   $35=$32|$34;
   $36=((($35)+(1))|0);
   HEAP32[(($30)>>2)]=$36;
   $37=(($this+96+($26<<2))|0);
   HEAP32[(($37)>>2)]=$total_used_syms_0106;
   $38=(($sorted_positions+($i1_0103<<2))|0);
   HEAP32[(($38)>>2)]=$total_used_syms_0106;
   $39=((($18)+($total_used_syms_0106))|0);
   $cur_code_1=$28;$total_used_syms_1=$39;$max_code_size_1=$25;$min_code_size_1=$24;
  }




  $41=$cur_code_1<<1;
  $42=((($i1_0103)+(1))|0);
  $43=($42>>>0)<((17)>>>0);
  if ($43) {
   $i1_0103=$42;$min_code_size_0104=$min_code_size_1;$max_code_size_0105=$max_code_size_1;$total_used_syms_0106=$total_used_syms_1;$cur_code_0107=$41;
  } else {
   break;
  }
 }
 $45=(($this+4)|0);
 HEAP32[(($45)>>2)]=$total_used_syms_1;
 $46=(($this+172)|0);
 $47=((HEAP32[(($46)>>2)])|0);
 $48=($total_used_syms_1>>>0)>($47>>>0);
 do {
  if ($48) {
   $50=((__ZN4crnd4math13is_power_of_2Ej($total_used_syms_1))|0);
   if ($50) {
    $storemerge=$total_used_syms_1;
   } else {
    $52=((__ZN4crnd4math9next_pow2Ej($total_used_syms_1))|0);
    $53=((__ZN4crnd4math7minimumIjEET_S2_S2_($num_syms,$52))|0);
    $storemerge=$53;
   }

   HEAP32[(($46)>>2)]=$storemerge;
   $55=(($this+176)|0);
   $56=((HEAP32[(($55)>>2)])|0);
   $57=($56|0)==0;
   if (!($57)) {
    __ZN4crnd17crnd_delete_arrayItEEvPT_($56);
   }
   $60=((HEAP32[(($46)>>2)])|0);
   $61=((__ZN4crnd14crnd_new_arrayItEEPT_j($60))|0);
   HEAP32[(($55)>>2)]=$61;
   $62=($61|0)==0;
   if ($62) {
    $_0=0;
   } else {
    break;
   }

   STACKTOP=sp;return (($_0)|0);
  }
 } while(0);
 $64=(($min_code_size_1)&255);
 $65=(($this+24)|0);
 HEAP8[($65)]=$64;
 $66=(($max_code_size_1)&255);
 $67=(($this+25)|0);
 HEAP8[($67)]=$66;
 $68=($num_syms|0)==0;
 if (!($68)) {
  $69=(($this+176)|0);
  $i2_0100=0;
  while(1) {

   $71=(($pCodesizes+$i2_0100)|0);
   $72=((HEAP8[($71)])|0);
   $73=($72&255);
   $74=(($72<<24)>>24)==0;
   if (!($74)) {
    $76=(($num_codes+($73<<2))|0);
    $77=((HEAP32[(($76)>>2)])|0);
    $78=($77|0)==0;
    if ($78) {
     __ZN4crnd11crnd_assertEPKcS1_j(136,488,2272);
    }
    $81=(($sorted_positions+($73<<2))|0);
    $82=((HEAP32[(($81)>>2)])|0);
    $83=((($82)+(1))|0);
    HEAP32[(($81)>>2)]=$83;
    $84=($82>>>0)<($total_used_syms_1>>>0);
    if (!($84)) {
     __ZN4crnd11crnd_assertEPKcS1_j(104,488,2276);
    }
    $87=(($i2_0100)&65535);
    $88=((HEAP32[(($69)>>2)])|0);
    $89=(($88+($82<<1))|0);
    HEAP16[(($89)>>1)]=$87;
   }
   $91=((($i2_0100)+(1))|0);
   $92=($91>>>0)<($num_syms>>>0);
   if ($92) {
    $i2_0100=$91;
   } else {
    break;
   }
  }
 }
 $93=((HEAP8[($65)])|0);
 $94=($93&255);
 $95=($94>>>0)<($table_bits>>>0);
 $table_bits_=($95?$table_bits:0);
 $96=(($this+8)|0);
 HEAP32[(($96)>>2)]=$table_bits_;
 $97=($table_bits_|0)!=0;
 L41: do {
  if ($97) {
   $99=1<<$table_bits_;
   $100=(($this+164)|0);
   $101=((HEAP32[(($100)>>2)])|0);
   $102=($99>>>0)>($101>>>0);
   do {
    if ($102) {
     HEAP32[(($100)>>2)]=$99;
     $108=(($this+168)|0);
     $109=((HEAP32[(($108)>>2)])|0);
     $110=($109|0)==0;
     if (!($110)) {
      __ZN4crnd17crnd_delete_arrayIjEEvPT_($109);
     }
     $113=((__ZN4crnd14crnd_new_arrayIjEEPT_j($99))|0);
     HEAP32[(($108)>>2)]=$113;
     $114=($113|0)==0;
     if ($114) {
      $_0=0;

      STACKTOP=sp;return (($_0)|0);
     } else {
      $116=(($this+168)|0);
      $117=((HEAP32[(($116)>>2)])|0);
      $118=$117;
      $119=$99<<2;
      _memset((((($118)|0))|0), ((((-1)|0))|0), (((($119)|0))|0))|0;
      $120=($table_bits_|0)==0;
      if ($120) {
       break L41;
      } else {
       $121=$116;
       break;
      }
     }
    } else {
     $103=(($this+168)|0);
     $104=((HEAP32[(($103)>>2)])|0);
     $105=$104;
     $106=$99<<2;
     _memset((((($105)|0))|0), ((((-1)|0))|0), (((($106)|0))|0))|0;
     $121=$103;
    }
   } while(0);

   $122=(($this+176)|0);
   $codesize_098=1;
   while(1) {

    $124=(($num_codes+($codesize_098<<2))|0);
    $125=((HEAP32[(($124)>>2)])|0);
    $126=($125|0)==0;
    do {
     if (!($126)) {
      $128=((($table_bits_)-($codesize_098))|0);
      $129=1<<$128;
      $130=((($codesize_098)-(1))|0);
      $131=(($min_codes+($130<<2))|0);
      $132=((HEAP32[(($131)>>2)])|0);
      $133=((__ZNK4crnd13prefix_coding14decoder_tables22get_unshifted_max_codeEj($this,$codesize_098))|0);
      $134=($132>>>0)>($133>>>0);
      if ($134) {
       break;
      }
      $135=(($this+96+($130<<2))|0);
      $136=((HEAP32[(($135)>>2)])|0);
      $137=((($136)-($132))|0);
      $138=$codesize_098<<16;
      $code_097=$132;
      while(1) {

       $140=((($137)+($code_097))|0);
       $141=((HEAP32[(($122)>>2)])|0);
       $142=(($141+($140<<1))|0);
       $143=((HEAP16[(($142)>>1)])|0);
       $144=($143&65535);
       $145=(($pCodesizes+$144)|0);
       $146=((HEAP8[($145)])|0);
       $147=($146&255);
       $148=($147|0)==($codesize_098|0);
       if (!($148)) {
        __ZN4crnd11crnd_assertEPKcS1_j(64,488,2318);
       }
       $150=$code_097<<$128;
       $151=$144|$138;
       $j_096=0;
       while(1) {

        $153=((($j_096)+($150))|0);
        $154=($153>>>0)<($99>>>0);
        if (!($154)) {
         __ZN4crnd11crnd_assertEPKcS1_j(40,488,2324);
        }
        $157=((HEAP32[(($121)>>2)])|0);
        $158=(($157+($153<<2))|0);
        $159=((HEAP32[(($158)>>2)])|0);
        $160=($159|0)==-1;
        if (!($160)) {
         __ZN4crnd11crnd_assertEPKcS1_j(8,488,2326);
        }
        $163=((HEAP32[(($121)>>2)])|0);
        $164=(($163+($153<<2))|0);
        HEAP32[(($164)>>2)]=$151;
        $165=((($j_096)+(1))|0);
        $166=($165>>>0)<($129>>>0);
        if ($166) {
         $j_096=$165;
        } else {
         break;
        }
       }
       $168=((($code_097)+(1))|0);
       $169=($168>>>0)>($133>>>0);
       if ($169) {
        break;
       } else {
        $code_097=$168;
       }
      }
     }
    } while(0);
    $170=((($codesize_098)+(1))|0);
    $171=($170>>>0)>($table_bits_>>>0);
    if ($171) {
     break;
    } else {
     $codesize_098=$170;
    }
   }
  }
 } while(0);
 $172=(($min_codes)|0);
 $173=((HEAP32[(($172)>>2)])|0);
 $174=(($this+96)|0);
 $175=((HEAP32[(($174)>>2)])|0);
 $176=((($175)-($173))|0);
 HEAP32[(($174)>>2)]=$176;
 $177=(($min_codes+4)|0);
 $178=((HEAP32[(($177)>>2)])|0);
 $179=(($this+100)|0);
 $180=((HEAP32[(($179)>>2)])|0);
 $181=((($180)-($178))|0);
 HEAP32[(($179)>>2)]=$181;
 $182=(($min_codes+8)|0);
 $183=((HEAP32[(($182)>>2)])|0);
 $184=(($this+104)|0);
 $185=((HEAP32[(($184)>>2)])|0);
 $186=((($185)-($183))|0);
 HEAP32[(($184)>>2)]=$186;
 $187=(($min_codes+12)|0);
 $188=((HEAP32[(($187)>>2)])|0);
 $189=(($this+108)|0);
 $190=((HEAP32[(($189)>>2)])|0);
 $191=((($190)-($188))|0);
 HEAP32[(($189)>>2)]=$191;
 $192=(($min_codes+16)|0);
 $193=((HEAP32[(($192)>>2)])|0);
 $194=(($this+112)|0);
 $195=((HEAP32[(($194)>>2)])|0);
 $196=((($195)-($193))|0);
 HEAP32[(($194)>>2)]=$196;
 $197=(($min_codes+20)|0);
 $198=((HEAP32[(($197)>>2)])|0);
 $199=(($this+116)|0);
 $200=((HEAP32[(($199)>>2)])|0);
 $201=((($200)-($198))|0);
 HEAP32[(($199)>>2)]=$201;
 $202=(($min_codes+24)|0);
 $203=((HEAP32[(($202)>>2)])|0);
 $204=(($this+120)|0);
 $205=((HEAP32[(($204)>>2)])|0);
 $206=((($205)-($203))|0);
 HEAP32[(($204)>>2)]=$206;
 $207=(($min_codes+28)|0);
 $208=((HEAP32[(($207)>>2)])|0);
 $209=(($this+124)|0);
 $210=((HEAP32[(($209)>>2)])|0);
 $211=((($210)-($208))|0);
 HEAP32[(($209)>>2)]=$211;
 $212=(($min_codes+32)|0);
 $213=((HEAP32[(($212)>>2)])|0);
 $214=(($this+128)|0);
 $215=((HEAP32[(($214)>>2)])|0);
 $216=((($215)-($213))|0);
 HEAP32[(($214)>>2)]=$216;
 $217=(($min_codes+36)|0);
 $218=((HEAP32[(($217)>>2)])|0);
 $219=(($this+132)|0);
 $220=((HEAP32[(($219)>>2)])|0);
 $221=((($220)-($218))|0);
 HEAP32[(($219)>>2)]=$221;
 $222=(($min_codes+40)|0);
 $223=((HEAP32[(($222)>>2)])|0);
 $224=(($this+136)|0);
 $225=((HEAP32[(($224)>>2)])|0);
 $226=((($225)-($223))|0);
 HEAP32[(($224)>>2)]=$226;
 $227=(($min_codes+44)|0);
 $228=((HEAP32[(($227)>>2)])|0);
 $229=(($this+140)|0);
 $230=((HEAP32[(($229)>>2)])|0);
 $231=((($230)-($228))|0);
 HEAP32[(($229)>>2)]=$231;
 $232=(($min_codes+48)|0);
 $233=((HEAP32[(($232)>>2)])|0);
 $234=(($this+144)|0);
 $235=((HEAP32[(($234)>>2)])|0);
 $236=((($235)-($233))|0);
 HEAP32[(($234)>>2)]=$236;
 $237=(($min_codes+52)|0);
 $238=((HEAP32[(($237)>>2)])|0);
 $239=(($this+148)|0);
 $240=((HEAP32[(($239)>>2)])|0);
 $241=((($240)-($238))|0);
 HEAP32[(($239)>>2)]=$241;
 $242=(($min_codes+56)|0);
 $243=((HEAP32[(($242)>>2)])|0);
 $244=(($this+152)|0);
 $245=((HEAP32[(($244)>>2)])|0);
 $246=((($245)-($243))|0);
 HEAP32[(($244)>>2)]=$246;
 $247=(($min_codes+60)|0);
 $248=((HEAP32[(($247)>>2)])|0);
 $249=(($this+156)|0);
 $250=((HEAP32[(($249)>>2)])|0);
 $251=((($250)-($248))|0);
 HEAP32[(($249)>>2)]=$251;
 $252=(($this+16)|0);
 HEAP32[(($252)>>2)]=0;
 $253=((HEAP8[($65)])|0);
 $254=($253&255);
 $255=(($this+20)|0);
 HEAP32[(($255)>>2)]=$254;
 L74: do {
  if ($97) {
   $i5_0=$table_bits_;
   while(1) {

    $256=($i5_0|0)==0;
    if ($256) {
     break L74;
    }
    $258=(($num_codes+($i5_0<<2))|0);
    $259=((HEAP32[(($258)>>2)])|0);
    $260=($259|0)==0;
    $261=((($i5_0)-(1))|0);
    if ($260) {
     $i5_0=$261;
    } else {
     break;
    }
   }
   $263=(($this+28+($261<<2))|0);
   $264=((HEAP32[(($263)>>2)])|0);
   HEAP32[(($252)>>2)]=$264;
   $265=((($table_bits_)+(1))|0);
   HEAP32[(($255)>>2)]=$265;
   $j6_0=$265;
   while(1) {

    $267=($j6_0>>>0)>($max_code_size_1>>>0);
    if ($267) {
     break L74;
    }
    $269=(($num_codes+($j6_0<<2))|0);
    $270=((HEAP32[(($269)>>2)])|0);
    $271=($270|0)==0;
    $272=((($j6_0)+(1))|0);
    if ($271) {
     $j6_0=$272;
    } else {
     break;
    }
   }
   HEAP32[(($255)>>2)]=$j6_0;
  }
 } while(0);
 $274=(($this+92)|0);
 HEAP32[(($274)>>2)]=-1;
 $275=(($this+160)|0);
 HEAP32[(($275)>>2)]=1048575;
 $276=((HEAP32[(($96)>>2)])|0);
 $277=(((32)-($276))|0);
 $278=(($this+12)|0);
 HEAP32[(($278)>>2)]=$277;
 $_0=1;

 STACKTOP=sp;return (($_0)|0);
}


function __ZN4crnd5utils11zero_objectIA17_jEEvRT_($obj){
 $obj=($obj)|0;
 var $1=0,label=0;

 $1=$obj;
 _memset((((($1)|0))|0), ((((0)|0))|0), ((((68)|0))|0))|0;
 return;
}


function __ZN4crnd4math7minimumIjEET_S2_S2_($a,$b){
 $a=($a)|0;
 $b=($b)|0;
 var $1=0,$2=0,label=0;

 $1=($a>>>0)<($b>>>0);
 $2=($1?$a:$b);
 return (($2)|0);
}


function __ZN4crnd4math7maximumIjEET_S2_S2_($a,$b){
 $a=($a)|0;
 $b=($b)|0;
 var $1=0,$2=0,label=0;

 $1=($a>>>0)>($b>>>0);
 $2=($1?$a:$b);
 return (($2)|0);
}


function __ZN4crnd17crnd_delete_arrayItEEvPT_($p){
 $p=($p)|0;
 var $1=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$10=0,$11=0,$12=0,$15=0,$16=0,label=0;

 $1=($p|0)==0;
 if ($1) {
  return;
 }
 $3=((($p)-(4))|0);
 $4=$3;
 $5=((HEAP32[(($4)>>2)])|0);
 $6=($5|0)==0;
 if ($6) {
  label = 4;
 } else {
  $8=((($p)-(8))|0);
  $9=$8;
  $10=((HEAP32[(($9)>>2)])|0);
  $11=$10^-1;
  $12=($5|0)==($11|0);
  if (!($12)) {
   label = 4;
  }
 }
 if ((label|0) == 4) {
  __ZN4crnd11crnd_assertEPKcS1_j(280,488,647);
 }
 $15=((($p)-(8))|0);
 $16=$15;
 __ZN4crnd9crnd_freeEPv($16);
 return;
}


function __ZN4crnd14crnd_new_arrayItEEPT_j($num){
 $num=($num)|0;
 var $1=0,$_num=0,$2=0,$3=0,$4=0,$5=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$_0=0,label=0;

 $1=($num|0)==0;
 $_num=($1?1:$num);
 $2=$_num<<1;
 $3=((($2)+(8))|0);
 $4=((__ZN4crnd11crnd_mallocEjPj($3,0))|0);
 $5=($4|0)==0;
 if ($5) {
  $_0=0;

  return (($_0)|0);
 }
 $7=(($4+8)|0);
 $8=$7;
 $9=(($4+4)|0);
 $10=$9;
 HEAP32[(($10)>>2)]=$_num;
 $11=$_num^-1;
 $12=$4;
 HEAP32[(($12)>>2)]=$11;
 $_0=$8;

 return (($_0)|0);
}


function __ZN4crnd17crnd_delete_arrayIjEEvPT_($p){
 $p=($p)|0;
 var $1=0,$3=0,$4=0,$5=0,$7=0,$8=0,$9=0,$10=0,$13=0,$14=0,label=0;

 $1=($p|0)==0;
 if ($1) {
  return;
 }
 $3=((($p)-(4))|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $5=($4|0)==0;
 if ($5) {
  label = 4;
 } else {
  $7=((($p)-(8))|0);
  $8=((HEAP32[(($7)>>2)])|0);
  $9=$8^-1;
  $10=($4|0)==($9|0);
  if (!($10)) {
   label = 4;
  }
 }
 if ((label|0) == 4) {
  __ZN4crnd11crnd_assertEPKcS1_j(280,488,647);
 }
 $13=((($p)-(8))|0);
 $14=$13;
 __ZN4crnd9crnd_freeEPv($14);
 return;
}


function __ZN4crnd14crnd_new_arrayIjEEPT_j($num){
 $num=($num)|0;
 var $1=0,$_num=0,$2=0,$3=0,$4=0,$5=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$_0=0,label=0;

 $1=($num|0)==0;
 $_num=($1?1:$num);
 $2=$_num<<2;
 $3=((($2)+(8))|0);
 $4=((__ZN4crnd11crnd_mallocEjPj($3,0))|0);
 $5=($4|0)==0;
 if ($5) {
  $_0=0;

  return (($_0)|0);
 }
 $7=(($4+8)|0);
 $8=$7;
 $9=(($4+4)|0);
 $10=$9;
 HEAP32[(($10)>>2)]=$_num;
 $11=$_num^-1;
 $12=$4;
 HEAP32[(($12)>>2)]=$11;
 $_0=$8;

 return (($_0)|0);
}


function __ZNK4crnd13prefix_coding14decoder_tables22get_unshifted_max_codeEj($this,$len){
 $this=($this)|0;
 $len=($len)|0;
 var $1=0,$2=0,$or_cond=0,$5=0,$6=0,$7=0,$8=0,$10=0,$11=0,$12=0,$_0=0,label=0;

 $1=($len|0)!=0;
 $2=($len>>>0)<((17)>>>0);
 $or_cond=$1&$2;
 if (!($or_cond)) {
  __ZN4crnd11crnd_assertEPKcS1_j(200,488,1956);
 }
 $5=((($len)-(1))|0);
 $6=(($this+28+($5<<2))|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=($7|0)==0;
 if ($8) {
  $_0=-1;

  return (($_0)|0);
 }
 $10=((($7)-(1))|0);
 $11=(((16)-($len))|0);
 $12=$10>>>($11>>>0);
 $_0=$12;

 return (($_0)|0);
}


function __ZN4crndL20crnd_default_reallocEPvjPjbS0_($p,$size,$pActual_size,$movable,$pUser_data){
 $p=($p)|0;
 $size=($size)|0;
 $pActual_size=($pActual_size)|0;
 $movable=($movable)|0;
 $pUser_data=($pUser_data)|0;
 var $1=0,$3=0,$4=0,$6=0,$8=0,$10=0,$12=0,$14=0,$18=0,$19=0,$p_=0,$p_new_0=0,$p_final_block_0=0,$21=0,$23=0,$p_new_1=0,label=0;

 $1=($p|0)==0;
 do {
  if ($1) {
   $3=((_malloc($size))|0);
   $4=($pActual_size|0)==0;
   if ($4) {
    $p_new_1=$3;
    break;
   }
   $6=($3|0)==0;
   if ($6) {
    $10=0;
   } else {
    $8=((_malloc_usable_size($3))|0);
    $10=$8;
   }

   HEAP32[(($pActual_size)>>2)]=$10;
   $p_new_1=$3;
  } else {
   $12=($size|0)==0;
   if ($12) {
    _free($p);
    $14=($pActual_size|0)==0;
    if ($14) {
     $p_new_1=0;
     break;
    }
    HEAP32[(($pActual_size)>>2)]=0;
    $p_new_1=0;
    break;
   }
   if ($movable) {
    $18=((_realloc($p,$size))|0);
    $19=($18|0)==0;
    $p_=($19?$p:$18);
    $p_final_block_0=$p_;$p_new_0=$18;
   } else {
    $p_final_block_0=$p;$p_new_0=0;
   }


   $21=($pActual_size|0)==0;
   if ($21) {
    $p_new_1=$p_new_0;
    break;
   }
   $23=((_malloc_usable_size($p_final_block_0))|0);
   HEAP32[(($pActual_size)>>2)]=$23;
   $p_new_1=$p_new_0;
  }
 } while(0);

 return (($p_new_1)|0);
}


function __ZN4crndL14crnd_mem_errorEPKc($p_msg){
 $p_msg=($p_msg)|0;
 var label=0;

 __ZN4crnd11crnd_assertEPKcS1_j($p_msg,488,2502);
 return;
}


function __ZN4crnd34crnd_get_crn_format_bits_per_texelE10crn_format($fmt$0,$fmt$1){
 $fmt$0=($fmt$0)|0;
 $fmt$1=($fmt$1)|0;
 var $$etemp$10$0=0,$$etemp$10$1=0,$$etemp$9$0=0,$$etemp$9$1=0,$$etemp$8$0=0,$$etemp$8$1=0,$$etemp$7$0=0,$$etemp$7$1=0,$$etemp$6$0=0,$$etemp$6$1=0,$$etemp$5$0=0,$$etemp$5$1=0,$$etemp$4$0=0,$$etemp$4$1=0,$$etemp$3$0=0,$$etemp$3$1=0,$$etemp$2$0=0,$$etemp$2$1=0,$$etemp$1$0=0,$$etemp$1$1=0;
 var $$etemp$0$0=0,$$etemp$0$1=0,$_0=0,label=0;

 $$etemp$10$0=6;
 $$etemp$10$1=0;
 $$etemp$9$0=5;
 $$etemp$9$1=0;
 $$etemp$8$0=4;
 $$etemp$8$1=0;
 $$etemp$7$0=3;
 $$etemp$7$1=0;
 $$etemp$6$0=8;
 $$etemp$6$1=0;
 $$etemp$5$0=7;
 $$etemp$5$1=0;
 $$etemp$4$0=2;
 $$etemp$4$1=0;
 $$etemp$3$0=1;
 $$etemp$3$1=0;
 $$etemp$2$0=10;
 $$etemp$2$1=0;
 $$etemp$1$0=9;
 $$etemp$1$1=0;
 $$etemp$0$0=0;
 $$etemp$0$1=0;
 if ((($fmt$0)|0)==(($$etemp$3$0)|0)&(($fmt$1)|0)==(($$etemp$3$1)|0)|(($fmt$0)|0)==(($$etemp$4$0)|0)&(($fmt$1)|0)==(($$etemp$4$1)|0)|(($fmt$0)|0)==(($$etemp$5$0)|0)&(($fmt$1)|0)==(($$etemp$5$1)|0)|(($fmt$0)|0)==(($$etemp$6$0)|0)&(($fmt$1)|0)==(($$etemp$6$1)|0)|(($fmt$0)|0)==(($$etemp$7$0)|0)&(($fmt$1)|0)==(($$etemp$7$1)|0)|(($fmt$0)|0)==(($$etemp$8$0)|0)&(($fmt$1)|0)==(($$etemp$8$1)|0)|(($fmt$0)|0)==(($$etemp$9$0)|0)&(($fmt$1)|0)==(($$etemp$9$1)|0)|(($fmt$0)|0)==(($$etemp$10$0)|0)&(($fmt$1)|0)==(($$etemp$10$1)|0)) {
  $_0=8;

  return (($_0)|0);
 } else if ((($fmt$0)|0)==(($$etemp$0$0)|0)&(($fmt$1)|0)==(($$etemp$0$1)|0)|(($fmt$0)|0)==(($$etemp$1$0)|0)&(($fmt$1)|0)==(($$etemp$1$1)|0)|(($fmt$0)|0)==(($$etemp$2$0)|0)&(($fmt$1)|0)==(($$etemp$2$1)|0)) {
  $_0=4;

  return (($_0)|0);
 } else {
  __ZN4crnd11crnd_assertEPKcS1_j(624,488,2668);
  $_0=0;

  return (($_0)|0);
 }
  return 0;
}


function __ZN4crnd28crnd_get_bytes_per_dxt_blockE10crn_format($fmt$0,$fmt$1){
 $fmt$0=($fmt$0)|0;
 $fmt$1=($fmt$1)|0;
 var $1=0,$2=0,$3=0,label=0;

 $1=((__ZN4crnd34crnd_get_crn_format_bits_per_texelE10crn_format($fmt$0,$fmt$1))|0);
 $2=$1<<1;
 $3=$2&536870910;
 return (($3)|0);
}


function __ZN4crnd15crnd_get_headerERNS_10crn_headerEPKvj($tmp_header,$pData,$data_size){
 $tmp_header=($tmp_header)|0;
 $pData=($pData)|0;
 $data_size=($data_size)|0;
 var $1=0,$2=0,$or_cond=0,$4=0,$5=0,$6=0,$7=0,$9=0,$10=0,$11=0,$12=0,$14=0,$15=0,$16=0,$17=0,$_=0,label=0;

 $1=($pData|0)==0;
 $2=($data_size>>>0)<((74)>>>0);
 $or_cond=$1|$2;
 if ($or_cond) {
  return ((0)|0);
 }
 $4=$pData;
 $5=$pData;
 $6=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($5))|0);
 $7=($6|0)==18552;
 if (!($7)) {
  return ((0)|0);
 }
 $9=(($pData+2)|0);
 $10=$9;
 $11=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($10))|0);
 $12=($11>>>0)<((74)>>>0);
 if ($12) {
  return ((0)|0);
 } else {
  $14=(($pData+6)|0);
  $15=$14;
  $16=((__ZNK4crnd15crn_packed_uintILj4EEcvjEv($15))|0);
  $17=($16>>>0)>($data_size>>>0);
  $_=($17?0:$4);
  return (($_)|0);
 }
  return 0;
}


function __ZNK4crnd15crn_packed_uintILj2EEcvjEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,label=0;

 $1=(($this)|0);
 $2=((HEAP8[($1)])|0);
 $3=($2&255);
 $4=$3<<8;
 $5=(($this+1)|0);
 $6=((HEAP8[($5)])|0);
 $7=($6&255);
 $8=$4|$7;
 return (($8)|0);
}


function __ZNK4crnd15crn_packed_uintILj4EEcvjEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$14=0,$15=0,$16=0,$17=0,$18=0,label=0;

 $1=(($this)|0);
 $2=((HEAP8[($1)])|0);
 $3=($2&255);
 $4=$3<<24;
 $5=(($this+1)|0);
 $6=((HEAP8[($5)])|0);
 $7=($6&255);
 $8=$7<<16;
 $9=$8|$4;
 $10=(($this+2)|0);
 $11=((HEAP8[($10)])|0);
 $12=($11&255);
 $13=$12<<8;
 $14=$9|$13;
 $15=(($this+3)|0);
 $16=((HEAP8[($15)])|0);
 $17=($16&255);
 $18=$14|$17;
 return (($18)|0);
}


function __ZNK4crnd15crn_packed_uintILj1EEcvjEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,label=0;

 $1=(($this)|0);
 $2=((HEAP8[($1)])|0);
 $3=($2&255);
 return (($3)|0);
}


function __ZNK4crnd15crn_packed_uintILj3EEcvjEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,label=0;

 $1=(($this)|0);
 $2=((HEAP8[($1)])|0);
 $3=($2&255);
 $4=$3<<16;
 $5=(($this+1)|0);
 $6=((HEAP8[($5)])|0);
 $7=($6&255);
 $8=$7<<8;
 $9=$8|$4;
 $10=(($this+2)|0);
 $11=((HEAP8[($10)])|0);
 $12=($11&255);
 $13=$9|$12;
 return (($13)|0);
}


function __ZN4crnd21crnd_get_texture_infoEPKvjPNS_16crn_texture_infoE($pData,$data_size,$pInfo){
 $pData=($pData)|0;
 $data_size=($data_size)|0;
 $pInfo=($pInfo)|0;
 var $1=0,$2=0,$or_cond=0,$3=0,$or_cond24=0,$5=0,$6=0,$7=0,$9=0,$10=0,$12=0,$13=0,$14=0,$15=0,$16=0,$17=0,$18=0,$19=0,$20=0,$21=0;
 var $22=0,$23=0,$24=0,$25=0,$26$0=0,$26$1=0,$27=0,$st$0$0=0,$st$1$1=0,$28=0,$29=0,$31=0,$phitmp=0,$33=0,$34=0,$35=0,$36=0,$37=0,$38=0,$39=0;
 var $40=0,$_0=0,label=0;

 $1=($pData|0)==0;
 $2=($data_size>>>0)<((74)>>>0);
 $or_cond=$1|$2;
 $3=($pInfo|0)==0;
 $or_cond24=$or_cond|$3;
 if ($or_cond24) {
  $_0=0;

  return (($_0)|0);
 }
 $5=(($pInfo)|0);
 $6=((HEAP32[(($5)>>2)])|0);
 $7=($6|0)==40;
 if (!($7)) {
  $_0=0;

  return (($_0)|0);
 }
 $9=((__ZN4crnd15crnd_get_headerERNS_10crn_headerEPKvj(0,$pData,$data_size))|0);
 $10=($9|0)==0;
 if ($10) {
  $_0=0;

  return (($_0)|0);
 }
 $12=(($9+12)|0);
 $13=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($12))|0);
 $14=(($pInfo+4)|0);
 HEAP32[(($14)>>2)]=$13;
 $15=(($9+14)|0);
 $16=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($15))|0);
 $17=(($pInfo+8)|0);
 HEAP32[(($17)>>2)]=$16;
 $18=(($9+16)|0);
 $19=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($18))|0);
 $20=(($pInfo+12)|0);
 HEAP32[(($20)>>2)]=$19;
 $21=(($9+17)|0);
 $22=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($21))|0);
 $23=(($pInfo+16)|0);
 HEAP32[(($23)>>2)]=$22;
 $24=(($9+18)|0);
 $25=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($24))|0);
 $26$0=$25;
 $26$1=0;
 $27=(($pInfo+32)|0);
 $st$0$0=(($27)|0);
 HEAP32[(($st$0$0)>>2)]=$26$0;
 $st$1$1=(($27+4)|0);
 HEAP32[(($st$1$1)>>2)]=$26$1;
 $28=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($24))|0);
 $29=($28|0)==0;
 if ($29) {
  $33=8;
 } else {
  $31=($28|0)==9;
  $phitmp=($31?8:16);
  $33=$phitmp;
 }

 $34=(($pInfo+20)|0);
 HEAP32[(($34)>>2)]=$33;
 $35=(($9+25)|0);
 $36=((__ZNK4crnd15crn_packed_uintILj4EEcvjEv($35))|0);
 $37=(($pInfo+24)|0);
 HEAP32[(($37)>>2)]=$36;
 $38=(($9+29)|0);
 $39=((__ZNK4crnd15crn_packed_uintILj4EEcvjEv($38))|0);
 $40=(($pInfo+28)|0);
 HEAP32[(($40)>>2)]=$39;
 $_0=1;

 return (($_0)|0);
}


function __ZN4crnd25static_huffman_data_modelC2Ev($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,label=0;

 $1=(($this)|0);
 HEAP32[(($1)>>2)]=0;
 $2=(($this+4)|0);
 __ZN4crnd6vectorIhEC1Ev($2);
 $3=(($this+20)|0);
 HEAP32[(($3)>>2)]=0;
 return;
}


function __ZN4crnd6vectorIhEC1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorIhEC2Ev($this);
 return;
}


function __ZN4crnd6vectorIhED1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorIhED2Ev($this);
 return;
}


function __ZN4crnd25static_huffman_data_modelD2Ev($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$7=0,$9=0,$6$0=0,$6$1=0,$12$0=0,$12$1=0,label=0;

 $1=(($this+20)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==0;
 if (!($3)) {
  __ZN4crnd11crnd_deleteINS_13prefix_coding14decoder_tablesEEEvPT_($2);
 }
 $9=(($this+4)|0);
 __ZN4crnd6vectorIhED1Ev($9);
 return;
}


function __ZN4crnd11crnd_deleteINS_13prefix_coding14decoder_tablesEEEvPT_($p){
 $p=($p)|0;
 var $1=0,$3=0,label=0;

 $1=($p|0)==0;
 if ($1) {
  return;
 }
 __ZN4crnd7helpers8destructINS_13prefix_coding14decoder_tablesEEEvPT_($p);
 $3=$p;
 __ZN4crnd9crnd_freeEPv($3);
 return;
}


function __ZN4crnd25static_huffman_data_model5clearEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,label=0;

 $1=(($this)|0);
 HEAP32[(($1)>>2)]=0;
 $2=(($this+4)|0);
 __ZN4crnd6vectorIhE5clearEv($2);
 $3=(($this+20)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $5=($4|0)==0;
 if ($5) {
  return;
 }
 __ZN4crnd11crnd_deleteINS_13prefix_coding14decoder_tablesEEEvPT_($4);
 HEAP32[(($3)>>2)]=0;
 return;
}


function __ZN4crnd6vectorIhE5clearEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$5=0,$6=0,$8=0,label=0;

 $1=(($this)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==0;
 if ($3) {
  $8=(($this+12)|0);
  HEAP8[($8)]=0;
  return;
 }
 $5=(($this+4)|0);
 __ZN4crnd9crnd_freeEPv($2);
 HEAP32[(($1)>>2)]=0;
 HEAP32[(($5)>>2)]=0;
 $6=(($this+8)|0);
 HEAP32[(($6)>>2)]=0;
 $8=(($this+12)|0);
 HEAP8[($8)]=0;
 return;
}


function __ZN4crnd6vectorIhE6resizeEj($this,$new_size){
 $this=($this)|0;
 $new_size=($new_size)|0;
 var $1=0,$2=0,$3=0,$5=0,$7=0,$8=0,$9=0,$11=0,$12=0,$13=0,$15=0,$16=0,$17=0,$18=0,$19=0,$_0=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==($new_size|0);
 if ($3) {
  $_0=1;

  return (($_0)|0);
 }
 $5=($2>>>0)>($new_size>>>0);
 if (!($5)) {
  $7=(($this+8)|0);
  $8=((HEAP32[(($7)>>2)])|0);
  $9=($8>>>0)<($new_size>>>0);
  do {
   if ($9) {
    $11=((($2)+(1))|0);
    $12=($11|0)==($new_size|0);
    $13=((__ZN4crnd6vectorIhE17increase_capacityEjb($this,$new_size,$12))|0);
    if ($13) {
     break;
    } else {
     $_0=0;
    }

    return (($_0)|0);
   }
  } while(0);
  $15=(($this)|0);
  $16=((HEAP32[(($15)>>2)])|0);
  $17=((HEAP32[(($1)>>2)])|0);
  $18=(($16+$17)|0);
  $19=((($new_size)-($17))|0);
  __ZN4crnd11scalar_typeIhE15construct_arrayEPhj($18,$19);
 }
 HEAP32[(($1)>>2)]=$new_size;
 $_0=1;

 return (($_0)|0);
}


function __ZN4crnd6vectorIhEixEj($this,$i){
 $this=($this)|0;
 $i=($i)|0;
 var $1=0,$2=0,$3=0,$6=0,$7=0,$8=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2>>>0)>($i>>>0);
 if (!($3)) {
  __ZN4crnd11crnd_assertEPKcS1_j(312,488,906);
 }
 $6=(($this)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=(($7+$i)|0);
 return (($8)|0);
}


function __ZN4crnd8crnd_newINS_13prefix_coding14decoder_tablesEEEPT_v(){
 var $1=0,$2=0,$4=0,$5=0,$_0=0,label=0;

 $1=((__ZN4crnd11crnd_mallocEjPj(180,0))|0);
 $2=($1|0)==0;
 if ($2) {
  $_0=0;

  return (($_0)|0);
 }
 $4=$1;
 $5=((__ZN4crnd7helpers9constructINS_13prefix_coding14decoder_tablesEEEPT_S5_($4))|0);
 $_0=$5;

 return (($_0)|0);
}


function __ZNK4crnd25static_huffman_data_model26compute_decoder_table_bitsEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$5=0,$6=0,$7=0,$8=0,$decoder_table_bits_0=0,label=0;

 $1=(($this)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2>>>0)>((16)>>>0);
 if (!($3)) {
  $decoder_table_bits_0=0;

  return (($decoder_table_bits_0)|0);
 }
 $5=((__ZN4crnd4math10ceil_log2iEj($2))|0);
 $6=((($5)+(1))|0);
 $7=((__ZN4crnd4math7minimumIjEET_S2_S2_($6,11))|0);
 $8=$7&255;
 $decoder_table_bits_0=$8;

 return (($decoder_table_bits_0)|0);
}


function __ZN4crnd25static_huffman_data_model22prepare_decoder_tablesEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$4=0,$or_cond=0,$7=0,$8=0,$9=0,$10=0,$12=0,$14=0,$15=0,$16=0,$17=0,$18=0,label=0;

 $1=(($this+4)|0);
 $2=((__ZNK4crnd6vectorIhE4sizeEv($1))|0);
 $3=($2|0)!=0;
 $4=($2>>>0)<((8193)>>>0);
 $or_cond=$3&$4;
 if (!($or_cond)) {
  __ZN4crnd11crnd_assertEPKcS1_j(552,488,3002);
 }
 $7=(($this)|0);
 HEAP32[(($7)>>2)]=$2;
 $8=(($this+20)|0);
 $9=((HEAP32[(($8)>>2)])|0);
 $10=($9|0)==0;
 if ($10) {
  $12=((__ZN4crnd8crnd_newINS_13prefix_coding14decoder_tablesEEEPT_v())|0);
  HEAP32[(($8)>>2)]=$12;
 }
 $14=((HEAP32[(($8)>>2)])|0);
 $15=((HEAP32[(($7)>>2)])|0);
 $16=((__ZN4crnd6vectorIhEixEj($1,0))|0);
 $17=((__ZNK4crnd25static_huffman_data_model26compute_decoder_table_bitsEv($this))|0);
 $18=((__ZN4crnd13prefix_coding14decoder_tables4initEjPKhj($14,$15,$16,$17))|0);
 return (($18)|0);
}


function __ZNK4crnd6vectorIhE4sizeEv($this){
 $this=($this)|0;
 var $1=0,$2=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 return (($2)|0);
}


function __ZN4crnd4math10ceil_log2iEj($v){
 $v=($v)|0;
 var $1=0,$2=0,$3=0,$4=0,$or_cond=0,$5=0,$l_0=0,label=0;

 $1=((__ZN4crnd4math11floor_log2iEj($v))|0);
 $2=($1|0)!=32;
 $3=1<<$1;
 $4=($3>>>0)<($v>>>0);
 $or_cond=$2&$4;
 $5=($or_cond&1);
 $l_0=((($5)+($1))|0);
 return (($l_0)|0);
}


function __ZN4crnd12symbol_codecC2Ev($this){
 $this=($this)|0;
 var $1=0,label=0;

 $1=$this;
 _memset((((($1)|0))|0), ((((0)|0))|0), ((((24)|0))|0))|0;
 return;
}


function __ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($this,$model){
 $this=($this)|0;
 $model=($model)|0;
 var $dm=0,$1=0,$2=0,$3=0,$6=0,$7=0,$9=0,$10=0,$11=0,$12=0,$or_cond=0,$14=0,$15=0,$17=0,$i_052=0,$20=0,$21=0,$22=0,$23=0,$24=0;
 var $25=0,$26=0,$27=0,$28=0,$30=0,$31=0,$ofs_048=0,$32=0,$33=0,$34=0,$36=0,$37=0,$38=0,$41=0,$42=0,$43=0,$45=0,$ofs_0_be=0,$46=0,$48=0;
 var $49=0,$50=0,$52=0,$_off=0,$54=0,$56=0,$58=0,$59=0,$61=0,$62=0,$len2_0=0,$64=0,$65=0,$or_cond43=0,$67=0,$68=0,$69=0,$70=0,$72=0,$73=0;
 var $ofs_144=0,$74=0,$75=0,$76=0,$ofs_0_lcssa=0,$78=0,$80=0,$_0=0,$_1=0,$19$0=0,$19$1=0,$84$0=0,$84$1=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+24)|0;
 $dm=((sp)|0);
 $1=((__ZN4crnd4math10total_bitsEj(8192))|0);
 $2=((__ZN4crnd12symbol_codec11decode_bitsEj($this,$1))|0);
 $3=($2|0)==0;
 if ($3) {
  __ZN4crnd25static_huffman_data_model5clearEv($model);
  $_1=1;

  STACKTOP=sp;return (($_1)|0);
 }
 $6=(($model+4)|0);
 $7=((__ZN4crnd6vectorIhE6resizeEj($6,$2))|0);
 if (!($7)) {
  $_1=0;

  STACKTOP=sp;return (($_1)|0);
 }
 $9=((__ZN4crnd6vectorIhEixEj($6,0))|0);
 _memset((((($9)|0))|0), ((((0)|0))|0), (((($2)|0))|0))|0;
 $10=((__ZN4crnd12symbol_codec11decode_bitsEj($this,5))|0);
 $11=($10|0)==0;
 $12=($10>>>0)>((21)>>>0);
 $or_cond=$11|$12;
 if ($or_cond) {
  $_1=0;

  STACKTOP=sp;return (($_1)|0);
 }
 __ZN4crnd25static_huffman_data_modelC2Ev($dm);
 $14=(($dm+4)|0);
 $15=((__ZN4crnd6vectorIhE6resizeEj($14,21))|0);
 L12: do {
  if ($15) {
   $17=($10|0)==0;
   if (!($17)) {
    $i_052=0;
    while(1) {

     $20=((__ZN4crnd12symbol_codec11decode_bitsEj($this,3))|0);
     $21=((864+$i_052)|0);
     $22=((HEAP8[($21)])|0);
     $23=($22&255);
     $24=((__ZN4crnd6vectorIhEixEj($14,$23))|0);
     $25=(($20)&255);
     HEAP8[($24)]=$25;
     $26=((($i_052)+(1))|0);
     $27=($26>>>0)<($10>>>0);
     if ($27) {
      $i_052=$26;
     } else {
      break;
     }
    }
   }
   $28=((__ZN4crnd25static_huffman_data_model22prepare_decoder_tablesEv($dm))|0);
   if (!($28)) {
    $_0=0;
    break;
   }
   $30=($2|0)==0;
   L20: do {
    if ($30) {
     $ofs_0_lcssa=0;
    } else {
     $ofs_048=0;
     L21: while(1) {

      $32=((($2)-($ofs_048))|0);
      $33=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($this,$dm))|0);
      $34=($33>>>0)<((17)>>>0);
      do {
       if ($34) {
        $36=((__ZN4crnd6vectorIhEixEj($6,$ofs_048))|0);
        $37=((($ofs_048)+(1))|0);
        $38=(($33)&255);
        HEAP8[($36)]=$38;
        $ofs_0_be=$37;
       } else {
        if (((($33|0))|0)==((17)|0)) {
         $41=((__ZN4crnd12symbol_codec11decode_bitsEj($this,3))|0);
         $42=((($41)+(3))|0);
         $43=($42>>>0)>($32>>>0);
         if ($43) {
          $_0=0;
          break L12;
         }
         $45=((($42)+($ofs_048))|0);
         $ofs_0_be=$45;
         break;
        } else if (((($33|0))|0)==((18)|0)) {
         $48=((__ZN4crnd12symbol_codec11decode_bitsEj($this,7))|0);
         $49=((($48)+(11))|0);
         $50=($49>>>0)>($32>>>0);
         if ($50) {
          $_0=0;
          break L12;
         }
         $52=((($49)+($ofs_048))|0);
         $ofs_0_be=$52;
         break;
        } else {
         $_off=((($33)-(19))|0);
         $54=($_off>>>0)<((2)>>>0);
         if (!($54)) {
          break L21;
         }
         $56=($33|0)==19;
         if ($56) {
          $58=((__ZN4crnd12symbol_codec11decode_bitsEj($this,2))|0);
          $59=((($58)+(3))|0);
          $len2_0=$59;
         } else {
          $61=((__ZN4crnd12symbol_codec11decode_bitsEj($this,6))|0);
          $62=((($61)+(7))|0);
          $len2_0=$62;
         }

         $64=($ofs_048|0)==0;
         $65=($len2_0>>>0)>($32>>>0);
         $or_cond43=$64|$65;
         if ($or_cond43) {
          $_0=0;
          break L12;
         }
         $67=((($ofs_048)-(1))|0);
         $68=((__ZN4crnd6vectorIhEixEj($6,$67))|0);
         $69=((HEAP8[($68)])|0);
         $70=(($69<<24)>>24)==0;
         if ($70) {
          $_0=0;
          break L12;
         }
         $72=((($len2_0)+($ofs_048))|0);
         $73=($ofs_048>>>0)<($72>>>0);
         if ($73) {
          $ofs_144=$ofs_048;
         } else {
          $ofs_0_be=$ofs_048;
          break;
         }
         while(1) {

          $74=((__ZN4crnd6vectorIhEixEj($6,$ofs_144))|0);
          $75=((($ofs_144)+(1))|0);
          HEAP8[($74)]=$69;
          $76=($75>>>0)<($72>>>0);
          if ($76) {
           $ofs_144=$75;
          } else {
           break;
          }
         }
         $31=((($len2_0)+($ofs_048))|0);
         $ofs_0_be=$31;
         break;
        }
       }
      } while(0);

      $46=($ofs_0_be>>>0)<($2>>>0);
      if ($46) {
       $ofs_048=$ofs_0_be;
      } else {
       $ofs_0_lcssa=$ofs_0_be;
       break L20;
      }
     }
     __ZN4crnd11crnd_assertEPKcS1_j(480,488,3145);
     $_0=0;
     break L12;
    }
   } while(0);

   $78=($ofs_0_lcssa|0)==($2|0);
   if (!($78)) {
    $_0=0;
    break;
   }
   $80=((__ZN4crnd25static_huffman_data_model22prepare_decoder_tablesEv($model))|0);
   $_0=$80;
  } else {
   $_0=0;
  }
 } while(0);

 __ZN4crnd25static_huffman_data_modelD2Ev($dm);
 $_1=$_0;

 STACKTOP=sp;return (($_1)|0);
}


function __ZN4crnd12symbol_codec11decode_bitsEj($this,$num_bits){
 $this=($this)|0;
 $num_bits=($num_bits)|0;
 var $1=0,$3=0,$5=0,$6=0,$7=0,$8=0,$9=0,$11=0,$_0=0,label=0;

 $1=($num_bits|0)==0;
 if ($1) {
  $_0=0;

  return (($_0)|0);
 }
 $3=($num_bits>>>0)>((16)>>>0);
 if ($3) {
  $5=((($num_bits)-(16))|0);
  $6=((__ZN4crnd12symbol_codec8get_bitsEj($this,$5))|0);
  $7=((__ZN4crnd12symbol_codec8get_bitsEj($this,16))|0);
  $8=$6<<16;
  $9=$8|$7;
  $_0=$9;

  return (($_0)|0);
 } else {
  $11=((__ZN4crnd12symbol_codec8get_bitsEj($this,$num_bits))|0);
  $_0=$11;

  return (($_0)|0);
 }
  return 0;
}


function __ZN4crnd4math10total_bitsEj($v){
 $v=($v)|0;
 var $1=0,$l_04=0,$_03=0,$2=0,$3=0,$4=0,$l_0_lcssa=0,label=0;

 $1=($v|0)==0;
 if ($1) {
  $l_0_lcssa=0;
 } else {
  $_03=$v;$l_04=0;
  while(1) {


   $2=$_03>>>1;
   $3=((($l_04)+(1))|0);
   $4=($2|0)==0;
   if ($4) {
    $l_0_lcssa=$3;
    break;
   } else {
    $_03=$2;$l_04=$3;
   }
  }
 }

 return (($l_0_lcssa)|0);
}


function __ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($this,$model){
 $this=($this)|0;
 $model=($model)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$15=0,$16=0,$17=0,$phitmp=0,$p_0=0,$c0_0=0,$19=0,$20=0,$22=0;
 var $23=0,$24=0,$p_1=0,$c1_0=0,$26=0,$27=0,$28=0,$29=0,$30=0,$31=0,$32=0,$33=0,$36=0,$37=0,$38=0,$40=0,$41=0,$42=0,$43=0,$44=0;
 var $45=0,$46=0,$47=0,$49=0,$50=0,$51=0,$52=0,$53=0,$54=0,$55=0,$57=0,$58=0,$59=0,$60=0,$61=0,$62=0,$63=0,$64=0,$65=0,$68=0;
 var $69=0,$70=0,$71=0,$72=0,$73=0,$74=0,$77=0,$78=0,$len_0=0,$80=0,$81=0,$82=0,$83=0,$84=0,$86=0,$87=0,$88=0,$89=0,$90=0,$91=0;
 var $92=0,$93=0,$94=0,$97=0,$98=0,$99=0,$100=0,$101=0,$sym_0=0,$len_1=0,$103=0,$104=0,$105=0,$106=0,$_0=0,label=0;

 $1=(($model+20)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($this+20)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $5=($4|0)<24;
 do {
  if ($5) {
   $7=($4|0)<16;
   $8=(($this+4)|0);
   $9=((HEAP32[(($8)>>2)])|0);
   $10=(($this+8)|0);
   $11=((HEAP32[(($10)>>2)])|0);
   $12=($9>>>0)<($11>>>0);
   if (!($7)) {
    if ($12) {
     $36=(($9+1)|0);
     HEAP32[(($8)>>2)]=$36;
     $37=((HEAP8[($9)])|0);
     $38=($37&255);
     $40=$38;
    } else {
     $40=0;
    }

    $41=((HEAP32[(($3)>>2)])|0);
    $42=((($41)+(8))|0);
    HEAP32[(($3)>>2)]=$42;
    $43=(((24)-($41))|0);
    $44=$40<<$43;
    $45=(($this+16)|0);
    $46=((HEAP32[(($45)>>2)])|0);
    $47=$44|$46;
    HEAP32[(($45)>>2)]=$47;
    break;
   }
   if ($12) {
    $15=(($9+1)|0);
    $16=((HEAP8[($9)])|0);
    $17=($16&255);
    $phitmp=$17<<8;
    $c0_0=$phitmp;$p_0=$15;
   } else {
    $c0_0=0;$p_0=$9;
   }


   $19=((HEAP32[(($10)>>2)])|0);
   $20=($p_0>>>0)<($19>>>0);
   if ($20) {
    $22=(($p_0+1)|0);
    $23=((HEAP8[($p_0)])|0);
    $24=($23&255);
    $c1_0=$24;$p_1=$22;
   } else {
    $c1_0=0;$p_1=$p_0;
   }


   HEAP32[(($8)>>2)]=$p_1;
   $26=((HEAP32[(($3)>>2)])|0);
   $27=((($26)+(16))|0);
   HEAP32[(($3)>>2)]=$27;
   $28=$c1_0|$c0_0;
   $29=(((16)-($26))|0);
   $30=$28<<$29;
   $31=(($this+16)|0);
   $32=((HEAP32[(($31)>>2)])|0);
   $33=$30|$32;
   HEAP32[(($31)>>2)]=$33;
  }
 } while(0);
 $49=(($this+16)|0);
 $50=((HEAP32[(($49)>>2)])|0);
 $51=$50>>>16;
 $52=((($51)+(1))|0);
 $53=(($2+16)|0);
 $54=((HEAP32[(($53)>>2)])|0);
 $55=($52>>>0)>($54>>>0);
 do {
  if ($55) {
   $77=(($2+20)|0);
   $78=((HEAP32[(($77)>>2)])|0);
   $len_0=$78;
   while(1) {

    $80=((($len_0)-(1))|0);
    $81=(($2+28+($80<<2))|0);
    $82=((HEAP32[(($81)>>2)])|0);
    $83=($52>>>0)>($82>>>0);
    $84=((($len_0)+(1))|0);
    if ($83) {
     $len_0=$84;
    } else {
     break;
    }
   }
   $86=(($2+96+($80<<2))|0);
   $87=((HEAP32[(($86)>>2)])|0);
   $88=((HEAP32[(($49)>>2)])|0);
   $89=(((32)-($len_0))|0);
   $90=$88>>>($89>>>0);
   $91=((($90)+($87))|0);
   $92=(($model)|0);
   $93=((HEAP32[(($92)>>2)])|0);
   $94=($91>>>0)<($93>>>0);
   if ($94) {
    $97=(($2+176)|0);
    $98=((HEAP32[(($97)>>2)])|0);
    $99=(($98+($91<<1))|0);
    $100=((HEAP16[(($99)>>1)])|0);
    $101=($100&65535);
    $len_1=$len_0;$sym_0=$101;
    break;
   }
   __ZN4crnd11crnd_assertEPKcS1_j(480,488,3271);
   $_0=0;

   return (($_0)|0);
  } else {
   $57=(($2+8)|0);
   $58=((HEAP32[(($57)>>2)])|0);
   $59=(((32)-($58))|0);
   $60=$50>>>($59>>>0);
   $61=(($2+168)|0);
   $62=((HEAP32[(($61)>>2)])|0);
   $63=(($62+($60<<2))|0);
   $64=((HEAP32[(($63)>>2)])|0);
   $65=($64|0)==-1;
   if ($65) {
    __ZN4crnd11crnd_assertEPKcS1_j(408,488,3249);
   }
   $68=$64&65535;
   $69=$64>>>16;
   $70=(($model+4)|0);
   $71=((__ZNK4crnd6vectorIhEixEj($70,$68))|0);
   $72=((HEAP8[($71)])|0);
   $73=($72&255);
   $74=($73|0)==($69|0);
   if ($74) {
    $len_1=$69;$sym_0=$68;
    break;
   }
   __ZN4crnd11crnd_assertEPKcS1_j(376,488,3253);
   $len_1=$69;$sym_0=$68;
  }
 } while(0);


 $103=((HEAP32[(($49)>>2)])|0);
 $104=$103<<$len_1;
 HEAP32[(($49)>>2)]=$104;
 $105=((HEAP32[(($3)>>2)])|0);
 $106=((($105)-($len_1))|0);
 HEAP32[(($3)>>2)]=$106;
 $_0=$sym_0;

 return (($_0)|0);
}


function __ZN4crnd12symbol_codec14start_decodingEPKhj($this,$pBuf,$buf_size){
 $this=($this)|0;
 $pBuf=($pBuf)|0;
 $buf_size=($buf_size)|0;
 var $1=0,$3=0,$4=0,$5=0,$6=0,$7=0,$_0=0,label=0;

 $1=($buf_size|0)==0;
 if ($1) {
  $_0=0;

  return (($_0)|0);
 }
 $3=(($this)|0);
 HEAP32[(($3)>>2)]=$pBuf;
 $4=(($this+4)|0);
 HEAP32[(($4)>>2)]=$pBuf;
 $5=(($this+12)|0);
 HEAP32[(($5)>>2)]=$buf_size;
 $6=(($pBuf+$buf_size)|0);
 $7=(($this+8)|0);
 HEAP32[(($7)>>2)]=$6;
 __ZN4crnd12symbol_codec13get_bits_initEv($this);
 $_0=1;

 return (($_0)|0);
}


function __ZN4crnd12symbol_codec13get_bits_initEv($this){
 $this=($this)|0;
 var $1=0,$2=0,label=0;

 $1=(($this+16)|0);
 HEAP32[(($1)>>2)]=0;
 $2=(($this+20)|0);
 HEAP32[(($2)>>2)]=0;
 return;
}


function __ZN4crnd12symbol_codec8get_bitsEj($this,$num_bits){
 $this=($this)|0;
 $num_bits=($num_bits)|0;
 var $1=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$10=0,$11=0,$12=0,$14=0,$15=0,$16=0,$c_0=0,$18=0,$19=0,$20=0,$23=0,$24=0,$25=0;
 var $26=0,$27=0,$28=0,$29=0,$30=0,$31=0,$32=0,$33=0,$34=0,$35=0,$36=0,label=0;

 $1=($num_bits>>>0)<((33)>>>0);
 if (!($1)) {
  __ZN4crnd11crnd_assertEPKcS1_j(464,488,3195);
 }
 $3=(($this+20)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $5=($4|0)<($num_bits|0);
 if ($5) {
  $6=(($this+4)|0);
  $7=(($this+8)|0);
  $8=(($this+16)|0);
  while(1) {
   $10=((HEAP32[(($6)>>2)])|0);
   $11=((HEAP32[(($7)>>2)])|0);
   $12=($10|0)==($11|0);
   if ($12) {
    $c_0=0;
   } else {
    $14=(($10+1)|0);
    HEAP32[(($6)>>2)]=$14;
    $15=((HEAP8[($10)])|0);
    $16=($15&255);
    $c_0=$16;
   }

   $18=((HEAP32[(($3)>>2)])|0);
   $19=((($18)+(8))|0);
   HEAP32[(($3)>>2)]=$19;
   $20=($19|0)<33;
   if (!($20)) {
    __ZN4crnd11crnd_assertEPKcS1_j(432,488,3204);
   }
   $23=((HEAP32[(($3)>>2)])|0);
   $24=(((32)-($23))|0);
   $25=$c_0<<$24;
   $26=((HEAP32[(($8)>>2)])|0);
   $27=$25|$26;
   HEAP32[(($8)>>2)]=$27;
   $28=((HEAP32[(($3)>>2)])|0);
   $29=($28|0)<($num_bits|0);
   if (!($29)) {
    break;
   }
  }
 }
 $30=(($this+16)|0);
 $31=((HEAP32[(($30)>>2)])|0);
 $32=(((32)-($num_bits))|0);
 $33=$31>>>($32>>>0);
 $34=$31<<$num_bits;
 HEAP32[(($30)>>2)]=$34;
 $35=((HEAP32[(($3)>>2)])|0);
 $36=((($35)-($num_bits))|0);
 HEAP32[(($3)>>2)]=$36;
 return (($33)|0);
}


function __ZNK4crnd6vectorIhEixEj($this,$i){
 $this=($this)|0;
 $i=($i)|0;
 var $1=0,$2=0,$3=0,$6=0,$7=0,$8=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2>>>0)>($i>>>0);
 if (!($3)) {
  __ZN4crnd11crnd_assertEPKcS1_j(312,488,905);
 }
 $6=(($this)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=(($7+$i)|0);
 return (($8)|0);
}


function __ZN4crnd17crnd_unpack_beginEPKvj($pData,$data_size){
 $pData=($pData)|0;
 $data_size=($data_size)|0;
 var $1=0,$2=0,$or_cond=0,$4=0,$5=0,$7=0,$10=0,$_0=0,label=0;

 $1=($pData|0)==0;
 $2=($data_size>>>0)<((62)>>>0);
 $or_cond=$1|$2;
 do {
  if ($or_cond) {
   $_0=0;
  } else {
   $4=((__ZN4crnd8crnd_newINS_12crn_unpackerEEEPT_v())|0);
   $5=($4|0)==0;
   if ($5) {
    $_0=0;
    break;
   }
   $7=((__ZN4crnd12crn_unpacker4initEPKvj($4,$pData,$data_size))|0);
   if ($7) {
    $10=$4;
    $_0=$10;
    break;
   } else {
    __ZN4crnd11crnd_deleteINS_12crn_unpackerEEEvPT_($4);
    $_0=0;
    break;
   }
  }
 } while(0);

 return (($_0)|0);
}


function __ZN4crnd8crnd_newINS_12crn_unpackerEEEPT_v(){
 var $1=0,$2=0,$4=0,$5=0,$_0=0,label=0;

 $1=((__ZN4crnd11crnd_mallocEjPj(300,0))|0);
 $2=($1|0)==0;
 if ($2) {
  $_0=0;

  return (($_0)|0);
 }
 $4=$1;
 $5=((__ZN4crnd7helpers9constructINS_12crn_unpackerEEEPT_S4_($4))|0);
 $_0=$5;

 return (($_0)|0);
}


function __ZN4crnd12crn_unpacker4initEPKvj($this,$pData,$data_size){
 $this=($this)|0;
 $pData=($pData)|0;
 $data_size=($data_size)|0;
 var $1=0,$2=0,$3=0,$5=0,$6=0,$7=0,$9=0,$_0=0,label=0;

 $1=((__ZN4crnd15crnd_get_headerERNS_10crn_headerEPKvj(0,$pData,$data_size))|0);
 $2=(($this+88)|0);
 HEAP32[(($2)>>2)]=$1;
 $3=($1|0)==0;
 if ($3) {
  $_0=0;

  return (($_0)|0);
 }
 $5=(($this+4)|0);
 HEAP32[(($5)>>2)]=$pData;
 $6=(($this+8)|0);
 HEAP32[(($6)>>2)]=$data_size;
 $7=((__ZN4crnd12crn_unpacker11init_tablesEv($this))|0);
 if (!($7)) {
  $_0=0;

  return (($_0)|0);
 }
 $9=((__ZN4crnd12crn_unpacker15decode_palettesEv($this))|0);
 $_0=$9;

 return (($_0)|0);
}


function __ZN4crnd11crnd_deleteINS_12crn_unpackerEEEvPT_($p){
 $p=($p)|0;
 var $1=0,$3=0,label=0;

 $1=($p|0)==0;
 if ($1) {
  return;
 }
 __ZN4crnd7helpers8destructINS_12crn_unpackerEEEvPT_($p);
 $3=$p;
 __ZN4crnd9crnd_freeEPv($3);
 return;
}


function __ZNK4crnd12crn_unpacker8is_validEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,label=0;

 $1=(($this)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==519686845;
 return (($3)|0);
}


function __ZN4crnd17crnd_unpack_levelEPvPS0_jjj($pContext,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$level_index){
 $pContext=($pContext)|0;
 $pDst=($pDst)|0;
 $dst_size_in_bytes=($dst_size_in_bytes)|0;
 $row_pitch_in_bytes=($row_pitch_in_bytes)|0;
 $level_index=($level_index)|0;
 var $1=0,$2=0,$or_cond=0,$3=0,$or_cond11=0,$4=0,$or_cond12=0,$6=0,$7=0,$9=0,$_0=0,label=0;

 $1=($pContext|0)==0;
 $2=($pDst|0)==0;
 $or_cond=$1|$2;
 $3=($dst_size_in_bytes>>>0)<((8)>>>0);
 $or_cond11=$or_cond|$3;
 $4=($level_index>>>0)>((15)>>>0);
 $or_cond12=$or_cond11|$4;
 if ($or_cond12) {
  $_0=0;

  return (($_0)|0);
 }
 $6=$pContext;
 $7=((__ZNK4crnd12crn_unpacker8is_validEv($6))|0);
 if (!($7)) {
  $_0=0;

  return (($_0)|0);
 }
 $9=((__ZN4crnd12crn_unpacker12unpack_levelEPPvjjj($6,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$level_index))|0);
 $_0=$9;

 return (($_0)|0);
}


function __ZN4crnd12crn_unpacker12unpack_levelEPPvjjj($this,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$level_index){
 $this=($this)|0;
 $pDst=($pDst)|0;
 $dst_size_in_bytes=($dst_size_in_bytes)|0;
 $row_pitch_in_bytes=($row_pitch_in_bytes)|0;
 $level_index=($level_index)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$12=0,$13=0,$next_level_ofs_0=0,$15=0,$18=0,$19=0,$20=0,$21=0,$22=0,label=0;

 $1=(($this+88)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($2+70+($level_index<<2))|0);
 $4=((__ZNK4crnd15crn_packed_uintILj4EEcvjEv($3))|0);
 $5=(($this+8)|0);
 $6=((HEAP32[(($5)>>2)])|0);
 $7=((($level_index)+(1))|0);
 $8=(($2+16)|0);
 $9=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($8))|0);
 $10=($7>>>0)<($9>>>0);
 if ($10) {
  $12=(($2+70+($7<<2))|0);
  $13=((__ZNK4crnd15crn_packed_uintILj4EEcvjEv($12))|0);
  $next_level_ofs_0=$13;
 } else {
  $next_level_ofs_0=$6;
 }

 $15=($next_level_ofs_0>>>0)>($4>>>0);
 if (!($15)) {
  __ZN4crnd11crnd_assertEPKcS1_j(248,488,3690);
 }
 $18=(($this+4)|0);
 $19=((HEAP32[(($18)>>2)])|0);
 $20=(($19+$4)|0);
 $21=((($next_level_ofs_0)-($4))|0);
 $22=((__ZN4crnd12crn_unpacker12unpack_levelEPKvjPPvjjj($this,$20,$21,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$level_index))|0);
 return (($22)|0);
}


function __ZN4crnd12crn_unpacker12unpack_levelEPKvjPPvjjj($this,$pSrc,$src_size_in_bytes,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$level_index){
 $this=($this)|0;
 $pSrc=($pSrc)|0;
 $src_size_in_bytes=($src_size_in_bytes)|0;
 $pDst=($pDst)|0;
 $dst_size_in_bytes=($dst_size_in_bytes)|0;
 $row_pitch_in_bytes=($row_pitch_in_bytes)|0;
 $level_index=($level_index)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$14=0,$15=0,$16=0,$17=0,$19=0,$phitmp=0,$21=0;
 var $22=0,$23=0,$25=0,$26=0,$27=0,$or_cond=0,$_040=0,$29=0,$30=0,$32=0,$33=0,$34=0,$35=0,$36=0,$37=0,$39=0,$40=0,$41=0,$43=0,$45=0;
 var $47=0,$49=0,$_0=0,label=0;

 $1=(($this+88)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($2+12)|0);
 $4=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($3))|0);
 $5=$4>>>($level_index>>>0);
 $6=((__ZN4crnd4math7maximumIjEET_S2_S2_($5,1))|0);
 $7=(($2+14)|0);
 $8=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($7))|0);
 $9=$8>>>($level_index>>>0);
 $10=((__ZN4crnd4math7maximumIjEET_S2_S2_($9,1))|0);
 $11=((($6)+(3))|0);
 $12=$11>>>2;
 $13=((($10)+(3))|0);
 $14=$13>>>2;
 $15=(($2+18)|0);
 $16=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($15))|0);
 $17=($16|0)==0;
 if ($17) {
  $21=8;
 } else {
  $19=($16|0)==9;
  $phitmp=($19?8:16);
  $21=$phitmp;
 }

 $22=(Math_imul($21,$12)|0);
 $23=($row_pitch_in_bytes|0)==0;
 do {
  if ($23) {
   $_040=$22;
  } else {
   $25=($22>>>0)<=($row_pitch_in_bytes>>>0);
   $26=$row_pitch_in_bytes&3;
   $27=($26|0)==0;
   $or_cond=$25&$27;
   if ($or_cond) {
    $_040=$row_pitch_in_bytes;
    break;
   } else {
    $_0=0;
   }

   return (($_0)|0);
  }
 } while(0);

 $29=(Math_imul($_040,$14)|0);
 $30=($29>>>0)>($dst_size_in_bytes>>>0);
 if ($30) {
  $_0=0;

  return (($_0)|0);
 }
 $32=((($12)+(1))|0);
 $33=$32>>>1;
 $34=((($14)+(1))|0);
 $35=$34>>>1;
 $36=(($this+92)|0);
 $37=((__ZN4crnd12symbol_codec14start_decodingEPKhj($36,$pSrc,$src_size_in_bytes))|0);
 if (!($37)) {
  $_0=0;

  return (($_0)|0);
 }
 $39=((HEAP32[(($1)>>2)])|0);
 $40=(($39+18)|0);
 $41=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($40))|0);
 switch (($41|0)) {
 case 0: {
  $43=((__ZN4crnd12crn_unpacker11unpack_dxt1EPPhjjjjjj($this,$pDst,0,$_040,$12,$14,$33,$35))|0);
  $_0=1;

  return (($_0)|0);
  break;
 }
 case 2:case 3:case 5:case 6:case 4: {
  $45=((__ZN4crnd12crn_unpacker11unpack_dxt5EPPhjjjjjj($this,$pDst,0,$_040,$12,$14,$33,$35))|0);
  $_0=1;

  return (($_0)|0);
  break;
 }
 case 9: {
  $47=((__ZN4crnd12crn_unpacker12unpack_dxt5aEPPhjjjjjj($this,$pDst,0,$_040,$12,$14,$33,$35))|0);
  $_0=1;

  return (($_0)|0);
  break;
 }
 case 7:case 8: {
  $49=((__ZN4crnd12crn_unpacker10unpack_dxnEPPhjjjjjj($this,$pDst,0,$_040,$12,$14,$33,$35))|0);
  $_0=1;

  return (($_0)|0);
  break;
 }
 default: {
  $_0=0;

  return (($_0)|0);
 }
 }
  return 0;
}


function __ZN4crnd15crnd_unpack_endEPv($pContext){
 $pContext=($pContext)|0;
 var $1=0,$3=0,$4=0,$_0=0,label=0;

 $1=($pContext|0)==0;
 do {
  if ($1) {
   $_0=0;
  } else {
   $3=$pContext;
   $4=((__ZNK4crnd12crn_unpacker8is_validEv($3))|0);
   if (!($4)) {
    $_0=0;
    break;
   }
   __ZN4crnd11crnd_deleteINS_12crn_unpackerEEEvPT_($3);
   $_0=1;
  }
 } while(0);

 return (($_0)|0);
}


function _crn_get_width($pSrc_file_data,$src_file_size){
 $pSrc_file_data=($pSrc_file_data)|0;
 $src_file_size=($src_file_size)|0;
 var $tex_info=0,$1=0,$3=0,$4=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+40)|0;
 $tex_info=((sp)|0);
 __ZN4crnd16crn_texture_infoC1Ev($tex_info);
 $1=((__ZN4crnd21crnd_get_texture_infoEPKvjPNS_16crn_texture_infoE($pSrc_file_data,$src_file_size,$tex_info))|0);
 if (!($1)) {
  $_0=-1;

  STACKTOP=sp;return (($_0)|0);
 }
 $3=(($tex_info+4)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $_0=$4;

 STACKTOP=sp;return (($_0)|0);
}


function __ZN4crnd16crn_texture_infoC1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd16crn_texture_infoC2Ev($this);
 return;
}


function _crn_get_height($pSrc_file_data,$src_file_size){
 $pSrc_file_data=($pSrc_file_data)|0;
 $src_file_size=($src_file_size)|0;
 var $tex_info=0,$1=0,$3=0,$4=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+40)|0;
 $tex_info=((sp)|0);
 __ZN4crnd16crn_texture_infoC1Ev($tex_info);
 $1=((__ZN4crnd21crnd_get_texture_infoEPKvjPNS_16crn_texture_infoE($pSrc_file_data,$src_file_size,$tex_info))|0);
 if (!($1)) {
  $_0=-1;

  STACKTOP=sp;return (($_0)|0);
 }
 $3=(($tex_info+8)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $_0=$4;

 STACKTOP=sp;return (($_0)|0);
}


function _crn_get_levels($pSrc_file_data,$src_file_size){
 $pSrc_file_data=($pSrc_file_data)|0;
 $src_file_size=($src_file_size)|0;
 var $tex_info=0,$1=0,$3=0,$4=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+40)|0;
 $tex_info=((sp)|0);
 __ZN4crnd16crn_texture_infoC1Ev($tex_info);
 $1=((__ZN4crnd21crnd_get_texture_infoEPKvjPNS_16crn_texture_infoE($pSrc_file_data,$src_file_size,$tex_info))|0);
 if (!($1)) {
  $_0=-1;

  STACKTOP=sp;return (($_0)|0);
 }
 $3=(($tex_info+12)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $_0=$4;

 STACKTOP=sp;return (($_0)|0);
}


function _crn_get_format($pSrc_file_data,$src_file_size){
 $pSrc_file_data=($pSrc_file_data)|0;
 $src_file_size=($src_file_size)|0;
 var $tex_info=0,$1=0,$3=0,$ld$0$0=0,$4$0=0,$ld$1$1=0,$4$1=0,$5$0=0,$5=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+40)|0;
 $tex_info=((sp)|0);
 __ZN4crnd16crn_texture_infoC1Ev($tex_info);
 $1=((__ZN4crnd21crnd_get_texture_infoEPKvjPNS_16crn_texture_infoE($pSrc_file_data,$src_file_size,$tex_info))|0);
 if (!($1)) {
  $_0=-1;

  STACKTOP=sp;return (($_0)|0);
 }
 $3=(($tex_info+32)|0);
 $ld$0$0=(($3)|0);
 $4$0=((HEAP32[(($ld$0$0)>>2)])|0);
 $ld$1$1=(($3+4)|0);
 $4$1=((HEAP32[(($ld$1$1)>>2)])|0);
 $5$0=$4$0;
 $5=$5$0;
 $_0=$5;

 STACKTOP=sp;return (($_0)|0);
}


function _crn_get_faces($pSrc_file_data,$src_file_size){
 $pSrc_file_data=($pSrc_file_data)|0;
 $src_file_size=($src_file_size)|0;
 var $tex_info=0,$1=0,$3=0,$4=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+40)|0;
 $tex_info=((sp)|0);
 __ZN4crnd16crn_texture_infoC1Ev($tex_info);
 $1=((__ZN4crnd21crnd_get_texture_infoEPKvjPNS_16crn_texture_infoE($pSrc_file_data,$src_file_size,$tex_info))|0);
 if (!($1)) {
  $_0=-1;

  STACKTOP=sp;return (($_0)|0);
 }
 $3=(($tex_info+16)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $_0=$4;

 STACKTOP=sp;return (($_0)|0);
}


function _crn_unpack_begin($pSrc_file_data,$src_file_size){
 $pSrc_file_data=($pSrc_file_data)|0;
 $src_file_size=($src_file_size)|0;
 var $1=0,label=0;

 $1=((__ZN4crnd17crnd_unpack_beginEPKvj($pSrc_file_data,$src_file_size))|0);
 return (($1)|0);
}


function _crn_unpack_end($context){
 $context=($context)|0;
 var $1=0,label=0;

 $1=((__ZN4crnd15crnd_unpack_endEPv($context))|0);
 return;
}


function _crn_unpack_level($pContext,$pSrc_file_data,$src_file_size,$level_index){
 $pContext=($pContext)|0;
 $pSrc_file_data=($pSrc_file_data)|0;
 $src_file_size=($src_file_size)|0;
 $level_index=($level_index)|0;
 var $tex_info=0,$pDecomp_images=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$_op=0,$_op_op=0,$10=0,$11=0,$12=0,$_op23=0,$_op23_op=0,$13=0,$14=0;
 var $15=0,$16=0,$ld$0$0=0,$17$0=0,$ld$1$1=0,$17$1=0,$18=0,$19=0,$20=0,$21=0,$22=0,$23=0,$24=0,$25=0,$26=0,$27=0,$28=0,$face_index_024=0,$30=0,$31=0;
 var $32=0,$33=0,$34=0,$35=0,$36=0,$_0=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+64)|0;
 $tex_info=((sp)|0);
 $pDecomp_images=(((sp)+(40))|0);
 __ZN4crnd16crn_texture_infoC1Ev($tex_info);
 $1=((__ZN4crnd21crnd_get_texture_infoEPKvjPNS_16crn_texture_infoE($pSrc_file_data,$src_file_size,$tex_info))|0);
 $2=(($tex_info+4)|0);
 $3=((HEAP32[(($2)>>2)])|0);
 $4=$3>>>($level_index>>>0);
 $5=($4|0)!=0;
 $6=(($tex_info+8)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=$7>>>($level_index>>>0);
 $9=($8|0)!=0;
 $_op=((($4)+(3))|0);
 $_op_op=$_op>>>2;
 $10=($5?$_op_op:1);
 $11=($10|0)!=0;
 $12=($11?$10:1);
 $_op23=((($8)+(3))|0);
 $_op23_op=$_op23>>>2;
 $13=($9?$_op23_op:1);
 $14=($13|0)!=0;
 $15=($14?$13:1);
 $16=(($tex_info+32)|0);
 $ld$0$0=(($16)|0);
 $17$0=((HEAP32[(($ld$0$0)>>2)])|0);
 $ld$1$1=(($16+4)|0);
 $17$1=((HEAP32[(($ld$1$1)>>2)])|0);
 $18=((__ZN4crnd28crnd_get_bytes_per_dxt_blockE10crn_format($17$0,$17$1))|0);
 $19=(Math_imul($12,$18)|0);
 $20=(Math_imul($19,$15)|0);
 $21=(($tex_info+16)|0);
 $22=((HEAP32[(($21)>>2)])|0);
 $23=(Math_imul($20,$22)|0);
 $24=((_malloc($23))|0);
 $25=($24|0)==0;
 if ($25) {
  $_0=0;

  STACKTOP=sp;return (($_0)|0);
 }
 $26=((HEAP32[(($21)>>2)])|0);
 $27=($26|0)==0;
 if (!($27)) {
  $28=((HEAP32[(($21)>>2)])|0);
  $face_index_024=0;
  while(1) {

   $30=(Math_imul($face_index_024,$20)|0);
   $31=(($24+$30)|0);
   $32=(($pDecomp_images+($face_index_024<<2))|0);
   HEAP32[(($32)>>2)]=$31;
   $33=((($face_index_024)+(1))|0);
   $34=($33>>>0)<($28>>>0);
   if ($34) {
    $face_index_024=$33;
   } else {
    break;
   }
  }
 }
 $35=(($pDecomp_images)|0);
 $36=((__ZN4crnd17crnd_unpack_levelEPvPS0_jjj($pContext,$35,$20,$19,$level_index))|0);
 if ($36) {
  $_0=$24;

  STACKTOP=sp;return (($_0)|0);
 }
 _free($24);
 $_0=0;

 STACKTOP=sp;return (($_0)|0);
}


function __ZN4crnd7helpers8destructINS_12crn_unpackerEEEvPT_($p){
 $p=($p)|0;
 var label=0;

 __ZN4crnd12crn_unpackerD1Ev($p);
 return;
}


function __ZN4crnd12crn_unpackerD1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd12crn_unpackerD2Ev($this);
 return;
}


function __ZN4crnd12crn_unpackerD2Ev($this){
 $this=($this)|0;
 var $1=0,$2=0,$4=0,$6=0,$8=0,$10=0,$11=0,$13=0,$15=0,$16=0,$18=0,$21=0,$22=0,$23=0,$26=0,$27=0,$30=0,$31=0,$_03=0,$_0=0;
 var $33=0,$36=0,$37=0,$_14=0,$_1=0,$39=0,$_lcssa25=0,$42=0,$43=0,$44=0,$45=0,$46=0,$48=0,$_25=0,$_2=0,$50=0,$52=0,$_lcssa=0,$55=0,$56=0;
 var $57=0,$58=0,$59=0,$61=0,$_36=0,$_3=0,$62=0,$64=0,$_47=0,$_4=0,$65=0,$67$0=0,$67$1=0,$68$0=0,$68$1=0,$70=0,$20$0=0,$20$1=0,$25$0=0,$25$1=0;
 var $29$0=0,$29$1=0,$35$0=0,$35$1=0,$41$0=0,$41$1=0,$54$0=0,$54$1=0,$lpad_loopexit$0=0,$lpad_loopexit$1=0,$lpad_loopexit10$0=0,$lpad_loopexit10$1=0,$lpad_loopexit15$0=0,$lpad_loopexit15$1=0,$lpad_loopexit20$0=0,$lpad_loopexit20$1=0,$lpad_nonloopexit21$0=0,$lpad_nonloopexit21$1=0,label=0;

 $1=(($this)|0);
 HEAP32[(($1)>>2)]=0;
 $2=(($this+284)|0);
 __ZN4crnd6vectorItED1Ev($2);
 $4=(($this+268)|0);
 __ZN4crnd6vectorItED1Ev($4);
 $6=(($this+252)|0);
 __ZN4crnd6vectorIjED1Ev($6);
 $8=(($this+236)|0);
 __ZN4crnd6vectorIjED1Ev($8);
 $10=(($this+188)|0);
 $11=(($this+212)|0);
 __ZN4crnd25static_huffman_data_modelD2Ev($11);
 $13=(($this+188)|0);
 __ZN4crnd25static_huffman_data_modelD2Ev($13);
 $15=(($this+140)|0);
 $16=(($this+164)|0);
 __ZN4crnd25static_huffman_data_modelD2Ev($16);
 $18=(($this+140)|0);
 __ZN4crnd25static_huffman_data_modelD2Ev($18);
 $70=(($this+116)|0);
 __ZN4crnd25static_huffman_data_modelD2Ev($70);
 return;
}


function __ZN4crnd6vectorItED1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorItED2Ev($this);
 return;
}


function __ZN4crnd6vectorIjED1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorIjED2Ev($this);
 return;
}


function __ZN4crnd6vectorIjED2Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorIjE5clearEv($this);
 return;
}


function __ZN4crnd6vectorIjE5clearEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$5=0,$6=0,$7=0,$9=0,label=0;

 $1=(($this)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==0;
 if ($3) {
  $9=(($this+12)|0);
  HEAP8[($9)]=0;
  return;
 }
 $5=(($this+4)|0);
 $6=$2;
 __ZN4crnd9crnd_freeEPv($6);
 HEAP32[(($1)>>2)]=0;
 HEAP32[(($5)>>2)]=0;
 $7=(($this+8)|0);
 HEAP32[(($7)>>2)]=0;
 $9=(($this+12)|0);
 HEAP8[($9)]=0;
 return;
}


function __ZN4crnd6vectorItED2Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorItE5clearEv($this);
 return;
}


function __ZN4crnd6vectorItE5clearEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$5=0,$6=0,$7=0,$9=0,label=0;

 $1=(($this)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==0;
 if ($3) {
  $9=(($this+12)|0);
  HEAP8[($9)]=0;
  return;
 }
 $5=(($this+4)|0);
 $6=$2;
 __ZN4crnd9crnd_freeEPv($6);
 HEAP32[(($1)>>2)]=0;
 HEAP32[(($5)>>2)]=0;
 $7=(($this+8)|0);
 HEAP32[(($7)>>2)]=0;
 $9=(($this+12)|0);
 HEAP8[($9)]=0;
 return;
}


function __ZN4crnd7helpers9constructINS_12crn_unpackerEEEPT_S4_($p){
 $p=($p)|0;
 var $1=0,$4=0,label=0;

 $1=($p|0)==0;
 if ($1) {
  $4=0;
 } else {
  __ZN4crnd12crn_unpackerC1Ev($p);
  $4=$p;
 }

 return (($4)|0);
}


function __ZN4crnd12crn_unpackerC1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd12crn_unpackerC2Ev($this);
 return;
}


function __ZN4crnd12crn_unpackerC2Ev($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$14=0,label=0;

 $1=(($this)|0);
 HEAP32[(($1)>>2)]=519686845;
 $2=(($this+4)|0);
 HEAP32[(($2)>>2)]=0;
 $3=(($this+8)|0);
 HEAP32[(($3)>>2)]=0;
 $4=(($this+88)|0);
 HEAP32[(($4)>>2)]=0;
 $5=(($this+92)|0);
 __ZN4crnd12symbol_codecC2Ev($5);
 $6=(($this+116)|0);
 __ZN4crnd25static_huffman_data_modelC2Ev($6);
 $7=(($this+140)|0);
 __ZN4crnd25static_huffman_data_modelC2Ev($7);
 $8=(($this+164)|0);
 __ZN4crnd25static_huffman_data_modelC2Ev($8);
 $9=(($this+188)|0);
 __ZN4crnd25static_huffman_data_modelC2Ev($9);
 $10=(($this+212)|0);
 __ZN4crnd25static_huffman_data_modelC2Ev($10);
 $11=(($this+236)|0);
 __ZN4crnd6vectorIjEC1Ev($11);
 $12=(($this+252)|0);
 __ZN4crnd6vectorIjEC1Ev($12);
 $13=(($this+268)|0);
 __ZN4crnd6vectorItEC1Ev($13);
 $14=(($this+284)|0);
 __ZN4crnd6vectorItEC1Ev($14);
 return;
}


function __ZN4crnd6vectorIjEC1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorIjEC2Ev($this);
 return;
}


function __ZN4crnd6vectorItEC1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorItEC2Ev($this);
 return;
}


function __ZN4crnd6vectorItEC2Ev($this){
 $this=($this)|0;
 var $1=0,label=0;

 $1=$this;
 _memset((((($1)|0))|0), ((((0)|0))|0), ((((13)|0))|0))|0;
 return;
}


function __ZN4crnd6vectorIjEC2Ev($this){
 $this=($this)|0;
 var $1=0,label=0;

 $1=$this;
 _memset((((($1)|0))|0), ((((0)|0))|0), ((((13)|0))|0))|0;
 return;
}


function __ZN4crnd7helpers9constructINS_13prefix_coding14decoder_tablesEEEPT_S5_($p){
 $p=($p)|0;
 var $1=0,$4=0,label=0;

 $1=($p|0)==0;
 if ($1) {
  $4=0;
 } else {
  __ZN4crnd13prefix_coding14decoder_tablesC1Ev($p);
  $4=$p;
 }

 return (($4)|0);
}


function __ZN4crnd13prefix_coding14decoder_tablesC1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd13prefix_coding14decoder_tablesC2Ev($this);
 return;
}


function __ZN4crnd13prefix_coding14decoder_tablesC2Ev($this){
 $this=($this)|0;
 var $1=0,$2=0,label=0;

 $1=(($this+164)|0);
 $2=$1;
 _memset((((($2)|0))|0), ((((0)|0))|0), ((((16)|0))|0))|0;
 return;
}


function __ZN4crnd6vectorIhE17increase_capacityEjb($this,$min_new_capacity,$grow_hint){
 $this=($this)|0;
 $min_new_capacity=($min_new_capacity)|0;
 $grow_hint=($grow_hint)|0;
 var $1=0,$2=0,$4=0,$_0=0,label=0;

 $1=$this;
 $2=((__ZN4crnd16elemental_vector17increase_capacityEjbjPFvPvS1_jE($1,$min_new_capacity,$grow_hint,1,0))|0);
 if ($2) {
  $_0=1;

  return (($_0)|0);
 }
 $4=(($this+12)|0);
 HEAP8[($4)]=1;
 $_0=0;

 return (($_0)|0);
}


function __ZN4crnd11scalar_typeIhE15construct_arrayEPhj($p,$n){
 $p=($p)|0;
 $n=($n)|0;
 var label=0;

 _memset((((($p)|0))|0), ((((0)|0))|0), (((($n)|0))|0))|0;
 return;
}


function __ZN4crnd7helpers8destructINS_13prefix_coding14decoder_tablesEEEvPT_($p){
 $p=($p)|0;
 var label=0;

 __ZN4crnd13prefix_coding14decoder_tablesD1Ev($p);
 return;
}


function __ZN4crnd13prefix_coding14decoder_tablesD1Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd13prefix_coding14decoder_tablesD2Ev($this);
 return;
}


function __ZN4crnd13prefix_coding14decoder_tablesD2Ev($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$6=0,$7=0,$8=0,label=0;

 $1=(($this+168)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==0;
 if (!($3)) {
  __ZN4crnd17crnd_delete_arrayIjEEvPT_($2);
 }
 $6=(($this+176)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=($7|0)==0;
 if ($8) {
  return;
 }
 __ZN4crnd17crnd_delete_arrayItEEvPT_($7);
 return;
}


function __ZN4crnd6vectorIhED2Ev($this){
 $this=($this)|0;
 var label=0;

 __ZN4crnd6vectorIhE5clearEv($this);
 return;
}


function __ZN4crnd6vectorIhEC2Ev($this){
 $this=($this)|0;
 var $1=0,label=0;

 $1=$this;
 _memset((((($1)|0))|0), ((((0)|0))|0), ((((13)|0))|0))|0;
 return;
}


function __ZN4crnd16crn_texture_infoC2Ev($this){
 $this=($this)|0;
 var $1=0,label=0;

 $1=(($this)|0);
 HEAP32[(($1)>>2)]=40;
 return;
}


function __ZN4crnd12crn_unpacker11unpack_dxt1EPPhjjjjjj($this,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$blocks_x,$blocks_y,$chunks_x,$chunks_y){
 $this=($this)|0;
 $pDst=($pDst)|0;
 $dst_size_in_bytes=($dst_size_in_bytes)|0;
 $row_pitch_in_bytes=($row_pitch_in_bytes)|0;
 $blocks_x=($blocks_x)|0;
 $blocks_y=($blocks_y)|0;
 $chunks_x=($chunks_x)|0;
 $chunks_y=($chunks_y)|0;
 var $prev_color_endpoint_index=0,$prev_color_selector_index=0,$color_endpoints=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$14=0,$15=0,$16=0,$17=0;
 var $18=0,$19=0,$20=0,$21=0,$22=0,$23=0,$24=0,$25=0,$26=0,$27=0,$28=0,$29=0,$30=0,$chunk_encoding_bits_080=0,$f_079=0,$32=0,$33=0,$chunk_encoding_bits_174=0,$pRow_073=0,$y_072=0;
 var $35=0,$36=0,$38=0,$pBlock_0=0,$block_delta_0=0,$dir_x_0=0,$end_x_0=0,$start_x_0=0,$40=0,$_=0,$41=0,$chunk_encoding_bits_268=0,$pBlock_167=0,$x_066=0,$42=0,$44=0,$45=0,$chunk_encoding_bits_3=0,$46=0,$47=0;
 var $48=0,$49=0,$50=0,$i_062=0,$52=0,$53=0,$54=0,$55=0,$56=0,$57=0,$58=0,$59=0,$60=0,$61=0,$not_=0,$_86=0,$62=0,$brmerge=0,$64=0,$65=0;
 var $66=0,$67=0,$68=0,$69=0,$70=0,$71=0,$72=0,$73=0,$74=0,$75=0,$76=0,$77=0,$78=0,$79=0,$80=0,$81=0,$82=0,$83=0,$84=0,$85=0;
 var $86=0,$87=0,$88=0,$89=0,$90=0,$91=0,$92=0,$93=0,$94=0,$95=0,$96=0,$97=0,$98=0,$99=0,$100=0,$101=0,$102=0,$103=0,$104=0,$105=0;
 var $106=0,$107=0,$108=0,$109=0,$110=0,$111=0,$112=0,$113=0,$114=0,$115=0,$116=0,$117=0,$119=0,$120=0,$121=0,$122=0,$123=0,$124=0,$125=0,$126=0;
 var $127=0,$128=0,$129=0,$130=0,$131=0,$132=0,$133=0,$134=0,$135=0,$136=0,$137=0,$138=0,$chunk_encoding_bits_2_lcssa=0,$139=0,$140=0,$141=0,$chunk_encoding_bits_1_lcssa=0,$142=0,$143=0,$145=0;
 var $146=0,$147=0,$148=0,$149=0,$150=0,$151=0,$152=0,$153=0,$154=0,$155=0,$156=0,$158=0,$159=0,$160=0,$162=0,$163=0,$164=0,$165=0,$166=0,$167=0;
 var $168=0,$169=0,$170=0,$171=0,$_sum85=0,$172=0,$173=0,$175=0,$176=0,$177=0,$brmerge87=0,$_sum=0,$179=0,$180=0,$181=0,$182=0,$183=0,$184=0,$185=0,$186=0;
 var $187=0,$188=0,$_sum84=0,$189=0,$190=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+32)|0;
 $prev_color_endpoint_index=((sp)|0);
 $prev_color_selector_index=(((sp)+(8))|0);
 $color_endpoints=(((sp)+(16))|0);
 $1=(($this+236)|0);
 $2=((__ZNK4crnd6vectorIjE4sizeEv($1))|0);
 $3=(($this+252)|0);
 $4=((__ZNK4crnd6vectorIjE4sizeEv($3))|0);
 HEAP32[(($prev_color_endpoint_index)>>2)]=0;
 HEAP32[(($prev_color_selector_index)>>2)]=0;
 $5=(($this+88)|0);
 $6=((HEAP32[(($5)>>2)])|0);
 $7=(($6+17)|0);
 $8=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($7))|0);
 $9=$row_pitch_in_bytes>>>2;
 $10=($8|0)==0;
 if ($10) {
  STACKTOP=sp;return ((1)|0);
 }
 $11=($chunks_y|0)==0;
 $12=((($chunks_y)-(1))|0);
 $13=$blocks_y&1;
 $14=($13|0)!=0;
 $15=$row_pitch_in_bytes<<1;
 $16=(($this+92)|0);
 $17=(($this+116)|0);
 $18=$blocks_x&1;
 $19=(($this+92)|0);
 $20=(($this+188)|0);
 $21=((($9)+(1))|0);
 $22=((($9)+(2))|0);
 $23=((($9)+(3))|0);
 $24=(($this+92)|0);
 $25=(($this+188)|0);
 $26=((($chunks_x)-(1))|0);
 $27=(($this+92)|0);
 $28=(($this+140)|0);
 $29=((($chunks_x)-(1))|0);
 $30=$29<<4;
 $f_079=0;$chunk_encoding_bits_080=1;
 while(1) {


  if ($11) {
   $chunk_encoding_bits_1_lcssa=$chunk_encoding_bits_080;
  } else {
   $32=(($pDst+($f_079<<2))|0);
   $33=((HEAP32[(($32)>>2)])|0);
   $y_072=0;$pRow_073=$33;$chunk_encoding_bits_174=$chunk_encoding_bits_080;
   while(1) {



    $35=$y_072&1;
    $36=($35|0)==0;
    if ($36) {
     $start_x_0=0;$end_x_0=$chunks_x;$dir_x_0=1;$block_delta_0=16;$pBlock_0=$pRow_073;
    } else {
     $38=(($pRow_073+$30)|0);
     $start_x_0=$29;$end_x_0=-1;$dir_x_0=-1;$block_delta_0=-16;$pBlock_0=$38;
    }





    $40=($y_072|0)==($12|0);
    $_=$40&$14;
    $41=($start_x_0|0)==($end_x_0|0);
    if ($41) {
     $chunk_encoding_bits_2_lcssa=$chunk_encoding_bits_174;
    } else {
     $x_066=$start_x_0;$pBlock_167=$pBlock_0;$chunk_encoding_bits_268=$chunk_encoding_bits_174;
     while(1) {



      $42=($chunk_encoding_bits_268|0)==1;
      if ($42) {
       $44=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($16,$17))|0);
       $45=$44|512;
       $chunk_encoding_bits_3=$45;
      } else {
       $chunk_encoding_bits_3=$chunk_encoding_bits_268;
      }

      $46=$chunk_encoding_bits_3&7;
      $47=$chunk_encoding_bits_3>>>3;
      $48=((888+$46)|0);
      $49=((HEAP8[($48)])|0);
      $50=($49&255);
      $i_062=0;
      while(1) {

       $52=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($27,$28))|0);
       $53=((HEAP32[(($prev_color_endpoint_index)>>2)])|0);
       $54=((($53)+($52))|0);
       HEAP32[(($prev_color_endpoint_index)>>2)]=$54;
       __ZN4crnd12crn_unpacker5limitERjj($prev_color_endpoint_index,$2);
       $55=((HEAP32[(($prev_color_endpoint_index)>>2)])|0);
       $56=((__ZN4crnd6vectorIjEixEj($1,$55))|0);
       $57=((HEAP32[(($56)>>2)])|0);
       $58=(($color_endpoints+($i_062<<2))|0);
       HEAP32[(($58)>>2)]=$57;
       $59=((($i_062)+(1))|0);
       $60=($59>>>0)<($50>>>0);
       if ($60) {
        $i_062=$59;
       } else {
        break;
       }
      }
      $61=($x_066|0)==($26|0);
      $not_=($18|0)!=0;
      $_86=$61&$not_;
      $62=$pBlock_167;
      $brmerge=$_|$_86;
      do {
       if ($brmerge) {
        $119=$pBlock_167;
        $120=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($24,$25))|0);
        $121=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $122=((($121)+($120))|0);
        HEAP32[(($prev_color_selector_index)>>2)]=$122;
        __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
        $123=((896+($46<<2))|0);
        $124=((HEAP8[($123)])|0);
        $125=($124&255);
        $126=(($color_endpoints+($125<<2))|0);
        $127=((HEAP32[(($126)>>2)])|0);
        HEAP32[(($119)>>2)]=$127;
        $128=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $129=((__ZN4crnd6vectorIjEixEj($3,$128))|0);
        $130=((HEAP32[(($129)>>2)])|0);
        $131=(($pBlock_167+4)|0);
        $132=$131;
        HEAP32[(($132)>>2)]=$130;
        $133=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($24,$25))|0);
        $134=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $135=((($134)+($133))|0);
        HEAP32[(($prev_color_selector_index)>>2)]=$135;
        __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
        if (!($_86)) {
         $145=(($pBlock_167+8)|0);
         $146=$145;
         $147=((896+($46<<2)+1)|0);
         $148=((HEAP8[($147)])|0);
         $149=($148&255);
         $150=(($color_endpoints+($149<<2))|0);
         $151=((HEAP32[(($150)>>2)])|0);
         HEAP32[(($146)>>2)]=$151;
         $152=((HEAP32[(($prev_color_selector_index)>>2)])|0);
         $153=((__ZN4crnd6vectorIjEixEj($3,$152))|0);
         $154=((HEAP32[(($153)>>2)])|0);
         $155=(($pBlock_167+12)|0);
         $156=$155;
         HEAP32[(($156)>>2)]=$154;
        }
        $158=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($24,$25))|0);
        $159=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $160=((($159)+($158))|0);
        HEAP32[(($prev_color_selector_index)>>2)]=$160;
        __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
        if (!($_)) {
         $162=(($pBlock_167+$row_pitch_in_bytes)|0);
         $163=$162;
         $164=((896+($46<<2)+2)|0);
         $165=((HEAP8[($164)])|0);
         $166=($165&255);
         $167=(($color_endpoints+($166<<2))|0);
         $168=((HEAP32[(($167)>>2)])|0);
         HEAP32[(($163)>>2)]=$168;
         $169=((HEAP32[(($prev_color_selector_index)>>2)])|0);
         $170=((__ZN4crnd6vectorIjEixEj($3,$169))|0);
         $171=((HEAP32[(($170)>>2)])|0);
         $_sum85=((($row_pitch_in_bytes)+(4))|0);
         $172=(($pBlock_167+$_sum85)|0);
         $173=$172;
         HEAP32[(($173)>>2)]=$171;
        }
        $175=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($24,$25))|0);
        $176=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $177=((($176)+($175))|0);
        HEAP32[(($prev_color_selector_index)>>2)]=$177;
        __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
        $brmerge87=$_86|$_;
        if ($brmerge87) {
         break;
        }
        $_sum=((($row_pitch_in_bytes)+(8))|0);
        $179=(($pBlock_167+$_sum)|0);
        $180=$179;
        $181=((896+($46<<2)+3)|0);
        $182=((HEAP8[($181)])|0);
        $183=($182&255);
        $184=(($color_endpoints+($183<<2))|0);
        $185=((HEAP32[(($184)>>2)])|0);
        HEAP32[(($180)>>2)]=$185;
        $186=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $187=((__ZN4crnd6vectorIjEixEj($3,$186))|0);
        $188=((HEAP32[(($187)>>2)])|0);
        $_sum84=((($row_pitch_in_bytes)+(12))|0);
        $189=(($pBlock_167+$_sum84)|0);
        $190=$189;
        HEAP32[(($190)>>2)]=$188;
       } else {
        $64=((896+($46<<2))|0);
        $65=((HEAP8[($64)])|0);
        $66=($65&255);
        $67=(($color_endpoints+($66<<2))|0);
        $68=((HEAP32[(($67)>>2)])|0);
        HEAP32[(($62)>>2)]=$68;
        $69=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($19,$20))|0);
        $70=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $71=((($70)+($69))|0);
        HEAP32[(($prev_color_selector_index)>>2)]=$71;
        __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
        $72=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $73=((__ZN4crnd6vectorIjEixEj($3,$72))|0);
        $74=((HEAP32[(($73)>>2)])|0);
        $75=(($pBlock_167+4)|0);
        $76=$75;
        HEAP32[(($76)>>2)]=$74;
        $77=((896+($46<<2)+1)|0);
        $78=((HEAP8[($77)])|0);
        $79=($78&255);
        $80=(($color_endpoints+($79<<2))|0);
        $81=((HEAP32[(($80)>>2)])|0);
        $82=(($pBlock_167+8)|0);
        $83=$82;
        HEAP32[(($83)>>2)]=$81;
        $84=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($19,$20))|0);
        $85=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $86=((($85)+($84))|0);
        HEAP32[(($prev_color_selector_index)>>2)]=$86;
        __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
        $87=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $88=((__ZN4crnd6vectorIjEixEj($3,$87))|0);
        $89=((HEAP32[(($88)>>2)])|0);
        $90=(($pBlock_167+12)|0);
        $91=$90;
        HEAP32[(($91)>>2)]=$89;
        $92=((896+($46<<2)+2)|0);
        $93=((HEAP8[($92)])|0);
        $94=($93&255);
        $95=(($color_endpoints+($94<<2))|0);
        $96=((HEAP32[(($95)>>2)])|0);
        $97=(($62+($9<<2))|0);
        HEAP32[(($97)>>2)]=$96;
        $98=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($19,$20))|0);
        $99=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $100=((($99)+($98))|0);
        HEAP32[(($prev_color_selector_index)>>2)]=$100;
        __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
        $101=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $102=((__ZN4crnd6vectorIjEixEj($3,$101))|0);
        $103=((HEAP32[(($102)>>2)])|0);
        $104=(($62+($21<<2))|0);
        HEAP32[(($104)>>2)]=$103;
        $105=((896+($46<<2)+3)|0);
        $106=((HEAP8[($105)])|0);
        $107=($106&255);
        $108=(($color_endpoints+($107<<2))|0);
        $109=((HEAP32[(($108)>>2)])|0);
        $110=(($62+($22<<2))|0);
        HEAP32[(($110)>>2)]=$109;
        $111=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($19,$20))|0);
        $112=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $113=((($112)+($111))|0);
        HEAP32[(($prev_color_selector_index)>>2)]=$113;
        __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
        $114=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $115=((__ZN4crnd6vectorIjEixEj($3,$114))|0);
        $116=((HEAP32[(($115)>>2)])|0);
        $117=(($62+($23<<2))|0);
        HEAP32[(($117)>>2)]=$116;
       }
      } while(0);
      $136=(($pBlock_167+$block_delta_0)|0);
      $137=((($x_066)+($dir_x_0))|0);
      $138=($137|0)==($end_x_0|0);
      if ($138) {
       $chunk_encoding_bits_2_lcssa=$47;
       break;
      } else {
       $x_066=$137;$pBlock_167=$136;$chunk_encoding_bits_268=$47;
      }
     }
    }

    $139=(($pRow_073+$15)|0);
    $140=((($y_072)+(1))|0);
    $141=($140>>>0)<($chunks_y>>>0);
    if ($141) {
     $y_072=$140;$pRow_073=$139;$chunk_encoding_bits_174=$chunk_encoding_bits_2_lcssa;
    } else {
     $chunk_encoding_bits_1_lcssa=$chunk_encoding_bits_2_lcssa;
     break;
    }
   }
  }

  $142=((($f_079)+(1))|0);
  $143=($142>>>0)<($8>>>0);
  if ($143) {
   $f_079=$142;$chunk_encoding_bits_080=$chunk_encoding_bits_1_lcssa;
  } else {
   break;
  }
 }
 STACKTOP=sp;return ((1)|0);
}


function __ZN4crnd12crn_unpacker11unpack_dxt5EPPhjjjjjj($this,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$blocks_x,$blocks_y,$chunks_x,$chunks_y){
 $this=($this)|0;
 $pDst=($pDst)|0;
 $dst_size_in_bytes=($dst_size_in_bytes)|0;
 $row_pitch_in_bytes=($row_pitch_in_bytes)|0;
 $blocks_x=($blocks_x)|0;
 $blocks_y=($blocks_y)|0;
 $chunks_x=($chunks_x)|0;
 $chunks_y=($chunks_y)|0;
 var $prev_color_endpoint_index=0,$prev_color_selector_index=0,$prev_alpha_endpoint_index=0,$prev_alpha_selector_index=0,$color_endpoints=0,$alpha_endpoints=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$14=0;
 var $15=0,$16=0,$17=0,$phitmp48=0,$18=0,$19=0,$20=0,$21=0,$22=0,$23=0,$24=0,$25=0,$26=0,$27=0,$28=0,$29=0,$30=0,$31=0,$32=0,$chunk_encoding_bits_069=0;
 var $f_068=0,$34=0,$35=0,$chunk_encoding_bits_163=0,$pRow_062=0,$y_061=0,$37=0,$38=0,$40=0,$pBlock_0=0,$block_delta_0=0,$dir_x_0=0,$end_x_0=0,$start_x_0=0,$not_=0,$phitmp48_=0,$42=0,$chunk_encoding_bits_259=0,$pBlock_158=0,$x_057=0;
 var $43=0,$45=0,$46=0,$chunk_encoding_bits_3=0,$47=0,$48=0,$49=0,$50=0,$51=0,$i_049=0,$53=0,$54=0,$55=0,$56=0,$57=0,$58=0,$59=0,$60=0,$61=0,$62=0;
 var $i1_051=0,$63=0,$64=0,$65=0,$66=0,$67=0,$68=0,$69=0,$70=0,$71=0,$by_056=0,$pD_0_in55=0,$73=0,$brmerge47=0,$74=0,$75=0,$76=0,$77=0,$78=0,$79=0;
 var $80=0,$pD_0=0,$82=0,$83=0,$84=0,$85=0,$86=0,$87=0,$88=0,$89=0,$90=0,$91=0,$92=0,$93=0,$94=0,$95=0,$96=0,$97=0,$98=0,$99=0;
 var $100=0,$101=0,$102=0,$103=0,$104=0,$105=0,$106=0,$107=0,$108=0,$109=0,$110=0,$111=0,$112=0,$114=0,$115=0,$116=0,$117=0,$118=0,$119=0,$notlhs=0;
 var $notrhs=0,$_phitmp_not=0,$brmerge47_not=0,$brmerge=0,$121=0,$122=0,$123=0,$chunk_encoding_bits_2_lcssa=0,$124=0,$125=0,$126=0,$chunk_encoding_bits_1_lcssa=0,$127=0,$128=0,$130=0,$131=0,$132=0,$133=0,$134=0,$135=0;
 var $136=0,$137=0,$138=0,$139=0,$140=0,$141=0,$142=0,$143=0,$144=0,$145=0,$146=0,$147=0,$148=0,$149=0,$150=0,$151=0,$152=0,$153=0,$154=0,$155=0;
 var $156=0,$157=0,$158=0,$159=0,$160=0,$161=0,$162=0,$163=0,$165=0,$166=0,$167=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+64)|0;
 $prev_color_endpoint_index=((sp)|0);
 $prev_color_selector_index=(((sp)+(8))|0);
 $prev_alpha_endpoint_index=(((sp)+(16))|0);
 $prev_alpha_selector_index=(((sp)+(24))|0);
 $color_endpoints=(((sp)+(32))|0);
 $alpha_endpoints=(((sp)+(48))|0);
 $1=(($this+236)|0);
 $2=((__ZNK4crnd6vectorIjE4sizeEv($1))|0);
 $3=(($this+252)|0);
 $4=((__ZNK4crnd6vectorIjE4sizeEv($3))|0);
 $5=(($this+268)|0);
 $6=((__ZNK4crnd6vectorItE4sizeEv($5))|0);
 $7=(($this+88)|0);
 $8=((HEAP32[(($7)>>2)])|0);
 $9=(($8+63)|0);
 $10=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($9))|0);
 HEAP32[(($prev_color_endpoint_index)>>2)]=0;
 HEAP32[(($prev_color_selector_index)>>2)]=0;
 HEAP32[(($prev_alpha_endpoint_index)>>2)]=0;
 HEAP32[(($prev_alpha_selector_index)>>2)]=0;
 $11=((HEAP32[(($7)>>2)])|0);
 $12=(($11+17)|0);
 $13=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($12))|0);
 $14=($13|0)==0;
 if ($14) {
  STACKTOP=sp;return ((1)|0);
 }
 $15=($chunks_y|0)==0;
 $16=((($chunks_y)-(1))|0);
 $17=$blocks_y&1;
 $phitmp48=($17|0)==0;
 $18=$row_pitch_in_bytes<<1;
 $19=(($this+92)|0);
 $20=(($this+116)|0);
 $21=$blocks_x&1;
 $22=(($this+92)|0);
 $23=(($this+212)|0);
 $24=(($this+188)|0);
 $25=(($this+284)|0);
 $26=(($this+92)|0);
 $27=(($this+140)|0);
 $28=(($this+92)|0);
 $29=(($this+164)|0);
 $30=((($chunks_x)-(1))|0);
 $31=((($chunks_x)-(1))|0);
 $32=$31<<5;
 $f_068=0;$chunk_encoding_bits_069=1;
 while(1) {


  if ($15) {
   $chunk_encoding_bits_1_lcssa=$chunk_encoding_bits_069;
  } else {
   $34=(($pDst+($f_068<<2))|0);
   $35=((HEAP32[(($34)>>2)])|0);
   $y_061=0;$pRow_062=$35;$chunk_encoding_bits_163=$chunk_encoding_bits_069;
   while(1) {



    $37=$y_061&1;
    $38=($37|0)==0;
    if ($38) {
     $start_x_0=0;$end_x_0=$chunks_x;$dir_x_0=1;$block_delta_0=32;$pBlock_0=$pRow_062;
    } else {
     $40=(($pRow_062+$32)|0);
     $start_x_0=$31;$end_x_0=-1;$dir_x_0=-1;$block_delta_0=-32;$pBlock_0=$40;
    }





    $not_=($y_061|0)!=($16|0);
    $phitmp48_=$phitmp48|$not_;
    $42=($start_x_0|0)==($end_x_0|0);
    if ($42) {
     $chunk_encoding_bits_2_lcssa=$chunk_encoding_bits_163;
    } else {
     $x_057=$start_x_0;$pBlock_158=$pBlock_0;$chunk_encoding_bits_259=$chunk_encoding_bits_163;
     while(1) {



      $43=($chunk_encoding_bits_259|0)==1;
      if ($43) {
       $45=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($19,$20))|0);
       $46=$45|512;
       $chunk_encoding_bits_3=$46;
      } else {
       $chunk_encoding_bits_3=$chunk_encoding_bits_259;
      }

      $47=$chunk_encoding_bits_3&7;
      $48=$chunk_encoding_bits_3>>>3;
      $49=((888+$47)|0);
      $50=((HEAP8[($49)])|0);
      $51=($50&255);
      $i_049=0;
      while(1) {

       $53=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($28,$29))|0);
       $54=((HEAP32[(($prev_alpha_endpoint_index)>>2)])|0);
       $55=((($54)+($53))|0);
       HEAP32[(($prev_alpha_endpoint_index)>>2)]=$55;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha_endpoint_index,$6);
       $56=((HEAP32[(($prev_alpha_endpoint_index)>>2)])|0);
       $57=((__ZN4crnd6vectorItEixEj($5,$56))|0);
       $58=((HEAP16[(($57)>>1)])|0);
       $59=($58&65535);
       $60=(($alpha_endpoints+($i_049<<2))|0);
       HEAP32[(($60)>>2)]=$59;
       $61=((($i_049)+(1))|0);
       $62=($61>>>0)<($51>>>0);
       if ($62) {
        $i_049=$61;
       } else {
        $i1_051=0;
        break;
       }
      }
      while(1) {

       $63=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($26,$27))|0);
       $64=((HEAP32[(($prev_color_endpoint_index)>>2)])|0);
       $65=((($64)+($63))|0);
       HEAP32[(($prev_color_endpoint_index)>>2)]=$65;
       __ZN4crnd12crn_unpacker5limitERjj($prev_color_endpoint_index,$2);
       $66=((HEAP32[(($prev_color_endpoint_index)>>2)])|0);
       $67=((__ZN4crnd6vectorIjEixEj($1,$66))|0);
       $68=((HEAP32[(($67)>>2)])|0);
       $69=(($color_endpoints+($i1_051<<2))|0);
       HEAP32[(($69)>>2)]=$68;
       $70=((($i1_051)+(1))|0);
       $71=($70>>>0)<($51>>>0);
       if ($71) {
        $i1_051=$70;
       } else {
        $pD_0_in55=$pBlock_158;$by_056=0;
        break;
       }
      }
      while(1) {


       $73=($by_056|0)==0;
       $brmerge47=$73|$phitmp48_;
       $74=$by_056<<1;
       $75=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($22,$23))|0);
       $76=((HEAP32[(($prev_alpha_selector_index)>>2)])|0);
       $77=((($76)+($75))|0);
       HEAP32[(($prev_alpha_selector_index)>>2)]=$77;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha_selector_index,$10);
       $78=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($22,$24))|0);
       $79=((HEAP32[(($prev_color_selector_index)>>2)])|0);
       $80=((($79)+($78))|0);
       HEAP32[(($prev_color_selector_index)>>2)]=$80;
       __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
       if ($brmerge47) {
        $pD_0=$pD_0_in55;
        $82=((896+($47<<2)+$74)|0);
        $83=((HEAP8[($82)])|0);
        $84=($83&255);
        $85=((HEAP32[(($prev_alpha_selector_index)>>2)])|0);
        $86=((($85)*(3))&-1);
        $87=((__ZN4crnd6vectorItEixEj($25,$86))|0);
        $88=(($alpha_endpoints+($84<<2))|0);
        $89=((HEAP32[(($88)>>2)])|0);
        $90=((HEAP16[(($87)>>1)])|0);
        $91=($90&65535);
        $92=$91<<16;
        $93=$92|$89;
        HEAP32[(($pD_0)>>2)]=$93;
        $94=(($87+2)|0);
        $95=((HEAP16[(($94)>>1)])|0);
        $96=($95&65535);
        $97=(($87+4)|0);
        $98=((HEAP16[(($97)>>1)])|0);
        $99=($98&65535);
        $100=$99<<16;
        $101=$100|$96;
        $102=(($pD_0_in55+4)|0);
        $103=$102;
        HEAP32[(($103)>>2)]=$101;
        $104=(($color_endpoints+($84<<2))|0);
        $105=((HEAP32[(($104)>>2)])|0);
        $106=(($pD_0_in55+8)|0);
        $107=$106;
        HEAP32[(($107)>>2)]=$105;
        $108=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $109=((__ZN4crnd6vectorIjEixEj($3,$108))|0);
        $110=((HEAP32[(($109)>>2)])|0);
        $111=(($pD_0_in55+12)|0);
        $112=$111;
        HEAP32[(($112)>>2)]=$110;
       }
       $114=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($22,$23))|0);
       $115=((HEAP32[(($prev_alpha_selector_index)>>2)])|0);
       $116=((($115)+($114))|0);
       HEAP32[(($prev_alpha_selector_index)>>2)]=$116;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha_selector_index,$10);
       $117=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($22,$24))|0);
       $118=((HEAP32[(($prev_color_selector_index)>>2)])|0);
       $119=((($118)+($117))|0);
       HEAP32[(($prev_color_selector_index)>>2)]=$119;
       __ZN4crnd12crn_unpacker5limitERjj($prev_color_selector_index,$4);
       $notlhs=($21|0)!=0;
       $notrhs=($x_057|0)==($30|0);
       $_phitmp_not=$notrhs&$notlhs;
       $brmerge47_not=$brmerge47^1;
       $brmerge=$_phitmp_not|$brmerge47_not;
       if (!($brmerge)) {
        $130=(($pD_0_in55+16)|0);
        $131=$130;
        $132=$74|1;
        $133=((896+($47<<2)+$132)|0);
        $134=((HEAP8[($133)])|0);
        $135=($134&255);
        $136=((HEAP32[(($prev_alpha_selector_index)>>2)])|0);
        $137=((($136)*(3))&-1);
        $138=((__ZN4crnd6vectorItEixEj($25,$137))|0);
        $139=(($alpha_endpoints+($135<<2))|0);
        $140=((HEAP32[(($139)>>2)])|0);
        $141=((HEAP16[(($138)>>1)])|0);
        $142=($141&65535);
        $143=$142<<16;
        $144=$143|$140;
        HEAP32[(($131)>>2)]=$144;
        $145=(($138+2)|0);
        $146=((HEAP16[(($145)>>1)])|0);
        $147=($146&65535);
        $148=(($138+4)|0);
        $149=((HEAP16[(($148)>>1)])|0);
        $150=($149&65535);
        $151=$150<<16;
        $152=$151|$147;
        $153=(($pD_0_in55+20)|0);
        $154=$153;
        HEAP32[(($154)>>2)]=$152;
        $155=(($color_endpoints+($135<<2))|0);
        $156=((HEAP32[(($155)>>2)])|0);
        $157=(($pD_0_in55+24)|0);
        $158=$157;
        HEAP32[(($158)>>2)]=$156;
        $159=((HEAP32[(($prev_color_selector_index)>>2)])|0);
        $160=((__ZN4crnd6vectorIjEixEj($3,$159))|0);
        $161=((HEAP32[(($160)>>2)])|0);
        $162=(($pD_0_in55+28)|0);
        $163=$162;
        HEAP32[(($163)>>2)]=$161;
       }
       $165=(($pD_0_in55+$row_pitch_in_bytes)|0);
       $166=((($by_056)+(1))|0);
       $167=($166>>>0)<((2)>>>0);
       if ($167) {
        $pD_0_in55=$165;$by_056=$166;
       } else {
        break;
       }
      }
      $121=(($pBlock_158+$block_delta_0)|0);
      $122=((($x_057)+($dir_x_0))|0);
      $123=($122|0)==($end_x_0|0);
      if ($123) {
       $chunk_encoding_bits_2_lcssa=$48;
       break;
      } else {
       $x_057=$122;$pBlock_158=$121;$chunk_encoding_bits_259=$48;
      }
     }
    }

    $124=(($pRow_062+$18)|0);
    $125=((($y_061)+(1))|0);
    $126=($125>>>0)<($chunks_y>>>0);
    if ($126) {
     $y_061=$125;$pRow_062=$124;$chunk_encoding_bits_163=$chunk_encoding_bits_2_lcssa;
    } else {
     $chunk_encoding_bits_1_lcssa=$chunk_encoding_bits_2_lcssa;
     break;
    }
   }
  }

  $127=((($f_068)+(1))|0);
  $128=($127>>>0)<($13>>>0);
  if ($128) {
   $f_068=$127;$chunk_encoding_bits_069=$chunk_encoding_bits_1_lcssa;
  } else {
   break;
  }
 }
 STACKTOP=sp;return ((1)|0);
}


function __ZN4crnd12crn_unpacker12unpack_dxt5aEPPhjjjjjj($this,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$blocks_x,$blocks_y,$chunks_x,$chunks_y){
 $this=($this)|0;
 $pDst=($pDst)|0;
 $dst_size_in_bytes=($dst_size_in_bytes)|0;
 $row_pitch_in_bytes=($row_pitch_in_bytes)|0;
 $blocks_x=($blocks_x)|0;
 $blocks_y=($blocks_y)|0;
 $chunks_x=($chunks_x)|0;
 $chunks_y=($chunks_y)|0;
 var $prev_alpha0_endpoint_index=0,$prev_alpha0_selector_index=0,$alpha0_endpoints=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$phitmp42=0,$14=0,$15=0,$16=0;
 var $17=0,$18=0,$19=0,$20=0,$21=0,$22=0,$23=0,$24=0,$25=0,$chunk_encoding_bits_060=0,$f_059=0,$27=0,$28=0,$chunk_encoding_bits_154=0,$pRow_053=0,$y_052=0,$30=0,$31=0,$33=0,$pBlock_0=0;
 var $block_delta_0=0,$dir_x_0=0,$end_x_0=0,$start_x_0=0,$not_=0,$phitmp42_=0,$35=0,$chunk_encoding_bits_250=0,$x_049=0,$pBlock_148=0,$36=0,$38=0,$39=0,$chunk_encoding_bits_3=0,$40=0,$41=0,$42=0,$43=0,$44=0,$i_043=0;
 var $46=0,$47=0,$48=0,$49=0,$50=0,$51=0,$52=0,$53=0,$54=0,$55=0,$by_047=0,$pD_0_in46=0,$57=0,$brmerge41=0,$58=0,$59=0,$60=0,$61=0,$pD_0=0,$63=0;
 var $64=0,$65=0,$66=0,$67=0,$68=0,$69=0,$70=0,$71=0,$72=0,$73=0,$74=0,$75=0,$76=0,$77=0,$78=0,$79=0,$80=0,$81=0,$82=0,$83=0;
 var $84=0,$86=0,$87=0,$88=0,$notlhs=0,$notrhs=0,$_phitmp_not=0,$brmerge41_not=0,$brmerge=0,$90=0,$91=0,$92=0,$chunk_encoding_bits_2_lcssa=0,$93=0,$94=0,$95=0,$chunk_encoding_bits_1_lcssa=0,$96=0,$97=0,$99=0;
 var $100=0,$101=0,$102=0,$103=0,$104=0,$105=0,$106=0,$107=0,$108=0,$109=0,$110=0,$111=0,$112=0,$113=0,$114=0,$115=0,$116=0,$117=0,$118=0,$119=0;
 var $120=0,$121=0,$122=0,$123=0,$125=0,$126=0,$127=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+32)|0;
 $prev_alpha0_endpoint_index=((sp)|0);
 $prev_alpha0_selector_index=(((sp)+(8))|0);
 $alpha0_endpoints=(((sp)+(16))|0);
 $1=(($this+268)|0);
 $2=((__ZNK4crnd6vectorItE4sizeEv($1))|0);
 $3=(($this+88)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $5=(($4+63)|0);
 $6=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($5))|0);
 HEAP32[(($prev_alpha0_endpoint_index)>>2)]=0;
 HEAP32[(($prev_alpha0_selector_index)>>2)]=0;
 $7=((HEAP32[(($3)>>2)])|0);
 $8=(($7+17)|0);
 $9=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($8))|0);
 $10=($9|0)==0;
 if ($10) {
  STACKTOP=sp;return ((1)|0);
 }
 $11=($chunks_y|0)==0;
 $12=((($chunks_y)-(1))|0);
 $13=$blocks_y&1;
 $phitmp42=($13|0)==0;
 $14=$row_pitch_in_bytes<<1;
 $15=(($this+92)|0);
 $16=(($this+116)|0);
 $17=$blocks_x&1;
 $18=(($this+92)|0);
 $19=(($this+212)|0);
 $20=(($this+284)|0);
 $21=(($this+92)|0);
 $22=(($this+164)|0);
 $23=((($chunks_x)-(1))|0);
 $24=((($chunks_x)-(1))|0);
 $25=$24<<4;
 $f_059=0;$chunk_encoding_bits_060=1;
 while(1) {


  if ($11) {
   $chunk_encoding_bits_1_lcssa=$chunk_encoding_bits_060;
  } else {
   $27=(($pDst+($f_059<<2))|0);
   $28=((HEAP32[(($27)>>2)])|0);
   $y_052=0;$pRow_053=$28;$chunk_encoding_bits_154=$chunk_encoding_bits_060;
   while(1) {



    $30=$y_052&1;
    $31=($30|0)==0;
    if ($31) {
     $start_x_0=0;$end_x_0=$chunks_x;$dir_x_0=1;$block_delta_0=16;$pBlock_0=$pRow_053;
    } else {
     $33=(($pRow_053+$25)|0);
     $start_x_0=$24;$end_x_0=-1;$dir_x_0=-1;$block_delta_0=-16;$pBlock_0=$33;
    }





    $not_=($y_052|0)!=($12|0);
    $phitmp42_=$phitmp42|$not_;
    $35=($start_x_0|0)==($end_x_0|0);
    if ($35) {
     $chunk_encoding_bits_2_lcssa=$chunk_encoding_bits_154;
    } else {
     $pBlock_148=$pBlock_0;$x_049=$start_x_0;$chunk_encoding_bits_250=$chunk_encoding_bits_154;
     while(1) {



      $36=($chunk_encoding_bits_250|0)==1;
      if ($36) {
       $38=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($15,$16))|0);
       $39=$38|512;
       $chunk_encoding_bits_3=$39;
      } else {
       $chunk_encoding_bits_3=$chunk_encoding_bits_250;
      }

      $40=$chunk_encoding_bits_3&7;
      $41=$chunk_encoding_bits_3>>>3;
      $42=((888+$40)|0);
      $43=((HEAP8[($42)])|0);
      $44=($43&255);
      $i_043=0;
      while(1) {

       $46=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($21,$22))|0);
       $47=((HEAP32[(($prev_alpha0_endpoint_index)>>2)])|0);
       $48=((($47)+($46))|0);
       HEAP32[(($prev_alpha0_endpoint_index)>>2)]=$48;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha0_endpoint_index,$2);
       $49=((HEAP32[(($prev_alpha0_endpoint_index)>>2)])|0);
       $50=((__ZN4crnd6vectorItEixEj($1,$49))|0);
       $51=((HEAP16[(($50)>>1)])|0);
       $52=($51&65535);
       $53=(($alpha0_endpoints+($i_043<<2))|0);
       HEAP32[(($53)>>2)]=$52;
       $54=((($i_043)+(1))|0);
       $55=($54>>>0)<($44>>>0);
       if ($55) {
        $i_043=$54;
       } else {
        $pD_0_in46=$pBlock_148;$by_047=0;
        break;
       }
      }
      while(1) {


       $57=($by_047|0)==0;
       $brmerge41=$57|$phitmp42_;
       $58=$by_047<<1;
       $59=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($18,$19))|0);
       $60=((HEAP32[(($prev_alpha0_selector_index)>>2)])|0);
       $61=((($60)+($59))|0);
       HEAP32[(($prev_alpha0_selector_index)>>2)]=$61;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha0_selector_index,$6);
       if ($brmerge41) {
        $pD_0=$pD_0_in46;
        $63=((896+($40<<2)+$58)|0);
        $64=((HEAP8[($63)])|0);
        $65=($64&255);
        $66=((HEAP32[(($prev_alpha0_selector_index)>>2)])|0);
        $67=((($66)*(3))&-1);
        $68=((__ZN4crnd6vectorItEixEj($20,$67))|0);
        $69=(($alpha0_endpoints+($65<<2))|0);
        $70=((HEAP32[(($69)>>2)])|0);
        $71=((HEAP16[(($68)>>1)])|0);
        $72=($71&65535);
        $73=$72<<16;
        $74=$73|$70;
        HEAP32[(($pD_0)>>2)]=$74;
        $75=(($68+2)|0);
        $76=((HEAP16[(($75)>>1)])|0);
        $77=($76&65535);
        $78=(($68+4)|0);
        $79=((HEAP16[(($78)>>1)])|0);
        $80=($79&65535);
        $81=$80<<16;
        $82=$81|$77;
        $83=(($pD_0_in46+4)|0);
        $84=$83;
        HEAP32[(($84)>>2)]=$82;
       }
       $86=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($18,$19))|0);
       $87=((HEAP32[(($prev_alpha0_selector_index)>>2)])|0);
       $88=((($87)+($86))|0);
       HEAP32[(($prev_alpha0_selector_index)>>2)]=$88;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha0_selector_index,$6);
       $notlhs=($17|0)!=0;
       $notrhs=($x_049|0)==($23|0);
       $_phitmp_not=$notrhs&$notlhs;
       $brmerge41_not=$brmerge41^1;
       $brmerge=$_phitmp_not|$brmerge41_not;
       if (!($brmerge)) {
        $99=(($pD_0_in46+8)|0);
        $100=$99;
        $101=$58|1;
        $102=((896+($40<<2)+$101)|0);
        $103=((HEAP8[($102)])|0);
        $104=($103&255);
        $105=((HEAP32[(($prev_alpha0_selector_index)>>2)])|0);
        $106=((($105)*(3))&-1);
        $107=((__ZN4crnd6vectorItEixEj($20,$106))|0);
        $108=(($alpha0_endpoints+($104<<2))|0);
        $109=((HEAP32[(($108)>>2)])|0);
        $110=((HEAP16[(($107)>>1)])|0);
        $111=($110&65535);
        $112=$111<<16;
        $113=$112|$109;
        HEAP32[(($100)>>2)]=$113;
        $114=(($107+2)|0);
        $115=((HEAP16[(($114)>>1)])|0);
        $116=($115&65535);
        $117=(($107+4)|0);
        $118=((HEAP16[(($117)>>1)])|0);
        $119=($118&65535);
        $120=$119<<16;
        $121=$120|$116;
        $122=(($pD_0_in46+12)|0);
        $123=$122;
        HEAP32[(($123)>>2)]=$121;
       }
       $125=(($pD_0_in46+$row_pitch_in_bytes)|0);
       $126=((($by_047)+(1))|0);
       $127=($126>>>0)<((2)>>>0);
       if ($127) {
        $pD_0_in46=$125;$by_047=$126;
       } else {
        break;
       }
      }
      $90=(($pBlock_148+$block_delta_0)|0);
      $91=((($x_049)+($dir_x_0))|0);
      $92=($91|0)==($end_x_0|0);
      if ($92) {
       $chunk_encoding_bits_2_lcssa=$41;
       break;
      } else {
       $pBlock_148=$90;$x_049=$91;$chunk_encoding_bits_250=$41;
      }
     }
    }

    $93=(($pRow_053+$14)|0);
    $94=((($y_052)+(1))|0);
    $95=($94>>>0)<($chunks_y>>>0);
    if ($95) {
     $y_052=$94;$pRow_053=$93;$chunk_encoding_bits_154=$chunk_encoding_bits_2_lcssa;
    } else {
     $chunk_encoding_bits_1_lcssa=$chunk_encoding_bits_2_lcssa;
     break;
    }
   }
  }

  $96=((($f_059)+(1))|0);
  $97=($96>>>0)<($9>>>0);
  if ($97) {
   $f_059=$96;$chunk_encoding_bits_060=$chunk_encoding_bits_1_lcssa;
  } else {
   break;
  }
 }
 STACKTOP=sp;return ((1)|0);
}


function __ZN4crnd12crn_unpacker10unpack_dxnEPPhjjjjjj($this,$pDst,$dst_size_in_bytes,$row_pitch_in_bytes,$blocks_x,$blocks_y,$chunks_x,$chunks_y){
 $this=($this)|0;
 $pDst=($pDst)|0;
 $dst_size_in_bytes=($dst_size_in_bytes)|0;
 $row_pitch_in_bytes=($row_pitch_in_bytes)|0;
 $blocks_x=($blocks_x)|0;
 $blocks_y=($blocks_y)|0;
 $chunks_x=($chunks_x)|0;
 $chunks_y=($chunks_y)|0;
 var $prev_alpha0_endpoint_index=0,$prev_alpha0_selector_index=0,$prev_alpha1_endpoint_index=0,$prev_alpha1_selector_index=0,$alpha0_endpoints=0,$alpha1_endpoints=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$phitmp52=0;
 var $14=0,$15=0,$16=0,$17=0,$18=0,$19=0,$20=0,$21=0,$22=0,$23=0,$24=0,$25=0,$26=0,$27=0,$chunk_encoding_bits_073=0,$f_072=0,$29=0,$30=0,$chunk_encoding_bits_167=0,$pRow_066=0;
 var $y_065=0,$32=0,$33=0,$35=0,$pBlock_0=0,$block_delta_0=0,$dir_x_0=0,$end_x_0=0,$start_x_0=0,$not_=0,$phitmp52_=0,$37=0,$chunk_encoding_bits_263=0,$pBlock_162=0,$x_061=0,$38=0,$40=0,$41=0,$chunk_encoding_bits_3=0,$42=0;
 var $43=0,$44=0,$45=0,$46=0,$i_053=0,$48=0,$49=0,$50=0,$51=0,$52=0,$53=0,$54=0,$55=0,$56=0,$57=0,$i1_055=0,$58=0,$59=0,$60=0,$61=0;
 var $62=0,$63=0,$64=0,$65=0,$66=0,$67=0,$by_060=0,$pD_0_in59=0,$69=0,$brmerge51=0,$70=0,$71=0,$72=0,$73=0,$74=0,$75=0,$76=0,$pD_0=0,$78=0,$79=0;
 var $80=0,$81=0,$82=0,$83=0,$84=0,$85=0,$86=0,$87=0,$88=0,$89=0,$90=0,$91=0,$92=0,$93=0,$94=0,$95=0,$96=0,$97=0,$98=0,$99=0;
 var $100=0,$101=0,$102=0,$103=0,$104=0,$105=0,$106=0,$107=0,$108=0,$109=0,$110=0,$111=0,$112=0,$113=0,$114=0,$115=0,$116=0,$117=0,$118=0,$119=0;
 var $120=0,$122=0,$123=0,$124=0,$125=0,$126=0,$127=0,$notlhs=0,$notrhs=0,$_phitmp_not=0,$brmerge51_not=0,$brmerge=0,$129=0,$130=0,$131=0,$chunk_encoding_bits_2_lcssa=0,$132=0,$133=0,$134=0,$chunk_encoding_bits_1_lcssa=0;
 var $135=0,$136=0,$138=0,$139=0,$140=0,$141=0,$142=0,$143=0,$144=0,$145=0,$146=0,$147=0,$148=0,$149=0,$150=0,$151=0,$152=0,$153=0,$154=0,$155=0;
 var $156=0,$157=0,$158=0,$159=0,$160=0,$161=0,$162=0,$163=0,$164=0,$165=0,$166=0,$167=0,$168=0,$169=0,$170=0,$171=0,$172=0,$173=0,$174=0,$175=0;
 var $176=0,$177=0,$178=0,$179=0,$180=0,$181=0,$182=0,$183=0,$185=0,$186=0,$187=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+64)|0;
 $prev_alpha0_endpoint_index=((sp)|0);
 $prev_alpha0_selector_index=(((sp)+(8))|0);
 $prev_alpha1_endpoint_index=(((sp)+(16))|0);
 $prev_alpha1_selector_index=(((sp)+(24))|0);
 $alpha0_endpoints=(((sp)+(32))|0);
 $alpha1_endpoints=(((sp)+(48))|0);
 $1=(($this+268)|0);
 $2=((__ZNK4crnd6vectorItE4sizeEv($1))|0);
 $3=(($this+88)|0);
 $4=((HEAP32[(($3)>>2)])|0);
 $5=(($4+63)|0);
 $6=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($5))|0);
 HEAP32[(($prev_alpha0_endpoint_index)>>2)]=0;
 HEAP32[(($prev_alpha0_selector_index)>>2)]=0;
 HEAP32[(($prev_alpha1_endpoint_index)>>2)]=0;
 HEAP32[(($prev_alpha1_selector_index)>>2)]=0;
 $7=((HEAP32[(($3)>>2)])|0);
 $8=(($7+17)|0);
 $9=((__ZNK4crnd15crn_packed_uintILj1EEcvjEv($8))|0);
 $10=($9|0)==0;
 if ($10) {
  STACKTOP=sp;return ((1)|0);
 }
 $11=($chunks_y|0)==0;
 $12=((($chunks_y)-(1))|0);
 $13=$blocks_y&1;
 $phitmp52=($13|0)==0;
 $14=$row_pitch_in_bytes<<1;
 $15=(($this+92)|0);
 $16=(($this+116)|0);
 $17=$blocks_x&1;
 $18=(($this+92)|0);
 $19=(($this+212)|0);
 $20=(($this+284)|0);
 $21=(($this+92)|0);
 $22=(($this+164)|0);
 $23=(($this+92)|0);
 $24=(($this+164)|0);
 $25=((($chunks_x)-(1))|0);
 $26=((($chunks_x)-(1))|0);
 $27=$26<<5;
 $f_072=0;$chunk_encoding_bits_073=1;
 while(1) {


  if ($11) {
   $chunk_encoding_bits_1_lcssa=$chunk_encoding_bits_073;
  } else {
   $29=(($pDst+($f_072<<2))|0);
   $30=((HEAP32[(($29)>>2)])|0);
   $y_065=0;$pRow_066=$30;$chunk_encoding_bits_167=$chunk_encoding_bits_073;
   while(1) {



    $32=$y_065&1;
    $33=($32|0)==0;
    if ($33) {
     $start_x_0=0;$end_x_0=$chunks_x;$dir_x_0=1;$block_delta_0=32;$pBlock_0=$pRow_066;
    } else {
     $35=(($pRow_066+$27)|0);
     $start_x_0=$26;$end_x_0=-1;$dir_x_0=-1;$block_delta_0=-32;$pBlock_0=$35;
    }





    $not_=($y_065|0)!=($12|0);
    $phitmp52_=$phitmp52|$not_;
    $37=($start_x_0|0)==($end_x_0|0);
    if ($37) {
     $chunk_encoding_bits_2_lcssa=$chunk_encoding_bits_167;
    } else {
     $x_061=$start_x_0;$pBlock_162=$pBlock_0;$chunk_encoding_bits_263=$chunk_encoding_bits_167;
     while(1) {



      $38=($chunk_encoding_bits_263|0)==1;
      if ($38) {
       $40=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($15,$16))|0);
       $41=$40|512;
       $chunk_encoding_bits_3=$41;
      } else {
       $chunk_encoding_bits_3=$chunk_encoding_bits_263;
      }

      $42=$chunk_encoding_bits_3&7;
      $43=$chunk_encoding_bits_3>>>3;
      $44=((888+$42)|0);
      $45=((HEAP8[($44)])|0);
      $46=($45&255);
      $i_053=0;
      while(1) {

       $48=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($23,$24))|0);
       $49=((HEAP32[(($prev_alpha0_endpoint_index)>>2)])|0);
       $50=((($49)+($48))|0);
       HEAP32[(($prev_alpha0_endpoint_index)>>2)]=$50;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha0_endpoint_index,$2);
       $51=((HEAP32[(($prev_alpha0_endpoint_index)>>2)])|0);
       $52=((__ZN4crnd6vectorItEixEj($1,$51))|0);
       $53=((HEAP16[(($52)>>1)])|0);
       $54=($53&65535);
       $55=(($alpha0_endpoints+($i_053<<2))|0);
       HEAP32[(($55)>>2)]=$54;
       $56=((($i_053)+(1))|0);
       $57=($56>>>0)<($46>>>0);
       if ($57) {
        $i_053=$56;
       } else {
        $i1_055=0;
        break;
       }
      }
      while(1) {

       $58=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($21,$22))|0);
       $59=((HEAP32[(($prev_alpha1_endpoint_index)>>2)])|0);
       $60=((($59)+($58))|0);
       HEAP32[(($prev_alpha1_endpoint_index)>>2)]=$60;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha1_endpoint_index,$2);
       $61=((HEAP32[(($prev_alpha1_endpoint_index)>>2)])|0);
       $62=((__ZN4crnd6vectorItEixEj($1,$61))|0);
       $63=((HEAP16[(($62)>>1)])|0);
       $64=($63&65535);
       $65=(($alpha1_endpoints+($i1_055<<2))|0);
       HEAP32[(($65)>>2)]=$64;
       $66=((($i1_055)+(1))|0);
       $67=($66>>>0)<($46>>>0);
       if ($67) {
        $i1_055=$66;
       } else {
        $pD_0_in59=$pBlock_162;$by_060=0;
        break;
       }
      }
      while(1) {


       $69=($by_060|0)==0;
       $brmerge51=$69|$phitmp52_;
       $70=$by_060<<1;
       $71=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($18,$19))|0);
       $72=((HEAP32[(($prev_alpha0_selector_index)>>2)])|0);
       $73=((($72)+($71))|0);
       HEAP32[(($prev_alpha0_selector_index)>>2)]=$73;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha0_selector_index,$6);
       $74=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($18,$19))|0);
       $75=((HEAP32[(($prev_alpha1_selector_index)>>2)])|0);
       $76=((($75)+($74))|0);
       HEAP32[(($prev_alpha1_selector_index)>>2)]=$76;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha1_selector_index,$6);
       if ($brmerge51) {
        $pD_0=$pD_0_in59;
        $78=((896+($42<<2)+$70)|0);
        $79=((HEAP8[($78)])|0);
        $80=($79&255);
        $81=((HEAP32[(($prev_alpha0_selector_index)>>2)])|0);
        $82=((($81)*(3))&-1);
        $83=((__ZN4crnd6vectorItEixEj($20,$82))|0);
        $84=((HEAP32[(($prev_alpha1_selector_index)>>2)])|0);
        $85=((($84)*(3))&-1);
        $86=((__ZN4crnd6vectorItEixEj($20,$85))|0);
        $87=(($alpha0_endpoints+($80<<2))|0);
        $88=((HEAP32[(($87)>>2)])|0);
        $89=((HEAP16[(($83)>>1)])|0);
        $90=($89&65535);
        $91=$90<<16;
        $92=$91|$88;
        HEAP32[(($pD_0)>>2)]=$92;
        $93=(($83+2)|0);
        $94=((HEAP16[(($93)>>1)])|0);
        $95=($94&65535);
        $96=(($83+4)|0);
        $97=((HEAP16[(($96)>>1)])|0);
        $98=($97&65535);
        $99=$98<<16;
        $100=$99|$95;
        $101=(($pD_0_in59+4)|0);
        $102=$101;
        HEAP32[(($102)>>2)]=$100;
        $103=(($alpha1_endpoints+($80<<2))|0);
        $104=((HEAP32[(($103)>>2)])|0);
        $105=((HEAP16[(($86)>>1)])|0);
        $106=($105&65535);
        $107=$106<<16;
        $108=$107|$104;
        $109=(($pD_0_in59+8)|0);
        $110=$109;
        HEAP32[(($110)>>2)]=$108;
        $111=(($86+2)|0);
        $112=((HEAP16[(($111)>>1)])|0);
        $113=($112&65535);
        $114=(($86+4)|0);
        $115=((HEAP16[(($114)>>1)])|0);
        $116=($115&65535);
        $117=$116<<16;
        $118=$117|$113;
        $119=(($pD_0_in59+12)|0);
        $120=$119;
        HEAP32[(($120)>>2)]=$118;
       }
       $122=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($18,$19))|0);
       $123=((HEAP32[(($prev_alpha0_selector_index)>>2)])|0);
       $124=((($123)+($122))|0);
       HEAP32[(($prev_alpha0_selector_index)>>2)]=$124;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha0_selector_index,$6);
       $125=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($18,$19))|0);
       $126=((HEAP32[(($prev_alpha1_selector_index)>>2)])|0);
       $127=((($126)+($125))|0);
       HEAP32[(($prev_alpha1_selector_index)>>2)]=$127;
       __ZN4crnd12crn_unpacker5limitERjj($prev_alpha1_selector_index,$6);
       $notlhs=($17|0)!=0;
       $notrhs=($x_061|0)==($25|0);
       $_phitmp_not=$notrhs&$notlhs;
       $brmerge51_not=$brmerge51^1;
       $brmerge=$_phitmp_not|$brmerge51_not;
       if (!($brmerge)) {
        $138=(($pD_0_in59+16)|0);
        $139=$138;
        $140=$70|1;
        $141=((896+($42<<2)+$140)|0);
        $142=((HEAP8[($141)])|0);
        $143=($142&255);
        $144=((HEAP32[(($prev_alpha0_selector_index)>>2)])|0);
        $145=((($144)*(3))&-1);
        $146=((__ZN4crnd6vectorItEixEj($20,$145))|0);
        $147=((HEAP32[(($prev_alpha1_selector_index)>>2)])|0);
        $148=((($147)*(3))&-1);
        $149=((__ZN4crnd6vectorItEixEj($20,$148))|0);
        $150=(($alpha0_endpoints+($143<<2))|0);
        $151=((HEAP32[(($150)>>2)])|0);
        $152=((HEAP16[(($146)>>1)])|0);
        $153=($152&65535);
        $154=$153<<16;
        $155=$154|$151;
        HEAP32[(($139)>>2)]=$155;
        $156=(($146+2)|0);
        $157=((HEAP16[(($156)>>1)])|0);
        $158=($157&65535);
        $159=(($146+4)|0);
        $160=((HEAP16[(($159)>>1)])|0);
        $161=($160&65535);
        $162=$161<<16;
        $163=$162|$158;
        $164=(($pD_0_in59+20)|0);
        $165=$164;
        HEAP32[(($165)>>2)]=$163;
        $166=(($alpha1_endpoints+($143<<2))|0);
        $167=((HEAP32[(($166)>>2)])|0);
        $168=((HEAP16[(($149)>>1)])|0);
        $169=($168&65535);
        $170=$169<<16;
        $171=$170|$167;
        $172=(($pD_0_in59+24)|0);
        $173=$172;
        HEAP32[(($173)>>2)]=$171;
        $174=(($149+2)|0);
        $175=((HEAP16[(($174)>>1)])|0);
        $176=($175&65535);
        $177=(($149+4)|0);
        $178=((HEAP16[(($177)>>1)])|0);
        $179=($178&65535);
        $180=$179<<16;
        $181=$180|$176;
        $182=(($pD_0_in59+28)|0);
        $183=$182;
        HEAP32[(($183)>>2)]=$181;
       }
       $185=(($pD_0_in59+$row_pitch_in_bytes)|0);
       $186=((($by_060)+(1))|0);
       $187=($186>>>0)<((2)>>>0);
       if ($187) {
        $pD_0_in59=$185;$by_060=$186;
       } else {
        break;
       }
      }
      $129=(($pBlock_162+$block_delta_0)|0);
      $130=((($x_061)+($dir_x_0))|0);
      $131=($130|0)==($end_x_0|0);
      if ($131) {
       $chunk_encoding_bits_2_lcssa=$43;
       break;
      } else {
       $x_061=$130;$pBlock_162=$129;$chunk_encoding_bits_263=$43;
      }
     }
    }

    $132=(($pRow_066+$14)|0);
    $133=((($y_065)+(1))|0);
    $134=($133>>>0)<($chunks_y>>>0);
    if ($134) {
     $y_065=$133;$pRow_066=$132;$chunk_encoding_bits_167=$chunk_encoding_bits_2_lcssa;
    } else {
     $chunk_encoding_bits_1_lcssa=$chunk_encoding_bits_2_lcssa;
     break;
    }
   }
  }

  $135=((($f_072)+(1))|0);
  $136=($135>>>0)<($9>>>0);
  if ($136) {
   $f_072=$135;$chunk_encoding_bits_073=$chunk_encoding_bits_1_lcssa;
  } else {
   break;
  }
 }
 STACKTOP=sp;return ((1)|0);
}


function __ZNK4crnd6vectorItE4sizeEv($this){
 $this=($this)|0;
 var $1=0,$2=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 return (($2)|0);
}


function __ZN4crnd12crn_unpacker5limitERjj($x,$n){
 $x=($x)|0;
 $n=($n)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,label=0;

 $1=((HEAP32[(($x)>>2)])|0);
 $2=((($1)-($n))|0);
 $3=$2>>31;
 $4=$3&$1;
 $5=$3^-1;
 $6=$2&$5;
 $7=$4|$6;
 HEAP32[(($x)>>2)]=$7;
 return;
}


function __ZN4crnd6vectorItEixEj($this,$i){
 $this=($this)|0;
 $i=($i)|0;
 var $1=0,$2=0,$3=0,$6=0,$7=0,$8=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2>>>0)>($i>>>0);
 if (!($3)) {
  __ZN4crnd11crnd_assertEPKcS1_j(312,488,906);
 }
 $6=(($this)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=(($7+($i<<1))|0);
 return (($8)|0);
}


function __ZNK4crnd6vectorIjE4sizeEv($this){
 $this=($this)|0;
 var $1=0,$2=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 return (($2)|0);
}


function __ZN4crnd6vectorIjEixEj($this,$i){
 $this=($this)|0;
 $i=($i)|0;
 var $1=0,$2=0,$3=0,$6=0,$7=0,$8=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2>>>0)>($i>>>0);
 if (!($3)) {
  __ZN4crnd11crnd_assertEPKcS1_j(312,488,906);
 }
 $6=(($this)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=(($7+($i<<2))|0);
 return (($8)|0);
}


function __ZN4crnd12crn_unpacker11init_tablesEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$13=0,$14=0,$16=0,$17=0,$18=0,$19=0,$21=0,$22=0,$23=0;
 var $25=0,$26=0,$27=0,$28=0,$30=0,$31=0,$33=0,$34=0,$36=0,$37=0,$38=0,$39=0,$41=0,$42=0,$44=0,$45=0,$_0=0,label=0;

 $1=(($this+92)|0);
 $2=(($this+4)|0);
 $3=((HEAP32[(($2)>>2)])|0);
 $4=(($this+88)|0);
 $5=((HEAP32[(($4)>>2)])|0);
 $6=(($5+67)|0);
 $7=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($6))|0);
 $8=(($3+$7)|0);
 $9=(($5+65)|0);
 $10=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($9))|0);
 $11=((__ZN4crnd12symbol_codec14start_decodingEPKhj($1,$8,$10))|0);
 if (!($11)) {
  $_0=0;

  return (($_0)|0);
 }
 $13=(($this+116)|0);
 $14=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($1,$13))|0);
 if (!($14)) {
  $_0=0;

  return (($_0)|0);
 }
 $16=((HEAP32[(($4)>>2)])|0);
 $17=(($16+39)|0);
 $18=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($17))|0);
 $19=($18|0)==0;
 do {
  if ($19) {
   $21=(($16+55)|0);
   $22=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($21))|0);
   $23=($22|0)==0;
   if ($23) {
    $_0=0;
   } else {
    break;
   }

   return (($_0)|0);
  }
 } while(0);
 $25=((HEAP32[(($4)>>2)])|0);
 $26=(($25+39)|0);
 $27=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($26))|0);
 $28=($27|0)==0;
 do {
  if (!($28)) {
   $30=(($this+140)|0);
   $31=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($1,$30))|0);
   if (!($31)) {
    $_0=0;

    return (($_0)|0);
   }
   $33=(($this+188)|0);
   $34=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($1,$33))|0);
   if ($34) {
    break;
   } else {
    $_0=0;
   }

   return (($_0)|0);
  }
 } while(0);
 $36=((HEAP32[(($4)>>2)])|0);
 $37=(($36+55)|0);
 $38=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($37))|0);
 $39=($38|0)==0;
 do {
  if (!($39)) {
   $41=(($this+164)|0);
   $42=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($1,$41))|0);
   if (!($42)) {
    $_0=0;

    return (($_0)|0);
   }
   $44=(($this+212)|0);
   $45=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($1,$44))|0);
   if ($45) {
    break;
   } else {
    $_0=0;
   }

   return (($_0)|0);
  }
 } while(0);
 $_0=1;

 return (($_0)|0);
}


function __ZN4crnd12crn_unpacker15decode_palettesEv($this){
 $this=($this)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$9=0,$11=0,$12=0,$13=0,$14=0,$16=0,$18=0,$_0=0,label=0;

 $1=(($this+88)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($2+39)|0);
 $4=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($3))|0);
 $5=($4|0)==0;
 do {
  if (!($5)) {
   $7=((__ZN4crnd12crn_unpacker22decode_color_endpointsEv($this))|0);
   if (!($7)) {
    $_0=0;

    return (($_0)|0);
   }
   $9=((__ZN4crnd12crn_unpacker22decode_color_selectorsEv($this))|0);
   if ($9) {
    break;
   } else {
    $_0=0;
   }

   return (($_0)|0);
  }
 } while(0);
 $11=((HEAP32[(($1)>>2)])|0);
 $12=(($11+55)|0);
 $13=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($12))|0);
 $14=($13|0)==0;
 do {
  if (!($14)) {
   $16=((__ZN4crnd12crn_unpacker22decode_alpha_endpointsEv($this))|0);
   if (!($16)) {
    $_0=0;

    return (($_0)|0);
   }
   $18=((__ZN4crnd12crn_unpacker22decode_alpha_selectorsEv($this))|0);
   if ($18) {
    break;
   } else {
    $_0=0;
   }

   return (($_0)|0);
  }
 } while(0);
 $_0=1;

 return (($_0)|0);
}


function __ZN4crnd12crn_unpacker22decode_color_endpointsEv($this){
 $this=($this)|0;
 var $dm=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$14=0,$15=0,$16=0,$17=0,$18=0,$19=0,$i_0=0;
 var $21=0,$23=0,$24=0,$26=0,$28=0,$29=0,$30=0,$a_028=0,$i1_027=0,$pDst_026=0,$f_025=0,$e_024=0,$d_023=0,$c_022=0,$b_021=0,$32=0,$33=0,$34=0,$35=0,$36=0;
 var $37=0,$38=0,$39=0,$40=0,$41=0,$42=0,$43=0,$44=0,$45=0,$46=0,$47=0,$48=0,$49=0,$50=0,$51=0,$52=0,$53=0,$54=0,$55=0,$56=0;
 var $57=0,$58=0,$59=0,$60=0,$61=0,$62=0,$_0=0,$63=0,$65=0,$_lcssa=0,$68=0,$69=0,$70=0,$71=0,$72=0,$74=0,$77=0,$79=0,$80=0,$81=0;
 var $_1=0,$_015=0,$_014=0,$82$0=0,$82$1=0,$83$0=0,$83$1=0,$67$0=0,$67$1=0,$76$0=0,$76$1=0,$lpad_loopexit$0=0,$lpad_loopexit$1=0,$lpad_nonloopexit$0=0,$lpad_nonloopexit$1=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+48)|0;
 $dm=((sp)|0);
 $1=(($this+88)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($2+39)|0);
 $4=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($3))|0);
 $5=(($this+236)|0);
 $6=((__ZN4crnd6vectorIjE6resizeEj($5,$4))|0);
 if (!($6)) {
  $_1=0;

  STACKTOP=sp;return (($_1)|0);
 }
 $8=(($this+92)|0);
 $9=(($this+4)|0);
 $10=((HEAP32[(($9)>>2)])|0);
 $11=((HEAP32[(($1)>>2)])|0);
 $12=(($11+33)|0);
 $13=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($12))|0);
 $14=(($10+$13)|0);
 $15=(($11+36)|0);
 $16=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($15))|0);
 $17=((__ZN4crnd12symbol_codec14start_decodingEPKhj($8,$14,$16))|0);
 if (!($17)) {
  $_1=0;

  STACKTOP=sp;return (($_1)|0);
 }
 $18=(($dm)|0);
 __ZN4crnd25static_huffman_data_modelC2Ev($18);
 $19=(($dm+24)|0);
 __ZN4crnd25static_huffman_data_modelC2Ev($19);
 $i_0=0;
 while(1) {

  $21=($i_0>>>0)<((2)>>>0);
  if (!($21)) {
   label = 7;
   break;
  }
  $23=(($dm+((($i_0)*(24))&-1))|0);
  $24=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($8,$23))|0);
  $26=((($i_0)+(1))|0);
  if ($24) {
   $i_0=$26;
  } else {
   $_0=0;
   break;
  }
 }
 do {
  if ((label|0) == 7) {
   $28=((__ZN4crnd6vectorIjEixEj($5,0))|0);
   $29=($4|0)==0;
   if ($29) {
    $_0=1;
    break;
   }
   $30=(($dm+24)|0);
   $b_021=0;$c_022=0;$d_023=0;$e_024=0;$f_025=0;$pDst_026=$28;$i1_027=0;$a_028=0;
   while(1) {








    $32=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($8,$18))|0);
    $33=((($32)+($a_028))|0);
    $34=$33&31;
    $35=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($8,$30))|0);
    $36=((($35)+($b_021))|0);
    $37=$36&63;
    $38=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($8,$18))|0);
    $39=((($38)+($c_022))|0);
    $40=$39&31;
    $41=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($8,$18))|0);
    $42=((($41)+($d_023))|0);
    $43=$42&31;
    $44=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($8,$30))|0);
    $45=((($44)+($e_024))|0);
    $46=$45&63;
    $47=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($8,$18))|0);
    $48=((($47)+($f_025))|0);
    $49=$48&31;
    $50=$37<<5;
    $51=$34<<11;
    $52=$49<<16;
    $53=$46<<21;
    $54=$42<<27;
    $55=$50|$51;
    $56=$55|$40;
    $57=$56|$54;
    $58=$57|$53;
    $59=$58|$52;
    $60=(($pDst_026+4)|0);
    HEAP32[(($pDst_026)>>2)]=$59;
    $61=((($i1_027)+(1))|0);
    $62=($61>>>0)<($4>>>0);
    if ($62) {
     $b_021=$37;$c_022=$40;$d_023=$43;$e_024=$46;$f_025=$49;$pDst_026=$60;$i1_027=$61;$a_028=$34;
    } else {
     $_0=1;
     break;
    }
   }
  }
 } while(0);

 $63=(($dm+24)|0);
 __ZN4crnd25static_huffman_data_modelD2Ev($63);
 $65=(($dm)|0);
 __ZN4crnd25static_huffman_data_modelD2Ev($65);
 $_1=$_0;

 STACKTOP=sp;return (($_1)|0);
}


function __ZN4crnd12crn_unpacker22decode_color_selectorsEv($this){
 $this=($this)|0;
 var $dm=0,$delta0=0,$delta1=0,$cur=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$15=0,$i_038=0,$m_037=0;
 var $l_036=0,$19=0,$20=0,$21=0,$22=0,$_=0,$23=0,$_m_0=0,$24=0,$25=0,$27=0,$28=0,$31=0,$32=0,$33=0,$34=0,$35=0,$36=0,$37=0,$38=0;
 var $39=0,$40=0,$41=0,$42=0,$43=0,$44=0,$45=0,$46=0,$47=0,$48=0,$i1_034=0,$pDst_033=0,$j_032=0,$50=0,$51=0,$52=0,$53=0,$54=0,$55=0,$56=0;
 var $57=0,$58=0,$59=0,$60=0,$61=0,$62=0,$63=0,$64=0,$65=0,$66=0,$68=0,$69=0,$70=0,$71=0,$72=0,$73=0,$74=0,$75=0,$76=0,$77=0;
 var $78=0,$79=0,$80=0,$81=0,$82=0,$83=0,$84=0,$85=0,$86=0,$87=0,$88=0,$89=0,$90=0,$91=0,$92=0,$93=0,$94=0,$95=0,$96=0,$97=0;
 var $98=0,$99=0,$100=0,$101=0,$102=0,$103=0,$104=0,$105=0,$106=0,$107=0,$108=0,$109=0,$110=0,$111=0,$112=0,$113=0,$114=0,$115=0,$116=0,$117=0;
 var $118=0,$119=0,$120=0,$121=0,$122=0,$123=0,$124=0,$125=0,$126=0,$127=0,$128=0,$129=0,$130=0,$131=0,$132=0,$133=0,$134=0,$135=0,$136=0,$137=0;
 var $138=0,$139=0,$140=0,$141=0,$142=0,$143=0,$144=0,$145=0,$146=0,$147=0,$148=0,$149=0,$150=0,$151=0,$152=0,$153=0,$154=0,$155=0,$156=0,$157=0;
 var $158=0,$159=0,$160=0,$161=0,$162=0,$163=0,$164=0,$_0=0,$_1=0,$18$0=0,$18$1=0,$168$0=0,$168$1=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+488)|0;
 $dm=((sp)|0);
 $delta0=(((sp)+(24))|0);
 $delta1=(((sp)+(224))|0);
 $cur=(((sp)+(424))|0);
 $1=(($this+88)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($2+47)|0);
 $4=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($3))|0);
 $5=(($this+92)|0);
 $6=(($this+4)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=(($2+41)|0);
 $9=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($8))|0);
 $10=(($7+$9)|0);
 $11=(($2+44)|0);
 $12=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($11))|0);
 $13=((__ZN4crnd12symbol_codec14start_decodingEPKhj($5,$10,$12))|0);
 if (!($13)) {
  $_1=0;

  STACKTOP=sp;return (($_1)|0);
 }
 __ZN4crnd25static_huffman_data_modelC2Ev($dm);
 $15=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($5,$dm))|0);
 do {
  if ($15) {
   $l_036=-3;$m_037=-3;$i_038=0;
   while(1) {



    $19=(($delta0+($i_038<<2))|0);
    HEAP32[(($19)>>2)]=$l_036;
    $20=(($delta1+($i_038<<2))|0);
    HEAP32[(($20)>>2)]=$m_037;
    $21=((($l_036)+(1))|0);
    $22=($21|0)>3;
    $_=($22?-3:$21);
    $23=($22&1);
    $_m_0=((($23)+($m_037))|0);
    $24=((($i_038)+(1))|0);
    $25=($24>>>0)<((49)>>>0);
    if ($25) {
     $l_036=$_;$m_037=$_m_0;$i_038=$24;
    } else {
     break;
    }
   }
   __ZN4crnd5utils11zero_objectIA16_jEEvRT_($cur);
   $27=(($this+252)|0);
   $28=((__ZN4crnd6vectorIjE6resizeEj($27,$4))|0);
   if (!($28)) {
    $_0=0;
    break;
   }
   $31=((__ZN4crnd6vectorIjEixEj($27,0))|0);
   $32=($4|0)==0;
   if ($32) {
    $_0=1;
    break;
   }
   $33=(($cur)|0);
   $34=(($cur+4)|0);
   $35=(($cur+8)|0);
   $36=(($cur+12)|0);
   $37=(($cur+16)|0);
   $38=(($cur+20)|0);
   $39=(($cur+24)|0);
   $40=(($cur+28)|0);
   $41=(($cur+32)|0);
   $42=(($cur+36)|0);
   $43=(($cur+40)|0);
   $44=(($cur+44)|0);
   $45=(($cur+48)|0);
   $46=(($cur+52)|0);
   $47=(($cur+56)|0);
   $48=(($cur+60)|0);
   $pDst_033=$31;$i1_034=0;
   while(1) {


    $j_032=0;
    while(1) {

     $50=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($5,$dm))|0);
     $51=(($delta0+($50<<2))|0);
     $52=((HEAP32[(($51)>>2)])|0);
     $53=$j_032<<1;
     $54=(($cur+($53<<2))|0);
     $55=((HEAP32[(($54)>>2)])|0);
     $56=((($55)+($52))|0);
     $57=$56&3;
     HEAP32[(($54)>>2)]=$57;
     $58=(($delta1+($50<<2))|0);
     $59=((HEAP32[(($58)>>2)])|0);
     $60=$53|1;
     $61=(($cur+($60<<2))|0);
     $62=((HEAP32[(($61)>>2)])|0);
     $63=((($62)+($59))|0);
     $64=$63&3;
     HEAP32[(($61)>>2)]=$64;
     $65=((($j_032)+(1))|0);
     $66=($65>>>0)<((8)>>>0);
     if ($66) {
      $j_032=$65;
     } else {
      break;
     }
    }
    $68=((HEAP32[(($33)>>2)])|0);
    $69=((944+$68)|0);
    $70=((HEAP8[($69)])|0);
    $71=($70&255);
    $72=((HEAP32[(($34)>>2)])|0);
    $73=((944+$72)|0);
    $74=((HEAP8[($73)])|0);
    $75=($74&255);
    $76=$75<<2;
    $77=$76|$71;
    $78=((HEAP32[(($35)>>2)])|0);
    $79=((944+$78)|0);
    $80=((HEAP8[($79)])|0);
    $81=($80&255);
    $82=$81<<4;
    $83=$77|$82;
    $84=((HEAP32[(($36)>>2)])|0);
    $85=((944+$84)|0);
    $86=((HEAP8[($85)])|0);
    $87=($86&255);
    $88=$87<<6;
    $89=$83|$88;
    $90=((HEAP32[(($37)>>2)])|0);
    $91=((944+$90)|0);
    $92=((HEAP8[($91)])|0);
    $93=($92&255);
    $94=$93<<8;
    $95=$89|$94;
    $96=((HEAP32[(($38)>>2)])|0);
    $97=((944+$96)|0);
    $98=((HEAP8[($97)])|0);
    $99=($98&255);
    $100=$99<<10;
    $101=$95|$100;
    $102=((HEAP32[(($39)>>2)])|0);
    $103=((944+$102)|0);
    $104=((HEAP8[($103)])|0);
    $105=($104&255);
    $106=$105<<12;
    $107=$101|$106;
    $108=((HEAP32[(($40)>>2)])|0);
    $109=((944+$108)|0);
    $110=((HEAP8[($109)])|0);
    $111=($110&255);
    $112=$111<<14;
    $113=$107|$112;
    $114=((HEAP32[(($41)>>2)])|0);
    $115=((944+$114)|0);
    $116=((HEAP8[($115)])|0);
    $117=($116&255);
    $118=$117<<16;
    $119=$113|$118;
    $120=((HEAP32[(($42)>>2)])|0);
    $121=((944+$120)|0);
    $122=((HEAP8[($121)])|0);
    $123=($122&255);
    $124=$123<<18;
    $125=$119|$124;
    $126=((HEAP32[(($43)>>2)])|0);
    $127=((944+$126)|0);
    $128=((HEAP8[($127)])|0);
    $129=($128&255);
    $130=$129<<20;
    $131=$125|$130;
    $132=((HEAP32[(($44)>>2)])|0);
    $133=((944+$132)|0);
    $134=((HEAP8[($133)])|0);
    $135=($134&255);
    $136=$135<<22;
    $137=$131|$136;
    $138=((HEAP32[(($45)>>2)])|0);
    $139=((944+$138)|0);
    $140=((HEAP8[($139)])|0);
    $141=($140&255);
    $142=$141<<24;
    $143=$137|$142;
    $144=((HEAP32[(($46)>>2)])|0);
    $145=((944+$144)|0);
    $146=((HEAP8[($145)])|0);
    $147=($146&255);
    $148=$147<<26;
    $149=$143|$148;
    $150=((HEAP32[(($47)>>2)])|0);
    $151=((944+$150)|0);
    $152=((HEAP8[($151)])|0);
    $153=($152&255);
    $154=$153<<28;
    $155=$149|$154;
    $156=((HEAP32[(($48)>>2)])|0);
    $157=((944+$156)|0);
    $158=((HEAP8[($157)])|0);
    $159=($158&255);
    $160=$159<<30;
    $161=$155|$160;
    $162=(($pDst_033+4)|0);
    HEAP32[(($pDst_033)>>2)]=$161;
    $163=((($i1_034)+(1))|0);
    $164=($163>>>0)<($4>>>0);
    if ($164) {
     $pDst_033=$162;$i1_034=$163;
    } else {
     $_0=1;
     break;
    }
   }
  } else {
   $_0=0;
  }
 } while(0);

 __ZN4crnd25static_huffman_data_modelD2Ev($dm);
 $_1=$_0;

 STACKTOP=sp;return (($_1)|0);
}


function __ZN4crnd12crn_unpacker22decode_alpha_endpointsEv($this){
 $this=($this)|0;
 var $dm=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$15=0,$20=0,$21=0,$24=0,$25=0,$i_011=0;
 var $b_010=0,$a_09=0,$pDst_08=0,$26=0,$27=0,$28=0,$29=0,$30=0,$31=0,$32=0,$33=0,$34=0,$35=0,$36=0,$37=0,$_0=0,$_1=0,$18$0=0,$18$1=0,$41$0=0;
 var $41$1=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+24)|0;
 $dm=((sp)|0);
 $1=(($this+88)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($2+55)|0);
 $4=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($3))|0);
 $5=(($this+92)|0);
 $6=(($this+4)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=(($2+49)|0);
 $9=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($8))|0);
 $10=(($7+$9)|0);
 $11=(($2+52)|0);
 $12=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($11))|0);
 $13=((__ZN4crnd12symbol_codec14start_decodingEPKhj($5,$10,$12))|0);
 if (!($13)) {
  $_1=0;

  STACKTOP=sp;return (($_1)|0);
 }
 __ZN4crnd25static_huffman_data_modelC2Ev($dm);
 $15=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($5,$dm))|0);
 do {
  if ($15) {
   $20=(($this+268)|0);
   $21=((__ZN4crnd6vectorItE6resizeEj($20,$4))|0);
   if (!($21)) {
    $_0=0;
    break;
   }
   $24=((__ZN4crnd6vectorItEixEj($20,0))|0);
   $25=($4|0)==0;
   if ($25) {
    $_0=1;
    break;
   } else {
    $pDst_08=$24;$a_09=0;$b_010=0;$i_011=0;
   }
   while(1) {




    $26=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($5,$dm))|0);
    $27=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($5,$dm))|0);
    $28=((($26)+($a_09))|0);
    $29=$28&255;
    $30=((($27)+($b_010))|0);
    $31=$30&255;
    $32=$31<<8;
    $33=$32|$29;
    $34=(($33)&65535);
    $35=(($pDst_08+2)|0);
    HEAP16[(($pDst_08)>>1)]=$34;
    $36=((($i_011)+(1))|0);
    $37=($36>>>0)<($4>>>0);
    if ($37) {
     $pDst_08=$35;$a_09=$29;$b_010=$31;$i_011=$36;
    } else {
     $_0=1;
     break;
    }
   }
  } else {
   $_0=0;
  }
 } while(0);

 __ZN4crnd25static_huffman_data_modelD2Ev($dm);
 $_1=$_0;

 STACKTOP=sp;return (($_1)|0);
}


function __ZN4crnd12crn_unpacker22decode_alpha_selectorsEv($this){
 $this=($this)|0;
 var $dm=0,$delta0=0,$delta1=0,$cur=0,$1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$15=0,$i_042=0,$m_041=0;
 var $l_040=0,$19=0,$20=0,$21=0,$22=0,$_=0,$23=0,$_m_0=0,$24=0,$25=0,$27=0,$28=0,$29=0,$32=0,$33=0,$34=0,$35=0,$36=0,$37=0,$38=0;
 var $39=0,$40=0,$41=0,$42=0,$43=0,$44=0,$45=0,$46=0,$47=0,$48=0,$49=0,$i1_038=0,$pDst_037=0,$j_036=0,$51=0,$52=0,$53=0,$54=0,$55=0,$56=0;
 var $57=0,$58=0,$59=0,$60=0,$61=0,$62=0,$63=0,$64=0,$65=0,$66=0,$67=0,$69=0,$70=0,$71=0,$72=0,$73=0,$74=0,$75=0,$76=0,$77=0;
 var $78=0,$79=0,$80=0,$81=0,$82=0,$83=0,$84=0,$85=0,$86=0,$87=0,$88=0,$89=0,$90=0,$91=0,$92=0,$93=0,$94=0,$95=0,$96=0,$97=0;
 var $98=0,$99=0,$100=0,$101=0,$102=0,$103=0,$104=0,$105=0,$106=0,$107=0,$108=0,$109=0,$110=0,$111=0,$112=0,$113=0,$114=0,$115=0,$116=0,$117=0;
 var $118=0,$119=0,$120=0,$121=0,$122=0,$123=0,$124=0,$125=0,$126=0,$127=0,$128=0,$129=0,$130=0,$131=0,$132=0,$133=0,$134=0,$135=0,$136=0,$137=0;
 var $138=0,$139=0,$140=0,$141=0,$142=0,$143=0,$144=0,$145=0,$146=0,$147=0,$148=0,$149=0,$150=0,$151=0,$152=0,$153=0,$154=0,$155=0,$156=0,$157=0;
 var $158=0,$159=0,$160=0,$161=0,$162=0,$163=0,$164=0,$165=0,$166=0,$167=0,$168=0,$169=0,$170=0,$171=0,$172=0,$173=0,$174=0,$175=0,$176=0,$177=0;
 var $_0=0,$_1=0,$18$0=0,$18$1=0,$181$0=0,$181$1=0,label=0;
 var sp=0;sp=STACKTOP;STACKTOP=(STACKTOP+1896)|0;
 $dm=((sp)|0);
 $delta0=(((sp)+(24))|0);
 $delta1=(((sp)+(928))|0);
 $cur=(((sp)+(1832))|0);
 $1=(($this+88)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=(($2+63)|0);
 $4=((__ZNK4crnd15crn_packed_uintILj2EEcvjEv($3))|0);
 $5=(($this+92)|0);
 $6=(($this+4)|0);
 $7=((HEAP32[(($6)>>2)])|0);
 $8=(($2+57)|0);
 $9=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($8))|0);
 $10=(($7+$9)|0);
 $11=(($2+60)|0);
 $12=((__ZNK4crnd15crn_packed_uintILj3EEcvjEv($11))|0);
 $13=((__ZN4crnd12symbol_codec14start_decodingEPKhj($5,$10,$12))|0);
 if (!($13)) {
  $_1=0;

  STACKTOP=sp;return (($_1)|0);
 }
 __ZN4crnd25static_huffman_data_modelC2Ev($dm);
 $15=((__ZN4crnd12symbol_codec32decode_receive_static_data_modelERNS_25static_huffman_data_modelE($5,$dm))|0);
 do {
  if ($15) {
   $l_040=-7;$m_041=-7;$i_042=0;
   while(1) {



    $19=(($delta0+($i_042<<2))|0);
    HEAP32[(($19)>>2)]=$l_040;
    $20=(($delta1+($i_042<<2))|0);
    HEAP32[(($20)>>2)]=$m_041;
    $21=((($l_040)+(1))|0);
    $22=($21|0)>7;
    $_=($22?-7:$21);
    $23=($22&1);
    $_m_0=((($23)+($m_041))|0);
    $24=((($i_042)+(1))|0);
    $25=($24>>>0)<((225)>>>0);
    if ($25) {
     $l_040=$_;$m_041=$_m_0;$i_042=$24;
    } else {
     break;
    }
   }
   __ZN4crnd5utils11zero_objectIA16_jEEvRT_($cur);
   $27=(($this+284)|0);
   $28=((($4)*(3))&-1);
   $29=((__ZN4crnd6vectorItE6resizeEj($27,$28))|0);
   if (!($29)) {
    $_0=0;
    break;
   }
   $32=((__ZN4crnd6vectorItEixEj($27,0))|0);
   $33=($4|0)==0;
   if ($33) {
    $_0=1;
    break;
   }
   $34=(($cur)|0);
   $35=(($cur+4)|0);
   $36=(($cur+8)|0);
   $37=(($cur+12)|0);
   $38=(($cur+16)|0);
   $39=(($cur+20)|0);
   $40=(($cur+24)|0);
   $41=(($cur+28)|0);
   $42=(($cur+32)|0);
   $43=(($cur+36)|0);
   $44=(($cur+40)|0);
   $45=(($cur+44)|0);
   $46=(($cur+48)|0);
   $47=(($cur+52)|0);
   $48=(($cur+56)|0);
   $49=(($cur+60)|0);
   $pDst_037=$32;$i1_038=0;
   while(1) {


    $j_036=0;
    while(1) {

     $51=((__ZN4crnd12symbol_codec6decodeERKNS_25static_huffman_data_modelE($5,$dm))|0);
     $52=(($delta0+($51<<2))|0);
     $53=((HEAP32[(($52)>>2)])|0);
     $54=$j_036<<1;
     $55=(($cur+($54<<2))|0);
     $56=((HEAP32[(($55)>>2)])|0);
     $57=((($56)+($53))|0);
     $58=$57&7;
     HEAP32[(($55)>>2)]=$58;
     $59=(($delta1+($51<<2))|0);
     $60=((HEAP32[(($59)>>2)])|0);
     $61=$54|1;
     $62=(($cur+($61<<2))|0);
     $63=((HEAP32[(($62)>>2)])|0);
     $64=((($63)+($60))|0);
     $65=$64&7;
     HEAP32[(($62)>>2)]=$65;
     $66=((($j_036)+(1))|0);
     $67=($66>>>0)<((8)>>>0);
     if ($67) {
      $j_036=$66;
     } else {
      break;
     }
    }
    $69=((HEAP32[(($34)>>2)])|0);
    $70=((936+$69)|0);
    $71=((HEAP8[($70)])|0);
    $72=($71&255);
    $73=((HEAP32[(($35)>>2)])|0);
    $74=((936+$73)|0);
    $75=((HEAP8[($74)])|0);
    $76=($75&255);
    $77=$76<<3;
    $78=$77|$72;
    $79=((HEAP32[(($36)>>2)])|0);
    $80=((936+$79)|0);
    $81=((HEAP8[($80)])|0);
    $82=($81&255);
    $83=$82<<6;
    $84=$78|$83;
    $85=((HEAP32[(($37)>>2)])|0);
    $86=((936+$85)|0);
    $87=((HEAP8[($86)])|0);
    $88=($87&255);
    $89=$88<<9;
    $90=$84|$89;
    $91=((HEAP32[(($38)>>2)])|0);
    $92=((936+$91)|0);
    $93=((HEAP8[($92)])|0);
    $94=($93&255);
    $95=$94<<12;
    $96=$90|$95;
    $97=((HEAP32[(($39)>>2)])|0);
    $98=((936+$97)|0);
    $99=((HEAP8[($98)])|0);
    $100=($99&255);
    $101=$100<<15;
    $102=$96|$101;
    $103=(($pDst_037+2)|0);
    HEAP16[(($pDst_037)>>1)]=$102;
    $104=((HEAP32[(($39)>>2)])|0);
    $105=((936+$104)|0);
    $106=((HEAP8[($105)])|0);
    $107=($106&255);
    $108=($107&65535)>>>1;
    $109=((HEAP32[(($40)>>2)])|0);
    $110=((936+$109)|0);
    $111=((HEAP8[($110)])|0);
    $112=($111&255);
    $113=$112<<2;
    $114=$113|$108;
    $115=((HEAP32[(($41)>>2)])|0);
    $116=((936+$115)|0);
    $117=((HEAP8[($116)])|0);
    $118=($117&255);
    $119=$118<<5;
    $120=$114|$119;
    $121=((HEAP32[(($42)>>2)])|0);
    $122=((936+$121)|0);
    $123=((HEAP8[($122)])|0);
    $124=($123&255);
    $125=$124<<8;
    $126=$120|$125;
    $127=((HEAP32[(($43)>>2)])|0);
    $128=((936+$127)|0);
    $129=((HEAP8[($128)])|0);
    $130=($129&255);
    $131=$130<<11;
    $132=$126|$131;
    $133=((HEAP32[(($44)>>2)])|0);
    $134=((936+$133)|0);
    $135=((HEAP8[($134)])|0);
    $136=($135&255);
    $137=$136<<14;
    $138=$132|$137;
    $139=(($pDst_037+4)|0);
    HEAP16[(($103)>>1)]=$138;
    $140=((HEAP32[(($44)>>2)])|0);
    $141=((936+$140)|0);
    $142=((HEAP8[($141)])|0);
    $143=($142&255);
    $144=($143&65535)>>>2;
    $145=((HEAP32[(($45)>>2)])|0);
    $146=((936+$145)|0);
    $147=((HEAP8[($146)])|0);
    $148=($147&255);
    $149=$148<<1;
    $150=$149|$144;
    $151=((HEAP32[(($46)>>2)])|0);
    $152=((936+$151)|0);
    $153=((HEAP8[($152)])|0);
    $154=($153&255);
    $155=$154<<4;
    $156=$150|$155;
    $157=((HEAP32[(($47)>>2)])|0);
    $158=((936+$157)|0);
    $159=((HEAP8[($158)])|0);
    $160=($159&255);
    $161=$160<<7;
    $162=$156|$161;
    $163=((HEAP32[(($48)>>2)])|0);
    $164=((936+$163)|0);
    $165=((HEAP8[($164)])|0);
    $166=($165&255);
    $167=$166<<10;
    $168=$162|$167;
    $169=((HEAP32[(($49)>>2)])|0);
    $170=((936+$169)|0);
    $171=((HEAP8[($170)])|0);
    $172=($171&255);
    $173=$172<<13;
    $174=$168|$173;
    $175=(($pDst_037+6)|0);
    HEAP16[(($139)>>1)]=$174;
    $176=((($i1_038)+(1))|0);
    $177=($176>>>0)<($4>>>0);
    if ($177) {
     $pDst_037=$175;$i1_038=$176;
    } else {
     $_0=1;
     break;
    }
   }
  } else {
   $_0=0;
  }
 } while(0);

 __ZN4crnd25static_huffman_data_modelD2Ev($dm);
 $_1=$_0;

 STACKTOP=sp;return (($_1)|0);
}


function __ZN4crnd5utils11zero_objectIA16_jEEvRT_($obj){
 $obj=($obj)|0;
 var $1=0,label=0;

 $1=$obj;
 _memset((((($1)|0))|0), ((((0)|0))|0), ((((64)|0))|0))|0;
 return;
}


function __ZN4crnd6vectorItE6resizeEj($this,$new_size){
 $this=($this)|0;
 $new_size=($new_size)|0;
 var $1=0,$2=0,$3=0,$5=0,$7=0,$8=0,$9=0,$11=0,$12=0,$13=0,$15=0,$16=0,$17=0,$18=0,$19=0,$_0=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==($new_size|0);
 if ($3) {
  $_0=1;

  return (($_0)|0);
 }
 $5=($2>>>0)>($new_size>>>0);
 if (!($5)) {
  $7=(($this+8)|0);
  $8=((HEAP32[(($7)>>2)])|0);
  $9=($8>>>0)<($new_size>>>0);
  do {
   if ($9) {
    $11=((($2)+(1))|0);
    $12=($11|0)==($new_size|0);
    $13=((__ZN4crnd6vectorItE17increase_capacityEjb($this,$new_size,$12))|0);
    if ($13) {
     break;
    } else {
     $_0=0;
    }

    return (($_0)|0);
   }
  } while(0);
  $15=(($this)|0);
  $16=((HEAP32[(($15)>>2)])|0);
  $17=((HEAP32[(($1)>>2)])|0);
  $18=(($16+($17<<1))|0);
  $19=((($new_size)-($17))|0);
  __ZN4crnd11scalar_typeItE15construct_arrayEPtj($18,$19);
 }
 HEAP32[(($1)>>2)]=$new_size;
 $_0=1;

 return (($_0)|0);
}


function __ZN4crnd6vectorItE17increase_capacityEjb($this,$min_new_capacity,$grow_hint){
 $this=($this)|0;
 $min_new_capacity=($min_new_capacity)|0;
 $grow_hint=($grow_hint)|0;
 var $1=0,$2=0,$4=0,$_0=0,label=0;

 $1=$this;
 $2=((__ZN4crnd16elemental_vector17increase_capacityEjbjPFvPvS1_jE($1,$min_new_capacity,$grow_hint,2,0))|0);
 if ($2) {
  $_0=1;

  return (($_0)|0);
 }
 $4=(($this+12)|0);
 HEAP8[($4)]=1;
 $_0=0;

 return (($_0)|0);
}


function __ZN4crnd11scalar_typeItE15construct_arrayEPtj($p,$n){
 $p=($p)|0;
 $n=($n)|0;
 var $1=0,$2=0,label=0;

 $1=$p;
 $2=$n<<1;
 _memset((((($1)|0))|0), ((((0)|0))|0), (((($2)|0))|0))|0;
 return;
}


function __ZN4crnd6vectorIjE6resizeEj($this,$new_size){
 $this=($this)|0;
 $new_size=($new_size)|0;
 var $1=0,$2=0,$3=0,$5=0,$7=0,$8=0,$9=0,$11=0,$12=0,$13=0,$15=0,$16=0,$17=0,$18=0,$19=0,$_0=0,label=0;

 $1=(($this+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=($2|0)==($new_size|0);
 if ($3) {
  $_0=1;

  return (($_0)|0);
 }
 $5=($2>>>0)>($new_size>>>0);
 if (!($5)) {
  $7=(($this+8)|0);
  $8=((HEAP32[(($7)>>2)])|0);
  $9=($8>>>0)<($new_size>>>0);
  do {
   if ($9) {
    $11=((($2)+(1))|0);
    $12=($11|0)==($new_size|0);
    $13=((__ZN4crnd6vectorIjE17increase_capacityEjb($this,$new_size,$12))|0);
    if ($13) {
     break;
    } else {
     $_0=0;
    }

    return (($_0)|0);
   }
  } while(0);
  $15=(($this)|0);
  $16=((HEAP32[(($15)>>2)])|0);
  $17=((HEAP32[(($1)>>2)])|0);
  $18=(($16+($17<<2))|0);
  $19=((($new_size)-($17))|0);
  __ZN4crnd11scalar_typeIjE15construct_arrayEPjj($18,$19);
 }
 HEAP32[(($1)>>2)]=$new_size;
 $_0=1;

 return (($_0)|0);
}


function __ZN4crnd6vectorIjE17increase_capacityEjb($this,$min_new_capacity,$grow_hint){
 $this=($this)|0;
 $min_new_capacity=($min_new_capacity)|0;
 $grow_hint=($grow_hint)|0;
 var $1=0,$2=0,$4=0,$_0=0,label=0;

 $1=$this;
 $2=((__ZN4crnd16elemental_vector17increase_capacityEjbjPFvPvS1_jE($1,$min_new_capacity,$grow_hint,4,0))|0);
 if ($2) {
  $_0=1;

  return (($_0)|0);
 }
 $4=(($this+12)|0);
 HEAP8[($4)]=1;
 $_0=0;

 return (($_0)|0);
}


function __ZN4crnd11scalar_typeIjE15construct_arrayEPjj($p,$n){
 $p=($p)|0;
 $n=($n)|0;
 var $1=0,$2=0,label=0;

 $1=$p;
 $2=$n<<2;
 _memset((((($1)|0))|0), ((((0)|0))|0), (((($2)|0))|0))|0;
 return;
}


function __ZN4crnd4math11floor_log2iEj($v){
 $v=($v)|0;
 var $1=0,$l_04=0,$_03=0,$2=0,$3=0,$4=0,$l_0_lcssa=0,label=0;

 $1=($v>>>0)>((1)>>>0);
 if ($1) {
  $_03=$v;$l_04=0;
  while(1) {


   $2=$_03>>>1;
   $3=((($l_04)+(1))|0);
   $4=($_03>>>0)>((3)>>>0);
   if ($4) {
    $_03=$2;$l_04=$3;
   } else {
    $l_0_lcssa=$3;
    break;
   }
  }
 } else {
  $l_0_lcssa=0;
 }

 return (($l_0_lcssa)|0);
}


function _malloc($bytes){
 $bytes=($bytes)|0;
 var $1=0,$3=0,$5=0,$6=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$15=0,$16=0,$17=0,$18=0,$19=0,$20=0,$_sum111=0,$21=0,$22=0,$23=0;
 var $24=0,$25=0,$27=0,$28=0,$29=0,$31=0,$32=0,$33=0,$35=0,$36=0,$37=0,$40=0,$41=0,$42=0,$43=0,$_sum113114=0,$44=0,$45=0,$46=0,$47=0;
 var $48=0,$50=0,$51=0,$53=0,$55=0,$56=0,$57=0,$58=0,$59=0,$60=0,$61=0,$62=0,$63=0,$64=0,$65=0,$66=0,$67=0,$68=0,$69=0,$70=0;
 var $71=0,$72=0,$73=0,$74=0,$75=0,$76=0,$77=0,$78=0,$79=0,$80=0,$81=0,$82=0,$83=0,$84=0,$85=0,$_sum104=0,$86=0,$87=0,$88=0,$89=0;
 var $90=0,$92=0,$93=0,$94=0,$96=0,$97=0,$98=0,$100=0,$101=0,$102=0,$105=0,$106=0,$107=0,$108=0,$109=0,$110=0,$111=0,$112=0,$_sum106107=0,$113=0;
 var $114=0,$115=0,$116=0,$117=0,$118=0,$120=0,$121=0,$122=0,$123=0,$124=0,$125=0,$126=0,$127=0,$128=0,$130=0,$_sum109_pre=0,$_pre=0,$_sum110=0,$132=0,$133=0;
 var $134=0,$135=0,$136=0,$_pre_phi=0,$F4_0=0,$139=0,$140=0,$141=0,$143=0,$145=0,$146=0,$148=0,$149=0,$150=0,$151=0,$152=0,$153=0,$154=0,$155=0,$156=0;
 var $157=0,$158=0,$159=0,$160=0,$161=0,$162=0,$163=0,$164=0,$165=0,$166=0,$167=0,$168=0,$169=0,$170=0,$171=0,$172=0,$173=0,$174=0,$175=0,$176=0;
 var $rsize_0_i=0,$v_0_i=0,$t_0_i=0,$178=0,$179=0,$180=0,$182=0,$183=0,$184=0,$185=0,$186=0,$187=0,$188=0,$189=0,$190=0,$_rsize_0_i=0,$_v_0_i=0,$192=0,$193=0,$194=0;
 var $196=0,$197=0,$198=0,$200=0,$201=0,$202=0,$203=0,$204=0,$206=0,$207=0,$208=0,$209=0,$211=0,$212=0,$213=0,$215=0,$216=0,$217=0,$220=0,$221=0;
 var $222=0,$224=0,$225=0,$226=0,$RP_0_i=0,$R_0_i=0,$227=0,$228=0,$229=0,$231=0,$232=0,$233=0,$235=0,$236=0,$R_1_i=0,$240=0,$242=0,$243=0,$244=0,$245=0;
 var $246=0,$cond_i=0,$248=0,$249=0,$250=0,$251=0,$253=0,$254=0,$255=0,$257=0,$258=0,$259=0,$262=0,$265=0,$267=0,$268=0,$269=0,$271=0,$272=0,$273=0;
 var $274=0,$276=0,$277=0,$278=0,$280=0,$281=0,$284=0,$285=0,$286=0,$288=0,$289=0,$290=0,$292=0,$293=0,$297=0,$299=0,$300=0,$301=0,$_sum4_i=0,$302=0;
 var $303=0,$304=0,$305=0,$307=0,$308=0,$309=0,$_sum_i137=0,$310=0,$311=0,$_sum1_i=0,$312=0,$313=0,$314=0,$315=0,$317=0,$318=0,$319=0,$320=0,$321=0,$322=0;
 var $323=0,$324=0,$325=0,$327=0,$_sum2_pre_i=0,$_pre_i=0,$_sum3_i=0,$329=0,$330=0,$331=0,$332=0,$333=0,$_pre_phi_i=0,$F1_0_i=0,$336=0,$337=0,$338=0,$341=0,$342=0,$343=0;
 var $345=0,$347=0,$348=0,$349=0,$350=0,$352=0,$353=0,$354=0,$356=0,$358=0,$359=0,$360=0,$361=0,$362=0,$363=0,$364=0,$365=0,$366=0,$367=0,$368=0;
 var $369=0,$370=0,$371=0,$372=0,$373=0,$374=0,$375=0,$376=0,$377=0,$378=0,$379=0,$idx_0_i=0,$381=0,$382=0,$383=0,$385=0,$387=0,$388=0,$390=0,$391=0;
 var $rst_0_i=0,$sizebits_0_i=0,$t_0_i116=0,$rsize_0_i117=0,$v_0_i118=0,$393=0,$394=0,$395=0,$396=0,$397=0,$399=0,$rsize_1_i=0,$v_1_i=0,$401=0,$402=0,$403=0,$404=0,$405=0,$406=0,$407=0;
 var $or_cond_i=0,$rst_1_i=0,$408=0,$409=0,$t_1_i=0,$rsize_2_i=0,$v_2_i=0,$410=0,$411=0,$or_cond21_i=0,$413=0,$414=0,$415=0,$416=0,$417=0,$419=0,$420=0,$421=0,$422=0,$423=0;
 var $424=0,$425=0,$426=0,$427=0,$428=0,$429=0,$430=0,$431=0,$432=0,$433=0,$434=0,$435=0,$436=0,$437=0,$438=0,$439=0,$440=0,$441=0,$442=0,$443=0;
 var $t_2_ph_i=0,$444=0,$v_330_i=0,$rsize_329_i=0,$t_228_i=0,$445=0,$446=0,$447=0,$448=0,$449=0,$_rsize_3_i=0,$t_2_v_3_i=0,$450=0,$451=0,$452=0,$453=0,$454=0,$455=0,$v_3_lcssa_i=0,$rsize_3_lcssa_i=0;
 var $456=0,$458=0,$459=0,$460=0,$462=0,$463=0,$464=0,$466=0,$467=0,$468=0,$470=0,$471=0,$472=0,$473=0,$474=0,$476=0,$477=0,$478=0,$479=0,$481=0;
 var $482=0,$483=0,$485=0,$486=0,$487=0,$490=0,$491=0,$492=0,$494=0,$495=0,$496=0,$RP_0_i119=0,$R_0_i120=0,$497=0,$498=0,$499=0,$501=0,$502=0,$503=0,$505=0;
 var $506=0,$R_1_i122=0,$510=0,$512=0,$513=0,$514=0,$515=0,$516=0,$cond_i123=0,$518=0,$519=0,$520=0,$521=0,$523=0,$524=0,$525=0,$527=0,$528=0,$529=0,$532=0;
 var $535=0,$537=0,$538=0,$539=0,$541=0,$542=0,$543=0,$544=0,$546=0,$547=0,$548=0,$550=0,$551=0,$554=0,$555=0,$556=0,$558=0,$559=0,$560=0,$562=0;
 var $563=0,$567=0,$569=0,$570=0,$571=0,$_sum19_i=0,$572=0,$573=0,$574=0,$575=0,$577=0,$578=0,$579=0,$_sum_i125136=0,$580=0,$581=0,$_sum1_i126=0,$582=0,$583=0,$584=0;
 var $585=0,$587=0,$588=0,$589=0,$590=0,$591=0,$592=0,$593=0,$595=0,$_sum15_pre_i=0,$_pre_i127=0,$_sum18_i=0,$597=0,$598=0,$599=0,$600=0,$601=0,$_pre_phi_i128=0,$F5_0_i=0,$604=0;
 var $_sum16_i=0,$605=0,$606=0,$_sum17_i=0,$607=0,$608=0,$610=0,$611=0,$612=0,$614=0,$616=0,$617=0,$618=0,$619=0,$620=0,$621=0,$622=0,$623=0,$624=0,$625=0;
 var $626=0,$627=0,$628=0,$629=0,$630=0,$631=0,$632=0,$633=0,$634=0,$635=0,$636=0,$637=0,$I7_0_i=0,$639=0,$_sum2_i=0,$640=0,$641=0,$_sum3_i129=0,$642=0,$_sum4_i130=0;
 var $643=0,$644=0,$645=0,$646=0,$647=0,$648=0,$649=0,$651=0,$652=0,$_sum5_i=0,$653=0,$654=0,$_sum6_i=0,$655=0,$656=0,$_sum7_i=0,$657=0,$658=0,$660=0,$661=0;
 var $663=0,$664=0,$666=0,$667=0,$T_0_i=0,$K12_0_i=0,$669=0,$670=0,$671=0,$672=0,$674=0,$675=0,$676=0,$677=0,$678=0,$680=0,$681=0,$682=0,$_sum12_i=0,$684=0;
 var $685=0,$_sum13_i=0,$686=0,$687=0,$_sum14_i=0,$688=0,$689=0,$692=0,$693=0,$694=0,$695=0,$696=0,$698=0,$699=0,$701=0,$_sum9_i=0,$702=0,$703=0,$_sum10_i=0,$704=0;
 var $705=0,$_sum11_i=0,$706=0,$707=0,$709=0,$710=0,$711=0,$nb_0=0,$712=0,$713=0,$715=0,$716=0,$717=0,$719=0,$720=0,$721=0,$722=0,$_sum102=0,$723=0,$724=0;
 var $725=0,$726=0,$727=0,$728=0,$730=0,$731=0,$732=0,$_sum101=0,$733=0,$734=0,$735=0,$736=0,$738=0,$739=0,$741=0,$742=0,$744=0,$745=0,$746=0,$747=0;
 var $748=0,$749=0,$_sum=0,$750=0,$751=0,$752=0,$753=0,$754=0,$755=0,$757=0,$758=0,$760=0,$761=0,$762=0,$763=0,$765=0,$766=0,$767=0,$769=0,$770=0;
 var $771=0,$772=0,$773=0,$774=0,$775=0,$777=0,$778=0,$780=0,$781=0,$782=0,$783=0,$or_cond1_i=0,$785=0,$786=0,$787=0,$789=0,$790=0,$792=0,$sp_0_i_i=0,$794=0;
 var $795=0,$796=0,$798=0,$799=0,$800=0,$801=0,$803=0,$804=0,$805=0,$806=0,$807=0,$808=0,$810=0,$811=0,$812=0,$813=0,$814=0,$816=0,$817=0,$818=0;
 var $819=0,$820=0,$ssize_0_i=0,$822=0,$823=0,$824=0,$825=0,$or_cond_i131=0,$827=0,$828=0,$830=0,$831=0,$or_cond2_i=0,$833=0,$834=0,$ssize_0__i=0,$__i=0,$836=0,$837=0,$838=0;
 var $839=0,$841=0,$842=0,$843=0,$844=0,$845=0,$_3_i=0,$_4_i=0,$ssize_1_i=0,$br_0_i=0,$tsize_0_i=0,$tbase_0_i=0,$847=0,$848=0,$850=0,$851=0,$or_cond5_i=0,$852=0,$or_cond6_i=0,$854=0;
 var $855=0,$856=0,$857=0,$858=0,$859=0,$861=0,$862=0,$864=0,$866=0,$ssize_2_i=0,$868=0,$tsize_0303639_i=0,$869=0,$870=0,$tsize_1_i=0,$872=0,$874=0,$875=0,$notlhs_i=0,$notrhs_i=0;
 var $or_cond8_not_i=0,$876=0,$or_cond9_i=0,$877=0,$878=0,$879=0,$880=0,$881=0,$_tsize_1_i=0,$_tbase_1_i=0,$882=0,$tbase_245_i=0,$tsize_244_i=0,$883=0,$884=0,$885=0,$886=0,$888=0,$889=0,$891=0;
 var $892=0,$893=0,$or_cond10_i=0,$895=0,$i_02_i_i=0,$897=0,$898=0,$899=0,$_sum_i_i=0,$900=0,$_sum1_i_i=0,$901=0,$902=0,$903=0,$904=0,$905=0,$906=0,$907=0,$908=0,$910=0;
 var $911=0,$912=0,$913=0,$914=0,$915=0,$916=0,$_sum_i14_i=0,$917=0,$918=0,$_sum2_i_i=0,$919=0,$920=0,$921=0,$sp_067_i=0,$922=0,$923=0,$924=0,$925=0,$926=0,$927=0;
 var $929=0,$930=0,$931=0,$932=0,$933=0,$934=0,$935=0,$937=0,$938=0,$939=0,$or_cond47_i=0,$941=0,$942=0,$943=0,$944=0,$945=0,$946=0,$947=0,$949=0,$950=0;
 var $951=0,$952=0,$953=0,$954=0,$955=0,$_sum_i18_i=0,$956=0,$957=0,$_sum2_i19_i=0,$958=0,$959=0,$960=0,$961=0,$962=0,$964=0,$sp_160_i=0,$966=0,$967=0,$968=0,$970=0;
 var $971=0,$972=0,$973=0,$974=0,$975=0,$976=0,$978=0,$979=0,$980=0,$981=0,$982=0,$983=0,$984=0,$986=0,$987=0,$989=0,$990=0,$_sum93_i=0,$991=0,$992=0;
 var $993=0,$994=0,$996=0,$997=0,$999=0,$_sum94_i=0,$1000=0,$1001=0,$1002=0,$1003=0,$1004=0,$_sum_i21_i=0,$1005=0,$1006=0,$1007=0,$1008=0,$_sum1_i22_i=0,$1009=0,$1010=0,$1011=0;
 var $1012=0,$1014=0,$1015=0,$1016=0,$_sum46_i_i=0,$1017=0,$1018=0,$1020=0,$1021=0,$1023=0,$1024=0,$1025=0,$_sum44_i_i=0,$1026=0,$1027=0,$_sum45_i_i=0,$1028=0,$1029=0,$_sum2_i23_i=0,$_sum95_i=0;
 var $1031=0,$1032=0,$1033=0,$1034=0,$1035=0,$1037=0,$1038=0,$1039=0,$_sum3940_i_i=0,$_sum105_i=0,$1041=0,$1042=0,$1043=0,$_sum41_i_i=0,$_sum106_i=0,$1044=0,$1045=0,$1046=0,$1047=0,$1048=0;
 var $1049=0,$1050=0,$1052=0,$1053=0,$1054=0,$1056=0,$1057=0,$1058=0,$1059=0,$1061=0,$1062=0,$1063=0,$1064=0,$1066=0,$_pre56_i_i=0,$1068=0,$1069=0,$1070=0,$1072=0,$1073=0;
 var $1074=0,$_pre_phi57_i_i=0,$1075=0,$1077=0,$_sum34_i_i=0,$_sum96_i=0,$1078=0,$1079=0,$1080=0,$_sum5_i_i=0,$_sum97_i=0,$1081=0,$1082=0,$1083=0,$1084=0,$_sum3637_i_i=0,$_sum98_i=0,$1086=0,$1087=0,$1088=0;
 var $1089=0,$1090=0,$1091=0,$1093=0,$1094=0,$1095=0,$1097=0,$1098=0,$1099=0,$_sum67_i_i=0,$_sum103_i=0,$1102=0,$1103=0,$1104=0,$1105=0,$_sum104_i=0,$1107=0,$1108=0,$1109=0,$1110=0;
 var $RP_0_i_i=0,$R_0_i_i=0,$1111=0,$1112=0,$1113=0,$1115=0,$1116=0,$1117=0,$1119=0,$1120=0,$1121=0,$R_1_i_i=0,$1125=0,$_sum31_i_i=0,$_sum99_i=0,$1127=0,$1128=0,$1129=0,$1130=0,$1131=0;
 var $1132=0,$cond_i_i=0,$1134=0,$1135=0,$1136=0,$1137=0,$1139=0,$1140=0,$1141=0,$1143=0,$1144=0,$1145=0,$1148=0,$1151=0,$1153=0,$1154=0,$1155=0,$1157=0,$_sum3233_i_i=0,$_sum100_i=0;
 var $1158=0,$1159=0,$1160=0,$1161=0,$1163=0,$1164=0,$1165=0,$1167=0,$1168=0,$_sum101_i=0,$1171=0,$1172=0,$1173=0,$1174=0,$1176=0,$1177=0,$1178=0,$1180=0,$1181=0,$_sum9_i_i=0;
 var $_sum102_i=0,$1185=0,$1186=0,$1187=0,$qsize_0_i_i=0,$oldfirst_0_i_i=0,$1189=0,$1190=0,$1191=0,$1192=0,$_sum10_i_i=0,$1193=0,$1194=0,$_sum11_i_i=0,$1195=0,$1196=0,$1197=0,$1198=0,$1200=0,$1201=0;
 var $1202=0,$1203=0,$1204=0,$1205=0,$1206=0,$1208=0,$_sum27_pre_i_i=0,$_pre_i24_i=0,$_sum30_i_i=0,$1210=0,$1211=0,$1212=0,$1213=0,$1214=0,$_pre_phi_i25_i=0,$F4_0_i_i=0,$1217=0,$_sum28_i_i=0,$1218=0,$1219=0;
 var $_sum29_i_i=0,$1220=0,$1221=0,$1223=0,$1224=0,$1225=0,$1227=0,$1229=0,$1230=0,$1231=0,$1232=0,$1233=0,$1234=0,$1235=0,$1236=0,$1237=0,$1238=0,$1239=0,$1240=0,$1241=0;
 var $1242=0,$1243=0,$1244=0,$1245=0,$1246=0,$1247=0,$1248=0,$1249=0,$1250=0,$I7_0_i_i=0,$1252=0,$_sum12_i26_i=0,$1253=0,$1254=0,$_sum13_i_i=0,$1255=0,$_sum14_i_i=0,$1256=0,$1257=0,$1258=0;
 var $1259=0,$1260=0,$1261=0,$1262=0,$1264=0,$1265=0,$_sum15_i_i=0,$1266=0,$1267=0,$_sum16_i_i=0,$1268=0,$1269=0,$_sum17_i_i=0,$1270=0,$1271=0,$1273=0,$1274=0,$1276=0,$1277=0,$1279=0;
 var $1280=0,$T_0_i27_i=0,$K8_0_i_i=0,$1282=0,$1283=0,$1284=0,$1285=0,$1287=0,$1288=0,$1289=0,$1290=0,$1291=0,$1293=0,$1294=0,$1295=0,$_sum24_i_i=0,$1297=0,$1298=0,$_sum25_i_i=0,$1299=0;
 var $1300=0,$_sum26_i_i=0,$1301=0,$1302=0,$1305=0,$1306=0,$1307=0,$1308=0,$1309=0,$1311=0,$1312=0,$1314=0,$_sum21_i_i=0,$1315=0,$1316=0,$_sum22_i_i=0,$1317=0,$1318=0,$_sum23_i_i=0,$1319=0;
 var $1320=0,$_sum1819_i_i=0,$1321=0,$1322=0,$sp_0_i_i_i=0,$1324=0,$1325=0,$1326=0,$1328=0,$1329=0,$1330=0,$1331=0,$1333=0,$1334=0,$_sum_i15_i=0,$_sum1_i16_i=0,$1335=0,$1336=0,$1337=0,$1338=0;
 var $1340=0,$1341=0,$1343=0,$_sum2_i17_i=0,$1344=0,$1345=0,$1346=0,$1347=0,$1348=0,$1349=0,$1350=0,$1351=0,$1352=0,$1353=0,$1354=0,$1355=0,$1357=0,$1358=0,$1359=0,$1360=0;
 var $1361=0,$1362=0,$1363=0,$_sum_i_i_i=0,$1364=0,$1365=0,$_sum2_i_i_i=0,$1366=0,$1367=0,$1368=0,$1369=0,$1370=0,$1371=0,$1372=0,$1373=0,$1374=0,$1375=0,$1376=0,$1377=0,$1378=0;
 var $1379=0,$1380=0,$1382=0,$1383=0,$1384=0,$1385=0,$_sum3_i_i=0,$1386=0,$1387=0,$1388=0,$1389=0,$1390=0,$1391=0,$1392=0,$1393=0,$1394=0,$1396=0,$1397=0,$1398=0,$1399=0;
 var $1400=0,$1401=0,$1402=0,$1404=0,$_sum11_pre_i_i=0,$_pre_i_i=0,$_sum12_i_i=0,$1406=0,$1407=0,$1408=0,$1409=0,$1410=0,$_pre_phi_i_i=0,$F_0_i_i=0,$1413=0,$1414=0,$1415=0,$1417=0,$1418=0,$1419=0;
 var $1421=0,$1423=0,$1424=0,$1425=0,$1426=0,$1427=0,$1428=0,$1429=0,$1430=0,$1431=0,$1432=0,$1433=0,$1434=0,$1435=0,$1436=0,$1437=0,$1438=0,$1439=0,$1440=0,$1441=0;
 var $1442=0,$1443=0,$1444=0,$I1_0_i_i=0,$1446=0,$1447=0,$I1_0_c_i_i=0,$1448=0,$1449=0,$1450=0,$1451=0,$1452=0,$1453=0,$1455=0,$1456=0,$_c_i_i=0,$1457=0,$1458=0,$1460=0,$1461=0;
 var $1463=0,$1464=0,$1466=0,$1467=0,$T_0_i_i=0,$K2_0_i_i=0,$1469=0,$1470=0,$1471=0,$1472=0,$1474=0,$1475=0,$1476=0,$1477=0,$1478=0,$1480=0,$1481=0,$1482=0,$1484=0,$T_0_c8_i_i=0;
 var $1485=0,$1486=0,$1489=0,$1490=0,$1491=0,$1492=0,$1493=0,$1495=0,$1496=0,$1498=0,$1499=0,$_c7_i_i=0,$1500=0,$T_0_c_i_i=0,$1501=0,$1502=0,$1503=0,$1505=0,$1506=0,$1507=0;
 var $1508=0,$1509=0,$1510=0,$_sum_i134=0,$1511=0,$1512=0,$1513=0,$1514=0,$1515=0,$1516=0,$1517=0,$mem_0=0,label=0;

 $1=($bytes>>>0)<((245)>>>0);
 do {
  if ($1) {
   $3=($bytes>>>0)<((11)>>>0);
   if ($3) {
    $8=16;
   } else {
    $5=((($bytes)+(11))|0);
    $6=$5&-8;
    $8=$6;
   }

   $9=$8>>>3;
   $10=((HEAP32[((976)>>2)])|0);
   $11=$10>>>($9>>>0);
   $12=$11&3;
   $13=($12|0)==0;
   if (!($13)) {
    $15=$11&1;
    $16=$15^1;
    $17=((($16)+($9))|0);
    $18=$17<<1;
    $19=((1016+($18<<2))|0);
    $20=$19;
    $_sum111=((($18)+(2))|0);
    $21=((1016+($_sum111<<2))|0);
    $22=((HEAP32[(($21)>>2)])|0);
    $23=(($22+8)|0);
    $24=((HEAP32[(($23)>>2)])|0);
    $25=($20|0)==($24|0);
    do {
     if ($25) {
      $27=1<<$17;
      $28=$27^-1;
      $29=$10&$28;
      HEAP32[((976)>>2)]=$29;
     } else {
      $31=$24;
      $32=((HEAP32[((992)>>2)])|0);
      $33=($31>>>0)<($32>>>0);
      if ($33) {
       _abort(); return ((0)|0);
       return ((0)|0);
      }
      $35=(($24+12)|0);
      $36=((HEAP32[(($35)>>2)])|0);
      $37=($36|0)==($22|0);
      if ($37) {
       HEAP32[(($35)>>2)]=$20;
       HEAP32[(($21)>>2)]=$24;
       break;
      } else {
       _abort(); return ((0)|0);
       return ((0)|0);
      }
     }
    } while(0);
    $40=$17<<3;
    $41=$40|3;
    $42=(($22+4)|0);
    HEAP32[(($42)>>2)]=$41;
    $43=$22;
    $_sum113114=$40|4;
    $44=(($43+$_sum113114)|0);
    $45=$44;
    $46=((HEAP32[(($45)>>2)])|0);
    $47=$46|1;
    HEAP32[(($45)>>2)]=$47;
    $48=$23;
    $mem_0=$48;

    return (($mem_0)|0);
   }
   $50=((HEAP32[((984)>>2)])|0);
   $51=($8>>>0)>($50>>>0);
   if (!($51)) {
    $nb_0=$8;
    break;
   }
   $53=($11|0)==0;
   if (!($53)) {
    $55=$11<<$9;
    $56=2<<$9;
    $57=(((-$56))|0);
    $58=$56|$57;
    $59=$55&$58;
    $60=(((-$59))|0);
    $61=$59&$60;
    $62=((($61)-(1))|0);
    $63=$62>>>12;
    $64=$63&16;
    $65=$62>>>($64>>>0);
    $66=$65>>>5;
    $67=$66&8;
    $68=$67|$64;
    $69=$65>>>($67>>>0);
    $70=$69>>>2;
    $71=$70&4;
    $72=$68|$71;
    $73=$69>>>($71>>>0);
    $74=$73>>>1;
    $75=$74&2;
    $76=$72|$75;
    $77=$73>>>($75>>>0);
    $78=$77>>>1;
    $79=$78&1;
    $80=$76|$79;
    $81=$77>>>($79>>>0);
    $82=((($80)+($81))|0);
    $83=$82<<1;
    $84=((1016+($83<<2))|0);
    $85=$84;
    $_sum104=((($83)+(2))|0);
    $86=((1016+($_sum104<<2))|0);
    $87=((HEAP32[(($86)>>2)])|0);
    $88=(($87+8)|0);
    $89=((HEAP32[(($88)>>2)])|0);
    $90=($85|0)==($89|0);
    do {
     if ($90) {
      $92=1<<$82;
      $93=$92^-1;
      $94=$10&$93;
      HEAP32[((976)>>2)]=$94;
     } else {
      $96=$89;
      $97=((HEAP32[((992)>>2)])|0);
      $98=($96>>>0)<($97>>>0);
      if ($98) {
       _abort(); return ((0)|0);
       return ((0)|0);
      }
      $100=(($89+12)|0);
      $101=((HEAP32[(($100)>>2)])|0);
      $102=($101|0)==($87|0);
      if ($102) {
       HEAP32[(($100)>>2)]=$85;
       HEAP32[(($86)>>2)]=$89;
       break;
      } else {
       _abort(); return ((0)|0);
       return ((0)|0);
      }
     }
    } while(0);
    $105=$82<<3;
    $106=((($105)-($8))|0);
    $107=$8|3;
    $108=(($87+4)|0);
    HEAP32[(($108)>>2)]=$107;
    $109=$87;
    $110=(($109+$8)|0);
    $111=$110;
    $112=$106|1;
    $_sum106107=$8|4;
    $113=(($109+$_sum106107)|0);
    $114=$113;
    HEAP32[(($114)>>2)]=$112;
    $115=(($109+$105)|0);
    $116=$115;
    HEAP32[(($116)>>2)]=$106;
    $117=((HEAP32[((984)>>2)])|0);
    $118=($117|0)==0;
    if (!($118)) {
     $120=((HEAP32[((996)>>2)])|0);
     $121=$117>>>3;
     $122=$121<<1;
     $123=((1016+($122<<2))|0);
     $124=$123;
     $125=((HEAP32[((976)>>2)])|0);
     $126=1<<$121;
     $127=$125&$126;
     $128=($127|0)==0;
     do {
      if ($128) {
       $130=$125|$126;
       HEAP32[((976)>>2)]=$130;
       $_sum109_pre=((($122)+(2))|0);
       $_pre=((1016+($_sum109_pre<<2))|0);
       $F4_0=$124;$_pre_phi=$_pre;
      } else {
       $_sum110=((($122)+(2))|0);
       $132=((1016+($_sum110<<2))|0);
       $133=((HEAP32[(($132)>>2)])|0);
       $134=$133;
       $135=((HEAP32[((992)>>2)])|0);
       $136=($134>>>0)<($135>>>0);
       if (!($136)) {
        $F4_0=$133;$_pre_phi=$132;
        break;
       }
       _abort(); return ((0)|0);
       return ((0)|0);
      }
     } while(0);


     HEAP32[(($_pre_phi)>>2)]=$120;
     $139=(($F4_0+12)|0);
     HEAP32[(($139)>>2)]=$120;
     $140=(($120+8)|0);
     HEAP32[(($140)>>2)]=$F4_0;
     $141=(($120+12)|0);
     HEAP32[(($141)>>2)]=$124;
    }
    HEAP32[((984)>>2)]=$106;
    HEAP32[((996)>>2)]=$111;
    $143=$88;
    $mem_0=$143;

    return (($mem_0)|0);
   }
   $145=((HEAP32[((980)>>2)])|0);
   $146=($145|0)==0;
   if ($146) {
    $nb_0=$8;
    break;
   }
   $148=(((-$145))|0);
   $149=$145&$148;
   $150=((($149)-(1))|0);
   $151=$150>>>12;
   $152=$151&16;
   $153=$150>>>($152>>>0);
   $154=$153>>>5;
   $155=$154&8;
   $156=$155|$152;
   $157=$153>>>($155>>>0);
   $158=$157>>>2;
   $159=$158&4;
   $160=$156|$159;
   $161=$157>>>($159>>>0);
   $162=$161>>>1;
   $163=$162&2;
   $164=$160|$163;
   $165=$161>>>($163>>>0);
   $166=$165>>>1;
   $167=$166&1;
   $168=$164|$167;
   $169=$165>>>($167>>>0);
   $170=((($168)+($169))|0);
   $171=((1280+($170<<2))|0);
   $172=((HEAP32[(($171)>>2)])|0);
   $173=(($172+4)|0);
   $174=((HEAP32[(($173)>>2)])|0);
   $175=$174&-8;
   $176=((($175)-($8))|0);
   $t_0_i=$172;$v_0_i=$172;$rsize_0_i=$176;
   while(1) {



    $178=(($t_0_i+16)|0);
    $179=((HEAP32[(($178)>>2)])|0);
    $180=($179|0)==0;
    if ($180) {
     $182=(($t_0_i+20)|0);
     $183=((HEAP32[(($182)>>2)])|0);
     $184=($183|0)==0;
     if ($184) {
      break;
     } else {
      $185=$183;
     }
    } else {
     $185=$179;
    }

    $186=(($185+4)|0);
    $187=((HEAP32[(($186)>>2)])|0);
    $188=$187&-8;
    $189=((($188)-($8))|0);
    $190=($189>>>0)<($rsize_0_i>>>0);
    $_rsize_0_i=($190?$189:$rsize_0_i);
    $_v_0_i=($190?$185:$v_0_i);
    $t_0_i=$185;$v_0_i=$_v_0_i;$rsize_0_i=$_rsize_0_i;
   }
   $192=$v_0_i;
   $193=((HEAP32[((992)>>2)])|0);
   $194=($192>>>0)<($193>>>0);
   if ($194) {
    _abort(); return ((0)|0);
    return ((0)|0);
   }
   $196=(($192+$8)|0);
   $197=$196;
   $198=($192>>>0)<($196>>>0);
   if (!($198)) {
    _abort(); return ((0)|0);
    return ((0)|0);
   }
   $200=(($v_0_i+24)|0);
   $201=((HEAP32[(($200)>>2)])|0);
   $202=(($v_0_i+12)|0);
   $203=((HEAP32[(($202)>>2)])|0);
   $204=($203|0)==($v_0_i|0);
   do {
    if ($204) {
     $220=(($v_0_i+20)|0);
     $221=((HEAP32[(($220)>>2)])|0);
     $222=($221|0)==0;
     if ($222) {
      $224=(($v_0_i+16)|0);
      $225=((HEAP32[(($224)>>2)])|0);
      $226=($225|0)==0;
      if ($226) {
       $R_1_i=0;
       break;
      } else {
       $R_0_i=$225;$RP_0_i=$224;
      }
     } else {
      $R_0_i=$221;$RP_0_i=$220;
     }
     while(1) {


      $227=(($R_0_i+20)|0);
      $228=((HEAP32[(($227)>>2)])|0);
      $229=($228|0)==0;
      if (!($229)) {
       $R_0_i=$228;$RP_0_i=$227;
       continue;
      }
      $231=(($R_0_i+16)|0);
      $232=((HEAP32[(($231)>>2)])|0);
      $233=($232|0)==0;
      if ($233) {
       break;
      } else {
       $R_0_i=$232;$RP_0_i=$231;
      }
     }
     $235=$RP_0_i;
     $236=($235>>>0)<($193>>>0);
     if ($236) {
      _abort(); return ((0)|0);
      return ((0)|0);
     } else {
      HEAP32[(($RP_0_i)>>2)]=0;
      $R_1_i=$R_0_i;
      break;
     }
    } else {
     $206=(($v_0_i+8)|0);
     $207=((HEAP32[(($206)>>2)])|0);
     $208=$207;
     $209=($208>>>0)<($193>>>0);
     if ($209) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $211=(($207+12)|0);
     $212=((HEAP32[(($211)>>2)])|0);
     $213=($212|0)==($v_0_i|0);
     if (!($213)) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $215=(($203+8)|0);
     $216=((HEAP32[(($215)>>2)])|0);
     $217=($216|0)==($v_0_i|0);
     if ($217) {
      HEAP32[(($211)>>2)]=$203;
      HEAP32[(($215)>>2)]=$207;
      $R_1_i=$203;
      break;
     } else {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
    }
   } while(0);

   $240=($201|0)==0;
   L78: do {
    if (!($240)) {
     $242=(($v_0_i+28)|0);
     $243=((HEAP32[(($242)>>2)])|0);
     $244=((1280+($243<<2))|0);
     $245=((HEAP32[(($244)>>2)])|0);
     $246=($v_0_i|0)==($245|0);
     do {
      if ($246) {
       HEAP32[(($244)>>2)]=$R_1_i;
       $cond_i=($R_1_i|0)==0;
       if (!($cond_i)) {
        break;
       }
       $248=1<<$243;
       $249=$248^-1;
       $250=((HEAP32[((980)>>2)])|0);
       $251=$250&$249;
       HEAP32[((980)>>2)]=$251;
       break L78;
      } else {
       $253=$201;
       $254=((HEAP32[((992)>>2)])|0);
       $255=($253>>>0)<($254>>>0);
       if ($255) {
        _abort(); return ((0)|0);
        return ((0)|0);
       }
       $257=(($201+16)|0);
       $258=((HEAP32[(($257)>>2)])|0);
       $259=($258|0)==($v_0_i|0);
       if ($259) {
        HEAP32[(($257)>>2)]=$R_1_i;
       } else {
        $262=(($201+20)|0);
        HEAP32[(($262)>>2)]=$R_1_i;
       }
       $265=($R_1_i|0)==0;
       if ($265) {
        break L78;
       }
      }
     } while(0);
     $267=$R_1_i;
     $268=((HEAP32[((992)>>2)])|0);
     $269=($267>>>0)<($268>>>0);
     if ($269) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $271=(($R_1_i+24)|0);
     HEAP32[(($271)>>2)]=$201;
     $272=(($v_0_i+16)|0);
     $273=((HEAP32[(($272)>>2)])|0);
     $274=($273|0)==0;
     do {
      if (!($274)) {
       $276=$273;
       $277=((HEAP32[((992)>>2)])|0);
       $278=($276>>>0)<($277>>>0);
       if ($278) {
        _abort(); return ((0)|0);
        return ((0)|0);
       } else {
        $280=(($R_1_i+16)|0);
        HEAP32[(($280)>>2)]=$273;
        $281=(($273+24)|0);
        HEAP32[(($281)>>2)]=$R_1_i;
        break;
       }
      }
     } while(0);
     $284=(($v_0_i+20)|0);
     $285=((HEAP32[(($284)>>2)])|0);
     $286=($285|0)==0;
     if ($286) {
      break;
     }
     $288=$285;
     $289=((HEAP32[((992)>>2)])|0);
     $290=($288>>>0)<($289>>>0);
     if ($290) {
      _abort(); return ((0)|0);
      return ((0)|0);
     } else {
      $292=(($R_1_i+20)|0);
      HEAP32[(($292)>>2)]=$285;
      $293=(($285+24)|0);
      HEAP32[(($293)>>2)]=$R_1_i;
      break;
     }
    }
   } while(0);
   $297=($rsize_0_i>>>0)<((16)>>>0);
   if ($297) {
    $299=((($rsize_0_i)+($8))|0);
    $300=$299|3;
    $301=(($v_0_i+4)|0);
    HEAP32[(($301)>>2)]=$300;
    $_sum4_i=((($299)+(4))|0);
    $302=(($192+$_sum4_i)|0);
    $303=$302;
    $304=((HEAP32[(($303)>>2)])|0);
    $305=$304|1;
    HEAP32[(($303)>>2)]=$305;
   } else {
    $307=$8|3;
    $308=(($v_0_i+4)|0);
    HEAP32[(($308)>>2)]=$307;
    $309=$rsize_0_i|1;
    $_sum_i137=$8|4;
    $310=(($192+$_sum_i137)|0);
    $311=$310;
    HEAP32[(($311)>>2)]=$309;
    $_sum1_i=((($rsize_0_i)+($8))|0);
    $312=(($192+$_sum1_i)|0);
    $313=$312;
    HEAP32[(($313)>>2)]=$rsize_0_i;
    $314=((HEAP32[((984)>>2)])|0);
    $315=($314|0)==0;
    if (!($315)) {
     $317=((HEAP32[((996)>>2)])|0);
     $318=$314>>>3;
     $319=$318<<1;
     $320=((1016+($319<<2))|0);
     $321=$320;
     $322=((HEAP32[((976)>>2)])|0);
     $323=1<<$318;
     $324=$322&$323;
     $325=($324|0)==0;
     do {
      if ($325) {
       $327=$322|$323;
       HEAP32[((976)>>2)]=$327;
       $_sum2_pre_i=((($319)+(2))|0);
       $_pre_i=((1016+($_sum2_pre_i<<2))|0);
       $F1_0_i=$321;$_pre_phi_i=$_pre_i;
      } else {
       $_sum3_i=((($319)+(2))|0);
       $329=((1016+($_sum3_i<<2))|0);
       $330=((HEAP32[(($329)>>2)])|0);
       $331=$330;
       $332=((HEAP32[((992)>>2)])|0);
       $333=($331>>>0)<($332>>>0);
       if (!($333)) {
        $F1_0_i=$330;$_pre_phi_i=$329;
        break;
       }
       _abort(); return ((0)|0);
       return ((0)|0);
      }
     } while(0);


     HEAP32[(($_pre_phi_i)>>2)]=$317;
     $336=(($F1_0_i+12)|0);
     HEAP32[(($336)>>2)]=$317;
     $337=(($317+8)|0);
     HEAP32[(($337)>>2)]=$F1_0_i;
     $338=(($317+12)|0);
     HEAP32[(($338)>>2)]=$321;
    }
    HEAP32[((984)>>2)]=$rsize_0_i;
    HEAP32[((996)>>2)]=$197;
   }
   $341=(($v_0_i+8)|0);
   $342=$341;
   $343=($341|0)==0;
   if ($343) {
    $nb_0=$8;
    break;
   } else {
    $mem_0=$342;
   }

   return (($mem_0)|0);
  } else {
   $345=($bytes>>>0)>((4294967231)>>>0);
   if ($345) {
    $nb_0=-1;
    break;
   }
   $347=((($bytes)+(11))|0);
   $348=$347&-8;
   $349=((HEAP32[((980)>>2)])|0);
   $350=($349|0)==0;
   if ($350) {
    $nb_0=$348;
    break;
   }
   $352=(((-$348))|0);
   $353=$347>>>8;
   $354=($353|0)==0;
   do {
    if ($354) {
     $idx_0_i=0;
    } else {
     $356=($348>>>0)>((16777215)>>>0);
     if ($356) {
      $idx_0_i=31;
      break;
     }
     $358=((($353)+(1048320))|0);
     $359=$358>>>16;
     $360=$359&8;
     $361=$353<<$360;
     $362=((($361)+(520192))|0);
     $363=$362>>>16;
     $364=$363&4;
     $365=$364|$360;
     $366=$361<<$364;
     $367=((($366)+(245760))|0);
     $368=$367>>>16;
     $369=$368&2;
     $370=$365|$369;
     $371=(((14)-($370))|0);
     $372=$366<<$369;
     $373=$372>>>15;
     $374=((($371)+($373))|0);
     $375=$374<<1;
     $376=((($374)+(7))|0);
     $377=$348>>>($376>>>0);
     $378=$377&1;
     $379=$378|$375;
     $idx_0_i=$379;
    }
   } while(0);

   $381=((1280+($idx_0_i<<2))|0);
   $382=((HEAP32[(($381)>>2)])|0);
   $383=($382|0)==0;
   L126: do {
    if ($383) {
     $v_2_i=0;$rsize_2_i=$352;$t_1_i=0;
    } else {
     $385=($idx_0_i|0)==31;
     if ($385) {
      $390=0;
     } else {
      $387=$idx_0_i>>>1;
      $388=(((25)-($387))|0);
      $390=$388;
     }

     $391=$348<<$390;
     $v_0_i118=0;$rsize_0_i117=$352;$t_0_i116=$382;$sizebits_0_i=$391;$rst_0_i=0;
     while(1) {





      $393=(($t_0_i116+4)|0);
      $394=((HEAP32[(($393)>>2)])|0);
      $395=$394&-8;
      $396=((($395)-($348))|0);
      $397=($396>>>0)<($rsize_0_i117>>>0);
      if ($397) {
       $399=($395|0)==($348|0);
       if ($399) {
        $v_2_i=$t_0_i116;$rsize_2_i=$396;$t_1_i=$t_0_i116;
        break L126;
       } else {
        $v_1_i=$t_0_i116;$rsize_1_i=$396;
       }
      } else {
       $v_1_i=$v_0_i118;$rsize_1_i=$rsize_0_i117;
      }


      $401=(($t_0_i116+20)|0);
      $402=((HEAP32[(($401)>>2)])|0);
      $403=$sizebits_0_i>>>31;
      $404=(($t_0_i116+16+($403<<2))|0);
      $405=((HEAP32[(($404)>>2)])|0);
      $406=($402|0)==0;
      $407=($402|0)==($405|0);
      $or_cond_i=$406|$407;
      $rst_1_i=($or_cond_i?$rst_0_i:$402);
      $408=($405|0)==0;
      $409=$sizebits_0_i<<1;
      if ($408) {
       $v_2_i=$v_1_i;$rsize_2_i=$rsize_1_i;$t_1_i=$rst_1_i;
       break;
      } else {
       $v_0_i118=$v_1_i;$rsize_0_i117=$rsize_1_i;$t_0_i116=$405;$sizebits_0_i=$409;$rst_0_i=$rst_1_i;
      }
     }
    }
   } while(0);



   $410=($t_1_i|0)==0;
   $411=($v_2_i|0)==0;
   $or_cond21_i=$410&$411;
   if ($or_cond21_i) {
    $413=2<<$idx_0_i;
    $414=(((-$413))|0);
    $415=$413|$414;
    $416=$349&$415;
    $417=($416|0)==0;
    if ($417) {
     $nb_0=$348;
     break;
    }
    $419=(((-$416))|0);
    $420=$416&$419;
    $421=((($420)-(1))|0);
    $422=$421>>>12;
    $423=$422&16;
    $424=$421>>>($423>>>0);
    $425=$424>>>5;
    $426=$425&8;
    $427=$426|$423;
    $428=$424>>>($426>>>0);
    $429=$428>>>2;
    $430=$429&4;
    $431=$427|$430;
    $432=$428>>>($430>>>0);
    $433=$432>>>1;
    $434=$433&2;
    $435=$431|$434;
    $436=$432>>>($434>>>0);
    $437=$436>>>1;
    $438=$437&1;
    $439=$435|$438;
    $440=$436>>>($438>>>0);
    $441=((($439)+($440))|0);
    $442=((1280+($441<<2))|0);
    $443=((HEAP32[(($442)>>2)])|0);
    $t_2_ph_i=$443;
   } else {
    $t_2_ph_i=$t_1_i;
   }

   $444=($t_2_ph_i|0)==0;
   if ($444) {
    $rsize_3_lcssa_i=$rsize_2_i;$v_3_lcssa_i=$v_2_i;
   } else {
    $t_228_i=$t_2_ph_i;$rsize_329_i=$rsize_2_i;$v_330_i=$v_2_i;
    while(1) {



     $445=(($t_228_i+4)|0);
     $446=((HEAP32[(($445)>>2)])|0);
     $447=$446&-8;
     $448=((($447)-($348))|0);
     $449=($448>>>0)<($rsize_329_i>>>0);
     $_rsize_3_i=($449?$448:$rsize_329_i);
     $t_2_v_3_i=($449?$t_228_i:$v_330_i);
     $450=(($t_228_i+16)|0);
     $451=((HEAP32[(($450)>>2)])|0);
     $452=($451|0)==0;
     if (!($452)) {
      $t_228_i=$451;$rsize_329_i=$_rsize_3_i;$v_330_i=$t_2_v_3_i;
      continue;
     }
     $453=(($t_228_i+20)|0);
     $454=((HEAP32[(($453)>>2)])|0);
     $455=($454|0)==0;
     if ($455) {
      $rsize_3_lcssa_i=$_rsize_3_i;$v_3_lcssa_i=$t_2_v_3_i;
      break;
     } else {
      $t_228_i=$454;$rsize_329_i=$_rsize_3_i;$v_330_i=$t_2_v_3_i;
     }
    }
   }


   $456=($v_3_lcssa_i|0)==0;
   if ($456) {
    $nb_0=$348;
    break;
   }
   $458=((HEAP32[((984)>>2)])|0);
   $459=((($458)-($348))|0);
   $460=($rsize_3_lcssa_i>>>0)<($459>>>0);
   if (!($460)) {
    $nb_0=$348;
    break;
   }
   $462=$v_3_lcssa_i;
   $463=((HEAP32[((992)>>2)])|0);
   $464=($462>>>0)<($463>>>0);
   if ($464) {
    _abort(); return ((0)|0);
    return ((0)|0);
   }
   $466=(($462+$348)|0);
   $467=$466;
   $468=($462>>>0)<($466>>>0);
   if (!($468)) {
    _abort(); return ((0)|0);
    return ((0)|0);
   }
   $470=(($v_3_lcssa_i+24)|0);
   $471=((HEAP32[(($470)>>2)])|0);
   $472=(($v_3_lcssa_i+12)|0);
   $473=((HEAP32[(($472)>>2)])|0);
   $474=($473|0)==($v_3_lcssa_i|0);
   do {
    if ($474) {
     $490=(($v_3_lcssa_i+20)|0);
     $491=((HEAP32[(($490)>>2)])|0);
     $492=($491|0)==0;
     if ($492) {
      $494=(($v_3_lcssa_i+16)|0);
      $495=((HEAP32[(($494)>>2)])|0);
      $496=($495|0)==0;
      if ($496) {
       $R_1_i122=0;
       break;
      } else {
       $R_0_i120=$495;$RP_0_i119=$494;
      }
     } else {
      $R_0_i120=$491;$RP_0_i119=$490;
     }
     while(1) {


      $497=(($R_0_i120+20)|0);
      $498=((HEAP32[(($497)>>2)])|0);
      $499=($498|0)==0;
      if (!($499)) {
       $R_0_i120=$498;$RP_0_i119=$497;
       continue;
      }
      $501=(($R_0_i120+16)|0);
      $502=((HEAP32[(($501)>>2)])|0);
      $503=($502|0)==0;
      if ($503) {
       break;
      } else {
       $R_0_i120=$502;$RP_0_i119=$501;
      }
     }
     $505=$RP_0_i119;
     $506=($505>>>0)<($463>>>0);
     if ($506) {
      _abort(); return ((0)|0);
      return ((0)|0);
     } else {
      HEAP32[(($RP_0_i119)>>2)]=0;
      $R_1_i122=$R_0_i120;
      break;
     }
    } else {
     $476=(($v_3_lcssa_i+8)|0);
     $477=((HEAP32[(($476)>>2)])|0);
     $478=$477;
     $479=($478>>>0)<($463>>>0);
     if ($479) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $481=(($477+12)|0);
     $482=((HEAP32[(($481)>>2)])|0);
     $483=($482|0)==($v_3_lcssa_i|0);
     if (!($483)) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $485=(($473+8)|0);
     $486=((HEAP32[(($485)>>2)])|0);
     $487=($486|0)==($v_3_lcssa_i|0);
     if ($487) {
      HEAP32[(($481)>>2)]=$473;
      HEAP32[(($485)>>2)]=$477;
      $R_1_i122=$473;
      break;
     } else {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
    }
   } while(0);

   $510=($471|0)==0;
   L176: do {
    if (!($510)) {
     $512=(($v_3_lcssa_i+28)|0);
     $513=((HEAP32[(($512)>>2)])|0);
     $514=((1280+($513<<2))|0);
     $515=((HEAP32[(($514)>>2)])|0);
     $516=($v_3_lcssa_i|0)==($515|0);
     do {
      if ($516) {
       HEAP32[(($514)>>2)]=$R_1_i122;
       $cond_i123=($R_1_i122|0)==0;
       if (!($cond_i123)) {
        break;
       }
       $518=1<<$513;
       $519=$518^-1;
       $520=((HEAP32[((980)>>2)])|0);
       $521=$520&$519;
       HEAP32[((980)>>2)]=$521;
       break L176;
      } else {
       $523=$471;
       $524=((HEAP32[((992)>>2)])|0);
       $525=($523>>>0)<($524>>>0);
       if ($525) {
        _abort(); return ((0)|0);
        return ((0)|0);
       }
       $527=(($471+16)|0);
       $528=((HEAP32[(($527)>>2)])|0);
       $529=($528|0)==($v_3_lcssa_i|0);
       if ($529) {
        HEAP32[(($527)>>2)]=$R_1_i122;
       } else {
        $532=(($471+20)|0);
        HEAP32[(($532)>>2)]=$R_1_i122;
       }
       $535=($R_1_i122|0)==0;
       if ($535) {
        break L176;
       }
      }
     } while(0);
     $537=$R_1_i122;
     $538=((HEAP32[((992)>>2)])|0);
     $539=($537>>>0)<($538>>>0);
     if ($539) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $541=(($R_1_i122+24)|0);
     HEAP32[(($541)>>2)]=$471;
     $542=(($v_3_lcssa_i+16)|0);
     $543=((HEAP32[(($542)>>2)])|0);
     $544=($543|0)==0;
     do {
      if (!($544)) {
       $546=$543;
       $547=((HEAP32[((992)>>2)])|0);
       $548=($546>>>0)<($547>>>0);
       if ($548) {
        _abort(); return ((0)|0);
        return ((0)|0);
       } else {
        $550=(($R_1_i122+16)|0);
        HEAP32[(($550)>>2)]=$543;
        $551=(($543+24)|0);
        HEAP32[(($551)>>2)]=$R_1_i122;
        break;
       }
      }
     } while(0);
     $554=(($v_3_lcssa_i+20)|0);
     $555=((HEAP32[(($554)>>2)])|0);
     $556=($555|0)==0;
     if ($556) {
      break;
     }
     $558=$555;
     $559=((HEAP32[((992)>>2)])|0);
     $560=($558>>>0)<($559>>>0);
     if ($560) {
      _abort(); return ((0)|0);
      return ((0)|0);
     } else {
      $562=(($R_1_i122+20)|0);
      HEAP32[(($562)>>2)]=$555;
      $563=(($555+24)|0);
      HEAP32[(($563)>>2)]=$R_1_i122;
      break;
     }
    }
   } while(0);
   $567=($rsize_3_lcssa_i>>>0)<((16)>>>0);
   do {
    if ($567) {
     $569=((($rsize_3_lcssa_i)+($348))|0);
     $570=$569|3;
     $571=(($v_3_lcssa_i+4)|0);
     HEAP32[(($571)>>2)]=$570;
     $_sum19_i=((($569)+(4))|0);
     $572=(($462+$_sum19_i)|0);
     $573=$572;
     $574=((HEAP32[(($573)>>2)])|0);
     $575=$574|1;
     HEAP32[(($573)>>2)]=$575;
    } else {
     $577=$348|3;
     $578=(($v_3_lcssa_i+4)|0);
     HEAP32[(($578)>>2)]=$577;
     $579=$rsize_3_lcssa_i|1;
     $_sum_i125136=$348|4;
     $580=(($462+$_sum_i125136)|0);
     $581=$580;
     HEAP32[(($581)>>2)]=$579;
     $_sum1_i126=((($rsize_3_lcssa_i)+($348))|0);
     $582=(($462+$_sum1_i126)|0);
     $583=$582;
     HEAP32[(($583)>>2)]=$rsize_3_lcssa_i;
     $584=$rsize_3_lcssa_i>>>3;
     $585=($rsize_3_lcssa_i>>>0)<((256)>>>0);
     if ($585) {
      $587=$584<<1;
      $588=((1016+($587<<2))|0);
      $589=$588;
      $590=((HEAP32[((976)>>2)])|0);
      $591=1<<$584;
      $592=$590&$591;
      $593=($592|0)==0;
      do {
       if ($593) {
        $595=$590|$591;
        HEAP32[((976)>>2)]=$595;
        $_sum15_pre_i=((($587)+(2))|0);
        $_pre_i127=((1016+($_sum15_pre_i<<2))|0);
        $F5_0_i=$589;$_pre_phi_i128=$_pre_i127;
       } else {
        $_sum18_i=((($587)+(2))|0);
        $597=((1016+($_sum18_i<<2))|0);
        $598=((HEAP32[(($597)>>2)])|0);
        $599=$598;
        $600=((HEAP32[((992)>>2)])|0);
        $601=($599>>>0)<($600>>>0);
        if (!($601)) {
         $F5_0_i=$598;$_pre_phi_i128=$597;
         break;
        }
        _abort(); return ((0)|0);
        return ((0)|0);
       }
      } while(0);


      HEAP32[(($_pre_phi_i128)>>2)]=$467;
      $604=(($F5_0_i+12)|0);
      HEAP32[(($604)>>2)]=$467;
      $_sum16_i=((($348)+(8))|0);
      $605=(($462+$_sum16_i)|0);
      $606=$605;
      HEAP32[(($606)>>2)]=$F5_0_i;
      $_sum17_i=((($348)+(12))|0);
      $607=(($462+$_sum17_i)|0);
      $608=$607;
      HEAP32[(($608)>>2)]=$589;
      break;
     }
     $610=$466;
     $611=$rsize_3_lcssa_i>>>8;
     $612=($611|0)==0;
     do {
      if ($612) {
       $I7_0_i=0;
      } else {
       $614=($rsize_3_lcssa_i>>>0)>((16777215)>>>0);
       if ($614) {
        $I7_0_i=31;
        break;
       }
       $616=((($611)+(1048320))|0);
       $617=$616>>>16;
       $618=$617&8;
       $619=$611<<$618;
       $620=((($619)+(520192))|0);
       $621=$620>>>16;
       $622=$621&4;
       $623=$622|$618;
       $624=$619<<$622;
       $625=((($624)+(245760))|0);
       $626=$625>>>16;
       $627=$626&2;
       $628=$623|$627;
       $629=(((14)-($628))|0);
       $630=$624<<$627;
       $631=$630>>>15;
       $632=((($629)+($631))|0);
       $633=$632<<1;
       $634=((($632)+(7))|0);
       $635=$rsize_3_lcssa_i>>>($634>>>0);
       $636=$635&1;
       $637=$636|$633;
       $I7_0_i=$637;
      }
     } while(0);

     $639=((1280+($I7_0_i<<2))|0);
     $_sum2_i=((($348)+(28))|0);
     $640=(($462+$_sum2_i)|0);
     $641=$640;
     HEAP32[(($641)>>2)]=$I7_0_i;
     $_sum3_i129=((($348)+(16))|0);
     $642=(($462+$_sum3_i129)|0);
     $_sum4_i130=((($348)+(20))|0);
     $643=(($462+$_sum4_i130)|0);
     $644=$643;
     HEAP32[(($644)>>2)]=0;
     $645=$642;
     HEAP32[(($645)>>2)]=0;
     $646=((HEAP32[((980)>>2)])|0);
     $647=1<<$I7_0_i;
     $648=$646&$647;
     $649=($648|0)==0;
     if ($649) {
      $651=$646|$647;
      HEAP32[((980)>>2)]=$651;
      HEAP32[(($639)>>2)]=$610;
      $652=$639;
      $_sum5_i=((($348)+(24))|0);
      $653=(($462+$_sum5_i)|0);
      $654=$653;
      HEAP32[(($654)>>2)]=$652;
      $_sum6_i=((($348)+(12))|0);
      $655=(($462+$_sum6_i)|0);
      $656=$655;
      HEAP32[(($656)>>2)]=$610;
      $_sum7_i=((($348)+(8))|0);
      $657=(($462+$_sum7_i)|0);
      $658=$657;
      HEAP32[(($658)>>2)]=$610;
      break;
     }
     $660=((HEAP32[(($639)>>2)])|0);
     $661=($I7_0_i|0)==31;
     if ($661) {
      $666=0;
     } else {
      $663=$I7_0_i>>>1;
      $664=(((25)-($663))|0);
      $666=$664;
     }

     $667=$rsize_3_lcssa_i<<$666;
     $K12_0_i=$667;$T_0_i=$660;
     while(1) {


      $669=(($T_0_i+4)|0);
      $670=((HEAP32[(($669)>>2)])|0);
      $671=$670&-8;
      $672=($671|0)==($rsize_3_lcssa_i|0);
      if ($672) {
       break;
      }
      $674=$K12_0_i>>>31;
      $675=(($T_0_i+16+($674<<2))|0);
      $676=((HEAP32[(($675)>>2)])|0);
      $677=($676|0)==0;
      $678=$K12_0_i<<1;
      if ($677) {
       label = 151;
       break;
      } else {
       $K12_0_i=$678;$T_0_i=$676;
      }
     }
     if ((label|0) == 151) {
      $680=$675;
      $681=((HEAP32[((992)>>2)])|0);
      $682=($680>>>0)<($681>>>0);
      if ($682) {
       _abort(); return ((0)|0);
       return ((0)|0);
      } else {
       HEAP32[(($675)>>2)]=$610;
       $_sum12_i=((($348)+(24))|0);
       $684=(($462+$_sum12_i)|0);
       $685=$684;
       HEAP32[(($685)>>2)]=$T_0_i;
       $_sum13_i=((($348)+(12))|0);
       $686=(($462+$_sum13_i)|0);
       $687=$686;
       HEAP32[(($687)>>2)]=$610;
       $_sum14_i=((($348)+(8))|0);
       $688=(($462+$_sum14_i)|0);
       $689=$688;
       HEAP32[(($689)>>2)]=$610;
       break;
      }
     }
     $692=(($T_0_i+8)|0);
     $693=((HEAP32[(($692)>>2)])|0);
     $694=$T_0_i;
     $695=((HEAP32[((992)>>2)])|0);
     $696=($694>>>0)<($695>>>0);
     if ($696) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $698=$693;
     $699=($698>>>0)<($695>>>0);
     if ($699) {
      _abort(); return ((0)|0);
      return ((0)|0);
     } else {
      $701=(($693+12)|0);
      HEAP32[(($701)>>2)]=$610;
      HEAP32[(($692)>>2)]=$610;
      $_sum9_i=((($348)+(8))|0);
      $702=(($462+$_sum9_i)|0);
      $703=$702;
      HEAP32[(($703)>>2)]=$693;
      $_sum10_i=((($348)+(12))|0);
      $704=(($462+$_sum10_i)|0);
      $705=$704;
      HEAP32[(($705)>>2)]=$T_0_i;
      $_sum11_i=((($348)+(24))|0);
      $706=(($462+$_sum11_i)|0);
      $707=$706;
      HEAP32[(($707)>>2)]=0;
      break;
     }
    }
   } while(0);
   $709=(($v_3_lcssa_i+8)|0);
   $710=$709;
   $711=($709|0)==0;
   if ($711) {
    $nb_0=$348;
    break;
   } else {
    $mem_0=$710;
   }

   return (($mem_0)|0);
  }
 } while(0);

 $712=((HEAP32[((984)>>2)])|0);
 $713=($nb_0>>>0)>($712>>>0);
 if (!($713)) {
  $715=((($712)-($nb_0))|0);
  $716=((HEAP32[((996)>>2)])|0);
  $717=($715>>>0)>((15)>>>0);
  if ($717) {
   $719=$716;
   $720=(($719+$nb_0)|0);
   $721=$720;
   HEAP32[((996)>>2)]=$721;
   HEAP32[((984)>>2)]=$715;
   $722=$715|1;
   $_sum102=((($nb_0)+(4))|0);
   $723=(($719+$_sum102)|0);
   $724=$723;
   HEAP32[(($724)>>2)]=$722;
   $725=(($719+$712)|0);
   $726=$725;
   HEAP32[(($726)>>2)]=$715;
   $727=$nb_0|3;
   $728=(($716+4)|0);
   HEAP32[(($728)>>2)]=$727;
  } else {
   HEAP32[((984)>>2)]=0;
   HEAP32[((996)>>2)]=0;
   $730=$712|3;
   $731=(($716+4)|0);
   HEAP32[(($731)>>2)]=$730;
   $732=$716;
   $_sum101=((($712)+(4))|0);
   $733=(($732+$_sum101)|0);
   $734=$733;
   $735=((HEAP32[(($734)>>2)])|0);
   $736=$735|1;
   HEAP32[(($734)>>2)]=$736;
  }
  $738=(($716+8)|0);
  $739=$738;
  $mem_0=$739;

  return (($mem_0)|0);
 }
 $741=((HEAP32[((988)>>2)])|0);
 $742=($nb_0>>>0)<($741>>>0);
 if ($742) {
  $744=((($741)-($nb_0))|0);
  HEAP32[((988)>>2)]=$744;
  $745=((HEAP32[((1000)>>2)])|0);
  $746=$745;
  $747=(($746+$nb_0)|0);
  $748=$747;
  HEAP32[((1000)>>2)]=$748;
  $749=$744|1;
  $_sum=((($nb_0)+(4))|0);
  $750=(($746+$_sum)|0);
  $751=$750;
  HEAP32[(($751)>>2)]=$749;
  $752=$nb_0|3;
  $753=(($745+4)|0);
  HEAP32[(($753)>>2)]=$752;
  $754=(($745+8)|0);
  $755=$754;
  $mem_0=$755;

  return (($mem_0)|0);
 }
 $757=((HEAP32[((952)>>2)])|0);
 $758=($757|0)==0;
 do {
  if ($758) {
   $760=((_sysconf(((30)|0)))|0);
   $761=((($760)-(1))|0);
   $762=$761&$760;
   $763=($762|0)==0;
   if ($763) {
    HEAP32[((960)>>2)]=$760;
    HEAP32[((956)>>2)]=$760;
    HEAP32[((964)>>2)]=-1;
    HEAP32[((968)>>2)]=-1;
    HEAP32[((972)>>2)]=0;
    HEAP32[((1420)>>2)]=0;
    $765=((_time(((0)|0)))|0);
    $766=$765&-16;
    $767=$766^1431655768;
    HEAP32[((952)>>2)]=$767;
    break;
   } else {
    _abort(); return ((0)|0);
    return ((0)|0);
   }
  }
 } while(0);
 $769=((($nb_0)+(48))|0);
 $770=((HEAP32[((960)>>2)])|0);
 $771=((($nb_0)+(47))|0);
 $772=((($770)+($771))|0);
 $773=(((-$770))|0);
 $774=$772&$773;
 $775=($774>>>0)>($nb_0>>>0);
 if (!($775)) {
  $mem_0=0;

  return (($mem_0)|0);
 }
 $777=((HEAP32[((1416)>>2)])|0);
 $778=($777|0)==0;
 do {
  if (!($778)) {
   $780=((HEAP32[((1408)>>2)])|0);
   $781=((($780)+($774))|0);
   $782=($781>>>0)<=($780>>>0);
   $783=($781>>>0)>($777>>>0);
   $or_cond1_i=$782|$783;
   if ($or_cond1_i) {
    $mem_0=0;
   } else {
    break;
   }

   return (($mem_0)|0);
  }
 } while(0);
 $785=((HEAP32[((1420)>>2)])|0);
 $786=$785&4;
 $787=($786|0)==0;
 L268: do {
  if ($787) {
   $789=((HEAP32[((1000)>>2)])|0);
   $790=($789|0)==0;
   L270: do {
    if ($790) {
     label = 181;
    } else {
     $792=$789;
     $sp_0_i_i=1424;
     while(1) {

      $794=(($sp_0_i_i)|0);
      $795=((HEAP32[(($794)>>2)])|0);
      $796=($795>>>0)>($792>>>0);
      if (!($796)) {
       $798=(($sp_0_i_i+4)|0);
       $799=((HEAP32[(($798)>>2)])|0);
       $800=(($795+$799)|0);
       $801=($800>>>0)>($792>>>0);
       if ($801) {
        break;
       }
      }
      $803=(($sp_0_i_i+8)|0);
      $804=((HEAP32[(($803)>>2)])|0);
      $805=($804|0)==0;
      if ($805) {
       label = 181;
       break L270;
      } else {
       $sp_0_i_i=$804;
      }
     }
     $806=($sp_0_i_i|0)==0;
     if ($806) {
      label = 181;
      break;
     }
     $836=((HEAP32[((988)>>2)])|0);
     $837=((($772)-($836))|0);
     $838=$837&$773;
     $839=($838>>>0)<((2147483647)>>>0);
     if (!($839)) {
      $tsize_0303639_i=0;
      break;
     }
     $841=((_sbrk((($838)|0)))|0);
     $842=((HEAP32[(($794)>>2)])|0);
     $843=((HEAP32[(($798)>>2)])|0);
     $844=(($842+$843)|0);
     $845=($841|0)==($844|0);
     $_3_i=($845?$838:0);
     $_4_i=($845?$841:-1);
     $tbase_0_i=$_4_i;$tsize_0_i=$_3_i;$br_0_i=$841;$ssize_1_i=$838;
     label = 190;
    }
   } while(0);
   do {
    if ((label|0) == 181) {
     $807=((_sbrk(((0)|0)))|0);
     $808=($807|0)==-1;
     if ($808) {
      $tsize_0303639_i=0;
      break;
     }
     $810=$807;
     $811=((HEAP32[((956)>>2)])|0);
     $812=((($811)-(1))|0);
     $813=$812&$810;
     $814=($813|0)==0;
     if ($814) {
      $ssize_0_i=$774;
     } else {
      $816=((($812)+($810))|0);
      $817=(((-$811))|0);
      $818=$816&$817;
      $819=((($774)-($810))|0);
      $820=((($819)+($818))|0);
      $ssize_0_i=$820;
     }

     $822=((HEAP32[((1408)>>2)])|0);
     $823=((($822)+($ssize_0_i))|0);
     $824=($ssize_0_i>>>0)>($nb_0>>>0);
     $825=($ssize_0_i>>>0)<((2147483647)>>>0);
     $or_cond_i131=$824&$825;
     if (!($or_cond_i131)) {
      $tsize_0303639_i=0;
      break;
     }
     $827=((HEAP32[((1416)>>2)])|0);
     $828=($827|0)==0;
     if (!($828)) {
      $830=($823>>>0)<=($822>>>0);
      $831=($823>>>0)>($827>>>0);
      $or_cond2_i=$830|$831;
      if ($or_cond2_i) {
       $tsize_0303639_i=0;
       break;
      }
     }
     $833=((_sbrk((($ssize_0_i)|0)))|0);
     $834=($833|0)==($807|0);
     $ssize_0__i=($834?$ssize_0_i:0);
     $__i=($834?$807:-1);
     $tbase_0_i=$__i;$tsize_0_i=$ssize_0__i;$br_0_i=$833;$ssize_1_i=$ssize_0_i;
     label = 190;
    }
   } while(0);
   L290: do {
    if ((label|0) == 190) {




     $847=(((-$ssize_1_i))|0);
     $848=($tbase_0_i|0)==-1;
     if (!($848)) {
      $tsize_244_i=$tsize_0_i;$tbase_245_i=$tbase_0_i;
      label = 201;
      break L268;
     }
     $850=($br_0_i|0)!=-1;
     $851=($ssize_1_i>>>0)<((2147483647)>>>0);
     $or_cond5_i=$850&$851;
     $852=($ssize_1_i>>>0)<($769>>>0);
     $or_cond6_i=$or_cond5_i&$852;
     do {
      if ($or_cond6_i) {
       $854=((HEAP32[((960)>>2)])|0);
       $855=((($771)-($ssize_1_i))|0);
       $856=((($855)+($854))|0);
       $857=(((-$854))|0);
       $858=$856&$857;
       $859=($858>>>0)<((2147483647)>>>0);
       if (!($859)) {
        $ssize_2_i=$ssize_1_i;
        break;
       }
       $861=((_sbrk((($858)|0)))|0);
       $862=($861|0)==-1;
       if ($862) {
        $866=((_sbrk((($847)|0)))|0);
        $tsize_0303639_i=$tsize_0_i;
        break L290;
       } else {
        $864=((($858)+($ssize_1_i))|0);
        $ssize_2_i=$864;
        break;
       }
      } else {
       $ssize_2_i=$ssize_1_i;
      }
     } while(0);

     $868=($br_0_i|0)==-1;
     if ($868) {
      $tsize_0303639_i=$tsize_0_i;
     } else {
      $tsize_244_i=$ssize_2_i;$tbase_245_i=$br_0_i;
      label = 201;
      break L268;
     }
    }
   } while(0);

   $869=((HEAP32[((1420)>>2)])|0);
   $870=$869|4;
   HEAP32[((1420)>>2)]=$870;
   $tsize_1_i=$tsize_0303639_i;
   label = 198;
  } else {
   $tsize_1_i=0;
   label = 198;
  }
 } while(0);
 do {
  if ((label|0) == 198) {

   $872=($774>>>0)<((2147483647)>>>0);
   if (!($872)) {
    break;
   }
   $874=((_sbrk((($774)|0)))|0);
   $875=((_sbrk(((0)|0)))|0);
   $notlhs_i=($874|0)!=-1;
   $notrhs_i=($875|0)!=-1;
   $or_cond8_not_i=$notrhs_i&$notlhs_i;
   $876=($874>>>0)<($875>>>0);
   $or_cond9_i=$or_cond8_not_i&$876;
   if (!($or_cond9_i)) {
    break;
   }
   $877=$875;
   $878=$874;
   $879=((($877)-($878))|0);
   $880=((($nb_0)+(40))|0);
   $881=($879>>>0)>($880>>>0);
   $_tsize_1_i=($881?$879:$tsize_1_i);
   $_tbase_1_i=($881?$874:-1);
   $882=($_tbase_1_i|0)==-1;
   if (!($882)) {
    $tsize_244_i=$_tsize_1_i;$tbase_245_i=$_tbase_1_i;
    label = 201;
   }
  }
 } while(0);
 do {
  if ((label|0) == 201) {


   $883=((HEAP32[((1408)>>2)])|0);
   $884=((($883)+($tsize_244_i))|0);
   HEAP32[((1408)>>2)]=$884;
   $885=((HEAP32[((1412)>>2)])|0);
   $886=($884>>>0)>($885>>>0);
   if ($886) {
    HEAP32[((1412)>>2)]=$884;
   }
   $888=((HEAP32[((1000)>>2)])|0);
   $889=($888|0)==0;
   L310: do {
    if ($889) {
     $891=((HEAP32[((992)>>2)])|0);
     $892=($891|0)==0;
     $893=($tbase_245_i>>>0)<($891>>>0);
     $or_cond10_i=$892|$893;
     if ($or_cond10_i) {
      HEAP32[((992)>>2)]=$tbase_245_i;
     }
     HEAP32[((1424)>>2)]=$tbase_245_i;
     HEAP32[((1428)>>2)]=$tsize_244_i;
     HEAP32[((1436)>>2)]=0;
     $895=((HEAP32[((952)>>2)])|0);
     HEAP32[((1012)>>2)]=$895;
     HEAP32[((1008)>>2)]=-1;
     $i_02_i_i=0;
     while(1) {

      $897=$i_02_i_i<<1;
      $898=((1016+($897<<2))|0);
      $899=$898;
      $_sum_i_i=((($897)+(3))|0);
      $900=((1016+($_sum_i_i<<2))|0);
      HEAP32[(($900)>>2)]=$899;
      $_sum1_i_i=((($897)+(2))|0);
      $901=((1016+($_sum1_i_i<<2))|0);
      HEAP32[(($901)>>2)]=$899;
      $902=((($i_02_i_i)+(1))|0);
      $903=($902>>>0)<((32)>>>0);
      if ($903) {
       $i_02_i_i=$902;
      } else {
       break;
      }
     }
     $904=((($tsize_244_i)-(40))|0);
     $905=(($tbase_245_i+8)|0);
     $906=$905;
     $907=$906&7;
     $908=($907|0)==0;
     if ($908) {
      $912=0;
     } else {
      $910=(((-$906))|0);
      $911=$910&7;
      $912=$911;
     }

     $913=(($tbase_245_i+$912)|0);
     $914=$913;
     $915=((($904)-($912))|0);
     HEAP32[((1000)>>2)]=$914;
     HEAP32[((988)>>2)]=$915;
     $916=$915|1;
     $_sum_i14_i=((($912)+(4))|0);
     $917=(($tbase_245_i+$_sum_i14_i)|0);
     $918=$917;
     HEAP32[(($918)>>2)]=$916;
     $_sum2_i_i=((($tsize_244_i)-(36))|0);
     $919=(($tbase_245_i+$_sum2_i_i)|0);
     $920=$919;
     HEAP32[(($920)>>2)]=40;
     $921=((HEAP32[((968)>>2)])|0);
     HEAP32[((1004)>>2)]=$921;
    } else {
     $sp_067_i=1424;
     while(1) {

      $922=(($sp_067_i)|0);
      $923=((HEAP32[(($922)>>2)])|0);
      $924=(($sp_067_i+4)|0);
      $925=((HEAP32[(($924)>>2)])|0);
      $926=(($923+$925)|0);
      $927=($tbase_245_i|0)==($926|0);
      if ($927) {
       label = 213;
       break;
      }
      $929=(($sp_067_i+8)|0);
      $930=((HEAP32[(($929)>>2)])|0);
      $931=($930|0)==0;
      if ($931) {
       break;
      } else {
       $sp_067_i=$930;
      }
     }
     do {
      if ((label|0) == 213) {
       $932=(($sp_067_i+12)|0);
       $933=((HEAP32[(($932)>>2)])|0);
       $934=$933&8;
       $935=($934|0)==0;
       if (!($935)) {
        break;
       }
       $937=$888;
       $938=($937>>>0)>=($923>>>0);
       $939=($937>>>0)<($tbase_245_i>>>0);
       $or_cond47_i=$938&$939;
       if (!($or_cond47_i)) {
        break;
       }
       $941=((($925)+($tsize_244_i))|0);
       HEAP32[(($924)>>2)]=$941;
       $942=((HEAP32[((988)>>2)])|0);
       $943=((($942)+($tsize_244_i))|0);
       $944=(($888+8)|0);
       $945=$944;
       $946=$945&7;
       $947=($946|0)==0;
       if ($947) {
        $951=0;
       } else {
        $949=(((-$945))|0);
        $950=$949&7;
        $951=$950;
       }

       $952=(($937+$951)|0);
       $953=$952;
       $954=((($943)-($951))|0);
       HEAP32[((1000)>>2)]=$953;
       HEAP32[((988)>>2)]=$954;
       $955=$954|1;
       $_sum_i18_i=((($951)+(4))|0);
       $956=(($937+$_sum_i18_i)|0);
       $957=$956;
       HEAP32[(($957)>>2)]=$955;
       $_sum2_i19_i=((($943)+(4))|0);
       $958=(($937+$_sum2_i19_i)|0);
       $959=$958;
       HEAP32[(($959)>>2)]=40;
       $960=((HEAP32[((968)>>2)])|0);
       HEAP32[((1004)>>2)]=$960;
       break L310;
      }
     } while(0);
     $961=((HEAP32[((992)>>2)])|0);
     $962=($tbase_245_i>>>0)<($961>>>0);
     if ($962) {
      HEAP32[((992)>>2)]=$tbase_245_i;
     }
     $964=(($tbase_245_i+$tsize_244_i)|0);
     $sp_160_i=1424;
     while(1) {

      $966=(($sp_160_i)|0);
      $967=((HEAP32[(($966)>>2)])|0);
      $968=($967|0)==($964|0);
      if ($968) {
       label = 223;
       break;
      }
      $970=(($sp_160_i+8)|0);
      $971=((HEAP32[(($970)>>2)])|0);
      $972=($971|0)==0;
      if ($972) {
       break;
      } else {
       $sp_160_i=$971;
      }
     }
     do {
      if ((label|0) == 223) {
       $973=(($sp_160_i+12)|0);
       $974=((HEAP32[(($973)>>2)])|0);
       $975=$974&8;
       $976=($975|0)==0;
       if (!($976)) {
        break;
       }
       HEAP32[(($966)>>2)]=$tbase_245_i;
       $978=(($sp_160_i+4)|0);
       $979=((HEAP32[(($978)>>2)])|0);
       $980=((($979)+($tsize_244_i))|0);
       HEAP32[(($978)>>2)]=$980;
       $981=(($tbase_245_i+8)|0);
       $982=$981;
       $983=$982&7;
       $984=($983|0)==0;
       if ($984) {
        $989=0;
       } else {
        $986=(((-$982))|0);
        $987=$986&7;
        $989=$987;
       }

       $990=(($tbase_245_i+$989)|0);
       $_sum93_i=((($tsize_244_i)+(8))|0);
       $991=(($tbase_245_i+$_sum93_i)|0);
       $992=$991;
       $993=$992&7;
       $994=($993|0)==0;
       if ($994) {
        $999=0;
       } else {
        $996=(((-$992))|0);
        $997=$996&7;
        $999=$997;
       }

       $_sum94_i=((($999)+($tsize_244_i))|0);
       $1000=(($tbase_245_i+$_sum94_i)|0);
       $1001=$1000;
       $1002=$1000;
       $1003=$990;
       $1004=((($1002)-($1003))|0);
       $_sum_i21_i=((($989)+($nb_0))|0);
       $1005=(($tbase_245_i+$_sum_i21_i)|0);
       $1006=$1005;
       $1007=((($1004)-($nb_0))|0);
       $1008=$nb_0|3;
       $_sum1_i22_i=((($989)+(4))|0);
       $1009=(($tbase_245_i+$_sum1_i22_i)|0);
       $1010=$1009;
       HEAP32[(($1010)>>2)]=$1008;
       $1011=((HEAP32[((1000)>>2)])|0);
       $1012=($1001|0)==($1011|0);
       do {
        if ($1012) {
         $1014=((HEAP32[((988)>>2)])|0);
         $1015=((($1014)+($1007))|0);
         HEAP32[((988)>>2)]=$1015;
         HEAP32[((1000)>>2)]=$1006;
         $1016=$1015|1;
         $_sum46_i_i=((($_sum_i21_i)+(4))|0);
         $1017=(($tbase_245_i+$_sum46_i_i)|0);
         $1018=$1017;
         HEAP32[(($1018)>>2)]=$1016;
        } else {
         $1020=((HEAP32[((996)>>2)])|0);
         $1021=($1001|0)==($1020|0);
         if ($1021) {
          $1023=((HEAP32[((984)>>2)])|0);
          $1024=((($1023)+($1007))|0);
          HEAP32[((984)>>2)]=$1024;
          HEAP32[((996)>>2)]=$1006;
          $1025=$1024|1;
          $_sum44_i_i=((($_sum_i21_i)+(4))|0);
          $1026=(($tbase_245_i+$_sum44_i_i)|0);
          $1027=$1026;
          HEAP32[(($1027)>>2)]=$1025;
          $_sum45_i_i=((($1024)+($_sum_i21_i))|0);
          $1028=(($tbase_245_i+$_sum45_i_i)|0);
          $1029=$1028;
          HEAP32[(($1029)>>2)]=$1024;
          break;
         }
         $_sum2_i23_i=((($tsize_244_i)+(4))|0);
         $_sum95_i=((($_sum2_i23_i)+($999))|0);
         $1031=(($tbase_245_i+$_sum95_i)|0);
         $1032=$1031;
         $1033=((HEAP32[(($1032)>>2)])|0);
         $1034=$1033&3;
         $1035=($1034|0)==1;
         if ($1035) {
          $1037=$1033&-8;
          $1038=$1033>>>3;
          $1039=($1033>>>0)<((256)>>>0);
          L355: do {
           if ($1039) {
            $_sum3940_i_i=$999|8;
            $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
            $1041=(($tbase_245_i+$_sum105_i)|0);
            $1042=$1041;
            $1043=((HEAP32[(($1042)>>2)])|0);
            $_sum41_i_i=((($tsize_244_i)+(12))|0);
            $_sum106_i=((($_sum41_i_i)+($999))|0);
            $1044=(($tbase_245_i+$_sum106_i)|0);
            $1045=$1044;
            $1046=((HEAP32[(($1045)>>2)])|0);
            $1047=$1038<<1;
            $1048=((1016+($1047<<2))|0);
            $1049=$1048;
            $1050=($1043|0)==($1049|0);
            do {
             if (!($1050)) {
              $1052=$1043;
              $1053=((HEAP32[((992)>>2)])|0);
              $1054=($1052>>>0)<($1053>>>0);
              if ($1054) {
               _abort(); return ((0)|0);
               return ((0)|0);
              }
              $1056=(($1043+12)|0);
              $1057=((HEAP32[(($1056)>>2)])|0);
              $1058=($1057|0)==($1001|0);
              if ($1058) {
               break;
              }
              _abort(); return ((0)|0);
              return ((0)|0);
             }
            } while(0);
            $1059=($1046|0)==($1043|0);
            if ($1059) {
             $1061=1<<$1038;
             $1062=$1061^-1;
             $1063=((HEAP32[((976)>>2)])|0);
             $1064=$1063&$1062;
             HEAP32[((976)>>2)]=$1064;
             break;
            }
            $1066=($1046|0)==($1049|0);
            do {
             if ($1066) {
              $_pre56_i_i=(($1046+8)|0);
              $_pre_phi57_i_i=$_pre56_i_i;
             } else {
              $1068=$1046;
              $1069=((HEAP32[((992)>>2)])|0);
              $1070=($1068>>>0)<($1069>>>0);
              if ($1070) {
               _abort(); return ((0)|0);
               return ((0)|0);
              }
              $1072=(($1046+8)|0);
              $1073=((HEAP32[(($1072)>>2)])|0);
              $1074=($1073|0)==($1001|0);
              if ($1074) {
               $_pre_phi57_i_i=$1072;
               break;
              }
              _abort(); return ((0)|0);
              return ((0)|0);
             }
            } while(0);

            $1075=(($1043+12)|0);
            HEAP32[(($1075)>>2)]=$1046;
            HEAP32[(($_pre_phi57_i_i)>>2)]=$1043;
           } else {
            $1077=$1000;
            $_sum34_i_i=$999|24;
            $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
            $1078=(($tbase_245_i+$_sum96_i)|0);
            $1079=$1078;
            $1080=((HEAP32[(($1079)>>2)])|0);
            $_sum5_i_i=((($tsize_244_i)+(12))|0);
            $_sum97_i=((($_sum5_i_i)+($999))|0);
            $1081=(($tbase_245_i+$_sum97_i)|0);
            $1082=$1081;
            $1083=((HEAP32[(($1082)>>2)])|0);
            $1084=($1083|0)==($1077|0);
            do {
             if ($1084) {
              $_sum67_i_i=$999|16;
              $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
              $1102=(($tbase_245_i+$_sum103_i)|0);
              $1103=$1102;
              $1104=((HEAP32[(($1103)>>2)])|0);
              $1105=($1104|0)==0;
              if ($1105) {
               $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
               $1107=(($tbase_245_i+$_sum104_i)|0);
               $1108=$1107;
               $1109=((HEAP32[(($1108)>>2)])|0);
               $1110=($1109|0)==0;
               if ($1110) {
                $R_1_i_i=0;
                break;
               } else {
                $R_0_i_i=$1109;$RP_0_i_i=$1108;
               }
              } else {
               $R_0_i_i=$1104;$RP_0_i_i=$1103;
              }
              while(1) {


               $1111=(($R_0_i_i+20)|0);
               $1112=((HEAP32[(($1111)>>2)])|0);
               $1113=($1112|0)==0;
               if (!($1113)) {
                $R_0_i_i=$1112;$RP_0_i_i=$1111;
                continue;
               }
               $1115=(($R_0_i_i+16)|0);
               $1116=((HEAP32[(($1115)>>2)])|0);
               $1117=($1116|0)==0;
               if ($1117) {
                break;
               } else {
                $R_0_i_i=$1116;$RP_0_i_i=$1115;
               }
              }
              $1119=$RP_0_i_i;
              $1120=((HEAP32[((992)>>2)])|0);
              $1121=($1119>>>0)<($1120>>>0);
              if ($1121) {
               _abort(); return ((0)|0);
               return ((0)|0);
              } else {
               HEAP32[(($RP_0_i_i)>>2)]=0;
               $R_1_i_i=$R_0_i_i;
               break;
              }
             } else {
              $_sum3637_i_i=$999|8;
              $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
              $1086=(($tbase_245_i+$_sum98_i)|0);
              $1087=$1086;
              $1088=((HEAP32[(($1087)>>2)])|0);
              $1089=$1088;
              $1090=((HEAP32[((992)>>2)])|0);
              $1091=($1089>>>0)<($1090>>>0);
              if ($1091) {
               _abort(); return ((0)|0);
               return ((0)|0);
              }
              $1093=(($1088+12)|0);
              $1094=((HEAP32[(($1093)>>2)])|0);
              $1095=($1094|0)==($1077|0);
              if (!($1095)) {
               _abort(); return ((0)|0);
               return ((0)|0);
              }
              $1097=(($1083+8)|0);
              $1098=((HEAP32[(($1097)>>2)])|0);
              $1099=($1098|0)==($1077|0);
              if ($1099) {
               HEAP32[(($1093)>>2)]=$1083;
               HEAP32[(($1097)>>2)]=$1088;
               $R_1_i_i=$1083;
               break;
              } else {
               _abort(); return ((0)|0);
               return ((0)|0);
              }
             }
            } while(0);

            $1125=($1080|0)==0;
            if ($1125) {
             break;
            }
            $_sum31_i_i=((($tsize_244_i)+(28))|0);
            $_sum99_i=((($_sum31_i_i)+($999))|0);
            $1127=(($tbase_245_i+$_sum99_i)|0);
            $1128=$1127;
            $1129=((HEAP32[(($1128)>>2)])|0);
            $1130=((1280+($1129<<2))|0);
            $1131=((HEAP32[(($1130)>>2)])|0);
            $1132=($1077|0)==($1131|0);
            do {
             if ($1132) {
              HEAP32[(($1130)>>2)]=$R_1_i_i;
              $cond_i_i=($R_1_i_i|0)==0;
              if (!($cond_i_i)) {
               break;
              }
              $1134=1<<$1129;
              $1135=$1134^-1;
              $1136=((HEAP32[((980)>>2)])|0);
              $1137=$1136&$1135;
              HEAP32[((980)>>2)]=$1137;
              break L355;
             } else {
              $1139=$1080;
              $1140=((HEAP32[((992)>>2)])|0);
              $1141=($1139>>>0)<($1140>>>0);
              if ($1141) {
               _abort(); return ((0)|0);
               return ((0)|0);
              }
              $1143=(($1080+16)|0);
              $1144=((HEAP32[(($1143)>>2)])|0);
              $1145=($1144|0)==($1077|0);
              if ($1145) {
               HEAP32[(($1143)>>2)]=$R_1_i_i;
              } else {
               $1148=(($1080+20)|0);
               HEAP32[(($1148)>>2)]=$R_1_i_i;
              }
              $1151=($R_1_i_i|0)==0;
              if ($1151) {
               break L355;
              }
             }
            } while(0);
            $1153=$R_1_i_i;
            $1154=((HEAP32[((992)>>2)])|0);
            $1155=($1153>>>0)<($1154>>>0);
            if ($1155) {
             _abort(); return ((0)|0);
             return ((0)|0);
            }
            $1157=(($R_1_i_i+24)|0);
            HEAP32[(($1157)>>2)]=$1080;
            $_sum3233_i_i=$999|16;
            $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
            $1158=(($tbase_245_i+$_sum100_i)|0);
            $1159=$1158;
            $1160=((HEAP32[(($1159)>>2)])|0);
            $1161=($1160|0)==0;
            do {
             if (!($1161)) {
              $1163=$1160;
              $1164=((HEAP32[((992)>>2)])|0);
              $1165=($1163>>>0)<($1164>>>0);
              if ($1165) {
               _abort(); return ((0)|0);
               return ((0)|0);
              } else {
               $1167=(($R_1_i_i+16)|0);
               HEAP32[(($1167)>>2)]=$1160;
               $1168=(($1160+24)|0);
               HEAP32[(($1168)>>2)]=$R_1_i_i;
               break;
              }
             }
            } while(0);
            $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
            $1171=(($tbase_245_i+$_sum101_i)|0);
            $1172=$1171;
            $1173=((HEAP32[(($1172)>>2)])|0);
            $1174=($1173|0)==0;
            if ($1174) {
             break;
            }
            $1176=$1173;
            $1177=((HEAP32[((992)>>2)])|0);
            $1178=($1176>>>0)<($1177>>>0);
            if ($1178) {
             _abort(); return ((0)|0);
             return ((0)|0);
            } else {
             $1180=(($R_1_i_i+20)|0);
             HEAP32[(($1180)>>2)]=$1173;
             $1181=(($1173+24)|0);
             HEAP32[(($1181)>>2)]=$R_1_i_i;
             break;
            }
           }
          } while(0);
          $_sum9_i_i=$1037|$999;
          $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
          $1185=(($tbase_245_i+$_sum102_i)|0);
          $1186=$1185;
          $1187=((($1037)+($1007))|0);
          $oldfirst_0_i_i=$1186;$qsize_0_i_i=$1187;
         } else {
          $oldfirst_0_i_i=$1001;$qsize_0_i_i=$1007;
         }


         $1189=(($oldfirst_0_i_i+4)|0);
         $1190=((HEAP32[(($1189)>>2)])|0);
         $1191=$1190&-2;
         HEAP32[(($1189)>>2)]=$1191;
         $1192=$qsize_0_i_i|1;
         $_sum10_i_i=((($_sum_i21_i)+(4))|0);
         $1193=(($tbase_245_i+$_sum10_i_i)|0);
         $1194=$1193;
         HEAP32[(($1194)>>2)]=$1192;
         $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
         $1195=(($tbase_245_i+$_sum11_i_i)|0);
         $1196=$1195;
         HEAP32[(($1196)>>2)]=$qsize_0_i_i;
         $1197=$qsize_0_i_i>>>3;
         $1198=($qsize_0_i_i>>>0)<((256)>>>0);
         if ($1198) {
          $1200=$1197<<1;
          $1201=((1016+($1200<<2))|0);
          $1202=$1201;
          $1203=((HEAP32[((976)>>2)])|0);
          $1204=1<<$1197;
          $1205=$1203&$1204;
          $1206=($1205|0)==0;
          do {
           if ($1206) {
            $1208=$1203|$1204;
            HEAP32[((976)>>2)]=$1208;
            $_sum27_pre_i_i=((($1200)+(2))|0);
            $_pre_i24_i=((1016+($_sum27_pre_i_i<<2))|0);
            $F4_0_i_i=$1202;$_pre_phi_i25_i=$_pre_i24_i;
           } else {
            $_sum30_i_i=((($1200)+(2))|0);
            $1210=((1016+($_sum30_i_i<<2))|0);
            $1211=((HEAP32[(($1210)>>2)])|0);
            $1212=$1211;
            $1213=((HEAP32[((992)>>2)])|0);
            $1214=($1212>>>0)<($1213>>>0);
            if (!($1214)) {
             $F4_0_i_i=$1211;$_pre_phi_i25_i=$1210;
             break;
            }
            _abort(); return ((0)|0);
            return ((0)|0);
           }
          } while(0);


          HEAP32[(($_pre_phi_i25_i)>>2)]=$1006;
          $1217=(($F4_0_i_i+12)|0);
          HEAP32[(($1217)>>2)]=$1006;
          $_sum28_i_i=((($_sum_i21_i)+(8))|0);
          $1218=(($tbase_245_i+$_sum28_i_i)|0);
          $1219=$1218;
          HEAP32[(($1219)>>2)]=$F4_0_i_i;
          $_sum29_i_i=((($_sum_i21_i)+(12))|0);
          $1220=(($tbase_245_i+$_sum29_i_i)|0);
          $1221=$1220;
          HEAP32[(($1221)>>2)]=$1202;
          break;
         }
         $1223=$1005;
         $1224=$qsize_0_i_i>>>8;
         $1225=($1224|0)==0;
         do {
          if ($1225) {
           $I7_0_i_i=0;
          } else {
           $1227=($qsize_0_i_i>>>0)>((16777215)>>>0);
           if ($1227) {
            $I7_0_i_i=31;
            break;
           }
           $1229=((($1224)+(1048320))|0);
           $1230=$1229>>>16;
           $1231=$1230&8;
           $1232=$1224<<$1231;
           $1233=((($1232)+(520192))|0);
           $1234=$1233>>>16;
           $1235=$1234&4;
           $1236=$1235|$1231;
           $1237=$1232<<$1235;
           $1238=((($1237)+(245760))|0);
           $1239=$1238>>>16;
           $1240=$1239&2;
           $1241=$1236|$1240;
           $1242=(((14)-($1241))|0);
           $1243=$1237<<$1240;
           $1244=$1243>>>15;
           $1245=((($1242)+($1244))|0);
           $1246=$1245<<1;
           $1247=((($1245)+(7))|0);
           $1248=$qsize_0_i_i>>>($1247>>>0);
           $1249=$1248&1;
           $1250=$1249|$1246;
           $I7_0_i_i=$1250;
          }
         } while(0);

         $1252=((1280+($I7_0_i_i<<2))|0);
         $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
         $1253=(($tbase_245_i+$_sum12_i26_i)|0);
         $1254=$1253;
         HEAP32[(($1254)>>2)]=$I7_0_i_i;
         $_sum13_i_i=((($_sum_i21_i)+(16))|0);
         $1255=(($tbase_245_i+$_sum13_i_i)|0);
         $_sum14_i_i=((($_sum_i21_i)+(20))|0);
         $1256=(($tbase_245_i+$_sum14_i_i)|0);
         $1257=$1256;
         HEAP32[(($1257)>>2)]=0;
         $1258=$1255;
         HEAP32[(($1258)>>2)]=0;
         $1259=((HEAP32[((980)>>2)])|0);
         $1260=1<<$I7_0_i_i;
         $1261=$1259&$1260;
         $1262=($1261|0)==0;
         if ($1262) {
          $1264=$1259|$1260;
          HEAP32[((980)>>2)]=$1264;
          HEAP32[(($1252)>>2)]=$1223;
          $1265=$1252;
          $_sum15_i_i=((($_sum_i21_i)+(24))|0);
          $1266=(($tbase_245_i+$_sum15_i_i)|0);
          $1267=$1266;
          HEAP32[(($1267)>>2)]=$1265;
          $_sum16_i_i=((($_sum_i21_i)+(12))|0);
          $1268=(($tbase_245_i+$_sum16_i_i)|0);
          $1269=$1268;
          HEAP32[(($1269)>>2)]=$1223;
          $_sum17_i_i=((($_sum_i21_i)+(8))|0);
          $1270=(($tbase_245_i+$_sum17_i_i)|0);
          $1271=$1270;
          HEAP32[(($1271)>>2)]=$1223;
          break;
         }
         $1273=((HEAP32[(($1252)>>2)])|0);
         $1274=($I7_0_i_i|0)==31;
         if ($1274) {
          $1279=0;
         } else {
          $1276=$I7_0_i_i>>>1;
          $1277=(((25)-($1276))|0);
          $1279=$1277;
         }

         $1280=$qsize_0_i_i<<$1279;
         $K8_0_i_i=$1280;$T_0_i27_i=$1273;
         while(1) {


          $1282=(($T_0_i27_i+4)|0);
          $1283=((HEAP32[(($1282)>>2)])|0);
          $1284=$1283&-8;
          $1285=($1284|0)==($qsize_0_i_i|0);
          if ($1285) {
           break;
          }
          $1287=$K8_0_i_i>>>31;
          $1288=(($T_0_i27_i+16+($1287<<2))|0);
          $1289=((HEAP32[(($1288)>>2)])|0);
          $1290=($1289|0)==0;
          $1291=$K8_0_i_i<<1;
          if ($1290) {
           label = 296;
           break;
          } else {
           $K8_0_i_i=$1291;$T_0_i27_i=$1289;
          }
         }
         if ((label|0) == 296) {
          $1293=$1288;
          $1294=((HEAP32[((992)>>2)])|0);
          $1295=($1293>>>0)<($1294>>>0);
          if ($1295) {
           _abort(); return ((0)|0);
           return ((0)|0);
          } else {
           HEAP32[(($1288)>>2)]=$1223;
           $_sum24_i_i=((($_sum_i21_i)+(24))|0);
           $1297=(($tbase_245_i+$_sum24_i_i)|0);
           $1298=$1297;
           HEAP32[(($1298)>>2)]=$T_0_i27_i;
           $_sum25_i_i=((($_sum_i21_i)+(12))|0);
           $1299=(($tbase_245_i+$_sum25_i_i)|0);
           $1300=$1299;
           HEAP32[(($1300)>>2)]=$1223;
           $_sum26_i_i=((($_sum_i21_i)+(8))|0);
           $1301=(($tbase_245_i+$_sum26_i_i)|0);
           $1302=$1301;
           HEAP32[(($1302)>>2)]=$1223;
           break;
          }
         }
         $1305=(($T_0_i27_i+8)|0);
         $1306=((HEAP32[(($1305)>>2)])|0);
         $1307=$T_0_i27_i;
         $1308=((HEAP32[((992)>>2)])|0);
         $1309=($1307>>>0)<($1308>>>0);
         if ($1309) {
          _abort(); return ((0)|0);
          return ((0)|0);
         }
         $1311=$1306;
         $1312=($1311>>>0)<($1308>>>0);
         if ($1312) {
          _abort(); return ((0)|0);
          return ((0)|0);
         } else {
          $1314=(($1306+12)|0);
          HEAP32[(($1314)>>2)]=$1223;
          HEAP32[(($1305)>>2)]=$1223;
          $_sum21_i_i=((($_sum_i21_i)+(8))|0);
          $1315=(($tbase_245_i+$_sum21_i_i)|0);
          $1316=$1315;
          HEAP32[(($1316)>>2)]=$1306;
          $_sum22_i_i=((($_sum_i21_i)+(12))|0);
          $1317=(($tbase_245_i+$_sum22_i_i)|0);
          $1318=$1317;
          HEAP32[(($1318)>>2)]=$T_0_i27_i;
          $_sum23_i_i=((($_sum_i21_i)+(24))|0);
          $1319=(($tbase_245_i+$_sum23_i_i)|0);
          $1320=$1319;
          HEAP32[(($1320)>>2)]=0;
          break;
         }
        }
       } while(0);
       $_sum1819_i_i=$989|8;
       $1321=(($tbase_245_i+$_sum1819_i_i)|0);
       $mem_0=$1321;

       return (($mem_0)|0);
      }
     } while(0);
     $1322=$888;
     $sp_0_i_i_i=1424;
     while(1) {

      $1324=(($sp_0_i_i_i)|0);
      $1325=((HEAP32[(($1324)>>2)])|0);
      $1326=($1325>>>0)>($1322>>>0);
      if (!($1326)) {
       $1328=(($sp_0_i_i_i+4)|0);
       $1329=((HEAP32[(($1328)>>2)])|0);
       $1330=(($1325+$1329)|0);
       $1331=($1330>>>0)>($1322>>>0);
       if ($1331) {
        break;
       }
      }
      $1333=(($sp_0_i_i_i+8)|0);
      $1334=((HEAP32[(($1333)>>2)])|0);
      $sp_0_i_i_i=$1334;
     }
     $_sum_i15_i=((($1329)-(47))|0);
     $_sum1_i16_i=((($1329)-(39))|0);
     $1335=(($1325+$_sum1_i16_i)|0);
     $1336=$1335;
     $1337=$1336&7;
     $1338=($1337|0)==0;
     if ($1338) {
      $1343=0;
     } else {
      $1340=(((-$1336))|0);
      $1341=$1340&7;
      $1343=$1341;
     }

     $_sum2_i17_i=((($_sum_i15_i)+($1343))|0);
     $1344=(($1325+$_sum2_i17_i)|0);
     $1345=(($888+16)|0);
     $1346=$1345;
     $1347=($1344>>>0)<($1346>>>0);
     $1348=($1347?$1322:$1344);
     $1349=(($1348+8)|0);
     $1350=$1349;
     $1351=((($tsize_244_i)-(40))|0);
     $1352=(($tbase_245_i+8)|0);
     $1353=$1352;
     $1354=$1353&7;
     $1355=($1354|0)==0;
     if ($1355) {
      $1359=0;
     } else {
      $1357=(((-$1353))|0);
      $1358=$1357&7;
      $1359=$1358;
     }

     $1360=(($tbase_245_i+$1359)|0);
     $1361=$1360;
     $1362=((($1351)-($1359))|0);
     HEAP32[((1000)>>2)]=$1361;
     HEAP32[((988)>>2)]=$1362;
     $1363=$1362|1;
     $_sum_i_i_i=((($1359)+(4))|0);
     $1364=(($tbase_245_i+$_sum_i_i_i)|0);
     $1365=$1364;
     HEAP32[(($1365)>>2)]=$1363;
     $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
     $1366=(($tbase_245_i+$_sum2_i_i_i)|0);
     $1367=$1366;
     HEAP32[(($1367)>>2)]=40;
     $1368=((HEAP32[((968)>>2)])|0);
     HEAP32[((1004)>>2)]=$1368;
     $1369=(($1348+4)|0);
     $1370=$1369;
     HEAP32[(($1370)>>2)]=27;
     HEAP32[(($1349)>>2)]=((HEAP32[((1424)>>2)])|0);HEAP32[((($1349)+(4))>>2)]=((HEAP32[((1428)>>2)])|0);HEAP32[((($1349)+(8))>>2)]=((HEAP32[((1432)>>2)])|0);HEAP32[((($1349)+(12))>>2)]=((HEAP32[((1436)>>2)])|0);
     HEAP32[((1424)>>2)]=$tbase_245_i;
     HEAP32[((1428)>>2)]=$tsize_244_i;
     HEAP32[((1436)>>2)]=0;
     HEAP32[((1432)>>2)]=$1350;
     $1371=(($1348+28)|0);
     $1372=$1371;
     HEAP32[(($1372)>>2)]=7;
     $1373=(($1348+32)|0);
     $1374=($1373>>>0)<($1330>>>0);
     if ($1374) {
      $1375=$1372;
      while(1) {

       $1376=(($1375+4)|0);
       HEAP32[(($1376)>>2)]=7;
       $1377=(($1375+8)|0);
       $1378=$1377;
       $1379=($1378>>>0)<($1330>>>0);
       if ($1379) {
        $1375=$1376;
       } else {
        break;
       }
      }
     }
     $1380=($1348|0)==($1322|0);
     if ($1380) {
      break;
     }
     $1382=$1348;
     $1383=$888;
     $1384=((($1382)-($1383))|0);
     $1385=(($1322+$1384)|0);
     $_sum3_i_i=((($1384)+(4))|0);
     $1386=(($1322+$_sum3_i_i)|0);
     $1387=$1386;
     $1388=((HEAP32[(($1387)>>2)])|0);
     $1389=$1388&-2;
     HEAP32[(($1387)>>2)]=$1389;
     $1390=$1384|1;
     $1391=(($888+4)|0);
     HEAP32[(($1391)>>2)]=$1390;
     $1392=$1385;
     HEAP32[(($1392)>>2)]=$1384;
     $1393=$1384>>>3;
     $1394=($1384>>>0)<((256)>>>0);
     if ($1394) {
      $1396=$1393<<1;
      $1397=((1016+($1396<<2))|0);
      $1398=$1397;
      $1399=((HEAP32[((976)>>2)])|0);
      $1400=1<<$1393;
      $1401=$1399&$1400;
      $1402=($1401|0)==0;
      do {
       if ($1402) {
        $1404=$1399|$1400;
        HEAP32[((976)>>2)]=$1404;
        $_sum11_pre_i_i=((($1396)+(2))|0);
        $_pre_i_i=((1016+($_sum11_pre_i_i<<2))|0);
        $F_0_i_i=$1398;$_pre_phi_i_i=$_pre_i_i;
       } else {
        $_sum12_i_i=((($1396)+(2))|0);
        $1406=((1016+($_sum12_i_i<<2))|0);
        $1407=((HEAP32[(($1406)>>2)])|0);
        $1408=$1407;
        $1409=((HEAP32[((992)>>2)])|0);
        $1410=($1408>>>0)<($1409>>>0);
        if (!($1410)) {
         $F_0_i_i=$1407;$_pre_phi_i_i=$1406;
         break;
        }
        _abort(); return ((0)|0);
        return ((0)|0);
       }
      } while(0);


      HEAP32[(($_pre_phi_i_i)>>2)]=$888;
      $1413=(($F_0_i_i+12)|0);
      HEAP32[(($1413)>>2)]=$888;
      $1414=(($888+8)|0);
      HEAP32[(($1414)>>2)]=$F_0_i_i;
      $1415=(($888+12)|0);
      HEAP32[(($1415)>>2)]=$1398;
      break;
     }
     $1417=$888;
     $1418=$1384>>>8;
     $1419=($1418|0)==0;
     do {
      if ($1419) {
       $I1_0_i_i=0;
      } else {
       $1421=($1384>>>0)>((16777215)>>>0);
       if ($1421) {
        $I1_0_i_i=31;
        break;
       }
       $1423=((($1418)+(1048320))|0);
       $1424=$1423>>>16;
       $1425=$1424&8;
       $1426=$1418<<$1425;
       $1427=((($1426)+(520192))|0);
       $1428=$1427>>>16;
       $1429=$1428&4;
       $1430=$1429|$1425;
       $1431=$1426<<$1429;
       $1432=((($1431)+(245760))|0);
       $1433=$1432>>>16;
       $1434=$1433&2;
       $1435=$1430|$1434;
       $1436=(((14)-($1435))|0);
       $1437=$1431<<$1434;
       $1438=$1437>>>15;
       $1439=((($1436)+($1438))|0);
       $1440=$1439<<1;
       $1441=((($1439)+(7))|0);
       $1442=$1384>>>($1441>>>0);
       $1443=$1442&1;
       $1444=$1443|$1440;
       $I1_0_i_i=$1444;
      }
     } while(0);

     $1446=((1280+($I1_0_i_i<<2))|0);
     $1447=(($888+28)|0);
     $I1_0_c_i_i=$I1_0_i_i;
     HEAP32[(($1447)>>2)]=$I1_0_c_i_i;
     $1448=(($888+20)|0);
     HEAP32[(($1448)>>2)]=0;
     $1449=(($888+16)|0);
     HEAP32[(($1449)>>2)]=0;
     $1450=((HEAP32[((980)>>2)])|0);
     $1451=1<<$I1_0_i_i;
     $1452=$1450&$1451;
     $1453=($1452|0)==0;
     if ($1453) {
      $1455=$1450|$1451;
      HEAP32[((980)>>2)]=$1455;
      HEAP32[(($1446)>>2)]=$1417;
      $1456=(($888+24)|0);
      $_c_i_i=$1446;
      HEAP32[(($1456)>>2)]=$_c_i_i;
      $1457=(($888+12)|0);
      HEAP32[(($1457)>>2)]=$888;
      $1458=(($888+8)|0);
      HEAP32[(($1458)>>2)]=$888;
      break;
     }
     $1460=((HEAP32[(($1446)>>2)])|0);
     $1461=($I1_0_i_i|0)==31;
     if ($1461) {
      $1466=0;
     } else {
      $1463=$I1_0_i_i>>>1;
      $1464=(((25)-($1463))|0);
      $1466=$1464;
     }

     $1467=$1384<<$1466;
     $K2_0_i_i=$1467;$T_0_i_i=$1460;
     while(1) {


      $1469=(($T_0_i_i+4)|0);
      $1470=((HEAP32[(($1469)>>2)])|0);
      $1471=$1470&-8;
      $1472=($1471|0)==($1384|0);
      if ($1472) {
       break;
      }
      $1474=$K2_0_i_i>>>31;
      $1475=(($T_0_i_i+16+($1474<<2))|0);
      $1476=((HEAP32[(($1475)>>2)])|0);
      $1477=($1476|0)==0;
      $1478=$K2_0_i_i<<1;
      if ($1477) {
       label = 331;
       break;
      } else {
       $K2_0_i_i=$1478;$T_0_i_i=$1476;
      }
     }
     if ((label|0) == 331) {
      $1480=$1475;
      $1481=((HEAP32[((992)>>2)])|0);
      $1482=($1480>>>0)<($1481>>>0);
      if ($1482) {
       _abort(); return ((0)|0);
       return ((0)|0);
      } else {
       HEAP32[(($1475)>>2)]=$1417;
       $1484=(($888+24)|0);
       $T_0_c8_i_i=$T_0_i_i;
       HEAP32[(($1484)>>2)]=$T_0_c8_i_i;
       $1485=(($888+12)|0);
       HEAP32[(($1485)>>2)]=$888;
       $1486=(($888+8)|0);
       HEAP32[(($1486)>>2)]=$888;
       break;
      }
     }
     $1489=(($T_0_i_i+8)|0);
     $1490=((HEAP32[(($1489)>>2)])|0);
     $1491=$T_0_i_i;
     $1492=((HEAP32[((992)>>2)])|0);
     $1493=($1491>>>0)<($1492>>>0);
     if ($1493) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $1495=$1490;
     $1496=($1495>>>0)<($1492>>>0);
     if ($1496) {
      _abort(); return ((0)|0);
      return ((0)|0);
     } else {
      $1498=(($1490+12)|0);
      HEAP32[(($1498)>>2)]=$1417;
      HEAP32[(($1489)>>2)]=$1417;
      $1499=(($888+8)|0);
      $_c7_i_i=$1490;
      HEAP32[(($1499)>>2)]=$_c7_i_i;
      $1500=(($888+12)|0);
      $T_0_c_i_i=$T_0_i_i;
      HEAP32[(($1500)>>2)]=$T_0_c_i_i;
      $1501=(($888+24)|0);
      HEAP32[(($1501)>>2)]=0;
      break;
     }
    }
   } while(0);
   $1502=((HEAP32[((988)>>2)])|0);
   $1503=($1502>>>0)>($nb_0>>>0);
   if (!($1503)) {
    break;
   }
   $1505=((($1502)-($nb_0))|0);
   HEAP32[((988)>>2)]=$1505;
   $1506=((HEAP32[((1000)>>2)])|0);
   $1507=$1506;
   $1508=(($1507+$nb_0)|0);
   $1509=$1508;
   HEAP32[((1000)>>2)]=$1509;
   $1510=$1505|1;
   $_sum_i134=((($nb_0)+(4))|0);
   $1511=(($1507+$_sum_i134)|0);
   $1512=$1511;
   HEAP32[(($1512)>>2)]=$1510;
   $1513=$nb_0|3;
   $1514=(($1506+4)|0);
   HEAP32[(($1514)>>2)]=$1513;
   $1515=(($1506+8)|0);
   $1516=$1515;
   $mem_0=$1516;

   return (($mem_0)|0);
  }
 } while(0);
 $1517=((___errno_location())|0);
 HEAP32[(($1517)>>2)]=12;
 $mem_0=0;

 return (($mem_0)|0);
}


function _free($mem){
 $mem=($mem)|0;
 var $1=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$10=0,$11=0,$12=0,$14=0,$_sum=0,$15=0,$16=0,$17=0,$18=0,$20=0,$21=0,$22=0,$_sum232=0;
 var $24=0,$25=0,$26=0,$27=0,$29=0,$30=0,$32=0,$33=0,$_sum276=0,$35=0,$36=0,$37=0,$_sum277=0,$38=0,$39=0,$40=0,$41=0,$42=0,$43=0,$44=0;
 var $46=0,$47=0,$49=0,$50=0,$51=0,$52=0,$54=0,$55=0,$56=0,$57=0,$59=0,$_pre307=0,$61=0,$62=0,$64=0,$65=0,$66=0,$_pre_phi308=0,$67=0,$69=0;
 var $_sum266=0,$70=0,$71=0,$72=0,$_sum267=0,$73=0,$74=0,$75=0,$76=0,$_sum273=0,$78=0,$79=0,$80=0,$81=0,$82=0,$84=0,$85=0,$86=0,$88=0,$89=0;
 var $90=0,$_sum269=0,$93=0,$94=0,$95=0,$96=0,$_sum268=0,$98=0,$99=0,$100=0,$101=0,$RP_0=0,$R_0=0,$102=0,$103=0,$104=0,$106=0,$107=0,$108=0,$110=0;
 var $111=0,$R_1=0,$115=0,$_sum270=0,$117=0,$118=0,$119=0,$120=0,$121=0,$122=0,$cond=0,$124=0,$125=0,$126=0,$127=0,$129=0,$130=0,$131=0,$133=0,$134=0;
 var $135=0,$138=0,$141=0,$143=0,$144=0,$145=0,$147=0,$_sum271=0,$148=0,$149=0,$150=0,$151=0,$153=0,$154=0,$155=0,$157=0,$158=0,$_sum272=0,$161=0,$162=0;
 var $163=0,$164=0,$166=0,$167=0,$168=0,$170=0,$171=0,$_sum233=0,$175=0,$176=0,$177=0,$178=0,$179=0,$181=0,$182=0,$183=0,$_sum264=0,$184=0,$185=0,$186=0;
 var $psize_0=0,$p_0=0,$188=0,$189=0,$_sum263=0,$191=0,$192=0,$193=0,$194=0,$phitmp=0,$196=0,$197=0,$199=0,$200=0,$202=0,$203=0,$204=0,$205=0,$206=0,$207=0;
 var $210=0,$211=0,$213=0,$214=0,$215=0,$216=0,$217=0,$218=0,$220=0,$221=0,$222=0,$223=0,$225=0,$226=0,$227=0,$_sum257258=0,$228=0,$229=0,$230=0,$231=0;
 var $232=0,$233=0,$234=0,$236=0,$237=0,$238=0,$240=0,$241=0,$242=0,$243=0,$245=0,$246=0,$247=0,$248=0,$250=0,$_pre305=0,$252=0,$253=0,$254=0,$256=0;
 var $257=0,$258=0,$_pre_phi306=0,$259=0,$261=0,$_sum235=0,$262=0,$263=0,$264=0,$_sum236237=0,$265=0,$266=0,$267=0,$268=0,$270=0,$271=0,$272=0,$273=0,$274=0,$275=0;
 var $277=0,$278=0,$279=0,$281=0,$282=0,$283=0,$_sum239=0,$286=0,$287=0,$288=0,$289=0,$_sum238=0,$291=0,$292=0,$293=0,$294=0,$RP9_0=0,$R7_0=0,$295=0,$296=0;
 var $297=0,$299=0,$300=0,$301=0,$303=0,$304=0,$305=0,$R7_1=0,$309=0,$_sum250=0,$311=0,$312=0,$313=0,$314=0,$315=0,$316=0,$cond298=0,$318=0,$319=0,$320=0;
 var $321=0,$323=0,$324=0,$325=0,$327=0,$328=0,$329=0,$332=0,$335=0,$337=0,$338=0,$339=0,$341=0,$_sum251=0,$342=0,$343=0,$344=0,$345=0,$347=0,$348=0;
 var $349=0,$351=0,$352=0,$_sum252=0,$355=0,$356=0,$357=0,$358=0,$360=0,$361=0,$362=0,$364=0,$365=0,$368=0,$369=0,$370=0,$371=0,$372=0,$373=0,$376=0;
 var $377=0,$378=0,$379=0,$380=0,$psize_1=0,$382=0,$383=0,$385=0,$386=0,$387=0,$388=0,$389=0,$390=0,$391=0,$393=0,$_sum248_pre=0,$_pre=0,$_sum249=0,$395=0,$396=0;
 var $397=0,$398=0,$399=0,$_pre_phi=0,$F16_0=0,$402=0,$403=0,$404=0,$406=0,$407=0,$408=0,$410=0,$412=0,$413=0,$414=0,$415=0,$416=0,$417=0,$418=0,$419=0;
 var $420=0,$421=0,$422=0,$423=0,$424=0,$425=0,$426=0,$427=0,$428=0,$429=0,$430=0,$431=0,$432=0,$433=0,$I18_0=0,$435=0,$436=0,$I18_0_c=0,$437=0,$438=0;
 var $439=0,$440=0,$441=0,$442=0,$444=0,$445=0,$_c=0,$446=0,$447=0,$449=0,$450=0,$452=0,$453=0,$455=0,$456=0,$T_0=0,$K19_0=0,$458=0,$459=0,$460=0;
 var $461=0,$463=0,$464=0,$465=0,$466=0,$467=0,$469=0,$470=0,$471=0,$473=0,$T_0_c245=0,$474=0,$475=0,$478=0,$479=0,$480=0,$481=0,$482=0,$484=0,$485=0;
 var $487=0,$488=0,$_c244=0,$489=0,$T_0_c=0,$490=0,$492=0,$493=0,$494=0,$sp_0_in_i=0,$sp_0_i=0,$495=0,$496=0,label=0;

 $1=($mem|0)==0;
 if ($1) {
  return;
 }
 $3=((($mem)-(8))|0);
 $4=$3;
 $5=((HEAP32[((992)>>2)])|0);
 $6=($3>>>0)<($5>>>0);
 if ($6) {
  _abort();

 }
 $8=((($mem)-(4))|0);
 $9=$8;
 $10=((HEAP32[(($9)>>2)])|0);
 $11=$10&3;
 $12=($11|0)==1;
 if ($12) {
  _abort();

 }
 $14=$10&-8;
 $_sum=((($14)-(8))|0);
 $15=(($mem+$_sum)|0);
 $16=$15;
 $17=$10&1;
 $18=($17|0)==0;
 L10: do {
  if ($18) {
   $20=$3;
   $21=((HEAP32[(($20)>>2)])|0);
   $22=($11|0)==0;
   if ($22) {
    return;
   }
   $_sum232=(((-8)-($21))|0);
   $24=(($mem+$_sum232)|0);
   $25=$24;
   $26=((($21)+($14))|0);
   $27=($24>>>0)<($5>>>0);
   if ($27) {
    _abort();

   }
   $29=((HEAP32[((996)>>2)])|0);
   $30=($25|0)==($29|0);
   if ($30) {
    $_sum233=((($14)-(4))|0);
    $175=(($mem+$_sum233)|0);
    $176=$175;
    $177=((HEAP32[(($176)>>2)])|0);
    $178=$177&3;
    $179=($178|0)==3;
    if (!($179)) {
     $p_0=$25;$psize_0=$26;
     break;
    }
    HEAP32[((984)>>2)]=$26;
    $181=((HEAP32[(($176)>>2)])|0);
    $182=$181&-2;
    HEAP32[(($176)>>2)]=$182;
    $183=$26|1;
    $_sum264=((($_sum232)+(4))|0);
    $184=(($mem+$_sum264)|0);
    $185=$184;
    HEAP32[(($185)>>2)]=$183;
    $186=$15;
    HEAP32[(($186)>>2)]=$26;
    return;
   }
   $32=$21>>>3;
   $33=($21>>>0)<((256)>>>0);
   if ($33) {
    $_sum276=((($_sum232)+(8))|0);
    $35=(($mem+$_sum276)|0);
    $36=$35;
    $37=((HEAP32[(($36)>>2)])|0);
    $_sum277=((($_sum232)+(12))|0);
    $38=(($mem+$_sum277)|0);
    $39=$38;
    $40=((HEAP32[(($39)>>2)])|0);
    $41=$32<<1;
    $42=((1016+($41<<2))|0);
    $43=$42;
    $44=($37|0)==($43|0);
    do {
     if (!($44)) {
      $46=$37;
      $47=($46>>>0)<($5>>>0);
      if ($47) {
       _abort();

      }
      $49=(($37+12)|0);
      $50=((HEAP32[(($49)>>2)])|0);
      $51=($50|0)==($25|0);
      if ($51) {
       break;
      }
      _abort();

     }
    } while(0);
    $52=($40|0)==($37|0);
    if ($52) {
     $54=1<<$32;
     $55=$54^-1;
     $56=((HEAP32[((976)>>2)])|0);
     $57=$56&$55;
     HEAP32[((976)>>2)]=$57;
     $p_0=$25;$psize_0=$26;
     break;
    }
    $59=($40|0)==($43|0);
    do {
     if ($59) {
      $_pre307=(($40+8)|0);
      $_pre_phi308=$_pre307;
     } else {
      $61=$40;
      $62=($61>>>0)<($5>>>0);
      if ($62) {
       _abort();

      }
      $64=(($40+8)|0);
      $65=((HEAP32[(($64)>>2)])|0);
      $66=($65|0)==($25|0);
      if ($66) {
       $_pre_phi308=$64;
       break;
      }
      _abort();

     }
    } while(0);

    $67=(($37+12)|0);
    HEAP32[(($67)>>2)]=$40;
    HEAP32[(($_pre_phi308)>>2)]=$37;
    $p_0=$25;$psize_0=$26;
    break;
   }
   $69=$24;
   $_sum266=((($_sum232)+(24))|0);
   $70=(($mem+$_sum266)|0);
   $71=$70;
   $72=((HEAP32[(($71)>>2)])|0);
   $_sum267=((($_sum232)+(12))|0);
   $73=(($mem+$_sum267)|0);
   $74=$73;
   $75=((HEAP32[(($74)>>2)])|0);
   $76=($75|0)==($69|0);
   do {
    if ($76) {
     $_sum269=((($_sum232)+(20))|0);
     $93=(($mem+$_sum269)|0);
     $94=$93;
     $95=((HEAP32[(($94)>>2)])|0);
     $96=($95|0)==0;
     if ($96) {
      $_sum268=((($_sum232)+(16))|0);
      $98=(($mem+$_sum268)|0);
      $99=$98;
      $100=((HEAP32[(($99)>>2)])|0);
      $101=($100|0)==0;
      if ($101) {
       $R_1=0;
       break;
      } else {
       $R_0=$100;$RP_0=$99;
      }
     } else {
      $R_0=$95;$RP_0=$94;
     }
     while(1) {


      $102=(($R_0+20)|0);
      $103=((HEAP32[(($102)>>2)])|0);
      $104=($103|0)==0;
      if (!($104)) {
       $R_0=$103;$RP_0=$102;
       continue;
      }
      $106=(($R_0+16)|0);
      $107=((HEAP32[(($106)>>2)])|0);
      $108=($107|0)==0;
      if ($108) {
       break;
      } else {
       $R_0=$107;$RP_0=$106;
      }
     }
     $110=$RP_0;
     $111=($110>>>0)<($5>>>0);
     if ($111) {
      _abort();

     } else {
      HEAP32[(($RP_0)>>2)]=0;
      $R_1=$R_0;
      break;
     }
    } else {
     $_sum273=((($_sum232)+(8))|0);
     $78=(($mem+$_sum273)|0);
     $79=$78;
     $80=((HEAP32[(($79)>>2)])|0);
     $81=$80;
     $82=($81>>>0)<($5>>>0);
     if ($82) {
      _abort();

     }
     $84=(($80+12)|0);
     $85=((HEAP32[(($84)>>2)])|0);
     $86=($85|0)==($69|0);
     if (!($86)) {
      _abort();

     }
     $88=(($75+8)|0);
     $89=((HEAP32[(($88)>>2)])|0);
     $90=($89|0)==($69|0);
     if ($90) {
      HEAP32[(($84)>>2)]=$75;
      HEAP32[(($88)>>2)]=$80;
      $R_1=$75;
      break;
     } else {
      _abort();

     }
    }
   } while(0);

   $115=($72|0)==0;
   if ($115) {
    $p_0=$25;$psize_0=$26;
    break;
   }
   $_sum270=((($_sum232)+(28))|0);
   $117=(($mem+$_sum270)|0);
   $118=$117;
   $119=((HEAP32[(($118)>>2)])|0);
   $120=((1280+($119<<2))|0);
   $121=((HEAP32[(($120)>>2)])|0);
   $122=($69|0)==($121|0);
   do {
    if ($122) {
     HEAP32[(($120)>>2)]=$R_1;
     $cond=($R_1|0)==0;
     if (!($cond)) {
      break;
     }
     $124=1<<$119;
     $125=$124^-1;
     $126=((HEAP32[((980)>>2)])|0);
     $127=$126&$125;
     HEAP32[((980)>>2)]=$127;
     $p_0=$25;$psize_0=$26;
     break L10;
    } else {
     $129=$72;
     $130=((HEAP32[((992)>>2)])|0);
     $131=($129>>>0)<($130>>>0);
     if ($131) {
      _abort();

     }
     $133=(($72+16)|0);
     $134=((HEAP32[(($133)>>2)])|0);
     $135=($134|0)==($69|0);
     if ($135) {
      HEAP32[(($133)>>2)]=$R_1;
     } else {
      $138=(($72+20)|0);
      HEAP32[(($138)>>2)]=$R_1;
     }
     $141=($R_1|0)==0;
     if ($141) {
      $p_0=$25;$psize_0=$26;
      break L10;
     }
    }
   } while(0);
   $143=$R_1;
   $144=((HEAP32[((992)>>2)])|0);
   $145=($143>>>0)<($144>>>0);
   if ($145) {
    _abort();

   }
   $147=(($R_1+24)|0);
   HEAP32[(($147)>>2)]=$72;
   $_sum271=((($_sum232)+(16))|0);
   $148=(($mem+$_sum271)|0);
   $149=$148;
   $150=((HEAP32[(($149)>>2)])|0);
   $151=($150|0)==0;
   do {
    if (!($151)) {
     $153=$150;
     $154=((HEAP32[((992)>>2)])|0);
     $155=($153>>>0)<($154>>>0);
     if ($155) {
      _abort();

     } else {
      $157=(($R_1+16)|0);
      HEAP32[(($157)>>2)]=$150;
      $158=(($150+24)|0);
      HEAP32[(($158)>>2)]=$R_1;
      break;
     }
    }
   } while(0);
   $_sum272=((($_sum232)+(20))|0);
   $161=(($mem+$_sum272)|0);
   $162=$161;
   $163=((HEAP32[(($162)>>2)])|0);
   $164=($163|0)==0;
   if ($164) {
    $p_0=$25;$psize_0=$26;
    break;
   }
   $166=$163;
   $167=((HEAP32[((992)>>2)])|0);
   $168=($166>>>0)<($167>>>0);
   if ($168) {
    _abort();

   } else {
    $170=(($R_1+20)|0);
    HEAP32[(($170)>>2)]=$163;
    $171=(($163+24)|0);
    HEAP32[(($171)>>2)]=$R_1;
    $p_0=$25;$psize_0=$26;
    break;
   }
  } else {
   $p_0=$4;$psize_0=$14;
  }
 } while(0);


 $188=$p_0;
 $189=($188>>>0)<($15>>>0);
 if (!($189)) {
  _abort();

 }
 $_sum263=((($14)-(4))|0);
 $191=(($mem+$_sum263)|0);
 $192=$191;
 $193=((HEAP32[(($192)>>2)])|0);
 $194=$193&1;
 $phitmp=($194|0)==0;
 if ($phitmp) {
  _abort();

 }
 $196=$193&2;
 $197=($196|0)==0;
 do {
  if ($197) {
   $199=((HEAP32[((1000)>>2)])|0);
   $200=($16|0)==($199|0);
   if ($200) {
    $202=((HEAP32[((988)>>2)])|0);
    $203=((($202)+($psize_0))|0);
    HEAP32[((988)>>2)]=$203;
    HEAP32[((1000)>>2)]=$p_0;
    $204=$203|1;
    $205=(($p_0+4)|0);
    HEAP32[(($205)>>2)]=$204;
    $206=((HEAP32[((996)>>2)])|0);
    $207=($p_0|0)==($206|0);
    if (!($207)) {
     return;
    }
    HEAP32[((996)>>2)]=0;
    HEAP32[((984)>>2)]=0;
    return;
   }
   $210=((HEAP32[((996)>>2)])|0);
   $211=($16|0)==($210|0);
   if ($211) {
    $213=((HEAP32[((984)>>2)])|0);
    $214=((($213)+($psize_0))|0);
    HEAP32[((984)>>2)]=$214;
    HEAP32[((996)>>2)]=$p_0;
    $215=$214|1;
    $216=(($p_0+4)|0);
    HEAP32[(($216)>>2)]=$215;
    $217=(($188+$214)|0);
    $218=$217;
    HEAP32[(($218)>>2)]=$214;
    return;
   }
   $220=$193&-8;
   $221=((($220)+($psize_0))|0);
   $222=$193>>>3;
   $223=($193>>>0)<((256)>>>0);
   L113: do {
    if ($223) {
     $225=(($mem+$14)|0);
     $226=$225;
     $227=((HEAP32[(($226)>>2)])|0);
     $_sum257258=$14|4;
     $228=(($mem+$_sum257258)|0);
     $229=$228;
     $230=((HEAP32[(($229)>>2)])|0);
     $231=$222<<1;
     $232=((1016+($231<<2))|0);
     $233=$232;
     $234=($227|0)==($233|0);
     do {
      if (!($234)) {
       $236=$227;
       $237=((HEAP32[((992)>>2)])|0);
       $238=($236>>>0)<($237>>>0);
       if ($238) {
        _abort();

       }
       $240=(($227+12)|0);
       $241=((HEAP32[(($240)>>2)])|0);
       $242=($241|0)==($16|0);
       if ($242) {
        break;
       }
       _abort();

      }
     } while(0);
     $243=($230|0)==($227|0);
     if ($243) {
      $245=1<<$222;
      $246=$245^-1;
      $247=((HEAP32[((976)>>2)])|0);
      $248=$247&$246;
      HEAP32[((976)>>2)]=$248;
      break;
     }
     $250=($230|0)==($233|0);
     do {
      if ($250) {
       $_pre305=(($230+8)|0);
       $_pre_phi306=$_pre305;
      } else {
       $252=$230;
       $253=((HEAP32[((992)>>2)])|0);
       $254=($252>>>0)<($253>>>0);
       if ($254) {
        _abort();

       }
       $256=(($230+8)|0);
       $257=((HEAP32[(($256)>>2)])|0);
       $258=($257|0)==($16|0);
       if ($258) {
        $_pre_phi306=$256;
        break;
       }
       _abort();

      }
     } while(0);

     $259=(($227+12)|0);
     HEAP32[(($259)>>2)]=$230;
     HEAP32[(($_pre_phi306)>>2)]=$227;
    } else {
     $261=$15;
     $_sum235=((($14)+(16))|0);
     $262=(($mem+$_sum235)|0);
     $263=$262;
     $264=((HEAP32[(($263)>>2)])|0);
     $_sum236237=$14|4;
     $265=(($mem+$_sum236237)|0);
     $266=$265;
     $267=((HEAP32[(($266)>>2)])|0);
     $268=($267|0)==($261|0);
     do {
      if ($268) {
       $_sum239=((($14)+(12))|0);
       $286=(($mem+$_sum239)|0);
       $287=$286;
       $288=((HEAP32[(($287)>>2)])|0);
       $289=($288|0)==0;
       if ($289) {
        $_sum238=((($14)+(8))|0);
        $291=(($mem+$_sum238)|0);
        $292=$291;
        $293=((HEAP32[(($292)>>2)])|0);
        $294=($293|0)==0;
        if ($294) {
         $R7_1=0;
         break;
        } else {
         $R7_0=$293;$RP9_0=$292;
        }
       } else {
        $R7_0=$288;$RP9_0=$287;
       }
       while(1) {


        $295=(($R7_0+20)|0);
        $296=((HEAP32[(($295)>>2)])|0);
        $297=($296|0)==0;
        if (!($297)) {
         $R7_0=$296;$RP9_0=$295;
         continue;
        }
        $299=(($R7_0+16)|0);
        $300=((HEAP32[(($299)>>2)])|0);
        $301=($300|0)==0;
        if ($301) {
         break;
        } else {
         $R7_0=$300;$RP9_0=$299;
        }
       }
       $303=$RP9_0;
       $304=((HEAP32[((992)>>2)])|0);
       $305=($303>>>0)<($304>>>0);
       if ($305) {
        _abort();

       } else {
        HEAP32[(($RP9_0)>>2)]=0;
        $R7_1=$R7_0;
        break;
       }
      } else {
       $270=(($mem+$14)|0);
       $271=$270;
       $272=((HEAP32[(($271)>>2)])|0);
       $273=$272;
       $274=((HEAP32[((992)>>2)])|0);
       $275=($273>>>0)<($274>>>0);
       if ($275) {
        _abort();

       }
       $277=(($272+12)|0);
       $278=((HEAP32[(($277)>>2)])|0);
       $279=($278|0)==($261|0);
       if (!($279)) {
        _abort();

       }
       $281=(($267+8)|0);
       $282=((HEAP32[(($281)>>2)])|0);
       $283=($282|0)==($261|0);
       if ($283) {
        HEAP32[(($277)>>2)]=$267;
        HEAP32[(($281)>>2)]=$272;
        $R7_1=$267;
        break;
       } else {
        _abort();

       }
      }
     } while(0);

     $309=($264|0)==0;
     if ($309) {
      break;
     }
     $_sum250=((($14)+(20))|0);
     $311=(($mem+$_sum250)|0);
     $312=$311;
     $313=((HEAP32[(($312)>>2)])|0);
     $314=((1280+($313<<2))|0);
     $315=((HEAP32[(($314)>>2)])|0);
     $316=($261|0)==($315|0);
     do {
      if ($316) {
       HEAP32[(($314)>>2)]=$R7_1;
       $cond298=($R7_1|0)==0;
       if (!($cond298)) {
        break;
       }
       $318=1<<$313;
       $319=$318^-1;
       $320=((HEAP32[((980)>>2)])|0);
       $321=$320&$319;
       HEAP32[((980)>>2)]=$321;
       break L113;
      } else {
       $323=$264;
       $324=((HEAP32[((992)>>2)])|0);
       $325=($323>>>0)<($324>>>0);
       if ($325) {
        _abort();

       }
       $327=(($264+16)|0);
       $328=((HEAP32[(($327)>>2)])|0);
       $329=($328|0)==($261|0);
       if ($329) {
        HEAP32[(($327)>>2)]=$R7_1;
       } else {
        $332=(($264+20)|0);
        HEAP32[(($332)>>2)]=$R7_1;
       }
       $335=($R7_1|0)==0;
       if ($335) {
        break L113;
       }
      }
     } while(0);
     $337=$R7_1;
     $338=((HEAP32[((992)>>2)])|0);
     $339=($337>>>0)<($338>>>0);
     if ($339) {
      _abort();

     }
     $341=(($R7_1+24)|0);
     HEAP32[(($341)>>2)]=$264;
     $_sum251=((($14)+(8))|0);
     $342=(($mem+$_sum251)|0);
     $343=$342;
     $344=((HEAP32[(($343)>>2)])|0);
     $345=($344|0)==0;
     do {
      if (!($345)) {
       $347=$344;
       $348=((HEAP32[((992)>>2)])|0);
       $349=($347>>>0)<($348>>>0);
       if ($349) {
        _abort();

       } else {
        $351=(($R7_1+16)|0);
        HEAP32[(($351)>>2)]=$344;
        $352=(($344+24)|0);
        HEAP32[(($352)>>2)]=$R7_1;
        break;
       }
      }
     } while(0);
     $_sum252=((($14)+(12))|0);
     $355=(($mem+$_sum252)|0);
     $356=$355;
     $357=((HEAP32[(($356)>>2)])|0);
     $358=($357|0)==0;
     if ($358) {
      break;
     }
     $360=$357;
     $361=((HEAP32[((992)>>2)])|0);
     $362=($360>>>0)<($361>>>0);
     if ($362) {
      _abort();

     } else {
      $364=(($R7_1+20)|0);
      HEAP32[(($364)>>2)]=$357;
      $365=(($357+24)|0);
      HEAP32[(($365)>>2)]=$R7_1;
      break;
     }
    }
   } while(0);
   $368=$221|1;
   $369=(($p_0+4)|0);
   HEAP32[(($369)>>2)]=$368;
   $370=(($188+$221)|0);
   $371=$370;
   HEAP32[(($371)>>2)]=$221;
   $372=((HEAP32[((996)>>2)])|0);
   $373=($p_0|0)==($372|0);
   if (!($373)) {
    $psize_1=$221;
    break;
   }
   HEAP32[((984)>>2)]=$221;
   return;
  } else {
   $376=$193&-2;
   HEAP32[(($192)>>2)]=$376;
   $377=$psize_0|1;
   $378=(($p_0+4)|0);
   HEAP32[(($378)>>2)]=$377;
   $379=(($188+$psize_0)|0);
   $380=$379;
   HEAP32[(($380)>>2)]=$psize_0;
   $psize_1=$psize_0;
  }
 } while(0);

 $382=$psize_1>>>3;
 $383=($psize_1>>>0)<((256)>>>0);
 if ($383) {
  $385=$382<<1;
  $386=((1016+($385<<2))|0);
  $387=$386;
  $388=((HEAP32[((976)>>2)])|0);
  $389=1<<$382;
  $390=$388&$389;
  $391=($390|0)==0;
  do {
   if ($391) {
    $393=$388|$389;
    HEAP32[((976)>>2)]=$393;
    $_sum248_pre=((($385)+(2))|0);
    $_pre=((1016+($_sum248_pre<<2))|0);
    $F16_0=$387;$_pre_phi=$_pre;
   } else {
    $_sum249=((($385)+(2))|0);
    $395=((1016+($_sum249<<2))|0);
    $396=((HEAP32[(($395)>>2)])|0);
    $397=$396;
    $398=((HEAP32[((992)>>2)])|0);
    $399=($397>>>0)<($398>>>0);
    if (!($399)) {
     $F16_0=$396;$_pre_phi=$395;
     break;
    }
    _abort();

   }
  } while(0);


  HEAP32[(($_pre_phi)>>2)]=$p_0;
  $402=(($F16_0+12)|0);
  HEAP32[(($402)>>2)]=$p_0;
  $403=(($p_0+8)|0);
  HEAP32[(($403)>>2)]=$F16_0;
  $404=(($p_0+12)|0);
  HEAP32[(($404)>>2)]=$387;
  return;
 }
 $406=$p_0;
 $407=$psize_1>>>8;
 $408=($407|0)==0;
 do {
  if ($408) {
   $I18_0=0;
  } else {
   $410=($psize_1>>>0)>((16777215)>>>0);
   if ($410) {
    $I18_0=31;
    break;
   }
   $412=((($407)+(1048320))|0);
   $413=$412>>>16;
   $414=$413&8;
   $415=$407<<$414;
   $416=((($415)+(520192))|0);
   $417=$416>>>16;
   $418=$417&4;
   $419=$418|$414;
   $420=$415<<$418;
   $421=((($420)+(245760))|0);
   $422=$421>>>16;
   $423=$422&2;
   $424=$419|$423;
   $425=(((14)-($424))|0);
   $426=$420<<$423;
   $427=$426>>>15;
   $428=((($425)+($427))|0);
   $429=$428<<1;
   $430=((($428)+(7))|0);
   $431=$psize_1>>>($430>>>0);
   $432=$431&1;
   $433=$432|$429;
   $I18_0=$433;
  }
 } while(0);

 $435=((1280+($I18_0<<2))|0);
 $436=(($p_0+28)|0);
 $I18_0_c=$I18_0;
 HEAP32[(($436)>>2)]=$I18_0_c;
 $437=(($p_0+20)|0);
 HEAP32[(($437)>>2)]=0;
 $438=(($p_0+16)|0);
 HEAP32[(($438)>>2)]=0;
 $439=((HEAP32[((980)>>2)])|0);
 $440=1<<$I18_0;
 $441=$439&$440;
 $442=($441|0)==0;
 do {
  if ($442) {
   $444=$439|$440;
   HEAP32[((980)>>2)]=$444;
   HEAP32[(($435)>>2)]=$406;
   $445=(($p_0+24)|0);
   $_c=$435;
   HEAP32[(($445)>>2)]=$_c;
   $446=(($p_0+12)|0);
   HEAP32[(($446)>>2)]=$p_0;
   $447=(($p_0+8)|0);
   HEAP32[(($447)>>2)]=$p_0;
  } else {
   $449=((HEAP32[(($435)>>2)])|0);
   $450=($I18_0|0)==31;
   if ($450) {
    $455=0;
   } else {
    $452=$I18_0>>>1;
    $453=(((25)-($452))|0);
    $455=$453;
   }

   $456=$psize_1<<$455;
   $K19_0=$456;$T_0=$449;
   while(1) {


    $458=(($T_0+4)|0);
    $459=((HEAP32[(($458)>>2)])|0);
    $460=$459&-8;
    $461=($460|0)==($psize_1|0);
    if ($461) {
     break;
    }
    $463=$K19_0>>>31;
    $464=(($T_0+16+($463<<2))|0);
    $465=((HEAP32[(($464)>>2)])|0);
    $466=($465|0)==0;
    $467=$K19_0<<1;
    if ($466) {
     label = 129;
     break;
    } else {
     $K19_0=$467;$T_0=$465;
    }
   }
   if ((label|0) == 129) {
    $469=$464;
    $470=((HEAP32[((992)>>2)])|0);
    $471=($469>>>0)<($470>>>0);
    if ($471) {
     _abort();

    } else {
     HEAP32[(($464)>>2)]=$406;
     $473=(($p_0+24)|0);
     $T_0_c245=$T_0;
     HEAP32[(($473)>>2)]=$T_0_c245;
     $474=(($p_0+12)|0);
     HEAP32[(($474)>>2)]=$p_0;
     $475=(($p_0+8)|0);
     HEAP32[(($475)>>2)]=$p_0;
     break;
    }
   }
   $478=(($T_0+8)|0);
   $479=((HEAP32[(($478)>>2)])|0);
   $480=$T_0;
   $481=((HEAP32[((992)>>2)])|0);
   $482=($480>>>0)<($481>>>0);
   if ($482) {
    _abort();

   }
   $484=$479;
   $485=($484>>>0)<($481>>>0);
   if ($485) {
    _abort();

   } else {
    $487=(($479+12)|0);
    HEAP32[(($487)>>2)]=$406;
    HEAP32[(($478)>>2)]=$406;
    $488=(($p_0+8)|0);
    $_c244=$479;
    HEAP32[(($488)>>2)]=$_c244;
    $489=(($p_0+12)|0);
    $T_0_c=$T_0;
    HEAP32[(($489)>>2)]=$T_0_c;
    $490=(($p_0+24)|0);
    HEAP32[(($490)>>2)]=0;
    break;
   }
  }
 } while(0);
 $492=((HEAP32[((1008)>>2)])|0);
 $493=((($492)-(1))|0);
 HEAP32[((1008)>>2)]=$493;
 $494=($493|0)==0;
 if ($494) {
  $sp_0_in_i=1432;
 } else {
  return;
 }
 while(1) {

  $sp_0_i=((HEAP32[(($sp_0_in_i)>>2)])|0);
  $495=($sp_0_i|0)==0;
  $496=(($sp_0_i+8)|0);
  if ($495) {
   break;
  } else {
   $sp_0_in_i=$496;
  }
 }
 HEAP32[((1008)>>2)]=-1;
 return;
}


function _realloc($oldmem,$bytes){
 $oldmem=($oldmem)|0;
 $bytes=($bytes)|0;
 var $1=0,$3=0,$5=0,$7=0,$9=0,$11=0,$12=0,$14=0,$15=0,$16=0,$17=0,$18=0,$20=0,$21=0,$23=0,$24=0,$26=0,$27=0,$28=0,$29=0;
 var $30=0,$31=0,$32=0,$33=0,$34=0,$35=0,$mem_0=0,label=0;

 $1=($oldmem|0)==0;
 if ($1) {
  $3=((_malloc($bytes))|0);
  $mem_0=$3;

  return (($mem_0)|0);
 }
 $5=($bytes>>>0)>((4294967231)>>>0);
 if ($5) {
  $7=((___errno_location())|0);
  HEAP32[(($7)>>2)]=12;
  $mem_0=0;

  return (($mem_0)|0);
 }
 $9=($bytes>>>0)<((11)>>>0);
 if ($9) {
  $14=16;
 } else {
  $11=((($bytes)+(11))|0);
  $12=$11&-8;
  $14=$12;
 }

 $15=((($oldmem)-(8))|0);
 $16=$15;
 $17=((_try_realloc_chunk($16,$14))|0);
 $18=($17|0)==0;
 if (!($18)) {
  $20=(($17+8)|0);
  $21=$20;
  $mem_0=$21;

  return (($mem_0)|0);
 }
 $23=((_malloc($bytes))|0);
 $24=($23|0)==0;
 if ($24) {
  $mem_0=0;

  return (($mem_0)|0);
 }
 $26=((($oldmem)-(4))|0);
 $27=$26;
 $28=((HEAP32[(($27)>>2)])|0);
 $29=$28&-8;
 $30=$28&3;
 $31=($30|0)==0;
 $32=($31?8:4);
 $33=((($29)-($32))|0);
 $34=($33>>>0)<($bytes>>>0);
 $35=($34?$33:$bytes);
 (_memcpy((($23)|0), (($oldmem)|0), $35)|0);
 _free($oldmem);
 $mem_0=$23;

 return (($mem_0)|0);
}


function _try_realloc_chunk($p,$nb){
 $p=($p)|0;
 $nb=($nb)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$10=0,$11=0,$12=0,$or_cond=0,$_sum3334=0,$14=0,$15=0,$16=0,$17=0,$phitmp=0,$19=0,$21=0;
 var $23=0,$24=0,$26=0,$27=0,$28=0,$29=0,$32=0,$34=0,$35=0,$37=0,$38=0,$39=0,$40=0,$41=0,$_sum29=0,$42=0,$43=0,$44=0,$45=0,$46=0;
 var $48=0,$49=0,$51=0,$52=0,$53=0,$55=0,$56=0,$57=0,$58=0,$59=0,$60=0,$_sum28=0,$61=0,$62=0,$63=0,$65=0,$66=0,$68=0,$69=0,$70=0;
 var $72=0,$73=0,$75=0,$76=0,$77=0,$78=0,$79=0,$80=0,$_sum25=0,$81=0,$82=0,$83=0,$84=0,$_sum26=0,$85=0,$86=0,$87=0,$88=0,$90=0,$91=0;
 var $92=0,$_sum23=0,$93=0,$94=0,$95=0,$96=0,$storemerge27=0,$storemerge=0,$99=0,$100=0,$102=0,$103=0,$104=0,$106=0,$107=0,$108=0,$_sum17=0,$110=0,$111=0,$112=0;
 var $_sum18=0,$113=0,$114=0,$115=0,$116=0,$117=0,$118=0,$119=0,$121=0,$122=0,$124=0,$125=0,$126=0,$127=0,$129=0,$130=0,$131=0,$132=0,$134=0,$_pre=0;
 var $136=0,$137=0,$139=0,$140=0,$141=0,$_pre_phi=0,$142=0,$144=0,$_sum=0,$145=0,$146=0,$147=0,$_sum2=0,$148=0,$149=0,$150=0,$151=0,$_sum14=0,$153=0,$154=0;
 var $155=0,$156=0,$157=0,$159=0,$160=0,$161=0,$163=0,$164=0,$165=0,$_sum4=0,$168=0,$169=0,$170=0,$171=0,$_sum3=0,$173=0,$174=0,$175=0,$176=0,$RP_0=0;
 var $R_0=0,$177=0,$178=0,$179=0,$181=0,$182=0,$183=0,$185=0,$186=0,$R_1=0,$190=0,$_sum11=0,$192=0,$193=0,$194=0,$195=0,$196=0,$197=0,$cond=0,$199=0;
 var $200=0,$201=0,$202=0,$204=0,$205=0,$206=0,$208=0,$209=0,$210=0,$213=0,$216=0,$218=0,$219=0,$220=0,$222=0,$_sum12=0,$223=0,$224=0,$225=0,$226=0;
 var $228=0,$229=0,$230=0,$232=0,$233=0,$_sum13=0,$236=0,$237=0,$238=0,$239=0,$241=0,$242=0,$243=0,$245=0,$246=0,$250=0,$252=0,$253=0,$254=0,$255=0;
 var $_sum910=0,$256=0,$257=0,$258=0,$259=0,$261=0,$262=0,$263=0,$264=0,$265=0,$266=0,$_sum5=0,$267=0,$268=0,$269=0,$_sum78=0,$270=0,$271=0,$272=0,$273=0;
 var $newp_0=0,label=0;

 $1=(($p+4)|0);
 $2=((HEAP32[(($1)>>2)])|0);
 $3=$2&-8;
 $4=$p;
 $5=(($4+$3)|0);
 $6=$5;
 $7=((HEAP32[((992)>>2)])|0);
 $8=($4>>>0)<($7>>>0);
 if ($8) {
  _abort(); return ((0)|0);
  return ((0)|0);
 }
 $10=$2&3;
 $11=($10|0)!=1;
 $12=($4>>>0)<($5>>>0);
 $or_cond=$11&$12;
 if (!($or_cond)) {
  _abort(); return ((0)|0);
  return ((0)|0);
 }
 $_sum3334=$3|4;
 $14=(($4+$_sum3334)|0);
 $15=$14;
 $16=((HEAP32[(($15)>>2)])|0);
 $17=$16&1;
 $phitmp=($17|0)==0;
 if ($phitmp) {
  _abort(); return ((0)|0);
  return ((0)|0);
 }
 $19=($10|0)==0;
 if ($19) {
  $21=($nb>>>0)<((256)>>>0);
  if ($21) {
   $newp_0=0;

   return (($newp_0)|0);
  }
  $23=((($nb)+(4))|0);
  $24=($3>>>0)<($23>>>0);
  do {
   if (!($24)) {
    $26=((($3)-($nb))|0);
    $27=((HEAP32[((960)>>2)])|0);
    $28=$27<<1;
    $29=($26>>>0)>($28>>>0);
    if ($29) {
     break;
    } else {
     $newp_0=$p;
    }

    return (($newp_0)|0);
   }
  } while(0);
  $newp_0=0;

  return (($newp_0)|0);
 }
 $32=($3>>>0)<($nb>>>0);
 if (!($32)) {
  $34=((($3)-($nb))|0);
  $35=($34>>>0)>((15)>>>0);
  if (!($35)) {
   $newp_0=$p;

   return (($newp_0)|0);
  }
  $37=(($4+$nb)|0);
  $38=$37;
  $39=$2&1;
  $40=$39|$nb;
  $41=$40|2;
  HEAP32[(($1)>>2)]=$41;
  $_sum29=((($nb)+(4))|0);
  $42=(($4+$_sum29)|0);
  $43=$42;
  $44=$34|3;
  HEAP32[(($43)>>2)]=$44;
  $45=((HEAP32[(($15)>>2)])|0);
  $46=$45|1;
  HEAP32[(($15)>>2)]=$46;
  _dispose_chunk($38,$34);
  $newp_0=$p;

  return (($newp_0)|0);
 }
 $48=((HEAP32[((1000)>>2)])|0);
 $49=($6|0)==($48|0);
 if ($49) {
  $51=((HEAP32[((988)>>2)])|0);
  $52=((($51)+($3))|0);
  $53=($52>>>0)>($nb>>>0);
  if (!($53)) {
   $newp_0=0;

   return (($newp_0)|0);
  }
  $55=((($52)-($nb))|0);
  $56=(($4+$nb)|0);
  $57=$56;
  $58=$2&1;
  $59=$58|$nb;
  $60=$59|2;
  HEAP32[(($1)>>2)]=$60;
  $_sum28=((($nb)+(4))|0);
  $61=(($4+$_sum28)|0);
  $62=$61;
  $63=$55|1;
  HEAP32[(($62)>>2)]=$63;
  HEAP32[((1000)>>2)]=$57;
  HEAP32[((988)>>2)]=$55;
  $newp_0=$p;

  return (($newp_0)|0);
 }
 $65=((HEAP32[((996)>>2)])|0);
 $66=($6|0)==($65|0);
 if ($66) {
  $68=((HEAP32[((984)>>2)])|0);
  $69=((($68)+($3))|0);
  $70=($69>>>0)<($nb>>>0);
  if ($70) {
   $newp_0=0;

   return (($newp_0)|0);
  }
  $72=((($69)-($nb))|0);
  $73=($72>>>0)>((15)>>>0);
  if ($73) {
   $75=(($4+$nb)|0);
   $76=$75;
   $77=(($4+$69)|0);
   $78=$2&1;
   $79=$78|$nb;
   $80=$79|2;
   HEAP32[(($1)>>2)]=$80;
   $_sum25=((($nb)+(4))|0);
   $81=(($4+$_sum25)|0);
   $82=$81;
   $83=$72|1;
   HEAP32[(($82)>>2)]=$83;
   $84=$77;
   HEAP32[(($84)>>2)]=$72;
   $_sum26=((($69)+(4))|0);
   $85=(($4+$_sum26)|0);
   $86=$85;
   $87=((HEAP32[(($86)>>2)])|0);
   $88=$87&-2;
   HEAP32[(($86)>>2)]=$88;
   $storemerge=$76;$storemerge27=$72;
  } else {
   $90=$2&1;
   $91=$90|$69;
   $92=$91|2;
   HEAP32[(($1)>>2)]=$92;
   $_sum23=((($69)+(4))|0);
   $93=(($4+$_sum23)|0);
   $94=$93;
   $95=((HEAP32[(($94)>>2)])|0);
   $96=$95|1;
   HEAP32[(($94)>>2)]=$96;
   $storemerge=0;$storemerge27=0;
  }


  HEAP32[((984)>>2)]=$storemerge27;
  HEAP32[((996)>>2)]=$storemerge;
  $newp_0=$p;

  return (($newp_0)|0);
 }
 $99=$16&2;
 $100=($99|0)==0;
 if (!($100)) {
  $newp_0=0;

  return (($newp_0)|0);
 }
 $102=$16&-8;
 $103=((($102)+($3))|0);
 $104=($103>>>0)<($nb>>>0);
 if ($104) {
  $newp_0=0;

  return (($newp_0)|0);
 }
 $106=((($103)-($nb))|0);
 $107=$16>>>3;
 $108=($16>>>0)<((256)>>>0);
 L52: do {
  if ($108) {
   $_sum17=((($3)+(8))|0);
   $110=(($4+$_sum17)|0);
   $111=$110;
   $112=((HEAP32[(($111)>>2)])|0);
   $_sum18=((($3)+(12))|0);
   $113=(($4+$_sum18)|0);
   $114=$113;
   $115=((HEAP32[(($114)>>2)])|0);
   $116=$107<<1;
   $117=((1016+($116<<2))|0);
   $118=$117;
   $119=($112|0)==($118|0);
   do {
    if (!($119)) {
     $121=$112;
     $122=($121>>>0)<($7>>>0);
     if ($122) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $124=(($112+12)|0);
     $125=((HEAP32[(($124)>>2)])|0);
     $126=($125|0)==($6|0);
     if ($126) {
      break;
     }
     _abort(); return ((0)|0);
     return ((0)|0);
    }
   } while(0);
   $127=($115|0)==($112|0);
   if ($127) {
    $129=1<<$107;
    $130=$129^-1;
    $131=((HEAP32[((976)>>2)])|0);
    $132=$131&$130;
    HEAP32[((976)>>2)]=$132;
    break;
   }
   $134=($115|0)==($118|0);
   do {
    if ($134) {
     $_pre=(($115+8)|0);
     $_pre_phi=$_pre;
    } else {
     $136=$115;
     $137=($136>>>0)<($7>>>0);
     if ($137) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $139=(($115+8)|0);
     $140=((HEAP32[(($139)>>2)])|0);
     $141=($140|0)==($6|0);
     if ($141) {
      $_pre_phi=$139;
      break;
     }
     _abort(); return ((0)|0);
     return ((0)|0);
    }
   } while(0);

   $142=(($112+12)|0);
   HEAP32[(($142)>>2)]=$115;
   HEAP32[(($_pre_phi)>>2)]=$112;
  } else {
   $144=$5;
   $_sum=((($3)+(24))|0);
   $145=(($4+$_sum)|0);
   $146=$145;
   $147=((HEAP32[(($146)>>2)])|0);
   $_sum2=((($3)+(12))|0);
   $148=(($4+$_sum2)|0);
   $149=$148;
   $150=((HEAP32[(($149)>>2)])|0);
   $151=($150|0)==($144|0);
   do {
    if ($151) {
     $_sum4=((($3)+(20))|0);
     $168=(($4+$_sum4)|0);
     $169=$168;
     $170=((HEAP32[(($169)>>2)])|0);
     $171=($170|0)==0;
     if ($171) {
      $_sum3=((($3)+(16))|0);
      $173=(($4+$_sum3)|0);
      $174=$173;
      $175=((HEAP32[(($174)>>2)])|0);
      $176=($175|0)==0;
      if ($176) {
       $R_1=0;
       break;
      } else {
       $R_0=$175;$RP_0=$174;
      }
     } else {
      $R_0=$170;$RP_0=$169;
     }
     while(1) {


      $177=(($R_0+20)|0);
      $178=((HEAP32[(($177)>>2)])|0);
      $179=($178|0)==0;
      if (!($179)) {
       $R_0=$178;$RP_0=$177;
       continue;
      }
      $181=(($R_0+16)|0);
      $182=((HEAP32[(($181)>>2)])|0);
      $183=($182|0)==0;
      if ($183) {
       break;
      } else {
       $R_0=$182;$RP_0=$181;
      }
     }
     $185=$RP_0;
     $186=($185>>>0)<($7>>>0);
     if ($186) {
      _abort(); return ((0)|0);
      return ((0)|0);
     } else {
      HEAP32[(($RP_0)>>2)]=0;
      $R_1=$R_0;
      break;
     }
    } else {
     $_sum14=((($3)+(8))|0);
     $153=(($4+$_sum14)|0);
     $154=$153;
     $155=((HEAP32[(($154)>>2)])|0);
     $156=$155;
     $157=($156>>>0)<($7>>>0);
     if ($157) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $159=(($155+12)|0);
     $160=((HEAP32[(($159)>>2)])|0);
     $161=($160|0)==($144|0);
     if (!($161)) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $163=(($150+8)|0);
     $164=((HEAP32[(($163)>>2)])|0);
     $165=($164|0)==($144|0);
     if ($165) {
      HEAP32[(($159)>>2)]=$150;
      HEAP32[(($163)>>2)]=$155;
      $R_1=$150;
      break;
     } else {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
    }
   } while(0);

   $190=($147|0)==0;
   if ($190) {
    break;
   }
   $_sum11=((($3)+(28))|0);
   $192=(($4+$_sum11)|0);
   $193=$192;
   $194=((HEAP32[(($193)>>2)])|0);
   $195=((1280+($194<<2))|0);
   $196=((HEAP32[(($195)>>2)])|0);
   $197=($144|0)==($196|0);
   do {
    if ($197) {
     HEAP32[(($195)>>2)]=$R_1;
     $cond=($R_1|0)==0;
     if (!($cond)) {
      break;
     }
     $199=1<<$194;
     $200=$199^-1;
     $201=((HEAP32[((980)>>2)])|0);
     $202=$201&$200;
     HEAP32[((980)>>2)]=$202;
     break L52;
    } else {
     $204=$147;
     $205=((HEAP32[((992)>>2)])|0);
     $206=($204>>>0)<($205>>>0);
     if ($206) {
      _abort(); return ((0)|0);
      return ((0)|0);
     }
     $208=(($147+16)|0);
     $209=((HEAP32[(($208)>>2)])|0);
     $210=($209|0)==($144|0);
     if ($210) {
      HEAP32[(($208)>>2)]=$R_1;
     } else {
      $213=(($147+20)|0);
      HEAP32[(($213)>>2)]=$R_1;
     }
     $216=($R_1|0)==0;
     if ($216) {
      break L52;
     }
    }
   } while(0);
   $218=$R_1;
   $219=((HEAP32[((992)>>2)])|0);
   $220=($218>>>0)<($219>>>0);
   if ($220) {
    _abort(); return ((0)|0);
    return ((0)|0);
   }
   $222=(($R_1+24)|0);
   HEAP32[(($222)>>2)]=$147;
   $_sum12=((($3)+(16))|0);
   $223=(($4+$_sum12)|0);
   $224=$223;
   $225=((HEAP32[(($224)>>2)])|0);
   $226=($225|0)==0;
   do {
    if (!($226)) {
     $228=$225;
     $229=((HEAP32[((992)>>2)])|0);
     $230=($228>>>0)<($229>>>0);
     if ($230) {
      _abort(); return ((0)|0);
      return ((0)|0);
     } else {
      $232=(($R_1+16)|0);
      HEAP32[(($232)>>2)]=$225;
      $233=(($225+24)|0);
      HEAP32[(($233)>>2)]=$R_1;
      break;
     }
    }
   } while(0);
   $_sum13=((($3)+(20))|0);
   $236=(($4+$_sum13)|0);
   $237=$236;
   $238=((HEAP32[(($237)>>2)])|0);
   $239=($238|0)==0;
   if ($239) {
    break;
   }
   $241=$238;
   $242=((HEAP32[((992)>>2)])|0);
   $243=($241>>>0)<($242>>>0);
   if ($243) {
    _abort(); return ((0)|0);
    return ((0)|0);
   } else {
    $245=(($R_1+20)|0);
    HEAP32[(($245)>>2)]=$238;
    $246=(($238+24)|0);
    HEAP32[(($246)>>2)]=$R_1;
    break;
   }
  }
 } while(0);
 $250=($106>>>0)<((16)>>>0);
 if ($250) {
  $252=((HEAP32[(($1)>>2)])|0);
  $253=$252&1;
  $254=$103|$253;
  $255=$254|2;
  HEAP32[(($1)>>2)]=$255;
  $_sum910=$103|4;
  $256=(($4+$_sum910)|0);
  $257=$256;
  $258=((HEAP32[(($257)>>2)])|0);
  $259=$258|1;
  HEAP32[(($257)>>2)]=$259;
  $newp_0=$p;

  return (($newp_0)|0);
 } else {
  $261=(($4+$nb)|0);
  $262=$261;
  $263=((HEAP32[(($1)>>2)])|0);
  $264=$263&1;
  $265=$264|$nb;
  $266=$265|2;
  HEAP32[(($1)>>2)]=$266;
  $_sum5=((($nb)+(4))|0);
  $267=(($4+$_sum5)|0);
  $268=$267;
  $269=$106|3;
  HEAP32[(($268)>>2)]=$269;
  $_sum78=$103|4;
  $270=(($4+$_sum78)|0);
  $271=$270;
  $272=((HEAP32[(($271)>>2)])|0);
  $273=$272|1;
  HEAP32[(($271)>>2)]=$273;
  _dispose_chunk($262,$106);
  $newp_0=$p;

  return (($newp_0)|0);
 }
  return 0;
}


function _malloc_usable_size($mem){
 $mem=($mem)|0;
 var $1=0,$3=0,$4=0,$5=0,$6=0,$7=0,$9=0,$10=0,$11=0,$12=0,$_0=0,label=0;

 $1=($mem|0)==0;
 do {
  if ($1) {
   $_0=0;
  } else {
   $3=((($mem)-(4))|0);
   $4=$3;
   $5=((HEAP32[(($4)>>2)])|0);
   $6=$5&3;
   $7=($6|0)==1;
   if ($7) {
    $_0=0;
    break;
   }
   $9=$5&-8;
   $10=($6|0)==0;
   $11=($10?8:4);
   $12=((($9)-($11))|0);
   $_0=$12;
  }
 } while(0);

 return (($_0)|0);
}


function _dispose_chunk($p,$psize){
 $p=($p)|0;
 $psize=($psize)|0;
 var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$9=0,$10=0,$11=0,$12=0,$14=0,$15=0,$16=0,$17=0,$18=0,$19=0,$21=0,$22=0,$24=0;
 var $25=0,$_sum35=0,$27=0,$28=0,$29=0,$_sum36=0,$30=0,$31=0,$32=0,$33=0,$34=0,$35=0,$36=0,$38=0,$39=0,$41=0,$42=0,$43=0,$44=0,$46=0;
 var $47=0,$48=0,$49=0,$51=0,$_pre65=0,$53=0,$54=0,$56=0,$57=0,$58=0,$_pre_phi66=0,$59=0,$61=0,$_sum26=0,$62=0,$63=0,$64=0,$_sum27=0,$65=0,$66=0;
 var $67=0,$68=0,$_sum33=0,$70=0,$71=0,$72=0,$73=0,$74=0,$76=0,$77=0,$78=0,$80=0,$81=0,$82=0,$_sum28=0,$_sum29=0,$85=0,$86=0,$87=0,$88=0;
 var $90=0,$91=0,$92=0,$93=0,$RP_0=0,$R_0=0,$94=0,$95=0,$96=0,$98=0,$99=0,$100=0,$102=0,$103=0,$R_1=0,$107=0,$_sum30=0,$109=0,$110=0,$111=0;
 var $112=0,$113=0,$114=0,$cond=0,$116=0,$117=0,$118=0,$119=0,$121=0,$122=0,$123=0,$125=0,$126=0,$127=0,$130=0,$133=0,$135=0,$136=0,$137=0,$139=0;
 var $_sum31=0,$140=0,$141=0,$142=0,$143=0,$145=0,$146=0,$147=0,$149=0,$150=0,$_sum32=0,$153=0,$154=0,$155=0,$156=0,$158=0,$159=0,$160=0,$162=0,$163=0;
 var $_sum=0,$167=0,$168=0,$169=0,$170=0,$171=0,$173=0,$174=0,$175=0,$_sum24=0,$176=0,$177=0,$178=0,$_0277=0,$_0=0,$180=0,$181=0,$_sum1=0,$183=0,$184=0;
 var $185=0,$186=0,$187=0,$189=0,$190=0,$192=0,$193=0,$194=0,$195=0,$196=0,$197=0,$200=0,$201=0,$203=0,$204=0,$205=0,$206=0,$207=0,$208=0,$209=0;
 var $211=0,$212=0,$213=0,$214=0,$_sum20=0,$216=0,$217=0,$218=0,$_sum21=0,$219=0,$220=0,$221=0,$222=0,$223=0,$224=0,$225=0,$227=0,$228=0,$230=0,$231=0;
 var $232=0,$233=0,$235=0,$236=0,$237=0,$238=0,$240=0,$_pre63=0,$242=0,$243=0,$245=0,$246=0,$247=0,$_pre_phi64=0,$248=0,$250=0,$_sum2=0,$251=0,$252=0,$253=0;
 var $_sum3=0,$254=0,$255=0,$256=0,$257=0,$_sum18=0,$259=0,$260=0,$261=0,$262=0,$263=0,$265=0,$266=0,$267=0,$269=0,$270=0,$271=0,$_sum5=0,$274=0,$275=0;
 var $276=0,$277=0,$_sum4=0,$279=0,$280=0,$281=0,$282=0,$RP9_0=0,$R7_0=0,$283=0,$284=0,$285=0,$287=0,$288=0,$289=0,$291=0,$292=0,$R7_1=0,$296=0,$_sum15=0;
 var $298=0,$299=0,$300=0,$301=0,$302=0,$303=0,$cond53=0,$305=0,$306=0,$307=0,$308=0,$310=0,$311=0,$312=0,$314=0,$315=0,$316=0,$319=0,$322=0,$324=0;
 var $325=0,$326=0,$328=0,$_sum16=0,$329=0,$330=0,$331=0,$332=0,$334=0,$335=0,$336=0,$338=0,$339=0,$_sum17=0,$342=0,$343=0,$344=0,$345=0,$347=0,$348=0;
 var $349=0,$351=0,$352=0,$355=0,$356=0,$357=0,$358=0,$359=0,$360=0,$361=0,$364=0,$365=0,$366=0,$367=0,$368=0,$369=0,$_1=0,$371=0,$372=0,$374=0;
 var $375=0,$376=0,$377=0,$378=0,$379=0,$380=0,$382=0,$_sum13_pre=0,$_pre=0,$_sum14=0,$384=0,$385=0,$386=0,$387=0,$388=0,$_pre_phi=0,$F16_0=0,$391=0,$392=0,$393=0;
 var $395=0,$396=0,$397=0,$399=0,$401=0,$402=0,$403=0,$404=0,$405=0,$406=0,$407=0,$408=0,$409=0,$410=0,$411=0,$412=0,$413=0,$414=0,$415=0,$416=0;
 var $417=0,$418=0,$419=0,$420=0,$421=0,$422=0,$I19_0=0,$424=0,$425=0,$I19_0_c=0,$426=0,$427=0,$428=0,$429=0,$430=0,$431=0,$433=0,$434=0,$_c=0,$435=0;
 var $436=0,$438=0,$439=0,$441=0,$442=0,$444=0,$445=0,$T_0=0,$K20_0=0,$447=0,$448=0,$449=0,$450=0,$452=0,$453=0,$454=0,$455=0,$456=0,$458=0,$459=0;
 var $460=0,$462=0,$T_0_c10=0,$463=0,$464=0,$467=0,$468=0,$469=0,$470=0,$471=0,$473=0,$474=0,$476=0,$477=0,$_c9=0,$478=0,$T_0_c=0,$479=0,label=0;

 $1=$p;
 $2=(($1+$psize)|0);
 $3=$2;
 $4=(($p+4)|0);
 $5=((HEAP32[(($4)>>2)])|0);
 $6=$5&1;
 $7=($6|0)==0;
 L1: do {
  if ($7) {
   $9=(($p)|0);
   $10=((HEAP32[(($9)>>2)])|0);
   $11=$5&3;
   $12=($11|0)==0;
   if ($12) {
    return;
   }
   $14=(((-$10))|0);
   $15=(($1+$14)|0);
   $16=$15;
   $17=((($10)+($psize))|0);
   $18=((HEAP32[((992)>>2)])|0);
   $19=($15>>>0)<($18>>>0);
   if ($19) {
    _abort();

   }
   $21=((HEAP32[((996)>>2)])|0);
   $22=($16|0)==($21|0);
   if ($22) {
    $_sum=((($psize)+(4))|0);
    $167=(($1+$_sum)|0);
    $168=$167;
    $169=((HEAP32[(($168)>>2)])|0);
    $170=$169&3;
    $171=($170|0)==3;
    if (!($171)) {
     $_0=$16;$_0277=$17;
     break;
    }
    HEAP32[((984)>>2)]=$17;
    $173=((HEAP32[(($168)>>2)])|0);
    $174=$173&-2;
    HEAP32[(($168)>>2)]=$174;
    $175=$17|1;
    $_sum24=(((4)-($10))|0);
    $176=(($1+$_sum24)|0);
    $177=$176;
    HEAP32[(($177)>>2)]=$175;
    $178=$2;
    HEAP32[(($178)>>2)]=$17;
    return;
   }
   $24=$10>>>3;
   $25=($10>>>0)<((256)>>>0);
   if ($25) {
    $_sum35=(((8)-($10))|0);
    $27=(($1+$_sum35)|0);
    $28=$27;
    $29=((HEAP32[(($28)>>2)])|0);
    $_sum36=(((12)-($10))|0);
    $30=(($1+$_sum36)|0);
    $31=$30;
    $32=((HEAP32[(($31)>>2)])|0);
    $33=$24<<1;
    $34=((1016+($33<<2))|0);
    $35=$34;
    $36=($29|0)==($35|0);
    do {
     if (!($36)) {
      $38=$29;
      $39=($38>>>0)<($18>>>0);
      if ($39) {
       _abort();

      }
      $41=(($29+12)|0);
      $42=((HEAP32[(($41)>>2)])|0);
      $43=($42|0)==($16|0);
      if ($43) {
       break;
      }
      _abort();

     }
    } while(0);
    $44=($32|0)==($29|0);
    if ($44) {
     $46=1<<$24;
     $47=$46^-1;
     $48=((HEAP32[((976)>>2)])|0);
     $49=$48&$47;
     HEAP32[((976)>>2)]=$49;
     $_0=$16;$_0277=$17;
     break;
    }
    $51=($32|0)==($35|0);
    do {
     if ($51) {
      $_pre65=(($32+8)|0);
      $_pre_phi66=$_pre65;
     } else {
      $53=$32;
      $54=($53>>>0)<($18>>>0);
      if ($54) {
       _abort();

      }
      $56=(($32+8)|0);
      $57=((HEAP32[(($56)>>2)])|0);
      $58=($57|0)==($16|0);
      if ($58) {
       $_pre_phi66=$56;
       break;
      }
      _abort();

     }
    } while(0);

    $59=(($29+12)|0);
    HEAP32[(($59)>>2)]=$32;
    HEAP32[(($_pre_phi66)>>2)]=$29;
    $_0=$16;$_0277=$17;
    break;
   }
   $61=$15;
   $_sum26=(((24)-($10))|0);
   $62=(($1+$_sum26)|0);
   $63=$62;
   $64=((HEAP32[(($63)>>2)])|0);
   $_sum27=(((12)-($10))|0);
   $65=(($1+$_sum27)|0);
   $66=$65;
   $67=((HEAP32[(($66)>>2)])|0);
   $68=($67|0)==($61|0);
   do {
    if ($68) {
     $_sum28=(((16)-($10))|0);
     $_sum29=((($_sum28)+(4))|0);
     $85=(($1+$_sum29)|0);
     $86=$85;
     $87=((HEAP32[(($86)>>2)])|0);
     $88=($87|0)==0;
     if ($88) {
      $90=(($1+$_sum28)|0);
      $91=$90;
      $92=((HEAP32[(($91)>>2)])|0);
      $93=($92|0)==0;
      if ($93) {
       $R_1=0;
       break;
      } else {
       $R_0=$92;$RP_0=$91;
      }
     } else {
      $R_0=$87;$RP_0=$86;
     }
     while(1) {


      $94=(($R_0+20)|0);
      $95=((HEAP32[(($94)>>2)])|0);
      $96=($95|0)==0;
      if (!($96)) {
       $R_0=$95;$RP_0=$94;
       continue;
      }
      $98=(($R_0+16)|0);
      $99=((HEAP32[(($98)>>2)])|0);
      $100=($99|0)==0;
      if ($100) {
       break;
      } else {
       $R_0=$99;$RP_0=$98;
      }
     }
     $102=$RP_0;
     $103=($102>>>0)<($18>>>0);
     if ($103) {
      _abort();

     } else {
      HEAP32[(($RP_0)>>2)]=0;
      $R_1=$R_0;
      break;
     }
    } else {
     $_sum33=(((8)-($10))|0);
     $70=(($1+$_sum33)|0);
     $71=$70;
     $72=((HEAP32[(($71)>>2)])|0);
     $73=$72;
     $74=($73>>>0)<($18>>>0);
     if ($74) {
      _abort();

     }
     $76=(($72+12)|0);
     $77=((HEAP32[(($76)>>2)])|0);
     $78=($77|0)==($61|0);
     if (!($78)) {
      _abort();

     }
     $80=(($67+8)|0);
     $81=((HEAP32[(($80)>>2)])|0);
     $82=($81|0)==($61|0);
     if ($82) {
      HEAP32[(($76)>>2)]=$67;
      HEAP32[(($80)>>2)]=$72;
      $R_1=$67;
      break;
     } else {
      _abort();

     }
    }
   } while(0);

   $107=($64|0)==0;
   if ($107) {
    $_0=$16;$_0277=$17;
    break;
   }
   $_sum30=(((28)-($10))|0);
   $109=(($1+$_sum30)|0);
   $110=$109;
   $111=((HEAP32[(($110)>>2)])|0);
   $112=((1280+($111<<2))|0);
   $113=((HEAP32[(($112)>>2)])|0);
   $114=($61|0)==($113|0);
   do {
    if ($114) {
     HEAP32[(($112)>>2)]=$R_1;
     $cond=($R_1|0)==0;
     if (!($cond)) {
      break;
     }
     $116=1<<$111;
     $117=$116^-1;
     $118=((HEAP32[((980)>>2)])|0);
     $119=$118&$117;
     HEAP32[((980)>>2)]=$119;
     $_0=$16;$_0277=$17;
     break L1;
    } else {
     $121=$64;
     $122=((HEAP32[((992)>>2)])|0);
     $123=($121>>>0)<($122>>>0);
     if ($123) {
      _abort();

     }
     $125=(($64+16)|0);
     $126=((HEAP32[(($125)>>2)])|0);
     $127=($126|0)==($61|0);
     if ($127) {
      HEAP32[(($125)>>2)]=$R_1;
     } else {
      $130=(($64+20)|0);
      HEAP32[(($130)>>2)]=$R_1;
     }
     $133=($R_1|0)==0;
     if ($133) {
      $_0=$16;$_0277=$17;
      break L1;
     }
    }
   } while(0);
   $135=$R_1;
   $136=((HEAP32[((992)>>2)])|0);
   $137=($135>>>0)<($136>>>0);
   if ($137) {
    _abort();

   }
   $139=(($R_1+24)|0);
   HEAP32[(($139)>>2)]=$64;
   $_sum31=(((16)-($10))|0);
   $140=(($1+$_sum31)|0);
   $141=$140;
   $142=((HEAP32[(($141)>>2)])|0);
   $143=($142|0)==0;
   do {
    if (!($143)) {
     $145=$142;
     $146=((HEAP32[((992)>>2)])|0);
     $147=($145>>>0)<($146>>>0);
     if ($147) {
      _abort();

     } else {
      $149=(($R_1+16)|0);
      HEAP32[(($149)>>2)]=$142;
      $150=(($142+24)|0);
      HEAP32[(($150)>>2)]=$R_1;
      break;
     }
    }
   } while(0);
   $_sum32=((($_sum31)+(4))|0);
   $153=(($1+$_sum32)|0);
   $154=$153;
   $155=((HEAP32[(($154)>>2)])|0);
   $156=($155|0)==0;
   if ($156) {
    $_0=$16;$_0277=$17;
    break;
   }
   $158=$155;
   $159=((HEAP32[((992)>>2)])|0);
   $160=($158>>>0)<($159>>>0);
   if ($160) {
    _abort();

   } else {
    $162=(($R_1+20)|0);
    HEAP32[(($162)>>2)]=$155;
    $163=(($155+24)|0);
    HEAP32[(($163)>>2)]=$R_1;
    $_0=$16;$_0277=$17;
    break;
   }
  } else {
   $_0=$p;$_0277=$psize;
  }
 } while(0);


 $180=((HEAP32[((992)>>2)])|0);
 $181=($2>>>0)<($180>>>0);
 if ($181) {
  _abort();

 }
 $_sum1=((($psize)+(4))|0);
 $183=(($1+$_sum1)|0);
 $184=$183;
 $185=((HEAP32[(($184)>>2)])|0);
 $186=$185&2;
 $187=($186|0)==0;
 do {
  if ($187) {
   $189=((HEAP32[((1000)>>2)])|0);
   $190=($3|0)==($189|0);
   if ($190) {
    $192=((HEAP32[((988)>>2)])|0);
    $193=((($192)+($_0277))|0);
    HEAP32[((988)>>2)]=$193;
    HEAP32[((1000)>>2)]=$_0;
    $194=$193|1;
    $195=(($_0+4)|0);
    HEAP32[(($195)>>2)]=$194;
    $196=((HEAP32[((996)>>2)])|0);
    $197=($_0|0)==($196|0);
    if (!($197)) {
     return;
    }
    HEAP32[((996)>>2)]=0;
    HEAP32[((984)>>2)]=0;
    return;
   }
   $200=((HEAP32[((996)>>2)])|0);
   $201=($3|0)==($200|0);
   if ($201) {
    $203=((HEAP32[((984)>>2)])|0);
    $204=((($203)+($_0277))|0);
    HEAP32[((984)>>2)]=$204;
    HEAP32[((996)>>2)]=$_0;
    $205=$204|1;
    $206=(($_0+4)|0);
    HEAP32[(($206)>>2)]=$205;
    $207=$_0;
    $208=(($207+$204)|0);
    $209=$208;
    HEAP32[(($209)>>2)]=$204;
    return;
   }
   $211=$185&-8;
   $212=((($211)+($_0277))|0);
   $213=$185>>>3;
   $214=($185>>>0)<((256)>>>0);
   L100: do {
    if ($214) {
     $_sum20=((($psize)+(8))|0);
     $216=(($1+$_sum20)|0);
     $217=$216;
     $218=((HEAP32[(($217)>>2)])|0);
     $_sum21=((($psize)+(12))|0);
     $219=(($1+$_sum21)|0);
     $220=$219;
     $221=((HEAP32[(($220)>>2)])|0);
     $222=$213<<1;
     $223=((1016+($222<<2))|0);
     $224=$223;
     $225=($218|0)==($224|0);
     do {
      if (!($225)) {
       $227=$218;
       $228=($227>>>0)<($180>>>0);
       if ($228) {
        _abort();

       }
       $230=(($218+12)|0);
       $231=((HEAP32[(($230)>>2)])|0);
       $232=($231|0)==($3|0);
       if ($232) {
        break;
       }
       _abort();

      }
     } while(0);
     $233=($221|0)==($218|0);
     if ($233) {
      $235=1<<$213;
      $236=$235^-1;
      $237=((HEAP32[((976)>>2)])|0);
      $238=$237&$236;
      HEAP32[((976)>>2)]=$238;
      break;
     }
     $240=($221|0)==($224|0);
     do {
      if ($240) {
       $_pre63=(($221+8)|0);
       $_pre_phi64=$_pre63;
      } else {
       $242=$221;
       $243=($242>>>0)<($180>>>0);
       if ($243) {
        _abort();

       }
       $245=(($221+8)|0);
       $246=((HEAP32[(($245)>>2)])|0);
       $247=($246|0)==($3|0);
       if ($247) {
        $_pre_phi64=$245;
        break;
       }
       _abort();

      }
     } while(0);

     $248=(($218+12)|0);
     HEAP32[(($248)>>2)]=$221;
     HEAP32[(($_pre_phi64)>>2)]=$218;
    } else {
     $250=$2;
     $_sum2=((($psize)+(24))|0);
     $251=(($1+$_sum2)|0);
     $252=$251;
     $253=((HEAP32[(($252)>>2)])|0);
     $_sum3=((($psize)+(12))|0);
     $254=(($1+$_sum3)|0);
     $255=$254;
     $256=((HEAP32[(($255)>>2)])|0);
     $257=($256|0)==($250|0);
     do {
      if ($257) {
       $_sum5=((($psize)+(20))|0);
       $274=(($1+$_sum5)|0);
       $275=$274;
       $276=((HEAP32[(($275)>>2)])|0);
       $277=($276|0)==0;
       if ($277) {
        $_sum4=((($psize)+(16))|0);
        $279=(($1+$_sum4)|0);
        $280=$279;
        $281=((HEAP32[(($280)>>2)])|0);
        $282=($281|0)==0;
        if ($282) {
         $R7_1=0;
         break;
        } else {
         $R7_0=$281;$RP9_0=$280;
        }
       } else {
        $R7_0=$276;$RP9_0=$275;
       }
       while(1) {


        $283=(($R7_0+20)|0);
        $284=((HEAP32[(($283)>>2)])|0);
        $285=($284|0)==0;
        if (!($285)) {
         $R7_0=$284;$RP9_0=$283;
         continue;
        }
        $287=(($R7_0+16)|0);
        $288=((HEAP32[(($287)>>2)])|0);
        $289=($288|0)==0;
        if ($289) {
         break;
        } else {
         $R7_0=$288;$RP9_0=$287;
        }
       }
       $291=$RP9_0;
       $292=($291>>>0)<($180>>>0);
       if ($292) {
        _abort();

       } else {
        HEAP32[(($RP9_0)>>2)]=0;
        $R7_1=$R7_0;
        break;
       }
      } else {
       $_sum18=((($psize)+(8))|0);
       $259=(($1+$_sum18)|0);
       $260=$259;
       $261=((HEAP32[(($260)>>2)])|0);
       $262=$261;
       $263=($262>>>0)<($180>>>0);
       if ($263) {
        _abort();

       }
       $265=(($261+12)|0);
       $266=((HEAP32[(($265)>>2)])|0);
       $267=($266|0)==($250|0);
       if (!($267)) {
        _abort();

       }
       $269=(($256+8)|0);
       $270=((HEAP32[(($269)>>2)])|0);
       $271=($270|0)==($250|0);
       if ($271) {
        HEAP32[(($265)>>2)]=$256;
        HEAP32[(($269)>>2)]=$261;
        $R7_1=$256;
        break;
       } else {
        _abort();

       }
      }
     } while(0);

     $296=($253|0)==0;
     if ($296) {
      break;
     }
     $_sum15=((($psize)+(28))|0);
     $298=(($1+$_sum15)|0);
     $299=$298;
     $300=((HEAP32[(($299)>>2)])|0);
     $301=((1280+($300<<2))|0);
     $302=((HEAP32[(($301)>>2)])|0);
     $303=($250|0)==($302|0);
     do {
      if ($303) {
       HEAP32[(($301)>>2)]=$R7_1;
       $cond53=($R7_1|0)==0;
       if (!($cond53)) {
        break;
       }
       $305=1<<$300;
       $306=$305^-1;
       $307=((HEAP32[((980)>>2)])|0);
       $308=$307&$306;
       HEAP32[((980)>>2)]=$308;
       break L100;
      } else {
       $310=$253;
       $311=((HEAP32[((992)>>2)])|0);
       $312=($310>>>0)<($311>>>0);
       if ($312) {
        _abort();

       }
       $314=(($253+16)|0);
       $315=((HEAP32[(($314)>>2)])|0);
       $316=($315|0)==($250|0);
       if ($316) {
        HEAP32[(($314)>>2)]=$R7_1;
       } else {
        $319=(($253+20)|0);
        HEAP32[(($319)>>2)]=$R7_1;
       }
       $322=($R7_1|0)==0;
       if ($322) {
        break L100;
       }
      }
     } while(0);
     $324=$R7_1;
     $325=((HEAP32[((992)>>2)])|0);
     $326=($324>>>0)<($325>>>0);
     if ($326) {
      _abort();

     }
     $328=(($R7_1+24)|0);
     HEAP32[(($328)>>2)]=$253;
     $_sum16=((($psize)+(16))|0);
     $329=(($1+$_sum16)|0);
     $330=$329;
     $331=((HEAP32[(($330)>>2)])|0);
     $332=($331|0)==0;
     do {
      if (!($332)) {
       $334=$331;
       $335=((HEAP32[((992)>>2)])|0);
       $336=($334>>>0)<($335>>>0);
       if ($336) {
        _abort();

       } else {
        $338=(($R7_1+16)|0);
        HEAP32[(($338)>>2)]=$331;
        $339=(($331+24)|0);
        HEAP32[(($339)>>2)]=$R7_1;
        break;
       }
      }
     } while(0);
     $_sum17=((($psize)+(20))|0);
     $342=(($1+$_sum17)|0);
     $343=$342;
     $344=((HEAP32[(($343)>>2)])|0);
     $345=($344|0)==0;
     if ($345) {
      break;
     }
     $347=$344;
     $348=((HEAP32[((992)>>2)])|0);
     $349=($347>>>0)<($348>>>0);
     if ($349) {
      _abort();

     } else {
      $351=(($R7_1+20)|0);
      HEAP32[(($351)>>2)]=$344;
      $352=(($344+24)|0);
      HEAP32[(($352)>>2)]=$R7_1;
      break;
     }
    }
   } while(0);
   $355=$212|1;
   $356=(($_0+4)|0);
   HEAP32[(($356)>>2)]=$355;
   $357=$_0;
   $358=(($357+$212)|0);
   $359=$358;
   HEAP32[(($359)>>2)]=$212;
   $360=((HEAP32[((996)>>2)])|0);
   $361=($_0|0)==($360|0);
   if (!($361)) {
    $_1=$212;
    break;
   }
   HEAP32[((984)>>2)]=$212;
   return;
  } else {
   $364=$185&-2;
   HEAP32[(($184)>>2)]=$364;
   $365=$_0277|1;
   $366=(($_0+4)|0);
   HEAP32[(($366)>>2)]=$365;
   $367=$_0;
   $368=(($367+$_0277)|0);
   $369=$368;
   HEAP32[(($369)>>2)]=$_0277;
   $_1=$_0277;
  }
 } while(0);

 $371=$_1>>>3;
 $372=($_1>>>0)<((256)>>>0);
 if ($372) {
  $374=$371<<1;
  $375=((1016+($374<<2))|0);
  $376=$375;
  $377=((HEAP32[((976)>>2)])|0);
  $378=1<<$371;
  $379=$377&$378;
  $380=($379|0)==0;
  do {
   if ($380) {
    $382=$377|$378;
    HEAP32[((976)>>2)]=$382;
    $_sum13_pre=((($374)+(2))|0);
    $_pre=((1016+($_sum13_pre<<2))|0);
    $F16_0=$376;$_pre_phi=$_pre;
   } else {
    $_sum14=((($374)+(2))|0);
    $384=((1016+($_sum14<<2))|0);
    $385=((HEAP32[(($384)>>2)])|0);
    $386=$385;
    $387=((HEAP32[((992)>>2)])|0);
    $388=($386>>>0)<($387>>>0);
    if (!($388)) {
     $F16_0=$385;$_pre_phi=$384;
     break;
    }
    _abort();

   }
  } while(0);


  HEAP32[(($_pre_phi)>>2)]=$_0;
  $391=(($F16_0+12)|0);
  HEAP32[(($391)>>2)]=$_0;
  $392=(($_0+8)|0);
  HEAP32[(($392)>>2)]=$F16_0;
  $393=(($_0+12)|0);
  HEAP32[(($393)>>2)]=$376;
  return;
 }
 $395=$_0;
 $396=$_1>>>8;
 $397=($396|0)==0;
 do {
  if ($397) {
   $I19_0=0;
  } else {
   $399=($_1>>>0)>((16777215)>>>0);
   if ($399) {
    $I19_0=31;
    break;
   }
   $401=((($396)+(1048320))|0);
   $402=$401>>>16;
   $403=$402&8;
   $404=$396<<$403;
   $405=((($404)+(520192))|0);
   $406=$405>>>16;
   $407=$406&4;
   $408=$407|$403;
   $409=$404<<$407;
   $410=((($409)+(245760))|0);
   $411=$410>>>16;
   $412=$411&2;
   $413=$408|$412;
   $414=(((14)-($413))|0);
   $415=$409<<$412;
   $416=$415>>>15;
   $417=((($414)+($416))|0);
   $418=$417<<1;
   $419=((($417)+(7))|0);
   $420=$_1>>>($419>>>0);
   $421=$420&1;
   $422=$421|$418;
   $I19_0=$422;
  }
 } while(0);

 $424=((1280+($I19_0<<2))|0);
 $425=(($_0+28)|0);
 $I19_0_c=$I19_0;
 HEAP32[(($425)>>2)]=$I19_0_c;
 $426=(($_0+20)|0);
 HEAP32[(($426)>>2)]=0;
 $427=(($_0+16)|0);
 HEAP32[(($427)>>2)]=0;
 $428=((HEAP32[((980)>>2)])|0);
 $429=1<<$I19_0;
 $430=$428&$429;
 $431=($430|0)==0;
 if ($431) {
  $433=$428|$429;
  HEAP32[((980)>>2)]=$433;
  HEAP32[(($424)>>2)]=$395;
  $434=(($_0+24)|0);
  $_c=$424;
  HEAP32[(($434)>>2)]=$_c;
  $435=(($_0+12)|0);
  HEAP32[(($435)>>2)]=$_0;
  $436=(($_0+8)|0);
  HEAP32[(($436)>>2)]=$_0;
  return;
 }
 $438=((HEAP32[(($424)>>2)])|0);
 $439=($I19_0|0)==31;
 if ($439) {
  $444=0;
 } else {
  $441=$I19_0>>>1;
  $442=(((25)-($441))|0);
  $444=$442;
 }

 $445=$_1<<$444;
 $K20_0=$445;$T_0=$438;
 while(1) {


  $447=(($T_0+4)|0);
  $448=((HEAP32[(($447)>>2)])|0);
  $449=$448&-8;
  $450=($449|0)==($_1|0);
  if ($450) {
   break;
  }
  $452=$K20_0>>>31;
  $453=(($T_0+16+($452<<2))|0);
  $454=((HEAP32[(($453)>>2)])|0);
  $455=($454|0)==0;
  $456=$K20_0<<1;
  if ($455) {
   label = 126;
   break;
  } else {
   $K20_0=$456;$T_0=$454;
  }
 }
 if ((label|0) == 126) {
  $458=$453;
  $459=((HEAP32[((992)>>2)])|0);
  $460=($458>>>0)<($459>>>0);
  if ($460) {
   _abort();

  }
  HEAP32[(($453)>>2)]=$395;
  $462=(($_0+24)|0);
  $T_0_c10=$T_0;
  HEAP32[(($462)>>2)]=$T_0_c10;
  $463=(($_0+12)|0);
  HEAP32[(($463)>>2)]=$_0;
  $464=(($_0+8)|0);
  HEAP32[(($464)>>2)]=$_0;
  return;
 }
 $467=(($T_0+8)|0);
 $468=((HEAP32[(($467)>>2)])|0);
 $469=$T_0;
 $470=((HEAP32[((992)>>2)])|0);
 $471=($469>>>0)<($470>>>0);
 if ($471) {
  _abort();

 }
 $473=$468;
 $474=($473>>>0)<($470>>>0);
 if ($474) {
  _abort();

 }
 $476=(($468+12)|0);
 HEAP32[(($476)>>2)]=$395;
 HEAP32[(($467)>>2)]=$395;
 $477=(($_0+8)|0);
 $_c9=$468;
 HEAP32[(($477)>>2)]=$_c9;
 $478=(($_0+12)|0);
 $T_0_c=$T_0;
 HEAP32[(($478)>>2)]=$T_0_c;
 $479=(($_0+24)|0);
 HEAP32[(($479)>>2)]=0;
 return;
}


function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[(curr)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[(ptr)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[(ptr)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[(dest)]=((HEAP8[(src)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[(dest)]=((HEAP8[(src)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}


// EMSCRIPTEN_END_FUNCS

  
  function dynCall_ii(index,a1) {
    index = index|0;
    a1=a1|0;
    return FUNCTION_TABLE_ii[index&1](a1|0)|0;
  }


  function dynCall_vi(index,a1) {
    index = index|0;
    a1=a1|0;
    FUNCTION_TABLE_vi[index&1](a1|0);
  }


  function dynCall_iiiiii(index,a1,a2,a3,a4,a5) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    return FUNCTION_TABLE_iiiiii[index&3](a1|0,a2|0,a3|0,a4|0,a5|0)|0;
  }


  function dynCall_viii(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0;
    FUNCTION_TABLE_viii[index&1](a1|0,a2|0,a3|0);
  }


  function dynCall_v(index) {
    index = index|0;
    
    FUNCTION_TABLE_v[index&1]();
  }


  function dynCall_iii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    return FUNCTION_TABLE_iii[index&1](a1|0,a2|0)|0;
  }

function b0(p0) { p0 = p0|0; abort(0); return 0 }
  function b1(p0) { p0 = p0|0; abort(1);  }
  function b2(p0,p1,p2,p3,p4) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0; abort(2); return 0 }
  function b3(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; abort(3);  }
  function b4() { ; abort(4);  }
  function b5(p0,p1) { p0 = p0|0;p1 = p1|0; abort(5); return 0 }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_ii = [b0,b0];
  
  var FUNCTION_TABLE_vi = [b1,b1];
  
  var FUNCTION_TABLE_iiiiii = [b2,b2,__ZN4crndL20crnd_default_reallocEPvjPjbS0_,b2];
  
  var FUNCTION_TABLE_viii = [b3,b3];
  
  var FUNCTION_TABLE_v = [b4,b4];
  
  var FUNCTION_TABLE_iii = [b5,b5];
  

  return { _strlen: _strlen, _crn_get_levels: _crn_get_levels, _crn_unpack_begin: _crn_unpack_begin, _realloc: _realloc, _crn_get_width: _crn_get_width, _crn_unpack_end: _crn_unpack_end, _memset: _memset, _crn_get_faces: _crn_get_faces, _malloc: _malloc, _crn_unpack_level: _crn_unpack_level, _memcpy: _memcpy, _free: _free, _crn_get_format: _crn_get_format, _crn_get_height: _crn_get_height, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_ii: dynCall_ii, dynCall_vi: dynCall_vi, dynCall_iiiiii: dynCall_iiiiii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_iii: dynCall_iii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_vi": invoke_vi, "invoke_iiiiii": invoke_iiiiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "_snprintf": _snprintf, "_abort": _abort, "_fflush": _fflush, "__reallyNegative": __reallyNegative, "_fputc": _fputc, "_sysconf": _sysconf, "_puts": _puts, "___setErrNo": ___setErrNo, "_send": _send, "_write": _write, "_fputs": _fputs, "_exit": _exit, "_sprintf": _sprintf, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___cxa_is_number_type": ___cxa_is_number_type, "_time": _time, "__formatString": __formatString, "___cxa_does_inherit": ___cxa_does_inherit, "__ZSt9terminatev": __ZSt9terminatev, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_pwrite": _pwrite, "_sbrk": _sbrk, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "_mkport": _mkport, "___resumeException": ___resumeException, "__exit": __exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _crn_get_levels = Module["_crn_get_levels"] = asm["_crn_get_levels"];
var _crn_unpack_begin = Module["_crn_unpack_begin"] = asm["_crn_unpack_begin"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _crn_get_width = Module["_crn_get_width"] = asm["_crn_get_width"];
var _crn_unpack_end = Module["_crn_unpack_end"] = asm["_crn_unpack_end"];
var _memset = Module["_memset"] = asm["_memset"];
var _crn_get_faces = Module["_crn_get_faces"] = asm["_crn_get_faces"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _crn_unpack_level = Module["_crn_unpack_level"] = asm["_crn_unpack_level"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _free = Module["_free"] = asm["_free"];
var _crn_get_format = Module["_crn_get_format"] = asm["_crn_get_format"];
var _crn_get_height = Module["_crn_get_height"] = asm["_crn_get_height"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}




return this;
}).call({TOTAL_MEMORY: (typeof CRUNCH_MEM==='number'?CRUNCH_MEM:16)<<20});

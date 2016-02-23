"use strict";
/**
 * Myou Engine
 *
 * Copyright (c) 2016 by Alberto Torres Ruiz <kungfoobar@gmail.com>
 * Copyright (c) 2016 by Julio Manuel López Tercero <julio@pixelements.net>
 *
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["myou"] = factory();
	else
		root["myou"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var GLRay, LogicBlock, Myou, actuators, create_canvas, glm, mat2, mat3, mat4, particles, physics, quat, ref, ref1, sensors, vec2, vec3, vec4;
	
	__webpack_require__(2);
	
	ref = __webpack_require__(6), Myou = ref.Myou, create_canvas = ref.create_canvas;
	
	physics = __webpack_require__(24);
	
	particles = __webpack_require__(39);
	
	GLRay = __webpack_require__(40).GLRay;
	
	LogicBlock = __webpack_require__(41).LogicBlock;
	
	glm = (ref1 = __webpack_require__(8), mat2 = ref1.mat2, mat3 = ref1.mat3, mat4 = ref1.mat4, vec2 = ref1.vec2, vec3 = ref1.vec3, vec4 = ref1.vec4, quat = ref1.quat, ref1);
	
	sensors = __webpack_require__(42);
	
	actuators = __webpack_require__(43);
	
	module.exports = {
	  Myou: Myou,
	  create_canvas: create_canvas,
	  LogicBlock: LogicBlock,
	  sensors: sensors,
	  actuators: actuators,
	  glm: glm,
	  physics: physics,
	  particles: particles,
	  GLRay: GLRay
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var eproto;
	
	__webpack_require__(3);
	
	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	
	window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
	
	eproto = HTMLElement.prototype;
	
	eproto.requestPointerLock = eproto.requestPointerLock || eproto.mozRequestPointerLock || eproto.webkitRequestPointerLock;
	
	eproto.requestFullscreen = eproto.requestFullscreen || eproto.mozRequestFullScreen || eproto.webkitRequestFullscreen || eproto.msRequestFullScreen;
	
	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
	
	document.exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullScreen;
	
	if (!window.performance) {
	  window.performance = Date;
	}
	
	window.is_64_bit_os = /x86_64|x86-64|Win64|x64;|amd64|AMD64|WOW64|x64_64/.test(navigator.userAgent);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var TimSort, base, base1, base2;
	
	TimSort = __webpack_require__(4);
	
	window.PI_2 = Math.PI * 2;
	
	window.closest_pow2 = function(n) {
	  return Math.pow(2, Math.round(Math.log(n) / Math.log(2)));
	};
	
	window.interpolate = function(t, p0, p1, p2, p3) {
	  var c0, c1, c2, c3, t2, t3;
	  t2 = t * t;
	  t3 = t2 * t;
	  c0 = p0;
	  c1 = -3.0 * p0 + 3.0 * p1;
	  c2 = 3.0 * p0 - 6.0 * p1 + 3.0 * p2;
	  c3 = -p0 + 3.0 * p1 - 3.0 * p2 + p3;
	  return c0 + t * c1 + t2 * c2 + t3 * c3;
	};
	
	window.timsort_sqdist = function(arr) {
	  return TimSort.sort(arr, function(a, b) {
	    return a._sqdist - b._sqdist;
	  });
	};
	
	window.timsort_numeric = TimSort.sort;
	
	window.randInt = function(min, max) {
	  var rand, range;
	  range = max - min;
	  rand = Math.floor(Math.random() * (range + 1));
	  return min + rand;
	};
	
	if ((base = String.prototype).startswith == null) {
	  base.startswith = function(s) {
	    return this.slice(0, s.length) === s;
	  };
	}
	
	if ((base1 = String.prototype).endswith == null) {
	  base1.endswith = function(s) {
	    return s === '' || this.slice(-s.length) === s;
	  };
	}
	
	if ((base2 = Array.prototype).append == null) {
	  base2.append = Array.prototype.push;
	}
	
	window.reversed = function(x) {
	  var i, l, result;
	  result = [];
	  l = x.length;
	  i = 0;
	  while (i < l) {
	    result.push(x[l - i - 1]);
	    i += 1;
	  }
	  return result;
	};
	
	Object.defineProperty(Array.prototype, 'insert', {
	  value: function(index, item) {
	    return this.splice(index, 0, item);
	  }
	});
	
	Object.defineProperty(Array.prototype, 'extend', {
	  value: function(items) {
	    var item, j, len;
	    for (j = 0, len = items.length; j < len; j++) {
	      item = items[j];
	      this.append(item);
	    }
	  }
	});
	
	Object.defineProperty(Array.prototype, 'remove', {
	  value: function(i) {
	    i = this.indexOf(i);
	    if (i !== -1) {
	      return this.splice(i, 1);
	    }
	  }
	});
	
	Object.defineProperty(Array.prototype, 'clear', {
	  value: function() {
	    return this.splice(0);
	  }
	});
	
	window.range = function(start, stop, step) {
	  var i, r;
	  if (step == null) {
	    step = 1;
	  }
	  if (stop == null) {
	    stop = start;
	    start = 0;
	  }
	  r = [];
	  i = start;
	  while (i < stop) {
	    r.push(i);
	    i += step;
	  }
	  return r;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(5);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/****
	 * The MIT License
	 *
	 * Copyright (c) 2015 Marco Ziccardi
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 ****/
	(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== 'undefined') {
	    factory(exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod.exports);
	    global.timsort = mod.exports;
	  }
	})(this, function (exports) {
	  'use strict';
	
	  exports.__esModule = true;
	  exports.sort = sort;
	
	  function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	      throw new TypeError('Cannot call a class as a function');
	    }
	  }
	
	  var DEFAULT_MIN_MERGE = 32;
	
	  var DEFAULT_MIN_GALLOPING = 7;
	
	  var DEFAULT_TMP_STORAGE_LENGTH = 256;
	
	  function alphabeticalCompare(a, b) {
	    if (a === b) {
	      return 0;
	    } else {
	      var aStr = String(a);
	      var bStr = String(b);
	
	      if (aStr === bStr) {
	        return 0;
	      } else {
	        return aStr < bStr ? -1 : 1;
	      }
	    }
	  }
	
	  function minRunLength(n) {
	    var r = 0;
	
	    while (n >= DEFAULT_MIN_MERGE) {
	      r |= n & 1;
	      n >>= 1;
	    }
	
	    return n + r;
	  }
	
	  function makeAscendingRun(array, lo, hi, compare) {
	    var runHi = lo + 1;
	
	    if (runHi === hi) {
	      return 1;
	    }
	
	    if (compare(array[runHi++], array[lo]) < 0) {
	      while (runHi < hi && compare(array[runHi], array[runHi - 1]) < 0) {
	        runHi++;
	      }
	
	      reverseRun(array, lo, runHi);
	    } else {
	      while (runHi < hi && compare(array[runHi], array[runHi - 1]) >= 0) {
	        runHi++;
	      }
	    }
	
	    return runHi - lo;
	  }
	
	  function reverseRun(array, lo, hi) {
	    hi--;
	
	    while (lo < hi) {
	      var t = array[lo];
	      array[lo++] = array[hi];
	      array[hi--] = t;
	    }
	  }
	
	  function binaryInsertionSort(array, lo, hi, start, compare) {
	    if (start === lo) {
	      start++;
	    }
	
	    for (; start < hi; start++) {
	      var pivot = array[start];
	
	      var left = lo;
	      var right = start;
	
	      while (left < right) {
	        var mid = left + right >>> 1;
	
	        if (compare(pivot, array[mid]) < 0) {
	          right = mid;
	        } else {
	          left = mid + 1;
	        }
	      }
	
	      var n = start - left;
	
	      switch (n) {
	        case 3:
	          array[left + 3] = array[left + 2];
	
	        case 2:
	          array[left + 2] = array[left + 1];
	
	        case 1:
	          array[left + 1] = array[left];
	          break;
	        default:
	          while (n > 0) {
	            array[left + n] = array[left + n - 1];
	            n--;
	          }
	      }
	
	      array[left] = pivot;
	    }
	  }
	
	  function gallopLeft(value, array, start, length, hint, compare) {
	    var lastOffset = 0;
	    var maxOffset = 0;
	    var offset = 1;
	
	    if (compare(value, array[start + hint]) > 0) {
	      maxOffset = length - hint;
	
	      while (offset < maxOffset && compare(value, array[start + hint + offset]) > 0) {
	        lastOffset = offset;
	        offset = (offset << 1) + 1;
	
	        if (offset <= 0) {
	          offset = maxOffset;
	        }
	      }
	
	      if (offset > maxOffset) {
	        offset = maxOffset;
	      }
	
	      lastOffset += hint;
	      offset += hint;
	    } else {
	      maxOffset = hint + 1;
	      while (offset < maxOffset && compare(value, array[start + hint - offset]) <= 0) {
	        lastOffset = offset;
	        offset = (offset << 1) + 1;
	
	        if (offset <= 0) {
	          offset = maxOffset;
	        }
	      }
	      if (offset > maxOffset) {
	        offset = maxOffset;
	      }
	
	      var tmp = lastOffset;
	      lastOffset = hint - offset;
	      offset = hint - tmp;
	    }
	
	    lastOffset++;
	    while (lastOffset < offset) {
	      var m = lastOffset + (offset - lastOffset >>> 1);
	
	      if (compare(value, array[start + m]) > 0) {
	        lastOffset = m + 1;
	      } else {
	        offset = m;
	      }
	    }
	    return offset;
	  }
	
	  function gallopRight(value, array, start, length, hint, compare) {
	    var lastOffset = 0;
	    var maxOffset = 0;
	    var offset = 1;
	
	    if (compare(value, array[start + hint]) < 0) {
	      maxOffset = hint + 1;
	
	      while (offset < maxOffset && compare(value, array[start + hint - offset]) < 0) {
	        lastOffset = offset;
	        offset = (offset << 1) + 1;
	
	        if (offset <= 0) {
	          offset = maxOffset;
	        }
	      }
	
	      if (offset > maxOffset) {
	        offset = maxOffset;
	      }
	
	      var tmp = lastOffset;
	      lastOffset = hint - offset;
	      offset = hint - tmp;
	    } else {
	      maxOffset = length - hint;
	
	      while (offset < maxOffset && compare(value, array[start + hint + offset]) >= 0) {
	        lastOffset = offset;
	        offset = (offset << 1) + 1;
	
	        if (offset <= 0) {
	          offset = maxOffset;
	        }
	      }
	
	      if (offset > maxOffset) {
	        offset = maxOffset;
	      }
	
	      lastOffset += hint;
	      offset += hint;
	    }
	
	    lastOffset++;
	
	    while (lastOffset < offset) {
	      var m = lastOffset + (offset - lastOffset >>> 1);
	
	      if (compare(value, array[start + m]) < 0) {
	        offset = m;
	      } else {
	        lastOffset = m + 1;
	      }
	    }
	
	    return offset;
	  }
	
	  var TimSort = (function () {
	    function TimSort(array, compare) {
	      _classCallCheck(this, TimSort);
	
	      this.array = null;
	      this.compare = null;
	      this.minGallop = DEFAULT_MIN_GALLOPING;
	      this.length = 0;
	      this.tmpStorageLength = DEFAULT_TMP_STORAGE_LENGTH;
	      this.stackLength = 0;
	      this.runStart = null;
	      this.runLength = null;
	      this.stackSize = 0;
	
	      this.array = array;
	      this.compare = compare;
	
	      this.length = array.length;
	
	      if (this.length < 2 * DEFAULT_TMP_STORAGE_LENGTH) {
	        this.tmpStorageLength = this.length >>> 1;
	      }
	
	      this.tmp = new Array(this.tmpStorageLength);
	
	      this.stackLength = this.length < 120 ? 5 : this.length < 1542 ? 10 : this.length < 119151 ? 19 : 40;
	
	      this.runStart = new Array(this.stackLength);
	      this.runLength = new Array(this.stackLength);
	    }
	
	    TimSort.prototype.pushRun = function pushRun(runStart, runLength) {
	      this.runStart[this.stackSize] = runStart;
	      this.runLength[this.stackSize] = runLength;
	      this.stackSize += 1;
	    };
	
	    TimSort.prototype.mergeRuns = function mergeRuns() {
	      while (this.stackSize > 1) {
	        var n = this.stackSize - 2;
	
	        if (n >= 1 && this.runLength[n - 1] <= this.runLength[n] + this.runLength[n + 1] || n >= 2 && this.runLength[n - 2] <= this.runLength[n] + this.runLength[n - 1]) {
	
	          if (this.runLength[n - 1] < this.runLength[n + 1]) {
	            n--;
	          }
	        } else if (this.runLength[n] > this.runLength[n + 1]) {
	          break;
	        }
	        this.mergeAt(n);
	      }
	    };
	
	    TimSort.prototype.forceMergeRuns = function forceMergeRuns() {
	      while (this.stackSize > 1) {
	        var n = this.stackSize - 2;
	
	        if (n > 0 && this.runLength[n - 1] < this.runLength[n + 1]) {
	          n--;
	        }
	
	        this.mergeAt(n);
	      }
	    };
	
	    TimSort.prototype.mergeAt = function mergeAt(i) {
	      var compare = this.compare;
	      var array = this.array;
	
	      var start1 = this.runStart[i];
	      var length1 = this.runLength[i];
	      var start2 = this.runStart[i + 1];
	      var length2 = this.runLength[i + 1];
	
	      this.runLength[i] = length1 + length2;
	
	      if (i === this.stackSize - 3) {
	        this.runStart[i + 1] = this.runStart[i + 2];
	        this.runLength[i + 1] = this.runLength[i + 2];
	      }
	
	      this.stackSize--;
	
	      var k = gallopRight(array[start2], array, start1, length1, 0, compare);
	      start1 += k;
	      length1 -= k;
	
	      if (length1 === 0) {
	        return;
	      }
	
	      length2 = gallopLeft(array[start1 + length1 - 1], array, start2, length2, length2 - 1, compare);
	
	      if (length2 === 0) {
	        return;
	      }
	
	      if (length1 <= length2) {
	        this.mergeLow(start1, length1, start2, length2);
	      } else {
	        this.mergeHigh(start1, length1, start2, length2);
	      }
	    };
	
	    TimSort.prototype.mergeLow = function mergeLow(start1, length1, start2, length2) {
	
	      var compare = this.compare;
	      var array = this.array;
	      var tmp = this.tmp;
	      var i = 0;
	
	      for (i = 0; i < length1; i++) {
	        tmp[i] = array[start1 + i];
	      }
	
	      var cursor1 = 0;
	      var cursor2 = start2;
	      var dest = start1;
	
	      array[dest++] = array[cursor2++];
	
	      if (--length2 === 0) {
	        for (i = 0; i < length1; i++) {
	          array[dest + i] = tmp[cursor1 + i];
	        }
	        return;
	      }
	
	      if (length1 === 1) {
	        for (i = 0; i < length2; i++) {
	          array[dest + i] = array[cursor2 + i];
	        }
	        array[dest + length2] = tmp[cursor1];
	        return;
	      }
	
	      var minGallop = this.minGallop;
	
	      while (true) {
	        var count1 = 0;
	        var count2 = 0;
	        var exit = false;
	
	        do {
	          if (compare(array[cursor2], tmp[cursor1]) < 0) {
	            array[dest++] = array[cursor2++];
	            count2++;
	            count1 = 0;
	
	            if (--length2 === 0) {
	              exit = true;
	              break;
	            }
	          } else {
	            array[dest++] = tmp[cursor1++];
	            count1++;
	            count2 = 0;
	            if (--length1 === 1) {
	              exit = true;
	              break;
	            }
	          }
	        } while ((count1 | count2) < minGallop);
	
	        if (exit) {
	          break;
	        }
	
	        do {
	          count1 = gallopRight(array[cursor2], tmp, cursor1, length1, 0, compare);
	
	          if (count1 !== 0) {
	            for (i = 0; i < count1; i++) {
	              array[dest + i] = tmp[cursor1 + i];
	            }
	
	            dest += count1;
	            cursor1 += count1;
	            length1 -= count1;
	            if (length1 <= 1) {
	              exit = true;
	              break;
	            }
	          }
	
	          array[dest++] = array[cursor2++];
	
	          if (--length2 === 0) {
	            exit = true;
	            break;
	          }
	
	          count2 = gallopLeft(tmp[cursor1], array, cursor2, length2, 0, compare);
	
	          if (count2 !== 0) {
	            for (i = 0; i < count2; i++) {
	              array[dest + i] = array[cursor2 + i];
	            }
	
	            dest += count2;
	            cursor2 += count2;
	            length2 -= count2;
	
	            if (length2 === 0) {
	              exit = true;
	              break;
	            }
	          }
	          array[dest++] = tmp[cursor1++];
	
	          if (--length1 === 1) {
	            exit = true;
	            break;
	          }
	
	          minGallop--;
	        } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);
	
	        if (exit) {
	          break;
	        }
	
	        if (minGallop < 0) {
	          minGallop = 0;
	        }
	
	        minGallop += 2;
	      }
	
	      this.minGallop = minGallop;
	
	      if (minGallop < 1) {
	        this.minGallop = 1;
	      }
	
	      if (length1 === 1) {
	        for (i = 0; i < length2; i++) {
	          array[dest + i] = array[cursor2 + i];
	        }
	        array[dest + length2] = tmp[cursor1];
	      } else if (length1 === 0) {
	        throw new Error('mergeLow preconditions were not respected');
	      } else {
	        for (i = 0; i < length1; i++) {
	          array[dest + i] = tmp[cursor1 + i];
	        }
	      }
	    };
	
	    TimSort.prototype.mergeHigh = function mergeHigh(start1, length1, start2, length2) {
	      var compare = this.compare;
	      var array = this.array;
	      var tmp = this.tmp;
	      var i = 0;
	
	      for (i = 0; i < length2; i++) {
	        tmp[i] = array[start2 + i];
	      }
	
	      var cursor1 = start1 + length1 - 1;
	      var cursor2 = length2 - 1;
	      var dest = start2 + length2 - 1;
	      var customCursor = 0;
	      var customDest = 0;
	
	      array[dest--] = array[cursor1--];
	
	      if (--length1 === 0) {
	        customCursor = dest - (length2 - 1);
	
	        for (i = 0; i < length2; i++) {
	          array[customCursor + i] = tmp[i];
	        }
	
	        return;
	      }
	
	      if (length2 === 1) {
	        dest -= length1;
	        cursor1 -= length1;
	        customDest = dest + 1;
	        customCursor = cursor1 + 1;
	
	        for (i = length1 - 1; i >= 0; i--) {
	          array[customDest + i] = array[customCursor + i];
	        }
	
	        array[dest] = tmp[cursor2];
	        return;
	      }
	
	      var minGallop = this.minGallop;
	
	      while (true) {
	        var count1 = 0;
	        var count2 = 0;
	        var exit = false;
	
	        do {
	          if (compare(tmp[cursor2], array[cursor1]) < 0) {
	            array[dest--] = array[cursor1--];
	            count1++;
	            count2 = 0;
	            if (--length1 === 0) {
	              exit = true;
	              break;
	            }
	          } else {
	            array[dest--] = tmp[cursor2--];
	            count2++;
	            count1 = 0;
	            if (--length2 === 1) {
	              exit = true;
	              break;
	            }
	          }
	        } while ((count1 | count2) < minGallop);
	
	        if (exit) {
	          break;
	        }
	
	        do {
	          count1 = length1 - gallopRight(tmp[cursor2], array, start1, length1, length1 - 1, compare);
	
	          if (count1 !== 0) {
	            dest -= count1;
	            cursor1 -= count1;
	            length1 -= count1;
	            customDest = dest + 1;
	            customCursor = cursor1 + 1;
	
	            for (i = count1 - 1; i >= 0; i--) {
	              array[customDest + i] = array[customCursor + i];
	            }
	
	            if (length1 === 0) {
	              exit = true;
	              break;
	            }
	          }
	
	          array[dest--] = tmp[cursor2--];
	
	          if (--length2 === 1) {
	            exit = true;
	            break;
	          }
	
	          count2 = length2 - gallopLeft(array[cursor1], tmp, 0, length2, length2 - 1, compare);
	
	          if (count2 !== 0) {
	            dest -= count2;
	            cursor2 -= count2;
	            length2 -= count2;
	            customDest = dest + 1;
	            customCursor = cursor2 + 1;
	
	            for (i = 0; i < count2; i++) {
	              array[customDest + i] = tmp[customCursor + i];
	            }
	
	            if (length2 <= 1) {
	              exit = true;
	              break;
	            }
	          }
	
	          array[dest--] = array[cursor1--];
	
	          if (--length1 === 0) {
	            exit = true;
	            break;
	          }
	
	          minGallop--;
	        } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);
	
	        if (exit) {
	          break;
	        }
	
	        if (minGallop < 0) {
	          minGallop = 0;
	        }
	
	        minGallop += 2;
	      }
	
	      this.minGallop = minGallop;
	
	      if (minGallop < 1) {
	        this.minGallop = 1;
	      }
	
	      if (length2 === 1) {
	        dest -= length1;
	        cursor1 -= length1;
	        customDest = dest + 1;
	        customCursor = cursor1 + 1;
	
	        for (i = length1 - 1; i >= 0; i--) {
	          array[customDest + i] = array[customCursor + i];
	        }
	
	        array[dest] = tmp[cursor2];
	      } else if (length2 === 0) {
	        throw new Error('mergeHigh preconditions were not respected');
	      } else {
	        customCursor = dest - (length2 - 1);
	        for (i = 0; i < length2; i++) {
	          array[customCursor + i] = tmp[i];
	        }
	      }
	    };
	
	    return TimSort;
	  })();
	
	  function sort(array, compare, lo, hi) {
	    if (!Array.isArray(array)) {
	      throw new TypeError('Can only sort arrays');
	    }
	
	    if (!compare) {
	      compare = alphabeticalCompare;
	    } else if (typeof compare !== 'function') {
	      hi = lo;
	      lo = compare;
	      compare = alphabeticalCompare;
	    }
	
	    if (!lo) {
	      lo = 0;
	    }
	    if (!hi) {
	      hi = array.length;
	    }
	
	    var remaining = hi - lo;
	
	    if (remaining < 2) {
	      return;
	    }
	
	    var runLength = 0;
	
	    if (remaining < DEFAULT_MIN_MERGE) {
	      runLength = makeAscendingRun(array, lo, hi, compare);
	      binaryInsertionSort(array, lo, hi, lo + runLength, compare);
	      return;
	    }
	
	    var ts = new TimSort(array, compare);
	
	    var minRun = minRunLength(remaining);
	
	    do {
	      runLength = makeAscendingRun(array, lo, hi, compare);
	      if (runLength < minRun) {
	        var force = remaining;
	        if (force > minRun) {
	          force = minRun;
	        }
	
	        binaryInsertionSort(array, lo, lo + force, lo + runLength, compare);
	        runLength = force;
	      }
	
	      ts.pushRun(lo, runLength);
	      ts.mergeRuns();
	
	      remaining -= runLength;
	      lo += runLength;
	    } while (remaining !== 0);
	
	    ts.forceMergeRuns();
	  }
	});


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Events, MainLoop, Myou, RenderManager, XhrLoader, create_canvas,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
	RenderManager = __webpack_require__(7).RenderManager;
	
	XhrLoader = __webpack_require__(25).XhrLoader;
	
	Events = __webpack_require__(37).Events;
	
	MainLoop = __webpack_require__(38).MainLoop;
	
	Myou = (function() {
	  function Myou(root, MYOU_PARAMS) {
	    this.update_canvas_rect = bind(this.update_canvas_rect, this);
	    var canvas, data_dir, initial_scene, loader, render_manager, resize_canvas, size;
	    this.scenes = {};
	    this.loaded_scenes = [];
	    this.active_sprites = [];
	    this.objects = {};
	    this.actions = {};
	    this.groups = {};
	    this.debug_loader = null;
	    this.canvas = null;
	    this.root = null;
	    this.all_materials = [];
	    this.mesh_datas = [];
	    this.SHADER_LIB = '';
	    this.all_anim_objects = [];
	    this.root = this.canvas = canvas = root;
	    this.MYOU_PARAMS = MYOU_PARAMS;
	    this.hash = Math.random();
	    if (getComputedStyle(root).position === 'static') {
	      root.style.position = 'relative';
	    }
	    if (canvas.tagName !== 'CANVAS') {
	      canvas = this.canvas = root.querySelector('canvas');
	    }
	    render_manager = new RenderManager(this, canvas, canvas.clientWidth, canvas.clientHeight, MYOU_PARAMS.gl_options || {
	      antialias: true,
	      alpha: false
	    });
	    this.update_canvas_rect();
	    resize_canvas = (function(_this) {
	      return function() {
	        render_manager.resize(canvas.clientWidth, canvas.clientHeight);
	        return _this.update_canvas_rect();
	      };
	    })(this);
	    window.addEventListener('resize', resize_canvas);
	    size = MYOU_PARAMS.total_size || 0;
	    initial_scene = MYOU_PARAMS.initial_scene || 'Scene';
	    data_dir = MYOU_PARAMS.data_dir || './data';
	    loader = new XhrLoader(this, data_dir);
	    loader.total += size;
	    loader.debug = MYOU_PARAMS.live_server ? true : false;
	    loader.load_scene(initial_scene, MYOU_PARAMS.initial_scene_filter);
	    if (MYOU_PARAMS.load_physics_engine) {
	      loader.load_physics_engine();
	    }
	    this.events = new Events(root);
	    this.main_loop = new MainLoop(this);
	    this.main_loop.run();
	  }
	
	  Myou.prototype.on_scene_ready_queue = {};
	
	  Myou.prototype.on_scene_ready = function(scene_name, callback) {
	    var k, ref, results, s, scene_ready;
	    scene_ready = (this.scenes[scene_name] != null) && (!this.MYOU_PARAMS.load_physics_engine || (typeof Ammo !== "undefined" && Ammo !== null));
	    if (scene_ready) {
	      while (this.on_scene_ready_queue[scene_name].length) {
	        this.on_scene_ready_queue[scene_name].shift()();
	      }
	      if (callback != null) {
	        return callback();
	      }
	    } else {
	      if (callback != null) {
	        if (this.on_scene_ready_queue[scene_name] != null) {
	          this.on_scene_ready_queue[scene_name].push(callback);
	        } else {
	          this.on_scene_ready_queue[scene_name] = [callback];
	        }
	      }
	      ref = this.on_scene_ready_queue;
	      results = [];
	      for (k in ref) {
	        s = ref[k];
	        if (s.length) {
	          results.push(window.requestAnimationFrame((function(_this) {
	            return function() {
	              return _this.on_scene_ready(k);
	            };
	          })(this)));
	        } else {
	          results.push(void 0);
	        }
	      }
	      return results;
	    }
	  };
	
	  Myou.prototype.update_canvas_rect = function() {
	    this.canvas_rect = this.canvas.getClientRects()[0];
	    return this.canvas.rect = this.canvas_rect;
	  };
	
	  return Myou;
	
	})();
	
	create_canvas = function(root) {
	  var canvas;
	  canvas = document.createElement('canvas');
	  if (root != null) {
	    canvas.style.position = 'relative';
	    canvas.style.width = '100%';
	    canvas.style.height = '100%';
	    root.insertBefore(canvas, root.firstChild);
	  }
	  return canvas;
	};
	
	module.exports = {
	  Myou: Myou,
	  create_canvas: create_canvas
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Debug, Filter, Framebuffer, MIRROR_MASK_X, MIRROR_MASK_Y, MIRROR_MASK_Z, MainFramebuffer, Material, Mesh, RenderManager, VECTOR_MINUS_Z, box_filter_code, mat2, mat3, mat4, plain_fs, plain_vs, quat, ref, ref1, ref2, vec2, vec3, vec4;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	ref1 = __webpack_require__(18), Filter = ref1.Filter, box_filter_code = ref1.box_filter_code;
	
	ref2 = __webpack_require__(20), Framebuffer = ref2.Framebuffer, MainFramebuffer = ref2.MainFramebuffer;
	
	Mesh = __webpack_require__(21).Mesh;
	
	Material = __webpack_require__(19).Material;
	
	MIRROR_MASK_X = 2 | 16 | 32 | 128;
	
	MIRROR_MASK_Y = 4 | 16 | 64 | 128;
	
	MIRROR_MASK_Z = 8 | 32 | 64 | 128;
	
	VECTOR_MINUS_Z = new Float32Array([0, 0, -1]);
	
	RenderManager = (function() {
	  function RenderManager(context, canvas, width, height, glflags, on_webgl_failed, on_context_lost, on_context_restored, no_s3tc) {
	    var ba, e, error, gl, iecanvas, lost, pixel_ratio_y, restored;
	    try {
	      gl = canvas.getContext("webgl", glflags) || canvas.getContext("experimental-webgl", glflags);
	    } catch (error) {
	      e = error;
	      pass;
	    }
	    if (!gl) {
	      if (navigator.appName === "Microsoft Internet Explorer") {
	        iecanvas = document.createElement('object');
	        iecanvas.type = "application/x-webgl";
	        canvas.parentNode.replaceChild(iecanvas, canvas);
	        canvas = iecanvas;
	        gl = canvas.getContext("webgl", glflags) || canvas.getContext("experimental-webgl", glflags);
	      }
	    }
	    if (!gl) {
	      if (typeof on_webgl_failed === "function") {
	        on_webgl_failed();
	      }
	      raise("Error: Can't start WebGL");
	    }
	    this.context = context;
	    this.context.render_manager = this;
	    this.canvas = canvas;
	    this.gl = gl;
	    this.textures = {};
	    this.width = width;
	    this.height = height;
	    this.main_fb = new MainFramebuffer(this);
	    this.viewports = [];
	    this.render_tick = 0;
	    this.context_lost_count = 0;
	    this.vrstate = null;
	    this.bound_textures = [];
	    this.frame_start = performance.now();
	    this.pixel_ratio_x = pixel_ratio_y = 1;
	    this.camera_z = vec3.create();
	    this.lod_factor = 1;
	    this.no_s3tc = no_s3tc;
	    ba = this.context.MYOU_PARAMS.background_alpha;
	    this.background_alpha = ba != null ? ba : 1;
	    this._cam2world = mat4.create();
	    this._world2cam = mat4.create();
	    this._world2cam3 = mat3.create();
	    this._world2cam_mx = mat4.create();
	    this._world2cam3_mx = mat3.create();
	    this._world2light = mat4.create();
	    this._m4 = mat4.create();
	    this._m3 = mat3.create();
	    this._v = vec3.create();
	    this._cam = null;
	    this._cull_left = vec3.create();
	    this._cull_right = vec3.create();
	    this._cull_top = vec3.create();
	    this._cull_bottom = vec3.create();
	    this._polygon_ratio = 1;
	    this.triangles_drawn = 0;
	    this.meshes_drawn = 0;
	    lost = function(event) {
	      event.preventDefault();
	      on_context_lost();
	      return render_manager.clear_context();
	    };
	    restored = function(event) {
	      render_manager.restore_context();
	      return (on_context_restored != null) && requestAnimationFrame(on_context_restored);
	    };
	    canvas.addEventListener("webglcontextlost", lost, false);
	    canvas.addEventListener("webglcontextrestored", restored, false);
	    this.initialize();
	  }
	
	  RenderManager.prototype.initialize = function() {
	    var gl, tex;
	    gl = this.gl;
	    this.extensions = {
	      standard_derivatives: gl.getExtension('OES_standard_derivatives'),
	      texture_float: gl.getExtension('OES_texture_float'),
	      texture_float_linear: gl.getExtension('OES_texture_float_linear'),
	      compressed_texture_s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
	      texture_filter_anisotropic: gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic"),
	      lose_context: gl.getExtension("WEBGL_lose_context")
	    };
	    if (this.no_s3tc) {
	      this.extensions['compressed_texture_s3tc'] = null;
	    }
	    this.dummy_filter = new Filter(this, "return get(0,0);", 'dummy_filter');
	    this.shadow_box_filter = new Filter(this, box_filter_code, 'box_filter');
	    this.invert_filter = new Filter(this, "return vec3(1.0) - get(0,0);", 'invert_filter');
	    this.common_shadow_fb = null;
	    this.debug = new Debug(this.context);
	    gl.clearDepth(1.0);
	    gl.enable(gl.DEPTH_TEST);
	    gl.depthFunc(gl.LEQUAL);
	    gl.enable(gl.CULL_FACE);
	    gl.cullFace(gl.BACK);
	    this.cull_face_enabled = true;
	    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	    this.attrib_bitmask = 0;
	    this.blank_texture = tex = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, tex);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
	    gl.bindTexture(gl.TEXTURE_2D, null);
	    return this.resize(this.width, this.height, this.pixel_ratio_x, this.pixel_ratio_y);
	  };
	
	  RenderManager.prototype.clear_context = function() {
	    var k, ref3, t;
	    this.context_lost_count += 1;
	    ref3 = this.textures;
	    for (k in ref3) {
	      t = ref3[k];
	      t.tex = null;
	    }
	  };
	
	  RenderManager.prototype.restore_context = function() {
	    var j, k, len, len1, m, o, ref3, ref4, ref5, t;
	    this.initialize();
	    ref3 = this.textures;
	    for (k in ref3) {
	      t = ref3[k];
	      t.reupload();
	    }
	    ref4 = this.context.all_materials;
	    for (j = 0, len = ref4.length; j < len; j++) {
	      m = ref4[j];
	      m.reupload();
	    }
	    ref5 = this.context.mesh_datas;
	    for (m = o = 0, len1 = ref5.length; o < len1; m = ++o) {
	      k = ref5[m];
	      m.reupload();
	    }
	  };
	
	  RenderManager.prototype.set_cull_face = function(enable) {
	    if (enable) {
	      return this.gl.enable(2884);
	    } else {
	      return this.gl.disable(2884);
	    }
	  };
	
	  RenderManager.prototype.resize = function(width, height, pixel_ratio_x, pixel_ratio_y) {
	    var filter_fb_needed, j, len, ref3, v;
	    if (pixel_ratio_x == null) {
	      pixel_ratio_x = 1;
	    }
	    if (pixel_ratio_y == null) {
	      pixel_ratio_y = 1;
	    }
	    this.width = width;
	    this.height = height;
	    this.canvas.width = this.main_fb.size_x = width * pixel_ratio_x;
	    this.canvas.height = this.main_fb.size_y = height * pixel_ratio_y;
	    this.pixel_ratio_x = pixel_ratio_x;
	    this.pixel_ratio_y = pixel_ratio_y;
	    this.screen_size = [width, height];
	    this.largest_side = Math.max(width, height);
	    this.smallest_side = Math.min(width, height);
	    this.diagonal = Math.sqrt(width * width + height * height);
	    filter_fb_needed = false;
	    ref3 = this.viewports;
	    for (j = 0, len = ref3.length; j < len; j++) {
	      v = ref3[j];
	      v.recalc_aspect();
	      if (v.post_processing_enabled) {
	        filter_fb_needed = true;
	      }
	    }
	    if (filter_fb_needed && this.viewports !== []) {
	      return this.recalculate_fb_size();
	    }
	  };
	
	  RenderManager.prototype.resize_soft = function(width, height) {
	    var j, len, ref3, v;
	    ref3 = this.viewports;
	    for (j = 0, len = ref3.length; j < len; j++) {
	      v = ref3[j];
	      v.camera.aspect_ratio = width / height;
	      v.camera.recalculate_projection();
	    }
	  };
	
	  RenderManager.prototype.request_fullscreen = function() {
	    var c;
	    c = this.canvas;
	    return (c.requestFullscreen || c.mozRequestFullScreen || c.webkitRequestFullscreen)();
	  };
	
	  RenderManager.prototype.recalculate_fb_size = function() {
	    var j, k, kk, len, mat, minx, miny, next_POT, ref3, ref4, ref5, scene, v;
	    next_POT = function(x) {
	      x = Math.max(0, x - 1);
	      return Math.pow(2, Math.floor(Math.log(x) / Math.log(2)) + 1);
	    };
	    minx = miny = 0;
	    ref3 = this.viewports;
	    for (j = 0, len = ref3.length; j < len; j++) {
	      v = ref3[j];
	      minx = Math.max(minx, v.rect_pix[2]);
	      miny = Math.max(miny, v.rect_pix[3]);
	    }
	    minx = next_POT(minx);
	    miny = next_POT(miny);
	    if (this.common_filter_fb) {
	      this.common_filter_fb.destroy();
	    }
	    if (!this.common_filter_fb || this.common_filter_fb.width !== minx || this.common_filter_fb.height !== miny) {
	      this.common_filter_fb = new Framebuffer(this.context.render_manager, minx, miny, this.gl.UNSIGNED_BYTE);
	    }
	    ref4 = this.context.scenes;
	    for (k in ref4) {
	      scene = ref4[k];
	      ref5 = scene.materials;
	      for (kk in ref5) {
	        mat = ref5[kk];
	        if (mat.u_fb_size != null) {
	          mat.use();
	          this.gl.uniform2f(mat.u_fb_size, minx, miny);
	        }
	      }
	    }
	  };
	
	  RenderManager.prototype.change_enabled_attributes = function(bitmask) {
	    var gl, i, mask, previous;
	    gl = this.gl;
	    previous = this.attrib_bitmask;
	    mask = previous & ~bitmask;
	    i = 0;
	    while (mask !== 0) {
	      if (mask & 1) {
	        gl.disableVertexAttribArray(i);
	      }
	      i += 1;
	      mask >>= 1;
	    }
	    mask = bitmask & ~previous;
	    i = 0;
	    while (mask !== 0) {
	      if (mask & 1) {
	        gl.enableVertexAttribArray(i);
	      }
	      i += 1;
	      mask >>= 1;
	    }
	    return this.attrib_bitmask = bitmask;
	  };
	
	  RenderManager.prototype.draw_all = function() {
	    var j, len, ref3, viewport;
	    this.frame_start = performance.now();
	    this.render_tick += 1;
	    this.triangles_drawn = 0;
	    this.meshes_drawn = 0;
	    ref3 = this.viewports;
	    for (j = 0, len = ref3.length; j < len; j++) {
	      viewport = ref3[j];
	      if (viewport.camera.scene.enabled) {
	        this.draw_viewport(viewport, viewport.rect_pix, viewport.dest_buffer, [0, 1]);
	      }
	    }
	    return this.debug.vectors.clear();
	  };
	
	  RenderManager.prototype.draw_mesh = function(mesh, mesh2world, pass_) {
	    var aa, ab, active_texture, amesh, attr, attrib_bitmasks, attrib_pointers, bones, bound_textures, cam, cv, data, dist, distance_to_camera, gl, i, influence, j, lamp, lavars, len, len1, len2, len3, len4, lod_ob, m, m3, m4, mat, mirrors, num_indices, o, parented_pos, pos, q, r, ref3, ref4, ref5, ref6, ref7, ref8, ref9, shape, stride, submesh_idx, tex, u, w, y;
	    if (pass_ == null) {
	      pass_ = -1;
	    }
	    gl = this.gl;
	    bound_textures = this.bound_textures;
	    m4 = this._m4;
	    m3 = this._m3;
	    cam = this._cam;
	    parented_pos = mesh.parent ? mesh.get_world_position() : mesh.position;
	    pos = vec3.copy(this._v, parented_pos);
	    if (mesh.mirrors === 2) {
	      pos[0] = -pos[0];
	    }
	    vec3.sub(pos, pos, cam.position);
	    r = mesh.radius;
	    distance_to_camera = vec3.dot(pos, this.camera_z);
	    if (((distance_to_camera + r) * (vec3.dot(pos, this._cull_top) + r) * (vec3.dot(pos, this._cull_left) + r) * (vec3.dot(pos, this._cull_right) + r) * (vec3.dot(pos, this._cull_bottom) + r)) < 0) {
	      mesh.culled_in_last_frame = true;
	      return true;
	    }
	    mesh.culled_in_last_frame = false;
	    amesh = mesh;
	    if (mesh.altmeshes.length) {
	      amesh = mesh.altmeshes[mesh.active_mesh_index] || mesh;
	    } else if (mesh.lod_objects) {
	      mesh.last_lod_object = null;
	      dist = distance_to_camera + this.lod_factor;
	      ref3 = mesh.lod_objects;
	      for (j = 0, len = ref3.length; j < len; j++) {
	        lod_ob = ref3[j];
	        if (dist > lod_ob.distance || !amesh.data) {
	          mesh.last_lod_object = amesh = lod_ob.object;
	          break;
	        }
	      }
	    }
	    if (!amesh.data) {
	      return true;
	    }
	    if (amesh.materials.length === 0) {
	      if (amesh.configure_materials() === false) {
	        return false;
	      }
	    }
	    submesh_idx = -1;
	    ref4 = amesh.materials;
	    for (o = 0, len1 = ref4.length; o < len1; o++) {
	      mat = ref4[o];
	      submesh_idx += 1;
	      if (!(pass_ === -1 || mesh.passes[submesh_idx] === pass_)) {
	        continue;
	      }
	      mat.use();
	      if (mat.double_sided === this.cull_face_enabled) {
	        this.cull_face_enabled = !this.cull_face_enabled;
	        this.set_cull_face(this.cull_face_enabled);
	      }
	      gl.uniformMatrix4fv(mat.u_projection_matrix, false, cam.projection_matrix);
	      gl.uniformMatrix4fv(mat.u_inv_model_view_matrix, false, this._cam2world);
	      if (mat.u_var_object_matrix != null) {
	        gl.uniformMatrix4fv(mat.u_var_object_matrix, false, mesh2world);
	      }
	      if (mat.u_var_inv_object_matrix != null) {
	        mat4.invert(m4, mesh2world);
	        gl.uniformMatrix4fv(mat.u_var_inv_object_matrix, false, m4);
	      }
	      if (mat.u_color != null) {
	        gl.uniform4fv(mat.u_color, mesh.color);
	      }
	      if (mat.u_custom[2]) {
	        gl.uniform1f(mat.u_custom[2], mesh.alpha);
	      }
	      for (i = q = 0, ref5 = mat.u_custom.length; 0 <= ref5 ? q < ref5 : q > ref5; i = 0 <= ref5 ? ++q : --q) {
	        cv = mesh.custom_uniform_values[i];
	        if (cv) {
	          if (cv.length) {
	            gl.uniform4fv(mat.u_custom[i], cv);
	          } else {
	            gl.uniform1f(mat.u_custom[i], cv);
	          }
	        }
	      }
	      ref6 = mat.lamps;
	      for (u = 0, len2 = ref6.length; u < len2; u++) {
	        lavars = ref6[u];
	        lamp = lavars[0];
	        gl.uniform3fv(lavars[1], lamp._view_pos);
	        gl.uniform3fv(lavars[2], lamp.color);
	        gl.uniform4fv(lavars[3], lamp._color4);
	        gl.uniform1f(lavars[4], lamp.falloff_distance);
	        gl.uniform3fv(lavars[5], lamp._dir);
	        gl.uniformMatrix4fv(lavars[6], false, lamp._cam2depth);
	      }
	      for (i = w = 0, ref7 = mat.textures.length; 0 <= ref7 ? w < ref7 : w > ref7; i = 0 <= ref7 ? ++w : --w) {
	        tex = mat.textures[i];
	        if (!tex.loaded) {
	          tex = this.context.render_manager.blank_texture;
	        }
	        if (bound_textures[i] !== tex) {
	          if (active_texture !== i) {
	            gl.activeTexture(gl.TEXTURE0 + i);
	            active_texture = i;
	          }
	          gl.bindTexture(gl.TEXTURE_2D, tex.tex);
	          bound_textures[i] = tex;
	        }
	      }
	      if (mat.u_shapef.length !== 0) {
	        i = 0;
	        ref8 = mesh._shape_names;
	        for (y = 0, len3 = ref8.length; y < len3; y++) {
	          shape = ref8[y];
	          influence = mesh.shapes[shape];
	          gl.uniform1f(mat.u_shapef[i], influence);
	          i += 1;
	        }
	        while (i < mat.u_shapef.length) {
	          gl.uniform1f(mat.u_shapef[i], 0);
	          i += 1;
	        }
	        if (amesh.shape_multiplier !== mat.shape_multiplier) {
	          mat.shape_multiplier = amesh.shape_multiplier;
	          gl.uniform1f(mat.u_shape_multiplier, amesh.shape_multiplier);
	        }
	      }
	      if (amesh.uv_multiplier !== mat.uv_multiplier) {
	        mat.uv_multiplier = amesh.uv_multiplier;
	        gl.uniform1f(mat.u_uv_multiplier, amesh.uv_multiplier);
	      }
	      if ((mesh.armature != null) && mesh.parent_bone_index === -1) {
	        bones = mesh.armature.deform_bones;
	        for (i = aa = 0, ref9 = mat.num_bone_uniforms; 0 <= ref9 ? aa < ref9 : aa > ref9; i = 0 <= ref9 ? ++aa : --aa) {
	          m = bones[i].ol_matrix;
	          gl.uniformMatrix4fv(mat.u_bones[i], false, m);
	        }
	      }
	      data = amesh.data;
	      attrib_pointers = data.attrib_pointers[submesh_idx];
	      attrib_bitmasks = data.attrib_bitmasks[submesh_idx];
	      stride = data.stride;
	      gl.bindBuffer(gl.ARRAY_BUFFER, data.vertex_buffers[submesh_idx]);
	      this.change_enabled_attributes(attrib_bitmasks);
	      for (ab = 0, len4 = attrib_pointers.length; ab < len4; ab++) {
	        attr = attrib_pointers[ab];
	        gl.vertexAttribPointer(attr[0], attr[1], attr[2], false, stride, attr[3]);
	      }
	      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.index_buffers[submesh_idx]);
	      mirrors = mesh.mirrors;
	      num_indices = data.num_indices[submesh_idx];
	      if (mirrors & 1) {
	        mat4.multiply(m4, this._world2cam, mesh2world);
	        gl.uniformMatrix4fv(mat.u_model_view_matrix, false, m4);
	        mat3.multiply(m3, this._world2cam3, mesh.normal_matrix);
	        gl.uniformMatrix3fv(mat.u_normal_matrix, false, m3);
	        gl.drawElements(data.draw_method, num_indices, gl.UNSIGNED_SHORT, 0);
	      }
	      if (mirrors & 178) {
	        mat4.multiply(m4, this._world2cam_mx, mesh2world);
	        gl.uniformMatrix4fv(mat.u_model_view_matrix, false, m4);
	        mat3.multiply(m3, this._world2cam3_mx, mesh.normal_matrix);
	        gl.uniformMatrix3fv(mat.u_normal_matrix, false, m3);
	        gl.frontFace(2304);
	        gl.drawElements(data.draw_method, num_indices, gl.UNSIGNED_SHORT, 0);
	        gl.frontFace(2305);
	      }
	    }
	    return true;
	  };
	
	  RenderManager.prototype.draw_viewport = function(viewport, rect, dest_buffer, passes) {
	    var aa, ab, ac, active_texture, ad, ae, af, ag, ah, attr, c, cam, cam2world, clear_bits, data, debug, dob, dvec, filter_fb, gl, i, j, lamp, len, len1, len10, len11, len12, len2, len3, len4, len5, len6, len7, len8, len9, m3, m4, ma, mat, o, ob, posrot, q, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, scene, shadows_pending, size, u, v, v1, v2, v3, w, world2cam, world2cam3, world2cam3_mx, world2cam_mx, world2light, x, y, z;
	    gl = this.gl;
	    if (gl.isContextLost()) {
	      return;
	    }
	    this._cam = cam = viewport.debug_camera || viewport.camera;
	    scene = cam.scene;
	    m4 = this._m4;
	    m3 = this._m3;
	    shadows_pending = false;
	    if (scene.last_render_tick < this.render_tick) {
	      scene.last_render_tick = this.render_tick;
	      shadows_pending = true;
	      if (scene._children_are_ordered === false) {
	        scene.reorder_children();
	      }
	      ref3 = scene.armatures;
	      for (j = 0, len = ref3.length; j < len; j++) {
	        ob = ref3[j];
	        ref4 = ob.children;
	        for (o = 0, len1 = ref4.length; o < len1; o++) {
	          c = ref4[o];
	          if (c.visible) {
	            ob.recalculate_bone_matrices();
	            break;
	          }
	        }
	      }
	      ref5 = scene.auto_updated_children;
	      for (q = 0, len2 = ref5.length; q < len2; q++) {
	        ob = ref5[q];
	        ob._update_matrices();
	      }
	    }
	    debug = this.debug;
	    filter_fb = this.common_filter_fb;
	    cam2world = mat4.copy(this._cam2world, cam.world_matrix);
	    world2cam = this._world2cam;
	    world2cam3 = this._world2cam3;
	    world2cam_mx = this._world2cam_mx;
	    world2cam3_mx = this._world2cam3_mx;
	    world2light = this._world2light;
	    vec3.transformMat4(cam2world.subarray(12), viewport.eye_shift, cam2world);
	    mat4.invert(world2cam, cam2world);
	    mat3.fromMat4(world2cam3, world2cam);
	    mat4.copy(world2cam_mx, world2cam);
	    world2cam_mx[0] = -world2cam_mx[0];
	    world2cam_mx[1] = -world2cam_mx[1];
	    world2cam_mx[2] = -world2cam_mx[2];
	    mat3.fromMat4(world2cam3_mx, world2cam_mx);
	    vec3.transformMat3(this.camera_z, VECTOR_MINUS_Z, cam.rotation_matrix);
	    vec3.transformMat3(this._cull_left, cam.cull_left, cam.rotation_matrix);
	    v = vec3.copy(this._cull_right, cam.cull_left);
	    v[0] = -v[0];
	    vec3.transformMat3(v, v, cam.rotation_matrix);
	    vec3.transformMat3(this._cull_bottom, cam.cull_bottom, cam.rotation_matrix);
	    v = vec3.copy(this._cull_top, cam.cull_bottom);
	    v[1] = -v[1];
	    vec3.transformMat3(v, v, cam.rotation_matrix);
	    mat4.mul(cam.world_to_screen_matrix, cam.projection_matrix, world2cam);
	    this.bound_textures.clear();
	    active_texture = -1;
	    ref6 = scene.lamps;
	    for (u = 0, len3 = ref6.length; u < len3; u++) {
	      lamp = ref6[u];
	      if ((lamp.shadow_fb != null) && shadows_pending) {
	        size = lamp.shadow_fb.size_x * 2;
	        if (this.common_shadow_fb == null) {
	          this.common_shadow_fb = new Framebuffer(this, size, size);
	        }
	        this.common_shadow_fb.enable([0, 0, size, size]);
	        gl.clearColor(1, 1, 1, 1);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        mat = lamp._shadow_material;
	        mat.use();
	        mat4.invert(world2light, lamp.world_matrix);
	        ref7 = scene.mesh_passes[0];
	        for (w = 0, len4 = ref7.length; w < len4; w++) {
	          ob = ref7[w];
	          data = ((ref8 = ob.last_lod_object) != null ? ref8.data : void 0) || ob.data;
	          if (ob.visible && data && data.attrib_pointers.length !== 0 && !ob.culled_in_last_frame) {
	            mat4.multiply(m4, world2light, ob.world_matrix);
	            gl.uniformMatrix4fv(mat.u_model_view_matrix, false, m4);
	            gl.uniformMatrix4fv(mat.u_projection_matrix, false, lamp._projection_matrix);
	            for (i = y = 0, ref9 = data.vertex_buffers.length; 0 <= ref9 ? y < ref9 : y > ref9; i = 0 <= ref9 ? ++y : --y) {
	              gl.bindBuffer(gl.ARRAY_BUFFER, data.vertex_buffers[i]);
	              this.change_enabled_attributes(1);
	              attr = data.attrib_pointers[i][0];
	              gl.vertexAttribPointer(attr[0], attr[1], attr[2], false, data.stride, attr[3]);
	              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.index_buffers[i]);
	              gl.drawElements(data.draw_method, data.num_indices[i], gl.UNSIGNED_SHORT, 0);
	            }
	          }
	        }
	        lamp.shadow_fb.enable();
	        this.common_shadow_fb.draw_with_filter(this.shadow_box_filter, [0, 0, size, size]);
	      }
	      if (lamp.shadow_fb != null) {
	        mat4.multiply(m4, world2light, cam2world);
	        mat4.multiply(lamp._cam2depth, lamp._depth_matrix, m4);
	      }
	      vec3.transformMat4(lamp._view_pos, lamp.world_matrix.subarray(12, 15), world2cam);
	      mat4.multiply(m4, world2cam, lamp.world_matrix);
	      lamp._dir[0] = -m4[8];
	      lamp._dir[1] = -m4[9];
	      lamp._dir[2] = -m4[10];
	    }
	    dest_buffer.enable(rect);
	    clear_bits = viewport.clear_bits;
	    if (clear_bits & gl.COLOR_BUFFER_BIT) {
	      c = scene.background_color;
	      gl.clearColor(c[0], c[1], c[2], this.background_alpha);
	    }
	    clear_bits && gl.clear(clear_bits);
	    if (scene.bg_pass && scene.bg_pass.length) {
	      ref10 = scene.bg_pass;
	      for (aa = 0, len5 = ref10.length; aa < len5; aa++) {
	        ob = ref10[aa];
	        if (ob.visible === true) {
	          if (this.draw_mesh(ob, ob.world_matrix, 0) === false) {
	            return;
	          }
	        }
	      }
	      gl.clear(gl.DEPTH_BUFFER_BIT);
	    }
	    if (passes.indexOf(0) >= 0) {
	      ref11 = scene.mesh_passes[0];
	      for (ab = 0, len6 = ref11.length; ab < len6; ab++) {
	        ob = ref11[ab];
	        if (ob.visible === true && !ob.bg && !ob.fg) {
	          if (this.draw_mesh(ob, ob.world_matrix, 0) === false) {
	            return;
	          }
	        }
	      }
	    }
	    if (passes.indexOf(1) >= 0 && scene.mesh_passes[1].length) {
	      gl.depthMask(false);
	      gl.enable(gl.BLEND);
	      z = this.camera_z;
	      ref12 = scene.mesh_passes[1];
	      for (ac = 0, len7 = ref12.length; ac < len7; ac++) {
	        ob = ref12[ac];
	        v = ob.parent ? ob.get_world_position() : ob.position;
	        x = v[0];
	        if (ob.mirrors === 2) {
	          x = -x;
	        }
	        ob._sqdist = -(x * z[0] + v[1] * z[1] + v[2] * z[2]) - (ob.zindex * (ob.dimensions[0] + ob.dimensions[1] + ob.dimensions[2]) * 0.166666);
	      }
	      timsort_sqdist(scene.mesh_passes[1]);
	    }
	    ref13 = scene.mesh_passes[1];
	    for (ad = 0, len8 = ref13.length; ad < len8; ad++) {
	      ob = ref13[ad];
	      if (ob.visible === true) {
	        if (this.draw_mesh(ob, ob.world_matrix, 1) === false) {
	          return;
	        }
	      }
	    }
	    if (scene.mesh_passes[1].length) {
	      gl.disable(gl.BLEND);
	      gl.depthMask(true);
	    }
	    if (scene.fg_pass && scene.fg_pass.length) {
	      gl.clear(gl.DEPTH_BUFFER_BIT);
	      ref14 = scene.fg_pass;
	      for (ae = 0, len9 = ref14.length; ae < len9; ae++) {
	        ob = ref14[ae];
	        if (ob.visible === true) {
	          if (this.draw_mesh(ob, ob.world_matrix, 0) === false) {
	            return;
	          }
	        }
	      }
	    }
	    if (passes.indexOf(2) >= 0) {
	      ref15 = scene.mesh_passes[2];
	      for (af = 0, len10 = ref15.length; af < len10; af++) {
	        ob = ref15[af];
	        if (ob.visible === true) {
	          this.draw_mesh(ob, ob.world_matrix, 2);
	        }
	      }
	    }
	    if (scene.debug_physics) {
	      ref16 = scene.children;
	      for (ag = 0, len11 = ref16.length; ag < len11; ag++) {
	        ob = ref16[ag];
	        dob = ob.phy_debug_mesh;
	        if (dob) {
	          if (dob !== ob) {
	            posrot = ob.get_world_pos_rot();
	            dob.position = posrot[0];
	            dob.rotation = posrot[1];
	            dob.scale = ob.phy_he;
	            dob._update_matrices();
	          }
	          dob.color = vec4.clone([1, 1, 1, 0.2]);
	          gl.enable(gl.BLEND);
	          gl.disable(gl.DEPTH_TEST);
	          this.draw_mesh(dob, dob.world_matrix);
	          gl.disable(gl.BLEND);
	          gl.enable(gl.DEPTH_TEST);
	          dob.color = vec4.clone([1, 1, 1, 1]);
	          this.draw_mesh(dob, dob.world_matrix);
	        }
	      }
	      gl.disable(gl.DEPTH_TEST);
	      ref17 = this.debug.vectors;
	      for (ah = 0, len12 = ref17.length; ah < len12; ah++) {
	        dvec = ref17[ah];
	        dob = this.debug.arrow;
	        dob.color = vec4.clone(dvec[2]);
	        dob.position = dvec[1];
	        v3 = dvec[0];
	        v2 = vec3.cross([0, 0, 0], cam.position, v3);
	        v1 = vec3.normalize([0, 0, 0], vec3.cross([0, 0, 0], v2, v3));
	        v2 = vec3.normalize([0, 0, 0], vec3.cross(v2, v3, v1));
	        s = vec3.len(v3);
	        vec3.scale(v2, v2, s);
	        vec3.scale(v1, v1, s);
	        ma = [v1[0], v1[1], v1[2], 0, v2[0], v2[1], v2[2], 0, v3[0], v3[1], v3[2], 0, dob.position[0], dob.position[1], dob.position[2], 1];
	        this.draw_mesh(dob, ma);
	      }
	      return gl.enable(gl.DEPTH_TEST);
	    }
	  };
	
	  RenderManager.prototype.type_debug = function() {
	    var gl, j, len, len1, o, p, ref3, ref4;
	    gl = this.gl;
	    ref3 = ['uniform1fv', 'uniform2fv', 'uniform3fv', 'uniform4fv'];
	    for (j = 0, len = ref3.length; j < len; j++) {
	      p = ref3[j];
	      gl['_' + p] = gl[p];
	      gl[p] = function(l, v) {
	        if (v.byteLength == null) {
	          throw "wrong type";
	        }
	        return gl["_" + p](l, v);
	      };
	    }
	    ref4 = ['uniformMatrix3fv', 'uniformMatrix4fv'];
	    for (o = 0, len1 = ref4.length; o < len1; o++) {
	      p = ref4[o];
	      gl['_' + p] = gl[p];
	      gl[p] = function(l, t, v) {
	        if (v.byteLength != null) {
	          throw "wrong type";
	        }
	        return gl["_" + p](l, t, v);
	      };
	    }
	  };
	
	  RenderManager.prototype.polycount_debug = function(ratio) {
	    var inv_ratio, j, len, len1, len2, len3, n, o, ob, q, ref3, ref4, ref5, ref6, removed_polys, total_polys, u;
	    if (ratio == null) {
	      ratio = 1;
	    }
	    total_polys = 0;
	    ref3 = scene.children;
	    for (j = 0, len = ref3.length; j < len; j++) {
	      ob = ref3[j];
	      if (ob.type === 'MESH' && ob.visible && ob.data) {
	        ref4 = ob.data.num_indices;
	        for (o = 0, len1 = ref4.length; o < len1; o++) {
	          n = ref4[o];
	          total_polys += n;
	        }
	      }
	    }
	    inv_ratio = 1 - ratio;
	    removed_polys = 0;
	    this.removed_meshes = [];
	    ref5 = scene.children;
	    for (q = 0, len2 = ref5.length; q < len2; q++) {
	      ob = ref5[q];
	      if (removed_polys / total_polys > inv_ratio) {
	        return;
	      }
	      if (ob.type === 'MESH' && ob.visible && ob.data) {
	        ref6 = ob.data.num_indices;
	        for (u = 0, len3 = ref6.length; u < len3; u++) {
	          n = ref6[u];
	          removed_polys += n;
	        }
	        ob.visible = false;
	        scene.mesh_passes[0].remove(ob);
	        scene.mesh_passes[1].remove(ob);
	        this.removed_meshes.push(ob);
	      }
	    }
	  };
	
	  RenderManager.prototype.restore_polycount_debug = function() {
	    var added_passes, j, len, len1, o, ob, pa, ref3, ref4;
	    ref3 = this.removed_meshes;
	    for (j = 0, len = ref3.length; j < len; j++) {
	      ob = ref3[j];
	      added_passes = [];
	      ref4 = ob.passes;
	      for (o = 0, len1 = ref4.length; o < len1; o++) {
	        pa = ref4[o];
	        if (!added_passes[pa] && pa < 5) {
	          scene.mesh_passes[pa].push(ob);
	          added_passes[pa] = true;
	        }
	      }
	      ob.visible = true;
	    }
	  };
	
	  return RenderManager;
	
	})();
	
	plain_vs = "precision highp float;\nprecision highp int;\nuniform mat4 model_view_matrix;\nuniform mat4 projection_matrix;\nattribute vec3 vertex;\nvoid main()\n{\n    vec4 pos = projection_matrix * model_view_matrix * vec4(vertex, 1.0);\n    pos.z -= 0.0005;\n    gl_Position = pos;\n}";
	
	plain_fs = "precision mediump float;uniform vec4 color;void main(){gl_FragColor = color;}";
	
	Debug = (function() {
	  function Debug(context1) {
	    var a, arrow, bone, box, cos, cylinder, d, i, idx, j, len, mat, o, ob, q, ref3, sin, sphere, u, w;
	    this.context = context1;
	    this.vectors = [];
	    if (!this.context.MYOU_PARAMS.debug) {
	      return;
	    }
	    sin = Math.sin;
	    cos = Math.cos;
	    box = new Mesh(this.context);
	    d = [1, 1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1];
	    box.load_from_lists(d, [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
	    cylinder = new Mesh(this.context);
	    d = [];
	    idx = [];
	    a = (3.1416 * 2) / 16;
	    for (i = j = 0; j < 16; i = ++j) {
	      d = d.concat([sin(a * i), cos(a * i), 1]);
	      d = d.concat([sin(a * i), cos(a * i), -1]);
	      idx = idx.concat([i * 2, (i * 2 + 2) % 32, i * 2 + 1, (i * 2 + 3) % 32]);
	      if (i % 2 === 0) {
	        idx = idx.concat([i * 2, i * 2 + 1]);
	      }
	    }
	    cylinder.load_from_lists(d, idx);
	    sphere = new Mesh(this.context);
	    d = [];
	    idx = [];
	    for (i = o = 0; o < 16; i = ++o) {
	      d = d.concat(sin(a * i), cos(a * i), 0);
	      idx = idx.concat(i, (i + 1) % 16);
	    }
	    for (i = q = 0; q < 16; i = ++q) {
	      d = d.concat(0, sin(a * i), cos(a * i));
	      idx = idx.concat(i + 16, (i + 1) % 16 + 16);
	    }
	    for (i = u = 0; u < 16; i = ++u) {
	      d = d.concat(sin(a * i), 0, cos(a * i));
	      idx = idx.concat(i + 32, (i + 1) % 16 + 32);
	    }
	    sphere.load_from_lists(d, idx);
	    mat = new Material(this.context, '_debug', plain_fs, [
	      {
	        'type': 5,
	        'varname': 'color'
	      }
	    ], [], plain_vs);
	    arrow = new Mesh(this.context);
	    d = [0, 0, 0, 0, 0, 1, 0, 0.07, 0.7, 0, -0.07, 0.7];
	    arrow.load_from_lists(d, [0, 1, 1, 2, 1, 3]);
	    bone = new Mesh(this.context);
	    d = [0, 0, 0, -0.1, 0.1, -0.1, 0.1, 0.1, -0.1, 0.1, 0.1, 0.1, -0.1, 0.1, 0.1, 0, 1, 0, 1];
	    bone.load_from_lists(d, [0, 1, 0, 2, 0, 3, 0, 4, 1, 2, 2, 3, 3, 4, 4, 1, 5, 1, 5, 2, 5, 3, 5, 4]);
	    this.material = mat = new Material(this.context, '_debug', plain_fs, [
	      {
	        'type': 5,
	        'varname': 'color'
	      }
	    ], [], plain_vs);
	    ref3 = [box, cylinder, sphere, arrow, bone];
	    for (w = 0, len = ref3.length; w < len; w++) {
	      ob = ref3[w];
	      ob.elements = [];
	      ob.stride = 4;
	      ob.configure_materials([mat]);
	      ob.color = vec4.create(1, 1, 1, 1);
	      ob.data.draw_method = this.context.render_manager.gl.LINES;
	      ob.scale = [1, 1, 1];
	      ob._update_matrices();
	    }
	    this.box = box;
	    this.cylinder = cylinder;
	    this.sphere = sphere;
	    this.arrow = arrow;
	    this.bone = bone;
	    this.vectors = [];
	  }
	
	  Debug.prototype.debug_mesh_from_va_ia = function(va, ia) {
	    var mesh;
	    return;
	    mesh = new Mesh(this.context);
	    mesh.stride = 3 * 4;
	    mesh.offsets = [0, 0, va.length, ia.length];
	    mesh.load_from_va_ia(va, ia);
	    mesh.elements = [];
	    mesh.configure_materials([this.material]);
	    mesh.color = vec4.create(1, 1, 1, 1);
	    mesh.data.draw_method = render_manager.gl.LINES;
	    mesh.scale = [1, 1, 1];
	    mesh._update_matrices();
	    return mesh;
	  };
	
	  return Debug;
	
	})();
	
	module.exports = {
	  RenderManager: RenderManager,
	  MIRROR_MASK_X: MIRROR_MASK_X,
	  MIRROR_MASK_Y: MIRROR_MASK_Y,
	  MIRROR_MASK_Z: MIRROR_MASK_Z,
	  VECTOR_MINUS_Z: VECTOR_MINUS_Z
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview gl-matrix - High performance matrix and vector operations
	 * @author Brandon Jones
	 * @author Colin MacKenzie IV
	 * @version 2.3.0
	 */
	
	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	// END HEADER
	
	exports.glMatrix = __webpack_require__(9);
	exports.mat2 = __webpack_require__(10);
	exports.mat2d = __webpack_require__(11);
	exports.mat3 = __webpack_require__(12);
	exports.mat4 = __webpack_require__(13);
	exports.quat = __webpack_require__(14);
	exports.vec2 = __webpack_require__(17);
	exports.vec3 = __webpack_require__(15);
	exports.vec4 = __webpack_require__(16);

/***/ },
/* 9 */
/***/ function(module, exports) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	/**
	 * @class Common utilities
	 * @name glMatrix
	 */
	var glMatrix = {};
	
	// Constants
	glMatrix.EPSILON = 0.000001;
	glMatrix.ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
	glMatrix.RANDOM = Math.random;
	
	/**
	 * Sets the type of array used when creating new vectors and matrices
	 *
	 * @param {Type} type Array type, such as Float32Array or Array
	 */
	glMatrix.setMatrixArrayType = function(type) {
	    GLMAT_ARRAY_TYPE = type;
	}
	
	var degree = Math.PI / 180;
	
	/**
	* Convert Degree To Radian
	*
	* @param {Number} Angle in Degrees
	*/
	glMatrix.toRadian = function(a){
	     return a * degree;
	}
	
	module.exports = glMatrix;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	var glMatrix = __webpack_require__(9);
	
	/**
	 * @class 2x2 Matrix
	 * @name mat2
	 */
	var mat2 = {};
	
	/**
	 * Creates a new identity mat2
	 *
	 * @returns {mat2} a new 2x2 matrix
	 */
	mat2.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Creates a new mat2 initialized with values from an existing matrix
	 *
	 * @param {mat2} a matrix to clone
	 * @returns {mat2} a new 2x2 matrix
	 */
	mat2.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Copy the values from one mat2 to another
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Set a mat2 to the identity matrix
	 *
	 * @param {mat2} out the receiving matrix
	 * @returns {mat2} out
	 */
	mat2.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a1 = a[1];
	        out[1] = a[2];
	        out[2] = a1;
	    } else {
	        out[0] = a[0];
	        out[1] = a[2];
	        out[2] = a[1];
	        out[3] = a[3];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.invert = function(out, a) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	
	        // Calculate the determinant
	        det = a0 * a3 - a2 * a1;
	
	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    
	    out[0] =  a3 * det;
	    out[1] = -a1 * det;
	    out[2] = -a2 * det;
	    out[3] =  a0 * det;
	
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.adjoint = function(out, a) {
	    // Caching this value is nessecary if out == a
	    var a0 = a[0];
	    out[0] =  a[3];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] =  a0;
	
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat2
	 *
	 * @param {mat2} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat2.determinant = function (a) {
	    return a[0] * a[3] - a[2] * a[1];
	};
	
	/**
	 * Multiplies two mat2's
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the first operand
	 * @param {mat2} b the second operand
	 * @returns {mat2} out
	 */
	mat2.multiply = function (out, a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = a0 * b0 + a2 * b1;
	    out[1] = a1 * b0 + a3 * b1;
	    out[2] = a0 * b2 + a2 * b3;
	    out[3] = a1 * b2 + a3 * b3;
	    return out;
	};
	
	/**
	 * Alias for {@link mat2.multiply}
	 * @function
	 */
	mat2.mul = mat2.multiply;
	
	/**
	 * Rotates a mat2 by the given angle
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2} out
	 */
	mat2.rotate = function (out, a, rad) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = a0 *  c + a2 * s;
	    out[1] = a1 *  c + a3 * s;
	    out[2] = a0 * -s + a2 * c;
	    out[3] = a1 * -s + a3 * c;
	    return out;
	};
	
	/**
	 * Scales the mat2 by the dimensions in the given vec2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat2} out
	 **/
	mat2.scale = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v0;
	    out[2] = a2 * v1;
	    out[3] = a3 * v1;
	    return out;
	};
	
	/**
	 * Creates a matrix from a given angle
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2.identity(dest);
	 *     mat2.rotate(dest, dest, rad);
	 *
	 * @param {mat2} out mat2 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2} out
	 */
	mat2.fromRotation = function(out, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = c;
	    out[1] = s;
	    out[2] = -s;
	    out[3] = c;
	    return out;
	}
	
	/**
	 * Creates a matrix from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2.identity(dest);
	 *     mat2.scale(dest, dest, vec);
	 *
	 * @param {mat2} out mat2 receiving operation result
	 * @param {vec2} v Scaling vector
	 * @returns {mat2} out
	 */
	mat2.fromScaling = function(out, v) {
	    out[0] = v[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = v[1];
	    return out;
	}
	
	/**
	 * Returns a string representation of a mat2
	 *
	 * @param {mat2} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat2.str = function (a) {
	    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	/**
	 * Returns Frobenius norm of a mat2
	 *
	 * @param {mat2} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat2.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
	};
	
	/**
	 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
	 * @param {mat2} L the lower triangular matrix 
	 * @param {mat2} D the diagonal matrix 
	 * @param {mat2} U the upper triangular matrix 
	 * @param {mat2} a the input matrix to factorize
	 */
	
	mat2.LDU = function (L, D, U, a) { 
	    L[2] = a[2]/a[0]; 
	    U[0] = a[0]; 
	    U[1] = a[1]; 
	    U[3] = a[3] - L[2] * U[1]; 
	    return [L, D, U];       
	}; 
	
	
	module.exports = mat2;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	var glMatrix = __webpack_require__(9);
	
	/**
	 * @class 2x3 Matrix
	 * @name mat2d
	 * 
	 * @description 
	 * A mat2d contains six elements defined as:
	 * <pre>
	 * [a, c, tx,
	 *  b, d, ty]
	 * </pre>
	 * This is a short form for the 3x3 matrix:
	 * <pre>
	 * [a, c, tx,
	 *  b, d, ty,
	 *  0, 0, 1]
	 * </pre>
	 * The last row is ignored so the array is shorter and operations are faster.
	 */
	var mat2d = {};
	
	/**
	 * Creates a new identity mat2d
	 *
	 * @returns {mat2d} a new 2x3 matrix
	 */
	mat2d.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(6);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	};
	
	/**
	 * Creates a new mat2d initialized with values from an existing matrix
	 *
	 * @param {mat2d} a matrix to clone
	 * @returns {mat2d} a new 2x3 matrix
	 */
	mat2d.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(6);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	};
	
	/**
	 * Copy the values from one mat2d to another
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the source matrix
	 * @returns {mat2d} out
	 */
	mat2d.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	};
	
	/**
	 * Set a mat2d to the identity matrix
	 *
	 * @param {mat2d} out the receiving matrix
	 * @returns {mat2d} out
	 */
	mat2d.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	};
	
	/**
	 * Inverts a mat2d
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the source matrix
	 * @returns {mat2d} out
	 */
	mat2d.invert = function(out, a) {
	    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
	        atx = a[4], aty = a[5];
	
	    var det = aa * ad - ab * ac;
	    if(!det){
	        return null;
	    }
	    det = 1.0 / det;
	
	    out[0] = ad * det;
	    out[1] = -ab * det;
	    out[2] = -ac * det;
	    out[3] = aa * det;
	    out[4] = (ac * aty - ad * atx) * det;
	    out[5] = (ab * atx - aa * aty) * det;
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat2d
	 *
	 * @param {mat2d} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat2d.determinant = function (a) {
	    return a[0] * a[3] - a[1] * a[2];
	};
	
	/**
	 * Multiplies two mat2d's
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the first operand
	 * @param {mat2d} b the second operand
	 * @returns {mat2d} out
	 */
	mat2d.multiply = function (out, a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
	    out[0] = a0 * b0 + a2 * b1;
	    out[1] = a1 * b0 + a3 * b1;
	    out[2] = a0 * b2 + a2 * b3;
	    out[3] = a1 * b2 + a3 * b3;
	    out[4] = a0 * b4 + a2 * b5 + a4;
	    out[5] = a1 * b4 + a3 * b5 + a5;
	    return out;
	};
	
	/**
	 * Alias for {@link mat2d.multiply}
	 * @function
	 */
	mat2d.mul = mat2d.multiply;
	
	/**
	 * Rotates a mat2d by the given angle
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2d} out
	 */
	mat2d.rotate = function (out, a, rad) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = a0 *  c + a2 * s;
	    out[1] = a1 *  c + a3 * s;
	    out[2] = a0 * -s + a2 * c;
	    out[3] = a1 * -s + a3 * c;
	    out[4] = a4;
	    out[5] = a5;
	    return out;
	};
	
	/**
	 * Scales the mat2d by the dimensions in the given vec2
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to translate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat2d} out
	 **/
	mat2d.scale = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v0;
	    out[2] = a2 * v1;
	    out[3] = a3 * v1;
	    out[4] = a4;
	    out[5] = a5;
	    return out;
	};
	
	/**
	 * Translates the mat2d by the dimensions in the given vec2
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to translate
	 * @param {vec2} v the vec2 to translate the matrix by
	 * @returns {mat2d} out
	 **/
	mat2d.translate = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0;
	    out[1] = a1;
	    out[2] = a2;
	    out[3] = a3;
	    out[4] = a0 * v0 + a2 * v1 + a4;
	    out[5] = a1 * v0 + a3 * v1 + a5;
	    return out;
	};
	
	/**
	 * Creates a matrix from a given angle
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2d.identity(dest);
	 *     mat2d.rotate(dest, dest, rad);
	 *
	 * @param {mat2d} out mat2d receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2d} out
	 */
	mat2d.fromRotation = function(out, rad) {
	    var s = Math.sin(rad), c = Math.cos(rad);
	    out[0] = c;
	    out[1] = s;
	    out[2] = -s;
	    out[3] = c;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	}
	
	/**
	 * Creates a matrix from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2d.identity(dest);
	 *     mat2d.scale(dest, dest, vec);
	 *
	 * @param {mat2d} out mat2d receiving operation result
	 * @param {vec2} v Scaling vector
	 * @returns {mat2d} out
	 */
	mat2d.fromScaling = function(out, v) {
	    out[0] = v[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = v[1];
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	}
	
	/**
	 * Creates a matrix from a vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2d.identity(dest);
	 *     mat2d.translate(dest, dest, vec);
	 *
	 * @param {mat2d} out mat2d receiving operation result
	 * @param {vec2} v Translation vector
	 * @returns {mat2d} out
	 */
	mat2d.fromTranslation = function(out, v) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = v[0];
	    out[5] = v[1];
	    return out;
	}
	
	/**
	 * Returns a string representation of a mat2d
	 *
	 * @param {mat2d} a matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat2d.str = function (a) {
	    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
	                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
	};
	
	/**
	 * Returns Frobenius norm of a mat2d
	 *
	 * @param {mat2d} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat2d.frob = function (a) { 
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
	}; 
	
	module.exports = mat2d;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	var glMatrix = __webpack_require__(9);
	
	/**
	 * @class 3x3 Matrix
	 * @name mat3
	 */
	var mat3 = {};
	
	/**
	 * Creates a new identity mat3
	 *
	 * @returns {mat3} a new 3x3 matrix
	 */
	mat3.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(9);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};
	
	/**
	 * Copies the upper-left 3x3 values into the given mat3.
	 *
	 * @param {mat3} out the receiving 3x3 matrix
	 * @param {mat4} a   the source 4x4 matrix
	 * @returns {mat3} out
	 */
	mat3.fromMat4 = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[4];
	    out[4] = a[5];
	    out[5] = a[6];
	    out[6] = a[8];
	    out[7] = a[9];
	    out[8] = a[10];
	    return out;
	};
	
	/**
	 * Creates a new mat3 initialized with values from an existing matrix
	 *
	 * @param {mat3} a matrix to clone
	 * @returns {mat3} a new 3x3 matrix
	 */
	mat3.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(9);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Copy the values from one mat3 to another
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Set a mat3 to the identity matrix
	 *
	 * @param {mat3} out the receiving matrix
	 * @returns {mat3} out
	 */
	mat3.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a01 = a[1], a02 = a[2], a12 = a[5];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a01;
	        out[5] = a[7];
	        out[6] = a02;
	        out[7] = a12;
	    } else {
	        out[0] = a[0];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a[1];
	        out[4] = a[4];
	        out[5] = a[7];
	        out[6] = a[2];
	        out[7] = a[5];
	        out[8] = a[8];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.invert = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        b01 = a22 * a11 - a12 * a21,
	        b11 = -a22 * a10 + a12 * a20,
	        b21 = a21 * a10 - a11 * a20,
	
	        // Calculate the determinant
	        det = a00 * b01 + a01 * b11 + a02 * b21;
	
	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;
	
	    out[0] = b01 * det;
	    out[1] = (-a22 * a01 + a02 * a21) * det;
	    out[2] = (a12 * a01 - a02 * a11) * det;
	    out[3] = b11 * det;
	    out[4] = (a22 * a00 - a02 * a20) * det;
	    out[5] = (-a12 * a00 + a02 * a10) * det;
	    out[6] = b21 * det;
	    out[7] = (-a21 * a00 + a01 * a20) * det;
	    out[8] = (a11 * a00 - a01 * a10) * det;
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.adjoint = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8];
	
	    out[0] = (a11 * a22 - a12 * a21);
	    out[1] = (a02 * a21 - a01 * a22);
	    out[2] = (a01 * a12 - a02 * a11);
	    out[3] = (a12 * a20 - a10 * a22);
	    out[4] = (a00 * a22 - a02 * a20);
	    out[5] = (a02 * a10 - a00 * a12);
	    out[6] = (a10 * a21 - a11 * a20);
	    out[7] = (a01 * a20 - a00 * a21);
	    out[8] = (a00 * a11 - a01 * a10);
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat3
	 *
	 * @param {mat3} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat3.determinant = function (a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8];
	
	    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
	};
	
	/**
	 * Multiplies two mat3's
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the first operand
	 * @param {mat3} b the second operand
	 * @returns {mat3} out
	 */
	mat3.multiply = function (out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        b00 = b[0], b01 = b[1], b02 = b[2],
	        b10 = b[3], b11 = b[4], b12 = b[5],
	        b20 = b[6], b21 = b[7], b22 = b[8];
	
	    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
	    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
	    out[2] = b00 * a02 + b01 * a12 + b02 * a22;
	
	    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
	    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
	    out[5] = b10 * a02 + b11 * a12 + b12 * a22;
	
	    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
	    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
	    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
	    return out;
	};
	
	/**
	 * Alias for {@link mat3.multiply}
	 * @function
	 */
	mat3.mul = mat3.multiply;
	
	/**
	 * Translate a mat3 by the given vector
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to translate
	 * @param {vec2} v vector to translate by
	 * @returns {mat3} out
	 */
	mat3.translate = function(out, a, v) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	        x = v[0], y = v[1];
	
	    out[0] = a00;
	    out[1] = a01;
	    out[2] = a02;
	
	    out[3] = a10;
	    out[4] = a11;
	    out[5] = a12;
	
	    out[6] = x * a00 + y * a10 + a20;
	    out[7] = x * a01 + y * a11 + a21;
	    out[8] = x * a02 + y * a12 + a22;
	    return out;
	};
	
	/**
	 * Rotates a mat3 by the given angle
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat3} out
	 */
	mat3.rotate = function (out, a, rad) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	
	    out[0] = c * a00 + s * a10;
	    out[1] = c * a01 + s * a11;
	    out[2] = c * a02 + s * a12;
	
	    out[3] = c * a10 - s * a00;
	    out[4] = c * a11 - s * a01;
	    out[5] = c * a12 - s * a02;
	
	    out[6] = a20;
	    out[7] = a21;
	    out[8] = a22;
	    return out;
	};
	
	/**
	 * Scales the mat3 by the dimensions in the given vec2
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat3} out
	 **/
	mat3.scale = function(out, a, v) {
	    var x = v[0], y = v[1];
	
	    out[0] = x * a[0];
	    out[1] = x * a[1];
	    out[2] = x * a[2];
	
	    out[3] = y * a[3];
	    out[4] = y * a[4];
	    out[5] = y * a[5];
	
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Creates a matrix from a vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.translate(dest, dest, vec);
	 *
	 * @param {mat3} out mat3 receiving operation result
	 * @param {vec2} v Translation vector
	 * @returns {mat3} out
	 */
	mat3.fromTranslation = function(out, v) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = v[0];
	    out[7] = v[1];
	    out[8] = 1;
	    return out;
	}
	
	/**
	 * Creates a matrix from a given angle
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.rotate(dest, dest, rad);
	 *
	 * @param {mat3} out mat3 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat3} out
	 */
	mat3.fromRotation = function(out, rad) {
	    var s = Math.sin(rad), c = Math.cos(rad);
	
	    out[0] = c;
	    out[1] = s;
	    out[2] = 0;
	
	    out[3] = -s;
	    out[4] = c;
	    out[5] = 0;
	
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	}
	
	/**
	 * Creates a matrix from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.scale(dest, dest, vec);
	 *
	 * @param {mat3} out mat3 receiving operation result
	 * @param {vec2} v Scaling vector
	 * @returns {mat3} out
	 */
	mat3.fromScaling = function(out, v) {
	    out[0] = v[0];
	    out[1] = 0;
	    out[2] = 0;
	
	    out[3] = 0;
	    out[4] = v[1];
	    out[5] = 0;
	
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	}
	
	/**
	 * Copies the values from a mat2d into a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat2d} a the matrix to copy
	 * @returns {mat3} out
	 **/
	mat3.fromMat2d = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = 0;
	
	    out[3] = a[2];
	    out[4] = a[3];
	    out[5] = 0;
	
	    out[6] = a[4];
	    out[7] = a[5];
	    out[8] = 1;
	    return out;
	};
	
	/**
	* Calculates a 3x3 matrix from the given quaternion
	*
	* @param {mat3} out mat3 receiving operation result
	* @param {quat} q Quaternion to create matrix from
	*
	* @returns {mat3} out
	*/
	mat3.fromQuat = function (out, q) {
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        yx = y * x2,
	        yy = y * y2,
	        zx = z * x2,
	        zy = z * y2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - yy - zz;
	    out[3] = yx - wz;
	    out[6] = zx + wy;
	
	    out[1] = yx + wz;
	    out[4] = 1 - xx - zz;
	    out[7] = zy - wx;
	
	    out[2] = zx - wy;
	    out[5] = zy + wx;
	    out[8] = 1 - xx - yy;
	
	    return out;
	};
	
	/**
	* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
	*
	* @param {mat3} out mat3 receiving operation result
	* @param {mat4} a Mat4 to derive the normal matrix from
	*
	* @returns {mat3} out
	*/
	mat3.normalFromMat4 = function (out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
	
	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,
	
	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	
	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;
	
	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	
	    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	
	    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat3
	 *
	 * @param {mat3} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat3.str = function (a) {
	    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
	                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
	                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
	};
	
	/**
	 * Returns Frobenius norm of a mat3
	 *
	 * @param {mat3} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat3.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
	};
	
	
	module.exports = mat3;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	var glMatrix = __webpack_require__(9);
	
	/**
	 * @class 4x4 Matrix
	 * @name mat4
	 */
	var mat4 = {};
	
	/**
	 * Creates a new identity mat4
	 *
	 * @returns {mat4} a new 4x4 matrix
	 */
	mat4.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(16);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Creates a new mat4 initialized with values from an existing matrix
	 *
	 * @param {mat4} a matrix to clone
	 * @returns {mat4} a new 4x4 matrix
	 */
	mat4.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(16);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Copy the values from one mat4 to another
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Set a mat4 to the identity matrix
	 *
	 * @param {mat4} out the receiving matrix
	 * @returns {mat4} out
	 */
	mat4.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a01 = a[1], a02 = a[2], a03 = a[3],
	            a12 = a[6], a13 = a[7],
	            a23 = a[11];
	
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a01;
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a02;
	        out[9] = a12;
	        out[11] = a[14];
	        out[12] = a03;
	        out[13] = a13;
	        out[14] = a23;
	    } else {
	        out[0] = a[0];
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a[1];
	        out[5] = a[5];
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a[2];
	        out[9] = a[6];
	        out[10] = a[10];
	        out[11] = a[14];
	        out[12] = a[3];
	        out[13] = a[7];
	        out[14] = a[11];
	        out[15] = a[15];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.invert = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
	
	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,
	
	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	
	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;
	
	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
	
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.adjoint = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	
	    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
	    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
	    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
	    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
	    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
	    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
	    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
	    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
	    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
	    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
	    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
	    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
	    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
	    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
	    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
	    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat4
	 *
	 * @param {mat4} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat4.determinant = function (a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
	
	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32;
	
	    // Calculate the determinant
	    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	};
	
	/**
	 * Multiplies two mat4's
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @returns {mat4} out
	 */
	mat4.multiply = function (out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	
	    // Cache only the current line of the second matrix
	    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
	    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	    return out;
	};
	
	/**
	 * Alias for {@link mat4.multiply}
	 * @function
	 */
	mat4.mul = mat4.multiply;
	
	/**
	 * Translate a mat4 by the given vector
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to translate
	 * @param {vec3} v vector to translate by
	 * @returns {mat4} out
	 */
	mat4.translate = function (out, a, v) {
	    var x = v[0], y = v[1], z = v[2],
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23;
	
	    if (a === out) {
	        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	    } else {
	        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
	
	        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
	        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
	        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
	
	        out[12] = a00 * x + a10 * y + a20 * z + a[12];
	        out[13] = a01 * x + a11 * y + a21 * z + a[13];
	        out[14] = a02 * x + a12 * y + a22 * z + a[14];
	        out[15] = a03 * x + a13 * y + a23 * z + a[15];
	    }
	
	    return out;
	};
	
	/**
	 * Scales the mat4 by the dimensions in the given vec3
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to scale
	 * @param {vec3} v the vec3 to scale the matrix by
	 * @returns {mat4} out
	 **/
	mat4.scale = function(out, a, v) {
	    var x = v[0], y = v[1], z = v[2];
	
	    out[0] = a[0] * x;
	    out[1] = a[1] * x;
	    out[2] = a[2] * x;
	    out[3] = a[3] * x;
	    out[4] = a[4] * y;
	    out[5] = a[5] * y;
	    out[6] = a[6] * y;
	    out[7] = a[7] * y;
	    out[8] = a[8] * z;
	    out[9] = a[9] * z;
	    out[10] = a[10] * z;
	    out[11] = a[11] * z;
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Rotates a mat4 by the given angle around the given axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @param {vec3} axis the axis to rotate around
	 * @returns {mat4} out
	 */
	mat4.rotate = function (out, a, rad, axis) {
	    var x = axis[0], y = axis[1], z = axis[2],
	        len = Math.sqrt(x * x + y * y + z * z),
	        s, c, t,
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23,
	        b00, b01, b02,
	        b10, b11, b12,
	        b20, b21, b22;
	
	    if (Math.abs(len) < glMatrix.EPSILON) { return null; }
	    
	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;
	
	    s = Math.sin(rad);
	    c = Math.cos(rad);
	    t = 1 - c;
	
	    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
	
	    // Construct the elements of the rotation matrix
	    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
	    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
	    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
	
	    // Perform rotation-specific matrix multiplication
	    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
	    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
	    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
	    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
	    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
	    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
	    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
	    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
	    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
	    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
	    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
	    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the X axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateX = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[0]  = a[0];
	        out[1]  = a[1];
	        out[2]  = a[2];
	        out[3]  = a[3];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[4] = a10 * c + a20 * s;
	    out[5] = a11 * c + a21 * s;
	    out[6] = a12 * c + a22 * s;
	    out[7] = a13 * c + a23 * s;
	    out[8] = a20 * c - a10 * s;
	    out[9] = a21 * c - a11 * s;
	    out[10] = a22 * c - a12 * s;
	    out[11] = a23 * c - a13 * s;
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the Y axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateY = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[4]  = a[4];
	        out[5]  = a[5];
	        out[6]  = a[6];
	        out[7]  = a[7];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c - a20 * s;
	    out[1] = a01 * c - a21 * s;
	    out[2] = a02 * c - a22 * s;
	    out[3] = a03 * c - a23 * s;
	    out[8] = a00 * s + a20 * c;
	    out[9] = a01 * s + a21 * c;
	    out[10] = a02 * s + a22 * c;
	    out[11] = a03 * s + a23 * c;
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the Z axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateZ = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[8]  = a[8];
	        out[9]  = a[9];
	        out[10] = a[10];
	        out[11] = a[11];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c + a10 * s;
	    out[1] = a01 * c + a11 * s;
	    out[2] = a02 * c + a12 * s;
	    out[3] = a03 * c + a13 * s;
	    out[4] = a10 * c - a00 * s;
	    out[5] = a11 * c - a01 * s;
	    out[6] = a12 * c - a02 * s;
	    out[7] = a13 * c - a03 * s;
	    return out;
	};
	
	/**
	 * Creates a matrix from a vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, dest, vec);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {vec3} v Translation vector
	 * @returns {mat4} out
	 */
	mat4.fromTranslation = function(out, v) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;
	    return out;
	}
	
	/**
	 * Creates a matrix from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.scale(dest, dest, vec);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {vec3} v Scaling vector
	 * @returns {mat4} out
	 */
	mat4.fromScaling = function(out, v) {
	    out[0] = v[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = v[1];
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = v[2];
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	
	/**
	 * Creates a matrix from a given angle around a given axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotate(dest, dest, rad, axis);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @param {vec3} axis the axis to rotate around
	 * @returns {mat4} out
	 */
	mat4.fromRotation = function(out, rad, axis) {
	    var x = axis[0], y = axis[1], z = axis[2],
	        len = Math.sqrt(x * x + y * y + z * z),
	        s, c, t;
	    
	    if (Math.abs(len) < glMatrix.EPSILON) { return null; }
	    
	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;
	    
	    s = Math.sin(rad);
	    c = Math.cos(rad);
	    t = 1 - c;
	    
	    // Perform rotation-specific matrix multiplication
	    out[0] = x * x * t + c;
	    out[1] = y * x * t + z * s;
	    out[2] = z * x * t - y * s;
	    out[3] = 0;
	    out[4] = x * y * t - z * s;
	    out[5] = y * y * t + c;
	    out[6] = z * y * t + x * s;
	    out[7] = 0;
	    out[8] = x * z * t + y * s;
	    out[9] = y * z * t - x * s;
	    out[10] = z * z * t + c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	
	/**
	 * Creates a matrix from the given angle around the X axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateX(dest, dest, rad);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.fromXRotation = function(out, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad);
	    
	    // Perform axis-specific matrix multiplication
	    out[0]  = 1;
	    out[1]  = 0;
	    out[2]  = 0;
	    out[3]  = 0;
	    out[4] = 0;
	    out[5] = c;
	    out[6] = s;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = -s;
	    out[10] = c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	
	/**
	 * Creates a matrix from the given angle around the Y axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateY(dest, dest, rad);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.fromYRotation = function(out, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad);
	    
	    // Perform axis-specific matrix multiplication
	    out[0]  = c;
	    out[1]  = 0;
	    out[2]  = -s;
	    out[3]  = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = s;
	    out[9] = 0;
	    out[10] = c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	
	/**
	 * Creates a matrix from the given angle around the Z axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateZ(dest, dest, rad);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.fromZRotation = function(out, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad);
	    
	    // Perform axis-specific matrix multiplication
	    out[0]  = c;
	    out[1]  = s;
	    out[2]  = 0;
	    out[3]  = 0;
	    out[4] = -s;
	    out[5] = c;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	
	/**
	 * Creates a matrix from a quaternion rotation and vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, vec);
	 *     var quatMat = mat4.create();
	 *     quat4.toMat4(quat, quatMat);
	 *     mat4.multiply(dest, quatMat);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat4} q Rotation quaternion
	 * @param {vec3} v Translation vector
	 * @returns {mat4} out
	 */
	mat4.fromRotationTranslation = function (out, q, v) {
	    // Quaternion math
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        xy = x * y2,
	        xz = x * z2,
	        yy = y * y2,
	        yz = y * z2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - (yy + zz);
	    out[1] = xy + wz;
	    out[2] = xz - wy;
	    out[3] = 0;
	    out[4] = xy - wz;
	    out[5] = 1 - (xx + zz);
	    out[6] = yz + wx;
	    out[7] = 0;
	    out[8] = xz + wy;
	    out[9] = yz - wx;
	    out[10] = 1 - (xx + yy);
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;
	    
	    return out;
	};
	
	/**
	 * Creates a matrix from a quaternion rotation, vector translation and vector scale
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, vec);
	 *     var quatMat = mat4.create();
	 *     quat4.toMat4(quat, quatMat);
	 *     mat4.multiply(dest, quatMat);
	 *     mat4.scale(dest, scale)
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat4} q Rotation quaternion
	 * @param {vec3} v Translation vector
	 * @param {vec3} s Scaling vector
	 * @returns {mat4} out
	 */
	mat4.fromRotationTranslationScale = function (out, q, v, s) {
	    // Quaternion math
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        xy = x * y2,
	        xz = x * z2,
	        yy = y * y2,
	        yz = y * z2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2,
	        sx = s[0],
	        sy = s[1],
	        sz = s[2];
	
	    out[0] = (1 - (yy + zz)) * sx;
	    out[1] = (xy + wz) * sx;
	    out[2] = (xz - wy) * sx;
	    out[3] = 0;
	    out[4] = (xy - wz) * sy;
	    out[5] = (1 - (xx + zz)) * sy;
	    out[6] = (yz + wx) * sy;
	    out[7] = 0;
	    out[8] = (xz + wy) * sz;
	    out[9] = (yz - wx) * sz;
	    out[10] = (1 - (xx + yy)) * sz;
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;
	    
	    return out;
	};
	
	/**
	 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, vec);
	 *     mat4.translate(dest, origin);
	 *     var quatMat = mat4.create();
	 *     quat4.toMat4(quat, quatMat);
	 *     mat4.multiply(dest, quatMat);
	 *     mat4.scale(dest, scale)
	 *     mat4.translate(dest, negativeOrigin);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat4} q Rotation quaternion
	 * @param {vec3} v Translation vector
	 * @param {vec3} s Scaling vector
	 * @param {vec3} o The origin vector around which to scale and rotate
	 * @returns {mat4} out
	 */
	mat4.fromRotationTranslationScaleOrigin = function (out, q, v, s, o) {
	  // Quaternion math
	  var x = q[0], y = q[1], z = q[2], w = q[3],
	      x2 = x + x,
	      y2 = y + y,
	      z2 = z + z,
	
	      xx = x * x2,
	      xy = x * y2,
	      xz = x * z2,
	      yy = y * y2,
	      yz = y * z2,
	      zz = z * z2,
	      wx = w * x2,
	      wy = w * y2,
	      wz = w * z2,
	      
	      sx = s[0],
	      sy = s[1],
	      sz = s[2],
	
	      ox = o[0],
	      oy = o[1],
	      oz = o[2];
	      
	  out[0] = (1 - (yy + zz)) * sx;
	  out[1] = (xy + wz) * sx;
	  out[2] = (xz - wy) * sx;
	  out[3] = 0;
	  out[4] = (xy - wz) * sy;
	  out[5] = (1 - (xx + zz)) * sy;
	  out[6] = (yz + wx) * sy;
	  out[7] = 0;
	  out[8] = (xz + wy) * sz;
	  out[9] = (yz - wx) * sz;
	  out[10] = (1 - (xx + yy)) * sz;
	  out[11] = 0;
	  out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
	  out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
	  out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
	  out[15] = 1;
	        
	  return out;
	};
	
	mat4.fromQuat = function (out, q) {
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        yx = y * x2,
	        yy = y * y2,
	        zx = z * x2,
	        zy = z * y2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - yy - zz;
	    out[1] = yx + wz;
	    out[2] = zx - wy;
	    out[3] = 0;
	
	    out[4] = yx - wz;
	    out[5] = 1 - xx - zz;
	    out[6] = zy + wx;
	    out[7] = 0;
	
	    out[8] = zx + wy;
	    out[9] = zy - wx;
	    out[10] = 1 - xx - yy;
	    out[11] = 0;
	
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	
	    return out;
	};
	
	/**
	 * Generates a frustum matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {Number} left Left bound of the frustum
	 * @param {Number} right Right bound of the frustum
	 * @param {Number} bottom Bottom bound of the frustum
	 * @param {Number} top Top bound of the frustum
	 * @param {Number} near Near bound of the frustum
	 * @param {Number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.frustum = function (out, left, right, bottom, top, near, far) {
	    var rl = 1 / (right - left),
	        tb = 1 / (top - bottom),
	        nf = 1 / (near - far);
	    out[0] = (near * 2) * rl;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = (near * 2) * tb;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = (right + left) * rl;
	    out[9] = (top + bottom) * tb;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (far * near * 2) * nf;
	    out[15] = 0;
	    return out;
	};
	
	/**
	 * Generates a perspective projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} fovy Vertical field of view in radians
	 * @param {number} aspect Aspect ratio. typically viewport width/height
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.perspective = function (out, fovy, aspect, near, far) {
	    var f = 1.0 / Math.tan(fovy / 2),
	        nf = 1 / (near - far);
	    out[0] = f / aspect;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = f;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (2 * far * near) * nf;
	    out[15] = 0;
	    return out;
	};
	
	/**
	 * Generates a perspective projection matrix with the given field of view.
	 * This is primarily useful for generating projection matrices to be used
	 * with the still experiemental WebVR API.
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.perspectiveFromFieldOfView = function (out, fov, near, far) {
	    var upTan = Math.tan(fov.upDegrees * Math.PI/180.0),
	        downTan = Math.tan(fov.downDegrees * Math.PI/180.0),
	        leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0),
	        rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0),
	        xScale = 2.0 / (leftTan + rightTan),
	        yScale = 2.0 / (upTan + downTan);
	
	    out[0] = xScale;
	    out[1] = 0.0;
	    out[2] = 0.0;
	    out[3] = 0.0;
	    out[4] = 0.0;
	    out[5] = yScale;
	    out[6] = 0.0;
	    out[7] = 0.0;
	    out[8] = -((leftTan - rightTan) * xScale * 0.5);
	    out[9] = ((upTan - downTan) * yScale * 0.5);
	    out[10] = far / (near - far);
	    out[11] = -1.0;
	    out[12] = 0.0;
	    out[13] = 0.0;
	    out[14] = (far * near) / (near - far);
	    out[15] = 0.0;
	    return out;
	}
	
	/**
	 * Generates a orthogonal projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} left Left bound of the frustum
	 * @param {number} right Right bound of the frustum
	 * @param {number} bottom Bottom bound of the frustum
	 * @param {number} top Top bound of the frustum
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.ortho = function (out, left, right, bottom, top, near, far) {
	    var lr = 1 / (left - right),
	        bt = 1 / (bottom - top),
	        nf = 1 / (near - far);
	    out[0] = -2 * lr;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = -2 * bt;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 2 * nf;
	    out[11] = 0;
	    out[12] = (left + right) * lr;
	    out[13] = (top + bottom) * bt;
	    out[14] = (far + near) * nf;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Generates a look-at matrix with the given eye position, focal point, and up axis
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {vec3} eye Position of the viewer
	 * @param {vec3} center Point the viewer is looking at
	 * @param {vec3} up vec3 pointing up
	 * @returns {mat4} out
	 */
	mat4.lookAt = function (out, eye, center, up) {
	    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
	        eyex = eye[0],
	        eyey = eye[1],
	        eyez = eye[2],
	        upx = up[0],
	        upy = up[1],
	        upz = up[2],
	        centerx = center[0],
	        centery = center[1],
	        centerz = center[2];
	
	    if (Math.abs(eyex - centerx) < glMatrix.EPSILON &&
	        Math.abs(eyey - centery) < glMatrix.EPSILON &&
	        Math.abs(eyez - centerz) < glMatrix.EPSILON) {
	        return mat4.identity(out);
	    }
	
	    z0 = eyex - centerx;
	    z1 = eyey - centery;
	    z2 = eyez - centerz;
	
	    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	    z0 *= len;
	    z1 *= len;
	    z2 *= len;
	
	    x0 = upy * z2 - upz * z1;
	    x1 = upz * z0 - upx * z2;
	    x2 = upx * z1 - upy * z0;
	    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	    if (!len) {
	        x0 = 0;
	        x1 = 0;
	        x2 = 0;
	    } else {
	        len = 1 / len;
	        x0 *= len;
	        x1 *= len;
	        x2 *= len;
	    }
	
	    y0 = z1 * x2 - z2 * x1;
	    y1 = z2 * x0 - z0 * x2;
	    y2 = z0 * x1 - z1 * x0;
	
	    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	    if (!len) {
	        y0 = 0;
	        y1 = 0;
	        y2 = 0;
	    } else {
	        len = 1 / len;
	        y0 *= len;
	        y1 *= len;
	        y2 *= len;
	    }
	
	    out[0] = x0;
	    out[1] = y0;
	    out[2] = z0;
	    out[3] = 0;
	    out[4] = x1;
	    out[5] = y1;
	    out[6] = z1;
	    out[7] = 0;
	    out[8] = x2;
	    out[9] = y2;
	    out[10] = z2;
	    out[11] = 0;
	    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	    out[15] = 1;
	
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat4
	 *
	 * @param {mat4} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat4.str = function (a) {
	    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
	                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
	                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
	                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
	};
	
	/**
	 * Returns Frobenius norm of a mat4
	 *
	 * @param {mat4} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat4.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
	};
	
	
	module.exports = mat4;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	var glMatrix = __webpack_require__(9);
	var mat3 = __webpack_require__(12);
	var vec3 = __webpack_require__(15);
	var vec4 = __webpack_require__(16);
	
	/**
	 * @class Quaternion
	 * @name quat
	 */
	var quat = {};
	
	/**
	 * Creates a new identity quat
	 *
	 * @returns {quat} a new quaternion
	 */
	quat.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Sets a quaternion to represent the shortest rotation from one
	 * vector to another.
	 *
	 * Both vectors are assumed to be unit length.
	 *
	 * @param {quat} out the receiving quaternion.
	 * @param {vec3} a the initial vector
	 * @param {vec3} b the destination vector
	 * @returns {quat} out
	 */
	quat.rotationTo = (function() {
	    var tmpvec3 = vec3.create();
	    var xUnitVec3 = vec3.fromValues(1,0,0);
	    var yUnitVec3 = vec3.fromValues(0,1,0);
	
	    return function(out, a, b) {
	        var dot = vec3.dot(a, b);
	        if (dot < -0.999999) {
	            vec3.cross(tmpvec3, xUnitVec3, a);
	            if (vec3.length(tmpvec3) < 0.000001)
	                vec3.cross(tmpvec3, yUnitVec3, a);
	            vec3.normalize(tmpvec3, tmpvec3);
	            quat.setAxisAngle(out, tmpvec3, Math.PI);
	            return out;
	        } else if (dot > 0.999999) {
	            out[0] = 0;
	            out[1] = 0;
	            out[2] = 0;
	            out[3] = 1;
	            return out;
	        } else {
	            vec3.cross(tmpvec3, a, b);
	            out[0] = tmpvec3[0];
	            out[1] = tmpvec3[1];
	            out[2] = tmpvec3[2];
	            out[3] = 1 + dot;
	            return quat.normalize(out, out);
	        }
	    };
	})();
	
	/**
	 * Sets the specified quaternion with values corresponding to the given
	 * axes. Each axis is a vec3 and is expected to be unit length and
	 * perpendicular to all other specified axes.
	 *
	 * @param {vec3} view  the vector representing the viewing direction
	 * @param {vec3} right the vector representing the local "right" direction
	 * @param {vec3} up    the vector representing the local "up" direction
	 * @returns {quat} out
	 */
	quat.setAxes = (function() {
	    var matr = mat3.create();
	
	    return function(out, view, right, up) {
	        matr[0] = right[0];
	        matr[3] = right[1];
	        matr[6] = right[2];
	
	        matr[1] = up[0];
	        matr[4] = up[1];
	        matr[7] = up[2];
	
	        matr[2] = -view[0];
	        matr[5] = -view[1];
	        matr[8] = -view[2];
	
	        return quat.normalize(out, quat.fromMat3(out, matr));
	    };
	})();
	
	/**
	 * Creates a new quat initialized with values from an existing quaternion
	 *
	 * @param {quat} a quaternion to clone
	 * @returns {quat} a new quaternion
	 * @function
	 */
	quat.clone = vec4.clone;
	
	/**
	 * Creates a new quat initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {quat} a new quaternion
	 * @function
	 */
	quat.fromValues = vec4.fromValues;
	
	/**
	 * Copy the values from one quat to another
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the source quaternion
	 * @returns {quat} out
	 * @function
	 */
	quat.copy = vec4.copy;
	
	/**
	 * Set the components of a quat to the given values
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {quat} out
	 * @function
	 */
	quat.set = vec4.set;
	
	/**
	 * Set a quat to the identity quaternion
	 *
	 * @param {quat} out the receiving quaternion
	 * @returns {quat} out
	 */
	quat.identity = function(out) {
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Sets a quat from the given angle and rotation axis,
	 * then returns it.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {vec3} axis the axis around which to rotate
	 * @param {Number} rad the angle in radians
	 * @returns {quat} out
	 **/
	quat.setAxisAngle = function(out, axis, rad) {
	    rad = rad * 0.5;
	    var s = Math.sin(rad);
	    out[0] = s * axis[0];
	    out[1] = s * axis[1];
	    out[2] = s * axis[2];
	    out[3] = Math.cos(rad);
	    return out;
	};
	
	/**
	 * Adds two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {quat} out
	 * @function
	 */
	quat.add = vec4.add;
	
	/**
	 * Multiplies two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {quat} out
	 */
	quat.multiply = function(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];
	
	    out[0] = ax * bw + aw * bx + ay * bz - az * by;
	    out[1] = ay * bw + aw * by + az * bx - ax * bz;
	    out[2] = az * bw + aw * bz + ax * by - ay * bx;
	    out[3] = aw * bw - ax * bx - ay * by - az * bz;
	    return out;
	};
	
	/**
	 * Alias for {@link quat.multiply}
	 * @function
	 */
	quat.mul = quat.multiply;
	
	/**
	 * Scales a quat by a scalar number
	 *
	 * @param {quat} out the receiving vector
	 * @param {quat} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {quat} out
	 * @function
	 */
	quat.scale = vec4.scale;
	
	/**
	 * Rotates a quaternion by the given angle about the X axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateX = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw + aw * bx;
	    out[1] = ay * bw + az * bx;
	    out[2] = az * bw - ay * bx;
	    out[3] = aw * bw - ax * bx;
	    return out;
	};
	
	/**
	 * Rotates a quaternion by the given angle about the Y axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateY = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        by = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw - az * by;
	    out[1] = ay * bw + aw * by;
	    out[2] = az * bw + ax * by;
	    out[3] = aw * bw - ay * by;
	    return out;
	};
	
	/**
	 * Rotates a quaternion by the given angle about the Z axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateZ = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bz = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw + ay * bz;
	    out[1] = ay * bw - ax * bz;
	    out[2] = az * bw + aw * bz;
	    out[3] = aw * bw - az * bz;
	    return out;
	};
	
	/**
	 * Calculates the W component of a quat from the X, Y, and Z components.
	 * Assumes that quaternion is 1 unit in length.
	 * Any existing W component will be ignored.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate W component of
	 * @returns {quat} out
	 */
	quat.calculateW = function (out, a) {
	    var x = a[0], y = a[1], z = a[2];
	
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
	    return out;
	};
	
	/**
	 * Calculates the dot product of two quat's
	 *
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {Number} dot product of a and b
	 * @function
	 */
	quat.dot = vec4.dot;
	
	/**
	 * Performs a linear interpolation between two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 * @function
	 */
	quat.lerp = vec4.lerp;
	
	/**
	 * Performs a spherical linear interpolation between two quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 */
	quat.slerp = function (out, a, b, t) {
	    // benchmarks:
	    //    http://jsperf.com/quaternion-slerp-implementations
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];
	
	    var        omega, cosom, sinom, scale0, scale1;
	
	    // calc cosine
	    cosom = ax * bx + ay * by + az * bz + aw * bw;
	    // adjust signs (if necessary)
	    if ( cosom < 0.0 ) {
	        cosom = -cosom;
	        bx = - bx;
	        by = - by;
	        bz = - bz;
	        bw = - bw;
	    }
	    // calculate coefficients
	    if ( (1.0 - cosom) > 0.000001 ) {
	        // standard case (slerp)
	        omega  = Math.acos(cosom);
	        sinom  = Math.sin(omega);
	        scale0 = Math.sin((1.0 - t) * omega) / sinom;
	        scale1 = Math.sin(t * omega) / sinom;
	    } else {        
	        // "from" and "to" quaternions are very close 
	        //  ... so we can do a linear interpolation
	        scale0 = 1.0 - t;
	        scale1 = t;
	    }
	    // calculate final values
	    out[0] = scale0 * ax + scale1 * bx;
	    out[1] = scale0 * ay + scale1 * by;
	    out[2] = scale0 * az + scale1 * bz;
	    out[3] = scale0 * aw + scale1 * bw;
	    
	    return out;
	};
	
	/**
	 * Performs a spherical linear interpolation with two control points
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {quat} c the third operand
	 * @param {quat} d the fourth operand
	 * @param {Number} t interpolation amount
	 * @returns {quat} out
	 */
	quat.sqlerp = (function () {
	  var temp1 = quat.create();
	  var temp2 = quat.create();
	  
	  return function (out, a, b, c, d, t) {
	    quat.slerp(temp1, a, d, t);
	    quat.slerp(temp2, b, c, t);
	    quat.slerp(out, temp1, temp2, 2 * t * (1 - t));
	    
	    return out;
	  };
	}());
	
	/**
	 * Calculates the inverse of a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate inverse of
	 * @returns {quat} out
	 */
	quat.invert = function(out, a) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
	        invDot = dot ? 1.0/dot : 0;
	    
	    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
	
	    out[0] = -a0*invDot;
	    out[1] = -a1*invDot;
	    out[2] = -a2*invDot;
	    out[3] = a3*invDot;
	    return out;
	};
	
	/**
	 * Calculates the conjugate of a quat
	 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate conjugate of
	 * @returns {quat} out
	 */
	quat.conjugate = function (out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Calculates the length of a quat
	 *
	 * @param {quat} a vector to calculate length of
	 * @returns {Number} length of a
	 * @function
	 */
	quat.length = vec4.length;
	
	/**
	 * Alias for {@link quat.length}
	 * @function
	 */
	quat.len = quat.length;
	
	/**
	 * Calculates the squared length of a quat
	 *
	 * @param {quat} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 * @function
	 */
	quat.squaredLength = vec4.squaredLength;
	
	/**
	 * Alias for {@link quat.squaredLength}
	 * @function
	 */
	quat.sqrLen = quat.squaredLength;
	
	/**
	 * Normalize a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quaternion to normalize
	 * @returns {quat} out
	 * @function
	 */
	quat.normalize = vec4.normalize;
	
	/**
	 * Creates a quaternion from the given 3x3 rotation matrix.
	 *
	 * NOTE: The resultant quaternion is not normalized, so you should be sure
	 * to renormalize the quaternion yourself where necessary.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {mat3} m rotation matrix
	 * @returns {quat} out
	 * @function
	 */
	quat.fromMat3 = function(out, m) {
	    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	    // article "Quaternion Calculus and Fast Animation".
	    var fTrace = m[0] + m[4] + m[8];
	    var fRoot;
	
	    if ( fTrace > 0.0 ) {
	        // |w| > 1/2, may as well choose w > 1/2
	        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
	        out[3] = 0.5 * fRoot;
	        fRoot = 0.5/fRoot;  // 1/(4w)
	        out[0] = (m[5]-m[7])*fRoot;
	        out[1] = (m[6]-m[2])*fRoot;
	        out[2] = (m[1]-m[3])*fRoot;
	    } else {
	        // |w| <= 1/2
	        var i = 0;
	        if ( m[4] > m[0] )
	          i = 1;
	        if ( m[8] > m[i*3+i] )
	          i = 2;
	        var j = (i+1)%3;
	        var k = (i+2)%3;
	        
	        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
	        out[i] = 0.5 * fRoot;
	        fRoot = 0.5 / fRoot;
	        out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
	        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
	        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
	    }
	    
	    return out;
	};
	
	/**
	 * Returns a string representation of a quatenion
	 *
	 * @param {quat} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	quat.str = function (a) {
	    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	module.exports = quat;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	var glMatrix = __webpack_require__(9);
	
	/**
	 * @class 3 Dimensional Vector
	 * @name vec3
	 */
	var vec3 = {};
	
	/**
	 * Creates a new, empty vec3
	 *
	 * @returns {vec3} a new 3D vector
	 */
	vec3.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(3);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec3 initialized with values from an existing vector
	 *
	 * @param {vec3} a vector to clone
	 * @returns {vec3} a new 3D vector
	 */
	vec3.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(3);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	};
	
	/**
	 * Creates a new vec3 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} a new 3D vector
	 */
	vec3.fromValues = function(x, y, z) {
	    var out = new glMatrix.ARRAY_TYPE(3);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Copy the values from one vec3 to another
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the source vector
	 * @returns {vec3} out
	 */
	vec3.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	};
	
	/**
	 * Set the components of a vec3 to the given values
	 *
	 * @param {vec3} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} out
	 */
	vec3.set = function(out, x, y, z) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Adds two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    return out;
	};
	
	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.subtract}
	 * @function
	 */
	vec3.sub = vec3.subtract;
	
	/**
	 * Multiplies two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.multiply}
	 * @function
	 */
	vec3.mul = vec3.multiply;
	
	/**
	 * Divides two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.divide}
	 * @function
	 */
	vec3.div = vec3.divide;
	
	/**
	 * Returns the minimum of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    return out;
	};
	
	/**
	 * Scales a vec3 by a scalar number
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec3} out
	 */
	vec3.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    return out;
	};
	
	/**
	 * Adds two vec3's after scaling the second operand by a scalar value
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec3} out
	 */
	vec3.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec3.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};
	
	/**
	 * Alias for {@link vec3.distance}
	 * @function
	 */
	vec3.dist = vec3.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec3.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return x*x + y*y + z*z;
	};
	
	/**
	 * Alias for {@link vec3.squaredDistance}
	 * @function
	 */
	vec3.sqrDist = vec3.squaredDistance;
	
	/**
	 * Calculates the length of a vec3
	 *
	 * @param {vec3} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec3.length = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};
	
	/**
	 * Alias for {@link vec3.length}
	 * @function
	 */
	vec3.len = vec3.length;
	
	/**
	 * Calculates the squared length of a vec3
	 *
	 * @param {vec3} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec3.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return x*x + y*y + z*z;
	};
	
	/**
	 * Alias for {@link vec3.squaredLength}
	 * @function
	 */
	vec3.sqrLen = vec3.squaredLength;
	
	/**
	 * Negates the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to negate
	 * @returns {vec3} out
	 */
	vec3.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    return out;
	};
	
	/**
	 * Returns the inverse of the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to invert
	 * @returns {vec3} out
	 */
	vec3.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  out[2] = 1.0 / a[2];
	  return out;
	};
	
	/**
	 * Normalize a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to normalize
	 * @returns {vec3} out
	 */
	vec3.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    var len = x*x + y*y + z*z;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	        out[2] = a[2] * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec3.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};
	
	/**
	 * Computes the cross product of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.cross = function(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2],
	        bx = b[0], by = b[1], bz = b[2];
	
	    out[0] = ay * bz - az * by;
	    out[1] = az * bx - ax * bz;
	    out[2] = ax * by - ay * bx;
	    return out;
	};
	
	/**
	 * Performs a linear interpolation between two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec3} out
	 */
	vec3.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1],
	        az = a[2];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    return out;
	};
	
	/**
	 * Performs a hermite interpolation with two control points
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {vec3} c the third operand
	 * @param {vec3} d the fourth operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec3} out
	 */
	vec3.hermite = function (out, a, b, c, d, t) {
	  var factorTimes2 = t * t,
	      factor1 = factorTimes2 * (2 * t - 3) + 1,
	      factor2 = factorTimes2 * (t - 2) + t,
	      factor3 = factorTimes2 * (t - 1),
	      factor4 = factorTimes2 * (3 - 2 * t);
	  
	  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
	  
	  return out;
	};
	
	/**
	 * Performs a bezier interpolation with two control points
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {vec3} c the third operand
	 * @param {vec3} d the fourth operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec3} out
	 */
	vec3.bezier = function (out, a, b, c, d, t) {
	  var inverseFactor = 1 - t,
	      inverseFactorTimesTwo = inverseFactor * inverseFactor,
	      factorTimes2 = t * t,
	      factor1 = inverseFactorTimesTwo * inverseFactor,
	      factor2 = 3 * t * inverseFactorTimesTwo,
	      factor3 = 3 * factorTimes2 * inverseFactor,
	      factor4 = factorTimes2 * t;
	  
	  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
	  
	  return out;
	};
	
	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec3} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec3} out
	 */
	vec3.random = function (out, scale) {
	    scale = scale || 1.0;
	
	    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
	    var z = (glMatrix.RANDOM() * 2.0) - 1.0;
	    var zScale = Math.sqrt(1.0-z*z) * scale;
	
	    out[0] = Math.cos(r) * zScale;
	    out[1] = Math.sin(r) * zScale;
	    out[2] = z * scale;
	    return out;
	};
	
	/**
	 * Transforms the vec3 with a mat4.
	 * 4th vector component is implicitly '1'
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec3} out
	 */
	vec3.transformMat4 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2],
	        w = m[3] * x + m[7] * y + m[11] * z + m[15];
	    w = w || 1.0;
	    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
	    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
	    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
	    return out;
	};
	
	/**
	 * Transforms the vec3 with a mat3.
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {mat4} m the 3x3 matrix to transform with
	 * @returns {vec3} out
	 */
	vec3.transformMat3 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2];
	    out[0] = x * m[0] + y * m[3] + z * m[6];
	    out[1] = x * m[1] + y * m[4] + z * m[7];
	    out[2] = x * m[2] + y * m[5] + z * m[8];
	    return out;
	};
	
	/**
	 * Transforms the vec3 with a quat
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {quat} q quaternion to transform with
	 * @returns {vec3} out
	 */
	vec3.transformQuat = function(out, a, q) {
	    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations
	
	    var x = a[0], y = a[1], z = a[2],
	        qx = q[0], qy = q[1], qz = q[2], qw = q[3],
	
	        // calculate quat * vec
	        ix = qw * x + qy * z - qz * y,
	        iy = qw * y + qz * x - qx * z,
	        iz = qw * z + qx * y - qy * x,
	        iw = -qx * x - qy * y - qz * z;
	
	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    return out;
	};
	
	/**
	 * Rotate a 3D vector around the x-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateX = function(out, a, b, c){
	   var p = [], r=[];
		  //Translate point to the origin
		  p[0] = a[0] - b[0];
		  p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];
	
		  //perform rotation
		  r[0] = p[0];
		  r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
		  r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);
	
		  //translate to correct position
		  out[0] = r[0] + b[0];
		  out[1] = r[1] + b[1];
		  out[2] = r[2] + b[2];
	
	  	return out;
	};
	
	/**
	 * Rotate a 3D vector around the y-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateY = function(out, a, b, c){
	  	var p = [], r=[];
	  	//Translate point to the origin
	  	p[0] = a[0] - b[0];
	  	p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];
	  
	  	//perform rotation
	  	r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
	  	r[1] = p[1];
	  	r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
	  
	  	//translate to correct position
	  	out[0] = r[0] + b[0];
	  	out[1] = r[1] + b[1];
	  	out[2] = r[2] + b[2];
	  
	  	return out;
	};
	
	/**
	 * Rotate a 3D vector around the z-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateZ = function(out, a, b, c){
	  	var p = [], r=[];
	  	//Translate point to the origin
	  	p[0] = a[0] - b[0];
	  	p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];
	  
	  	//perform rotation
	  	r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
	  	r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
	  	r[2] = p[2];
	  
	  	//translate to correct position
	  	out[0] = r[0] + b[0];
	  	out[1] = r[1] + b[1];
	  	out[2] = r[2] + b[2];
	  
	  	return out;
	};
	
	/**
	 * Perform some operation over an array of vec3s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec3.forEach = (function() {
	    var vec = vec3.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 3;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Get the angle between two 3D vectors
	 * @param {vec3} a The first operand
	 * @param {vec3} b The second operand
	 * @returns {Number} The angle in radians
	 */
	vec3.angle = function(a, b) {
	   
	    var tempA = vec3.fromValues(a[0], a[1], a[2]);
	    var tempB = vec3.fromValues(b[0], b[1], b[2]);
	 
	    vec3.normalize(tempA, tempA);
	    vec3.normalize(tempB, tempB);
	 
	    var cosine = vec3.dot(tempA, tempB);
	
	    if(cosine > 1.0){
	        return 0;
	    } else {
	        return Math.acos(cosine);
	    }     
	};
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec3} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec3.str = function (a) {
	    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
	};
	
	module.exports = vec3;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	var glMatrix = __webpack_require__(9);
	
	/**
	 * @class 4 Dimensional Vector
	 * @name vec4
	 */
	var vec4 = {};
	
	/**
	 * Creates a new, empty vec4
	 *
	 * @returns {vec4} a new 4D vector
	 */
	vec4.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec4 initialized with values from an existing vector
	 *
	 * @param {vec4} a vector to clone
	 * @returns {vec4} a new 4D vector
	 */
	vec4.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Creates a new vec4 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} a new 4D vector
	 */
	vec4.fromValues = function(x, y, z, w) {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};
	
	/**
	 * Copy the values from one vec4 to another
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the source vector
	 * @returns {vec4} out
	 */
	vec4.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Set the components of a vec4 to the given values
	 *
	 * @param {vec4} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} out
	 */
	vec4.set = function(out, x, y, z, w) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};
	
	/**
	 * Adds two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    return out;
	};
	
	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.subtract}
	 * @function
	 */
	vec4.sub = vec4.subtract;
	
	/**
	 * Multiplies two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    out[3] = a[3] * b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.multiply}
	 * @function
	 */
	vec4.mul = vec4.multiply;
	
	/**
	 * Divides two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    out[3] = a[3] / b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.divide}
	 * @function
	 */
	vec4.div = vec4.divide;
	
	/**
	 * Returns the minimum of two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    out[3] = Math.min(a[3], b[3]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    out[3] = Math.max(a[3], b[3]);
	    return out;
	};
	
	/**
	 * Scales a vec4 by a scalar number
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec4} out
	 */
	vec4.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    out[3] = a[3] * b;
	    return out;
	};
	
	/**
	 * Adds two vec4's after scaling the second operand by a scalar value
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec4} out
	 */
	vec4.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec4.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2],
	        w = b[3] - a[3];
	    return Math.sqrt(x*x + y*y + z*z + w*w);
	};
	
	/**
	 * Alias for {@link vec4.distance}
	 * @function
	 */
	vec4.dist = vec4.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec4.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2],
	        w = b[3] - a[3];
	    return x*x + y*y + z*z + w*w;
	};
	
	/**
	 * Alias for {@link vec4.squaredDistance}
	 * @function
	 */
	vec4.sqrDist = vec4.squaredDistance;
	
	/**
	 * Calculates the length of a vec4
	 *
	 * @param {vec4} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec4.length = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    return Math.sqrt(x*x + y*y + z*z + w*w);
	};
	
	/**
	 * Alias for {@link vec4.length}
	 * @function
	 */
	vec4.len = vec4.length;
	
	/**
	 * Calculates the squared length of a vec4
	 *
	 * @param {vec4} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec4.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    return x*x + y*y + z*z + w*w;
	};
	
	/**
	 * Alias for {@link vec4.squaredLength}
	 * @function
	 */
	vec4.sqrLen = vec4.squaredLength;
	
	/**
	 * Negates the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to negate
	 * @returns {vec4} out
	 */
	vec4.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = -a[3];
	    return out;
	};
	
	/**
	 * Returns the inverse of the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to invert
	 * @returns {vec4} out
	 */
	vec4.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  out[2] = 1.0 / a[2];
	  out[3] = 1.0 / a[3];
	  return out;
	};
	
	/**
	 * Normalize a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to normalize
	 * @returns {vec4} out
	 */
	vec4.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    var len = x*x + y*y + z*z + w*w;
	    if (len > 0) {
	        len = 1 / Math.sqrt(len);
	        out[0] = x * len;
	        out[1] = y * len;
	        out[2] = z * len;
	        out[3] = w * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec4.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	};
	
	/**
	 * Performs a linear interpolation between two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec4} out
	 */
	vec4.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1],
	        az = a[2],
	        aw = a[3];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    out[3] = aw + t * (b[3] - aw);
	    return out;
	};
	
	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec4} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec4} out
	 */
	vec4.random = function (out, scale) {
	    scale = scale || 1.0;
	
	    //TODO: This is a pretty awful way of doing this. Find something better.
	    out[0] = glMatrix.RANDOM();
	    out[1] = glMatrix.RANDOM();
	    out[2] = glMatrix.RANDOM();
	    out[3] = glMatrix.RANDOM();
	    vec4.normalize(out, out);
	    vec4.scale(out, out, scale);
	    return out;
	};
	
	/**
	 * Transforms the vec4 with a mat4.
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec4} out
	 */
	vec4.transformMat4 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2], w = a[3];
	    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	    return out;
	};
	
	/**
	 * Transforms the vec4 with a quat
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {quat} q quaternion to transform with
	 * @returns {vec4} out
	 */
	vec4.transformQuat = function(out, a, q) {
	    var x = a[0], y = a[1], z = a[2],
	        qx = q[0], qy = q[1], qz = q[2], qw = q[3],
	
	        // calculate quat * vec
	        ix = qw * x + qy * z - qz * y,
	        iy = qw * y + qz * x - qx * z,
	        iz = qw * z + qx * y - qy * x,
	        iw = -qx * x - qy * y - qz * z;
	
	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Perform some operation over an array of vec4s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec4.forEach = (function() {
	    var vec = vec4.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 4;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec4} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec4.str = function (a) {
	    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	module.exports = vec4;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	
	var glMatrix = __webpack_require__(9);
	
	/**
	 * @class 2 Dimensional Vector
	 * @name vec2
	 */
	var vec2 = {};
	
	/**
	 * Creates a new, empty vec2
	 *
	 * @returns {vec2} a new 2D vector
	 */
	vec2.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(2);
	    out[0] = 0;
	    out[1] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec2 initialized with values from an existing vector
	 *
	 * @param {vec2} a vector to clone
	 * @returns {vec2} a new 2D vector
	 */
	vec2.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(2);
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	};
	
	/**
	 * Creates a new vec2 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @returns {vec2} a new 2D vector
	 */
	vec2.fromValues = function(x, y) {
	    var out = new glMatrix.ARRAY_TYPE(2);
	    out[0] = x;
	    out[1] = y;
	    return out;
	};
	
	/**
	 * Copy the values from one vec2 to another
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the source vector
	 * @returns {vec2} out
	 */
	vec2.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	};
	
	/**
	 * Set the components of a vec2 to the given values
	 *
	 * @param {vec2} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @returns {vec2} out
	 */
	vec2.set = function(out, x, y) {
	    out[0] = x;
	    out[1] = y;
	    return out;
	};
	
	/**
	 * Adds two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    return out;
	};
	
	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.subtract}
	 * @function
	 */
	vec2.sub = vec2.subtract;
	
	/**
	 * Multiplies two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.multiply}
	 * @function
	 */
	vec2.mul = vec2.multiply;
	
	/**
	 * Divides two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.divide}
	 * @function
	 */
	vec2.div = vec2.divide;
	
	/**
	 * Returns the minimum of two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    return out;
	};
	
	/**
	 * Scales a vec2 by a scalar number
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec2} out
	 */
	vec2.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    return out;
	};
	
	/**
	 * Adds two vec2's after scaling the second operand by a scalar value
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec2} out
	 */
	vec2.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec2.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1];
	    return Math.sqrt(x*x + y*y);
	};
	
	/**
	 * Alias for {@link vec2.distance}
	 * @function
	 */
	vec2.dist = vec2.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec2.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1];
	    return x*x + y*y;
	};
	
	/**
	 * Alias for {@link vec2.squaredDistance}
	 * @function
	 */
	vec2.sqrDist = vec2.squaredDistance;
	
	/**
	 * Calculates the length of a vec2
	 *
	 * @param {vec2} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec2.length = function (a) {
	    var x = a[0],
	        y = a[1];
	    return Math.sqrt(x*x + y*y);
	};
	
	/**
	 * Alias for {@link vec2.length}
	 * @function
	 */
	vec2.len = vec2.length;
	
	/**
	 * Calculates the squared length of a vec2
	 *
	 * @param {vec2} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec2.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1];
	    return x*x + y*y;
	};
	
	/**
	 * Alias for {@link vec2.squaredLength}
	 * @function
	 */
	vec2.sqrLen = vec2.squaredLength;
	
	/**
	 * Negates the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to negate
	 * @returns {vec2} out
	 */
	vec2.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    return out;
	};
	
	/**
	 * Returns the inverse of the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to invert
	 * @returns {vec2} out
	 */
	vec2.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  return out;
	};
	
	/**
	 * Normalize a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to normalize
	 * @returns {vec2} out
	 */
	vec2.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1];
	    var len = x*x + y*y;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec2.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	};
	
	/**
	 * Computes the cross product of two vec2's
	 * Note that the cross product must by definition produce a 3D vector
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec3} out
	 */
	vec2.cross = function(out, a, b) {
	    var z = a[0] * b[1] - a[1] * b[0];
	    out[0] = out[1] = 0;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Performs a linear interpolation between two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec2} out
	 */
	vec2.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    return out;
	};
	
	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec2} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec2} out
	 */
	vec2.random = function (out, scale) {
	    scale = scale || 1.0;
	    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
	    out[0] = Math.cos(r) * scale;
	    out[1] = Math.sin(r) * scale;
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat2} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat2 = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[2] * y;
	    out[1] = m[1] * x + m[3] * y;
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat2d
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat2d} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat2d = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[2] * y + m[4];
	    out[1] = m[1] * x + m[3] * y + m[5];
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat3
	 * 3rd vector component is implicitly '1'
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat3} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat3 = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[3] * y + m[6];
	    out[1] = m[1] * x + m[4] * y + m[7];
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat4
	 * 3rd vector component is implicitly '0'
	 * 4th vector component is implicitly '1'
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat4 = function(out, a, m) {
	    var x = a[0], 
	        y = a[1];
	    out[0] = m[0] * x + m[4] * y + m[12];
	    out[1] = m[1] * x + m[5] * y + m[13];
	    return out;
	};
	
	/**
	 * Perform some operation over an array of vec2s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec2.forEach = (function() {
	    var vec = vec2.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 2;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec2} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec2.str = function (a) {
	    return 'vec2(' + a[0] + ', ' + a[1] + ')';
	};
	
	module.exports = vec2;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var Filter, Material, barrel_filter_chromeab_code, barrel_filter_code, box_filter_code,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	Material = __webpack_require__(19).Material;
	
	box_filter_code = "return (get(-1,-1)+get(0,-1)+get(1,-1)+\n        get(-1, 0)+get(0, 0)+get(1, 0)+\n        get(-1, 1)+get(0, 1)+get(1, 1))/9.0;";
	
	barrel_filter_code = "vec4 HmdWarpParam = vec4(1.0,0.22,0.24,0.0);\nvec2 c = vec2(coord.x - (VP_TO_LENS), coord.y * INV_RATIO);\nfloat rSq = c.x * c.x + c.y * c.y;\nvec2 rvector = c * ( HmdWarpParam.x + HmdWarpParam.y * rSq +\n        HmdWarpParam.z * rSq * rSq\n        + HmdWarpParam.w * rSq * rSq * rSq\n        ) * INV_FOV_SCALE;\nrvector.y *= RATIO;\nrvector.x += VP_TO_IPD;\nreturn all(equal(rvector, clamp(rvector, vec2(-1), vec2(1))))?\n        gettex(rvector):vec3(0);";
	
	barrel_filter_chromeab_code = "vec4 HmdWarpParam = vec4(1.0,0.22,0.24,0.0);\nvec4 u_chromAbParam = vec4(0.996, -0.004, 1.0038, 0.0);\nvec2 c = vec2(coord.x - (VP_TO_LENS), coord.y * INV_RATIO);\nfloat rSq = c.x * c.x + c.y * c.y;\nvec2 rvector = c * ( HmdWarpParam.x + HmdWarpParam.y * rSq +\n        HmdWarpParam.z * rSq * rSq\n        + HmdWarpParam.w * rSq * rSq * rSq\n        );\nfloat inv_fov_scale = INV_FOV_SCALE;\nif (any(notEqual(step(0.985, rvector*inv_fov_scale)+step(-0.985, rvector*inv_fov_scale), vec2(1.0, 1.0)))) {\n  return vec3(0);\n}\nvec2 rvec_blue = rvector * (u_chromAbParam.z + u_chromAbParam.w * rSq);\nvec2 rvec_red  = rvector * (u_chromAbParam.x + u_chromAbParam.y * rSq);\nvec2 scale = vec2(inv_fov_scale, inv_fov_scale * RATIO);\nrvector *= scale;\nrvec_blue *= scale;\nrvec_red *= scale;\nfloat vp_to_ipd = VP_TO_IPD;\nrvector.x += vp_to_ipd;\nrvec_red.x += vp_to_ipd;\nrvec_blue.x += vp_to_ipd;\nvec2 asdf = vec2(0.00048828125);\nreturn vec3(gettex(rvec_red+asdf).r+gettex(rvec_red-asdf).r,\n            gettex(rvector+asdf).g+gettex(rvector-asdf).g,\n            gettex(rvec_blue+asdf).b+gettex(rvec_blue-asdf).b)*0.5;";
	
	Filter = (function(superClass) {
	  extend(Filter, superClass);
	
	  function Filter(render_manager, code, name) {
	    var fs, gl, prog, quad, vs;
	    if (name == null) {
	      name = 'filter';
	    }
	    vs = "precision highp float;\nprecision highp int;\nattribute vec3 vertex;\nuniform vec2 src_size, pixel_ratio;\nuniform vec4 src_rect, dst_rect;\nvarying vec2 src_co, dst_co, uv, coord;\nvarying vec2 src_offset, src_scale;\n\nvoid main(){\n    coord = (vertex.xy*2.0)-vec2(1.0,1.0);\n    gl_Position = vec4(coord, 0.0, 1.0);\n    src_co = src_rect.xy + src_rect.zw * vertex.xy;\n    dst_co = dst_rect.xy + dst_rect.zw * vertex.xy;\n    uv = src_co / src_size;\n    src_scale = src_rect.zw / src_size;\n    src_offset = src_rect.xy / src_size;\n}";
	    fs = "precision highp float;\nuniform sampler2D source;\nuniform vec2 src_size;\nvarying vec2 src_co, dst_co, uv, coord;\nvarying vec2 src_offset, src_scale;\nvec3 get(vec2 off){\n    return texture2D(source, uv+off/src_size).rgb;\n}\nvec3 get(float x, float y){\n    vec2 off = vec2(x, y);\n    return texture2D(source, uv+off/src_size).rgb;\n}\nvec3 get(int x, int y){\n    vec2 off = vec2(x, y);\n    return texture2D(source, uv+off/src_size).rgb;\n}\nvec3 gettex(vec2 co){\n    return texture2D(source, (co/2.0+vec2(0.5,0.5))*src_scale+src_offset).rgb;\n}\nvec3 filter(){" + code + "}\nvoid main(){\n    gl_FragColor = vec4(filter(), 1.0);\n}";
	    gl = render_manager.gl;
	    Filter.__super__.constructor.call(this, render_manager.context, name, fs, [], [], vs);
	    prog = this._program;
	    gl.uniform1i(gl.getUniformLocation(prog, 'source'), 0);
	    if (!render_manager.quad) {
	      render_manager.quad = quad = gl.createBuffer();
	      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
	      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0]), gl.STATIC_DRAW);
	    }
	  }
	
	  return Filter;
	
	})(Material);
	
	module.exports = {
	  box_filter_code: box_filter_code,
	  barrel_filter_code: barrel_filter_code,
	  barrel_filter_chromeab_code: barrel_filter_chromeab_code,
	  Filter: Filter
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var Material, _active_program, load_material, load_textures_of_material, mat2, mat3, mat4, quat, ref, vec2, vec3, vec4;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	load_material = function(scene, data) {
	  var mat, name;
	  name = data.name;
	  mat = scene.materials[name] = new Material(scene.context, name, [scene.context.SHADER_LIB, data['fragment']], data.uniforms, data.attributes, "", scene);
	  return mat.double_sided = !!data.double_sided;
	};
	
	load_textures_of_material = function(scene, data) {
	  var j, len, ref1, u;
	  ref1 = data.uniforms;
	  for (j = 0, len = ref1.length; j < len; j++) {
	    u = ref1[j];
	    if (u.type === 13 && scene) {
	      scene.loader.load_texture(u.image, u.filepath, u.filter, u.wrap, u.size);
	    }
	  }
	};
	
	_active_program = null;
	
	Material = (function() {
	  function Material(context, name1, fs, uniforms, attributes, vs, scene1) {
	    var a, a_name, armature_deform_code, attribute_asgn, attribute_decl, extrude_code, fb, fragment_shader, gl, i, j, k, l, lamp_data, lamps, len, len1, len2, m, multiplier, n, num_bones, num_particles, num_shapes, o, p, prog, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, s, shape_key_code, strnd, t, tex, tex_uniforms, u, uniform_decl, v, var_color, var_custom, var_inv_model_view_matrix, var_inv_object_matrix, var_model_view_matrix, var_object_matrix, var_strand, var_strand_type, vertex_shader, vnormal, vtype;
	    this.context = context;
	    this.name = name1;
	    if (vs == null) {
	      vs = "";
	    }
	    this.scene = scene1;
	    if (this.context.all_materials.indexOf(this) === -1) {
	      this.context.all_materials.push(this);
	    }
	    gl = this.context.render_manager.gl;
	    this.textures = [];
	    this.uv_layer_attribs = {};
	    this.color_attribs = {};
	    tex_uniforms = [];
	    lamps = {};
	    this.lamps = [];
	    this.is_shadow_material = false;
	    this.attrib_locs = {
	      "vnormal": -1
	    };
	    this.users = [];
	    this.uniforms_config = uniforms;
	    this.attributes_config = attributes;
	    this.uv_multiplier = 1;
	    this.shape_multiplier = 1;
	    this.group_id = -1;
	    var_model_view_matrix = "model_view_matrix";
	    var_inv_model_view_matrix = "";
	    var_object_matrix = "";
	    var_inv_object_matrix = "";
	    var_color = "";
	    var_strand = "";
	    var_strand_type = "float";
	    var_custom = [];
	    for (j = 0, len = uniforms.length; j < len; j++) {
	      u = uniforms[j];
	      if (u.type === 6 || u.type === 7 || u.type === 11 || u.type === 15) {
	        l = lamps[u.lamp] || {
	          vardir: '',
	          varpos: '',
	          varmat: '',
	          varcolor3: '',
	          varcolor4: '',
	          dist: ''
	        };
	        lamps[u.lamp] = l;
	      }
	      if (u.type === 1) {
	        var_model_view_matrix = u.varname;
	      } else if (u.type === 2) {
	        var_object_matrix = u.varname;
	      } else if (u.type === 3) {
	        var_inv_model_view_matrix = u.varname;
	      } else if (u.type === 4) {
	        var_inv_object_matrix = u.varname;
	      } else if (u.type === 5) {
	        var_color = u.varname;
	      } else if (u.type === 6) {
	        l.vardir = u.varname;
	      } else if (u.type === 7) {
	        l.varpos = u.varname;
	      } else if (u.type === 9) {
	        l.varmat = u.varname;
	      } else if (u.type === 10) {
	        l.varenergy = u.varname;
	      } else if (u.type === 11) {
	        if (u.datatype === 4) {
	          l.varcolor3 = u.varname;
	        } else {
	          l.varcolor4 = u.varname;
	        }
	      } else if (u.type === 16) {
	        l.dist = u.varname;
	      } else if (u.type === 14) {
	        if (this.context.render_manager.extensions.texture_float_linear != null) {
	          this.textures.push({
	            loaded: true,
	            tex: this.scene.objects[u.lamp].shadow_fb.texture
	          });
	          tex_uniforms.push(u.varname);
	        }
	      } else if (u.type === 13 && this.scene) {
	        tex = this.scene.loader.load_texture(u.image, u.filepath, u.filter, u.wrap, u.size);
	        this.textures.push(tex);
	        tex.users.push(this);
	        tex_uniforms.push(u.varname);
	      } else if (u.type === 77) {
	        var_strand = u.varname;
	        var_strand_type = u.gltype;
	      } else if (u.type === -1) {
	        var_custom.push(u.varname);
	      } else {
	        console.log(u);
	        console.log("Warning: unknown uniform", u.varname, u.type, "of data type", ['0', '1i', '1f', '2f', '3f', '4f', 'm3', 'm4', '4ub'][u.datatype]);
	      }
	    }
	    uniform_decl = "";
	    attribute_decl = "";
	    attribute_asgn = "";
	    armature_deform_code = "";
	    extrude_code = "";
	    num_shapes = 0;
	    num_bones = 0;
	    num_particles = 0;
	    this.num_bone_uniforms = 0;
	    for (k = 0, len1 = attributes.length; k < len1; k++) {
	      a = attributes[k];
	      v = 'var' + a.varname.slice(3);
	      if (a.type < 14) {
	        vtype = "vec3";
	        multiplier = "";
	        if (a.type === 5) {
	          this.uv_layer_attribs[a.name] = a.varname;
	          vtype = "vec2";
	          multiplier = "*uv_multiplier";
	        } else if (a.type === 6) {
	          this.color_attribs[a.name] = a.varname;
	          vtype = "vec4";
	        } else {
	          console.log("Warning: unknown attribute type", a.type);
	        }
	        attribute_decl += "attribute " + vtype + " " + a.varname + ";\n" + "varying " + vtype + " " + v + ";\n";
	        attribute_asgn += v + "=" + a.varname + multiplier + ";\n";
	        this.attrib_locs[a.varname] = -1;
	      } else if (a.type === 18) {
	        attribute_decl += "attribute vec4 tangent;\n" + "varying vec4 " + v + ";\n";
	        attribute_asgn += v + ".xyz = normalize((" + var_model_view_matrix + "*vec4(tangent.xyz,0)).xyz);\n";
	        attribute_asgn += v + ".w = tangent.w;\n";
	        this.attrib_locs["tangent"] = -1;
	      } else if (a.type === 99) {
	        num_shapes = a.count;
	        for (i = m = 0, ref1 = num_shapes; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
	          attribute_decl += "attribute vec3 shape" + i + ";\n";
	          attribute_decl += "attribute vec3 shapenor" + i + ";\n";
	          this.attrib_locs["shape" + i] = -1;
	          this.attrib_locs["shapenor" + i] = -1;
	        }
	        uniform_decl += "uniform float shapef[" + num_shapes + "];";
	      } else if (a.type === 88) {
	        num_bones = a.count;
	        this.num_bone_uniforms = num_bones;
	        attribute_decl += "attribute vec4 weights;\n";
	        attribute_decl += "attribute vec4 b_indices;\n";
	        this.attrib_locs["weights"] = -1;
	        this.attrib_locs["b_indices"] = -1;
	        uniform_decl += "uniform mat4 bones[" + this.num_bone_uniforms + "];\n";
	        armature_deform_code = "vec4 blendco = vec4(0);\nvec3 blendnor = vec3(0);\nmat4 m;\nivec4 inds = ivec4(b_indices);\nint idx;\nfor(int i=0; i<4; ++i){\n    m = bones[inds[i]];\n    blendco += m * co4 * weights[i];\n    blendnor += mat3(m[0].xyz, m[1].xyz, m[2].xyz) * normal * weights[i];\n}\nco4 = blendco; normal = blendnor;";
	      } else if (a.type === 77) {
	        if (var_strand === "") {
	          var_strand = "strand";
	        }
	        uniform_decl += "uniform " + var_strand_type + " " + var_strand + ";\n";
	        num_particles = a.count;
	        for (i = n = 0, ref2 = num_particles; 0 <= ref2 ? n < ref2 : n > ref2; i = 0 <= ref2 ? ++n : --n) {
	          attribute_decl += "attribute vec3 particle" + i + ";\n";
	          this.attrib_locs["particle" + i] = -1;
	        }
	      } else {
	        attribute_decl += "varying vec3 " + v + ";\n";
	        attribute_asgn += v + " = co;\n";
	      }
	    }
	    shape_key_code = "";
	    if (num_shapes) {
	      shape_key_code = "float relf = 0.0;\nvec3 n;";
	      for (i = o = 0, ref3 = num_shapes; 0 <= ref3 ? o < ref3 : o > ref3; i = 0 <= ref3 ? ++o : --o) {
	        shape_key_code += "co += shape" + i + " * shapef[" + i + "] * shape_multiplier;\nrelf += shapef[" + i + "];";
	      }
	      shape_key_code += "normal *= clamp(1.0 - relf, 0.0, 1.0);\n";
	      for (i = p = 0, ref4 = num_shapes; 0 <= ref4 ? p < ref4 : p > ref4; i = 0 <= ref4 ? ++p : --p) {
	        shape_key_code += "n = shapenor" + i + " * 0.007874;\nnormal += n * Math.max(0.0, shapef[" + i + "]);";
	      }
	      vnormal = "vnormal * 0.007874";
	    } else {
	      vnormal = "vnormal";
	    }
	    if (num_particles) {
	      strnd = var_strand;
	      if (var_strand_type !== "float") {
	        strnd += ".x";
	      }
	      extrude_code = "co4 = vec4(mix(co4.xyz, particle0, " + strnd + ") ,1.0);";
	    }
	    this.vs_code = vs = vs || "precision highp float;\nprecision highp int;\nuniform mat4 " + var_model_view_matrix + ";\nuniform mat4 projection_matrix;\nuniform mat3 normal_matrix;\nuniform float shape_multiplier;\nuniform float uv_multiplier;\nattribute vec3 vertex;\nattribute vec3 vnormal;\nvarying vec3 varposition;\nvarying vec3 varnormal;" + attribute_decl + "        " + uniform_decl + "void main()\n{\n    vec3 co = vertex;\n    vec3 normal = " + vnormal + ";" + shape_key_code + attribute_asgn + "vec4 co4 = vec4(co, 1.0);" + armature_deform_code + "            " + extrude_code + "vec4 global_co = " + var_model_view_matrix + " * co4;\n    varposition = global_co.xyz;\n    varnormal = normalize(normal_matrix * normal);\n    gl_Position = projection_matrix * global_co;\n}";
	    vertex_shader = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vertex_shader, vs);
	    gl.compileShader(vertex_shader);
	    if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
	      console.log("Error compiling vertex shader of material", name);
	      console.log(gl.getShaderInfoLog(vertex_shader));
	      gl.deleteShader(vertex_shader);
	      return;
	    }
	    this.fs_code = fs;
	    fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
	    fs = fs.splice ? fs.join('') : fs;
	    gl.shaderSource(fragment_shader, fs);
	    gl.compileShader(fragment_shader);
	    if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
	      console.log("Error compiling fragment shader of material", name);
	      console.log(gl.getShaderInfoLog(fragment_shader));
	      gl.deleteShader(fragment_shader);
	      return;
	    }
	    prog = gl.createProgram();
	    gl.attachShader(prog, vertex_shader);
	    gl.attachShader(prog, fragment_shader);
	    gl.bindAttribLocation(prog, 0, 'vertex');
	    gl.linkProgram(prog);
	    if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) {
	      console.log("Error linking shader of material", name);
	      console.log(attributes);
	      console.log(gl.getProgramInfoLog(prog));
	      gl.deleteProgram(prog);
	      gl.deleteShader(vertex_shader);
	      gl.deleteShader(fragment_shader);
	      return;
	    }
	    gl.useProgram(prog);
	    this.u_model_view_matrix = gl.getUniformLocation(prog, var_model_view_matrix);
	    this.u_projection_matrix = gl.getUniformLocation(prog, "projection_matrix");
	    this.u_normal_matrix = gl.getUniformLocation(prog, "normal_matrix");
	    this.u_shape_multiplier = gl.getUniformLocation(prog, "shape_multiplier");
	    this.u_uv_multiplier = gl.getUniformLocation(prog, "uv_multiplier");
	    this.u_group_id = gl.getUniformLocation(prog, "group_id");
	    this.u_mesh_id = gl.getUniformLocation(prog, "mesh_id");
	    gl.uniform1f(this.u_shape_multiplier, this.shape_multiplier);
	    gl.uniform1f(this.u_uv_multiplier, this.uv_multiplier);
	    this.u_inv_model_view_matrix = gl.getUniformLocation(prog, var_inv_model_view_matrix);
	    this.u_var_object_matrix = gl.getUniformLocation(prog, var_inv_object_matrix);
	    this.u_var_inv_object_matrix = gl.getUniformLocation(prog, var_inv_object_matrix);
	    this.u_color = gl.getUniformLocation(prog, var_color);
	    this.u_fb_size = gl.getUniformLocation(prog, "fb_size");
	    this.u_strand = gl.getUniformLocation(prog, var_strand);
	    this.u_shapef = [];
	    for (i = q = 0, ref5 = num_shapes; 0 <= ref5 ? q < ref5 : q > ref5; i = 0 <= ref5 ? ++q : --q) {
	      this.u_shapef[i] = gl.getUniformLocation(prog, "shapef[" + i + "]");
	    }
	    this.u_bones = [];
	    for (i = r = 0, ref6 = this.num_bone_uniforms; 0 <= ref6 ? r < ref6 : r > ref6; i = 0 <= ref6 ? ++r : --r) {
	      this.u_bones[i] = gl.getUniformLocation(prog, "bones[" + i + "]");
	    }
	    this.u_custom = [];
	    for (s = 0, len2 = var_custom.length; s < len2; s++) {
	      v = var_custom[s];
	      this.u_custom.push(gl.getUniformLocation(prog, v));
	    }
	    fb = this.context.render_manager.common_filter_fb;
	    if (fb && (this.u_fb_size != null)) {
	      gl.uniform2f(this.u_fb_size, fb.size_x, fb.size_y);
	    }
	    this.a_vertex = gl.getAttribLocation(prog, "vertex");
	    gl.enableVertexAttribArray(this.a_vertex);
	    for (a_name in this.attrib_locs) {
	      a = gl.getAttribLocation(prog, a_name) | 0;
	      this.attrib_locs[a_name] = a;
	    }
	    for (i = t = 0, ref7 = tex_uniforms.length; 0 <= ref7 ? t < ref7 : t > ref7; i = 0 <= ref7 ? ++t : --t) {
	      gl.uniform1i(gl.getUniformLocation(prog, tex_uniforms[i]), i);
	    }
	    for (i in lamps) {
	      lamp_data = lamps[i];
	      this.lamps.push([this.scene.objects[i], gl.getUniformLocation(prog, lamp_data.varpos), gl.getUniformLocation(prog, lamp_data.varcolor3), gl.getUniformLocation(prog, lamp_data.varcolor4), gl.getUniformLocation(prog, lamp_data.dist), gl.getUniformLocation(prog, lamp_data.vardir), gl.getUniformLocation(prog, lamp_data.varmat), gl.getUniformLocation(prog, lamp_data.varenergy)]);
	    }
	    this._program = prog;
	  }
	
	  Material.prototype.use = function() {
	    var prog;
	    prog = this._program;
	    if (_active_program !== prog) {
	      this.context.render_manager.gl.useProgram(prog);
	    }
	    return prog;
	  };
	
	  Material.prototype.reupload = function() {
	    return this.constructor(this.name, this.fs_code, this.uniforms_config, this.attributes_config, this.vs_code, this.scene);
	  };
	
	  Material.prototype.destroy = function() {
	    return this.context.render_manager.gl.deleteProgram(this._program);
	  };
	
	  Material.prototype.debug_set_uniform = function(utype, uname, value) {
	    var loc;
	    this.context.render_manager.gl.useProgram(this._program);
	    loc = this.context.render_manager.gl.getUniformLocation(this._program, uname);
	    return this.context.render_manager.gl['uniform' + utype](loc, value);
	  };
	
	  Material.prototype.debug_set_custom_uniform = function(utype, index, value) {
	    this.context.render_manager.gl.useProgram(this._program);
	    return this.context.render_manager.gl['uniform' + utype](this.u_custom[index], value);
	  };
	
	  Material.prototype.clone_to_scene = function(scene) {
	    var cloned, dest_scene_lamps, dlamp, j, k, l, lamps, len, len1, ref1;
	    dest_scene_lamps = scene.lamps.slice(0);
	    cloned = scene.materials[this.name] = Object.create(this);
	    lamps = cloned.lamps = [];
	    ref1 = this.lamps;
	    for (j = 0, len = ref1.length; j < len; j++) {
	      l = ref1[j];
	      l = l.slice(0);
	      if (l[0]) {
	        for (k = 0, len1 = dest_scene_lamps.length; k < len1; k++) {
	          dlamp = dest_scene_lamps[k];
	          if (dlamp.lamp_type === l[0].lamp_type) {
	            l[0] = dlamp;
	            dest_scene_lamps.remove(dlamp);
	            break;
	          }
	        }
	      }
	      lamps.push(l);
	    }
	    return cloned;
	  };
	
	  return Material;
	
	})();
	
	module.exports = {
	  load_material: load_material,
	  load_textures_of_material: load_textures_of_material,
	  Material: Material
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var Filter, Framebuffer, MainFramebuffer,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	Filter = __webpack_require__(18).Filter;
	
	Framebuffer = (function() {
	  function Framebuffer(render_manager, size_x, size_y, tex_type, tex_format) {
	    var fb, gl, internal_format, rb, tex;
	    this.render_manager = render_manager;
	    if (tex_type == null) {
	      tex_type = this.render_manager.gl.FLOAT;
	    }
	    if (tex_format == null) {
	      tex_format = this.render_manager.gl.RGBA;
	    }
	    this.context = this.render_manager.context;
	    gl = this.render_manager.gl;
	    this.size_x = size_x;
	    this.size_y = size_y;
	    this.texture = tex = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, tex);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    this.tex_type = tex_type;
	    internal_format = this.tex_format = tex_format;
	    if (tex_type == null) {
	      tex_type = this.render_manager.gl.FLOAT;
	    }
	    if (tex_format == null) {
	      tex_format = this.render_manager.gl.RGBA;
	    }
	    if (tex_type === this.render_manager.gl.FLOAT) {
	      if (!this.render_manager.extensions['texture_float']) {
	        tex_type === this.render_manager.gl.UNSIGNED_BYTE;
	      } else if (this.context.MYOU_PARAMS.nodejs) {
	        internal_format = 0x8814;
	      }
	    }
	    gl.texImage2D(gl.TEXTURE_2D, 0, internal_format, size_x, size_y, 0, tex_format, tex_type, null);
	    this.render_buffer = rb = gl.createRenderbuffer();
	    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
	    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size_x, size_y);
	    this.framebuffer = fb = gl.createFramebuffer();
	    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
	    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
	    gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	  }
	
	  Framebuffer.prototype.recreate = function() {
	    if (this.framebuffer) {
	      return this.constructor(this.size_x, this.size_y, this.tex_type, this.tex_format);
	    }
	  };
	
	  Framebuffer.prototype.enable = function(rect) {
	    var left, size_x, size_y, top;
	    if (rect == null) {
	      rect = null;
	    }
	    if (rect == null) {
	      left = top = 0;
	      size_x = this.size_x;
	      size_y = this.size_y;
	    } else {
	      left = rect[0];
	      top = rect[1];
	      size_x = rect[2];
	      size_y = rect[3];
	    }
	    this.current_size_x = size_x;
	    this.current_size_y = size_y;
	    this.render_manager.gl.bindFramebuffer(this.render_manager.gl.FRAMEBUFFER, this.framebuffer);
	    this.render_manager.gl.viewport(left, top, size_x, size_y);
	    return Framebuffer.active_rect = [left, top, size_x, size_y];
	  };
	
	  Framebuffer.prototype.disable = function() {
	    return this.render_manager.gl.bindFramebuffer(this.render_manager.gl.FRAMEBUFFER, null);
	  };
	
	  Framebuffer.prototype.draw_with_filter = function(filter, src_rect) {
	    var gl, l, prog;
	    prog = filter.use();
	    gl = this.render_manager.gl;
	    gl.uniform2f(gl.getUniformLocation(prog, 'src_size'), this.size_x, this.size_y);
	    l = gl.getUniformLocation(prog, 'src_rect');
	    if (l && l._ !== -1) {
	      gl.uniform4f(l, src_rect[0], src_rect[1], src_rect[2], src_rect[3]);
	    }
	    l = gl.getUniformLocation(prog, 'dst_rect');
	    if (l && l._ !== -1) {
	      gl.uniform4fv(l, Framebuffer.active_rect);
	    }
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.render_manager.quad);
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, this.texture);
	    this.render_manager.change_enabled_attributes(1 << filter.a_vertex);
	    gl.vertexAttribPointer(filter.a_vertex, 3.0, gl.FLOAT, false, 0, 0);
	    return gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	  };
	
	  Framebuffer.prototype.destroy = function() {
	    this.render_manager.gl.deleteRenderbuffer(this.render_buffer);
	    return this.render_manager.gl.deleteFramebuffer(this.framebuffer);
	  };
	
	  return Framebuffer;
	
	})();
	
	MainFramebuffer = (function(superClass) {
	  extend(MainFramebuffer, superClass);
	
	  function MainFramebuffer(render_manager) {
	    this.render_manager = render_manager;
	    this.framebuffer = null;
	  }
	
	  return MainFramebuffer;
	
	})(Framebuffer);
	
	module.exports = {
	  Framebuffer: Framebuffer,
	  MainFramebuffer: MainFramebuffer
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var GL_BYTE, GL_FLOAT, GL_INT, GL_SHORT, GL_TRIANGLES, GL_UNSIGNED_BYTE, GL_UNSIGNED_INT, GL_UNSIGNED_SHORT, GameObject, Mesh, MeshData, load_material, load_textures_of_material, mat2, mat3, mat4, mesh_datas, quat, ref, ref1, vec2, vec3, vec4,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	GameObject = __webpack_require__(22).GameObject;
	
	ref1 = __webpack_require__(19), load_material = ref1.load_material, load_textures_of_material = ref1.load_textures_of_material;
	
	GL_TRIANGLES = 4;
	
	GL_BYTE = 0x1400;
	
	GL_UNSIGNED_BYTE = 0x1401;
	
	GL_SHORT = 0x1402;
	
	GL_UNSIGNED_SHORT = 0x1403;
	
	GL_INT = 0x1404;
	
	GL_UNSIGNED_INT = 0x1405;
	
	GL_FLOAT = 0x1406;
	
	mesh_datas = {};
	
	MeshData = (function() {
	  function MeshData(context) {
	    this.context = context;
	    this.type = 'MESH';
	    this.users = [];
	    this.hash = '';
	    this.varray = null;
	    this.iarray = null;
	    this.vertex_buffers = [];
	    this.index_buffers = [];
	    this.num_indices = [];
	    this.attrib_pointers = [];
	    this.attrib_bitmasks = [];
	    this.stride = 0;
	    this.draw_method = GL_TRIANGLES;
	    this.phy_convex_hull = null;
	    this.phy_mesh = null;
	  }
	
	  MeshData.prototype.reupload = function() {
	    var j, len, new_data, ref2, u;
	    if (this.users[0]) {
	      new_data = this.users[0].load_from_va_ia(this.varray, this.iarray);
	      ref2 = this.users;
	      for (j = 0, len = ref2.length; j < len; j++) {
	        u = ref2[j];
	        u.data.remove(u);
	        u.data = new_data;
	        u.configure_materials();
	      }
	    }
	  };
	
	  MeshData.prototype.remove = function(ob) {
	    this.users.remove(ob.data);
	    if (this.users.length === 0) {
	      return delete this.context.meshes[this.hash];
	    }
	  };
	
	  return MeshData;
	
	})();
	
	Mesh = (function(superClass) {
	  extend(Mesh, superClass);
	
	  function Mesh(context) {
	    this.context = context;
	    Mesh.__super__.constructor.call(this, this.context);
	    this.type = 'MESH';
	    this.data = null;
	    this.materials = [];
	    this.material_names = [];
	    this.passes = [0];
	    this.shapes = {};
	    this._shape_names = [];
	    this.armature = null;
	    this.sort_dot = 0;
	    this.custom_uniform_values = [];
	    this.active_mesh_index = 0;
	    this.altmeshes = [];
	    this.last_lod_object = null;
	    this.culled_in_last_frame = false;
	    this.hash = '';
	    this.elements = [];
	    this.offsets = [];
	    this.stride = 0;
	    this.mesh_id = 0;
	    this.all_f = false;
	    this.mesh_name = '';
	  }
	
	  Mesh.prototype.load_from_arraybuffer = function(data) {
	    var ia, ilen, offset, va, vlen;
	    vlen = this.offsets[this.offsets.length - 2];
	    ilen = this.offsets[this.offsets.length - 1];
	    offset = this.pack_offset || 0;
	    va = new Float32Array(data, offset, vlen);
	    ia = new Uint16Array(data, offset + vlen * 4, ilen);
	    return this.load_from_va_ia(va, ia);
	  };
	
	  Mesh.prototype.load_from_lists = function(vertices, indices) {
	    this.offsets = [0, 0, vertices.length, indices.length];
	    return this.load_from_va_ia(new Float32Array(vertices), new Uint16Array(indices));
	  };
	
	  Mesh.prototype.load_from_va_ia = function(va, ia) {
	    var bytes, data, gl, i, i2, ib, j, k, l, len, len1, m, mat, matname, mesh_id, num_submeshes, offsets, ref2, ref3, ref4, ref5, vb;
	    if (this.data != null) {
	      this.data.remove(this);
	    }
	    data = this.data = mesh_datas[this.hash] = new MeshData(this.context);
	    data.hash = this.hash;
	    data.users.push(this);
	    data.varray = va;
	    data.iarray = ia;
	    if (this.mesh_id) {
	      mesh_id = this.mesh_id | 0;
	      bytes = new Uint8Array(va.buffer, va.byteOffset, va.byteLength);
	      if (bytes[15] !== mesh_id) {
	        i = 0;
	        while (i < bytes.length) {
	          bytes[i] = mesh_id;
	          i += this.stride;
	        }
	      }
	    }
	    offsets = this.offsets;
	    num_submeshes = (offsets.length / 2) - 1;
	    gl = this.context.render_manager.gl;
	    for (i = j = 0, ref2 = num_submeshes; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
	      i2 = i * 2;
	      vb = gl.createBuffer();
	      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
	      gl.bufferData(gl.ARRAY_BUFFER, va.subarray(offsets[i2], offsets[i2 + 2]), gl.STATIC_DRAW);
	      data.vertex_buffers.push(vb);
	      ib = gl.createBuffer();
	      if (offsets[i2 + 1] !== offsets[i2 + 3]) {
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
	        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ia.subarray(offsets[i2 + 1], offsets[i2 + 3]), gl.STATIC_DRAW);
	      } else {
	        pass;
	      }
	      ref3 = this.altmeshes;
	      for (k = 0, len = ref3.length; k < len; k++) {
	        m = ref3[k];
	        pass;
	      }
	      data.index_buffers.push(ib);
	      data.num_indices.push(offsets[i2 + 3] - offsets[i2 + 1]);
	    }
	    data.stride = this.stride;
	    if (this.scene) {
	      if (this.materials.length !== 0) {
	        this.configure_materials();
	      } else if (!(this.scene.enabled && this.scene.loaded)) {
	        ref4 = this.material_names;
	        for (l = 0, len1 = ref4.length; l < len1; l++) {
	          matname = ref4[l];
	          mat = this.scene.unloaded_material_data[matname];
	          if (mat) {
	            load_textures_of_material(this.scene, mat);
	          }
	        }
	      }
	    }
	    if (this.scene && this.scene.world) {
	      this.instance_physics();
	    }
	    if ((ref5 = this.context.main_loop) != null) {
	      ref5.reset_timeout();
	    }
	    return data;
	  };
	
	  Mesh.prototype.update_iarray = function() {
	    var gl, i, i2, ia, j, num_submeshes, offsets, ref2;
	    if (!this.data) {
	      return;
	    }
	    offsets = this.offsets;
	    num_submeshes = offsets.length / 2 - 1;
	    ia = this.data.iarray;
	    gl = this.context.render_manager.gl;
	    for (i = j = 0, ref2 = num_submeshes; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
	      i2 = i * 2;
	      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.data.index_buffers[i]);
	      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ia.subarray(offsets[i2 + 1], offsets[i2 + 3]), gl.STATIC_DRAW);
	    }
	  };
	
	  Mesh.prototype.configure_materials = function(materials) {
	    var a_normal, attr, attrib_bitmasks, attrib_pointers, attribs, bitmask, color, cuv, data, e, etype, gl_float_byte, gl_float_unsigned_byte, i, j, k, l, len, len1, len10, len11, len2, len3, len4, len5, len6, len7, len8, len9, m, mat, mi, mname, n, num_values, o, o_b_indices, o_colors, o_particles, o_shapes, o_shapes_b, o_tangent, o_uvs, o_uvs_s, o_weights, p, q, r, ref2, ref3, ref4, ref5, ref6, ref7, s, scene, stride, t, uv, v, varname, w, x, y, z;
	    if (materials == null) {
	      materials = [];
	    }
	    if (materials.length === 0) {
	      if ((this.context.render_manager.frame_start + 3000) < performance.now()) {
	        return false;
	      }
	      scene = this.scene;
	      ref2 = this.material_names;
	      for (j = 0, len = ref2.length; j < len; j++) {
	        mname = ref2[j];
	        if (mname === 'UNDEFINED_MATERIAL') {
	          console.warn('Mesh ' + this.name + ' has undefined material');
	        }
	        if (scene) {
	          data = scene.unloaded_material_data[mname];
	          if (data) {
	            load_material(scene, data);
	            delete scene.unloaded_material_data[mname];
	          }
	        }
	        mat = scene.materials[mname];
	        if (mat) {
	          materials.push(mat);
	        } else {
	          return true;
	        }
	      }
	    }
	    for (k = 0, len1 = materials.length; k < len1; k++) {
	      m = materials[k];
	      m.users.remove(this);
	      m.users.push(this);
	    }
	    this.materials = materials;
	    this._shape_names = [];
	    o_shapes = [];
	    o_shapes_b = [];
	    o_tangent = [];
	    o_particles = [];
	    o_uvs = [];
	    o_uvs_s = [];
	    o_colors = [];
	    o_weights = 0;
	    o_b_indices = 0;
	    stride = 3 * 4;
	    ref3 = this.elements;
	    for (l = 0, len2 = ref3.length; l < len2; l++) {
	      e = ref3[l];
	      etype = e[0];
	      if (etype === 'normal') {
	        stride += this.all_f ? 3 * 4 : 4;
	      } else if (etype === 'shape') {
	        o_shapes.push(stride);
	        this.shapes[e[1]] = 0;
	        this._shape_names.push(e[1]);
	        stride += 4 * 4;
	      } else if (etype === 'shape_b') {
	        o_shapes_b.push(stride);
	        this.shapes[e[1]] = 0;
	        this._shape_names.push(e[1]);
	        stride += 2 * 4;
	      } else if (etype === 'tangent') {
	        o_tangent.push(stride);
	        stride += this.all_f ? 4 * 4 : 4;
	      } else if (etype === 'particles') {
	        for (i = n = 0, ref4 = e[1]; 0 <= ref4 ? n < ref4 : n > ref4; i = 0 <= ref4 ? ++n : --n) {
	          o_particles.push(stride);
	          stride += 3 * 4;
	        }
	      } else if (etype === 'uv') {
	        o_uvs.push([e[1], stride]);
	        stride += 2 * 4;
	      } else if (etype === 'uv_s') {
	        o_uvs_s.push([e[1], stride]);
	        stride += 2 * 2;
	      } else if (etype === 'color') {
	        o_colors.push([e[1], stride]);
	        stride += 4;
	      } else if (etype === 'weights') {
	        this.armature = this.parent;
	        o_weights = stride;
	        stride += 4 * 4;
	        o_b_indices = stride;
	        stride += this.all_f ? 4 * 4 : 4;
	      } else {
	        print("Unknown element" + etype);
	      }
	    }
	    if (o_uvs.length) {
	      o_uvs.push(['0', o_uvs[0][1]]);
	    }
	    if (o_colors.length) {
	      o_colors.push(['0', o_colors[0][1]]);
	    }
	    attrib_pointers = [];
	    attrib_bitmasks = [];
	    mi = 0;
	    for (p = 0, len3 = materials.length; p < len3; p++) {
	      mat = materials[p];
	      attribs = [[mat.a_vertex, 3, GL_FLOAT, 0]];
	      a_normal = mat.attrib_locs["vnormal"];
	      gl_float_byte = this.all_f ? GL_FLOAT : GL_BYTE;
	      gl_float_unsigned_byte = this.all_f ? GL_FLOAT : GL_UNSIGNED_BYTE;
	      if (a_normal !== -1) {
	        attribs.push([a_normal, 3, gl_float_byte, 12]);
	      }
	      i = 0;
	      for (q = 0, len4 = o_shapes.length; q < len4; q++) {
	        o = o_shapes[q];
	        attribs.push([mat.attrib_locs["shape" + i], 3, GL_FLOAT, o]);
	        attribs.push([mat.attrib_locs["shapenor" + i], 3, GL_BYTE, o + 12]);
	        i += 1;
	      }
	      for (r = 0, len5 = o_shapes_b.length; r < len5; r++) {
	        o = o_shapes_b[r];
	        attribs.push([mat.attrib_locs["shape" + i], 3, GL_BYTE, o]);
	        attribs.push([mat.attrib_locs["shapenor" + i], 3, GL_BYTE, o + 4]);
	        i += 1;
	      }
	      if (o_tangent.length && mat.attrib_locs["tangent"]) {
	        attribs.push([mat.attrib_locs["tangent"], 4, gl_float_byte, o_tangent]);
	      }
	      i = 0;
	      for (s = 0, len6 = o_particles.length; s < len6; s++) {
	        o = o_particles[s];
	        attribs.push([mat.attrib_locs["particle" + i], 3, GL_FLOAT, o]);
	        i += 1;
	      }
	      for (t = 0, len7 = o_uvs.length; t < len7; t++) {
	        uv = o_uvs[t];
	        varname = mat.uv_layer_attribs[uv[0]];
	        if (varname) {
	          attribs.push([mat.attrib_locs[varname], 2, GL_FLOAT, uv[1]]);
	        }
	      }
	      for (v = 0, len8 = o_uvs_s.length; v < len8; v++) {
	        uv = o_uvs_s[v];
	        varname = mat.uv_layer_attribs[uv[0]];
	        if (varname) {
	          attribs.push([mat.attrib_locs[varname], 2, GL_UNSIGNED_SHORT, uv[1]]);
	        }
	      }
	      for (w = 0, len9 = o_colors.length; w < len9; w++) {
	        color = o_colors[w];
	        varname = mat.color_attribs[color[0]];
	        if (varname) {
	          attribs.push([mat.attrib_locs[varname], 4, GL_UNSIGNED_BYTE, color[1]]);
	        }
	      }
	      if (this.armature) {
	        attribs.push([mat.attrib_locs['weights'], 4, GL_FLOAT, o_weights]);
	        attribs.push([mat.attrib_locs['b_indices'], 4, gl_float_unsigned_byte, o_b_indices]);
	      }
	      bitmask = 0;
	      ref5 = reversed(attribs);
	      for (x = 0, len10 = ref5.length; x < len10; x++) {
	        attr = ref5[x];
	        if (attr[0] !== -1) {
	          bitmask |= 1 << attr[0];
	        } else {
	          attribs.pop(attribs.indexOf(attr));
	        }
	      }
	      attrib_pointers.push(attribs);
	      attrib_bitmasks.push(bitmask);
	      mi += 1;
	    }
	    this.data.attrib_pointers = attrib_pointers;
	    this.data.attrib_bitmasks = attrib_bitmasks;
	    num_values = 0;
	    ref6 = this.materials;
	    for (y = 0, len11 = ref6.length; y < len11; y++) {
	      m = ref6[y];
	      num_values = Math.max(num_values, m.u_custom.length);
	    }
	    if (this.custom_uniform_values.length === 0) {
	      this.custom_uniform_values = cuv = [];
	      for (i = z = 0, ref7 = num_values; 0 <= ref7 ? z < ref7 : z > ref7; i = 0 <= ref7 ? ++z : --z) {
	        cuv.push(null);
	      }
	    }
	    return true;
	  };
	
	  return Mesh;
	
	})(GameObject);
	
	module.exports = {
	  Mesh: Mesh
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var Animation, BoxShape, CapsuleShape, CharacterBody, CompoundShape, ConvexShape, CylinderShape, GameObject, MIRROR_X, MIRROR_XY, MIRROR_XYZ, MIRROR_XZ, MIRROR_Y, MIRROR_YZ, MIRROR_Z, NO_MIRROR, RigidBody, STransform, SphereShape, StaticBody, TriangleMeshShape, add_body, add_child_shape, allow_sleeping, get_convex_hull_edges, make_ghost, mat2, mat3, mat4, quat, ref, ref1, remove_body, set_angular_factor, set_linear_factor, update_ob_physics, vec2, vec3, vec4;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	Animation = __webpack_require__(23).Animation;
	
	ref1 = __webpack_require__(24), update_ob_physics = ref1.update_ob_physics, BoxShape = ref1.BoxShape, SphereShape = ref1.SphereShape, CylinderShape = ref1.CylinderShape, CapsuleShape = ref1.CapsuleShape, ConvexShape = ref1.ConvexShape, TriangleMeshShape = ref1.TriangleMeshShape, CompoundShape = ref1.CompoundShape, get_convex_hull_edges = ref1.get_convex_hull_edges, add_child_shape = ref1.add_child_shape, RigidBody = ref1.RigidBody, StaticBody = ref1.StaticBody, CharacterBody = ref1.CharacterBody, add_body = ref1.add_body, remove_body = ref1.remove_body, allow_sleeping = ref1.allow_sleeping, make_ghost = ref1.make_ghost, set_linear_factor = ref1.set_linear_factor, set_angular_factor = ref1.set_angular_factor;
	
	NO_MIRROR = 1;
	
	MIRROR_X = 2;
	
	MIRROR_Y = 4;
	
	MIRROR_Z = 8;
	
	MIRROR_XY = 16;
	
	MIRROR_XZ = 32;
	
	MIRROR_YZ = 64;
	
	MIRROR_XYZ = 128;
	
	GameObject = (function() {
	  function GameObject(context) {
	    this.context = context;
	    this.use_physics = false;
	    this.debug = false;
	    if (this.context != null) {
	      this.use_physics = this.context.MYOU_PARAMS.load_physics_engine;
	    }
	    this.position = vec3.create();
	    this.rotation = quat.create();
	    this.radius = 0;
	    this.rotation_order = 'Q';
	    this.scale = vec3.set(vec3.create(), 1, 1, 1);
	    this.dimensions = vec3.create();
	    this.color = vec4.set(vec4.create(), 1, 1, 1, 1);
	    this.alpha = 1;
	    this.offset_scale = vec3.set(vec3.create(), 1, 1, 1);
	    this.scene = null;
	    this.dupli_group = null;
	    this.visible = true;
	    this._world_position = vec3.create();
	    this._sqdist = 0;
	    this.parent = null;
	    this.children = [];
	    this["static"] = false;
	    this.world_matrix = mat4.create();
	    this.rotation_matrix = mat3.create();
	    this.normal_matrix = mat3.create();
	    this.custom_uniform_values = [];
	    this.properties = {};
	    this.animations = {};
	    this.name = null;
	    this.original_name = null;
	    this.mirrors = 1;
	    this.lod_objects = [];
	    this.parent_bone_index = -1;
	    this.body = null;
	    this.shape = null;
	    this.physics_type = 'NO_COLLISION';
	    if (this.use_physics) {
	      this.physical_radius = 1;
	      this.anisotropic_friction = false;
	      this.friction_coefficients = vec3.set(vec3.create(), 1, 1, 1);
	      this.collision_group = 1;
	      this.collision_mask = 255;
	      this.collision_shape = null;
	      this.collision_margin = 0;
	      this.collision_compound = false;
	      this.mass = 0;
	      this.no_sleeping = false;
	      this.is_ghost = false;
	      this.linear_factor = vec3.set(vec3.create(), 1, 1, 1);
	      this.angular_factor = vec3.set(vec3.create(), 1, 1, 1);
	      this.form_factor = 0.4;
	      this.friction = 0.5;
	      this.elasticity = 0;
	      this.phy_mesh = null;
	      this.phy_he = vec3.create();
	      this.phy_debug_mesh = null;
	      this.phy_debug_hull = null;
	      this._use_visual_mesh = false;
	      this.step_height = 0.15;
	      this.jump_force = 10;
	      this.max_fall_speed = 55;
	      this.last_position = vec3.create();
	    }
	    this.actions = [];
	    this.particle_systems = null;
	  }
	
	  GameObject.prototype.instance_physics = function(use_visual_mesh) {
	    var body, comp, data, dim, has_collision, he, inv, is_hull, is_tmesh, mass, ob, p, parent, parent_posrot, pos, posrot, radius, rot, scale, shape, va_ia;
	    if (use_visual_mesh == null) {
	      use_visual_mesh = false;
	    }
	    if (this.visible_mesh) {
	      this.visible_mesh.instance_physics();
	      return;
	    }
	    if (this.body) {
	      remove_body(this.scene.world, this.body);
	      this.scene.rigid_bodies.remove(this);
	      this.scene.static_ghosts.remove(this);
	      this.body = null;
	      this.phy_debug_mesh = null;
	    }
	    mass = this.mass;
	    shape = null;
	    has_collision = this.physics_type !== 'NO_COLLISION';
	    if (has_collision) {
	      if (!this.scene.world) {
	        return;
	      }
	      is_hull = this.collision_shape === 'CONVEX_HULL';
	      is_tmesh = this.collision_shape === 'TRIANGLE_MESH';
	      he = this.phy_he;
	      dim = this.dimensions;
	      if (dim[0] === 0 && dim[1] === 0 && dim[2] === 0) {
	        he = vec3.scale(he, this.scale, this.physical_radius);
	      } else {
	        vec3.scale(he, dim, 0.5);
	      }
	      if (this.collision_shape === 'BOX') {
	        shape = new BoxShape(he[0], he[1], he[2], this.collision_margin);
	        this.phy_debug_mesh = this.context.render_manager.debug.box;
	      } else if (this.collision_shape === 'SPHERE') {
	        radius = Math.max(he[0], he[1], he[2]);
	        he = [radius, radius, radius];
	        shape = new SphereShape(radius, this.collision_margin);
	        this.phy_debug_mesh = this.context.render_manager.debug.sphere;
	      } else if (this.collision_shape === 'CYLINDER') {
	        radius = Math.max(he[0], he[1]);
	        he = [radius, radius, he[2]];
	        shape = new CylinderShape(radius, he[2], this.collision_margin);
	        this.phy_debug_mesh = this.context.render_manager.debug.cylinder;
	      } else if (this.collision_shape === 'CAPSULE') {
	        radius = Math.max(he[0], he[1]);
	        he = [radius, radius, he[2]];
	        shape = new CapsuleShape(radius, he[2], this.collision_margin);
	        this.phy_debug_mesh = this.context.render_manager.debug.cylinder;
	      } else if (is_hull || is_tmesh) {
	        if (this.physics_mesh) {
	          if (use_visual_mesh) {
	            ob = this;
	          } else {
	            ob = this.physics_mesh;
	          }
	        } else {
	          use_visual_mesh = true;
	          ob = this;
	        }
	        data = ob.data;
	        if (!data) {
	          if (this.visible) {
	            this.scene.loader.load_mesh_data(ob);
	          }
	          return;
	        }
	        if (is_hull) {
	          shape = data.phy_convex_hull;
	        } else {
	          shape = data.phy_mesh;
	          if (this.mirrors & 2) {
	            shape = data.phy_mesh_mx;
	          }
	        }
	        if (shape && (!use_visual_mesh) !== (!this._use_visual_mesh)) {
	          shape.mesh && destroy(shape.mesh);
	          destroy(shape);
	          shape = null;
	        }
	        this._use_visual_mesh = use_visual_mesh;
	        if (!shape) {
	          scale = vec3.clone(this.scale);
	          while (p) {
	            vec3.scale(scale, scale, p.scale[2]);
	            p = p.parent;
	          }
	          if (this.mirrors & 2) {
	            scale[0] = -scale[0];
	          }
	          if (is_hull) {
	            shape = new ConvexShape(data.varray, ob.stride / 4, this.scale, this.collision_margin);
	            data.phy_convex_hull = shape;
	            if (this.debug && !this.phy_debug_hull) {
	              va_ia = get_convex_hull_edges(data.varray, ob.stride / 4, scale);
	              this.phy_debug_hull = this.context.render_manager.debug.debug_mesh_from_va_ia(va_ia[0], va_ia[1]);
	            }
	            this.phy_debug_mesh = this.phy_debug_hull;
	          } else {
	            shape = TriangleMeshShape(data.varray, data.iarray.subarray(0, ob.offsets[2]), ob.stride / 4, scale, this.collision_margin, this.name);
	            if (this.mirrors & 2) {
	              data.phy_mesh_mx = shape;
	            } else {
	              data.phy_mesh = shape;
	            }
	          }
	        }
	        vec3.copy(he, this.scale);
	      } else {
	        print("Warning: Unknown shape", this.collision_shape);
	      }
	      if (this.collision_compound && shape) {
	        if (this.parent && this.parent.collision_compound) {
	          parent = this.parent;
	          while (parent.parent && parent.parent.collision_compound) {
	            parent = parent.parent;
	          }
	          posrot = this.get_world_pos_rot();
	          pos = posrot[0];
	          rot = posrot[1];
	          parent_posrot = parent.get_world_pos_rot();
	          vec3.sub(pos, pos, parent_posrot[0]);
	          inv = quat.invert([], parent_posrot[1]);
	          vec3.transformQuat(pos, pos, inv);
	          quat.mul(rot, inv, rot);
	          comp = parent.shape;
	          add_child_shape(comp, shape, pos, rot);
	          shape = null;
	        } else {
	          comp = new CompoundShape;
	          add_child_shape(comp, shape, [0, 0, 0], [0, 0, 0, 1]);
	          shape = comp;
	        }
	      } else {
	        this.collision_compound = false;
	      }
	      if (shape) {
	        posrot = this.get_world_pos_rot();
	        pos = posrot[0];
	        if (this.mirrors & 2) {
	          pos[0] = -pos[0];
	        }
	        rot = posrot[1];
	        if (this.physics_type === 'RIGID_BODY') {
	          body = new RigidBody(mass, shape, pos, rot, this.friction, this.elasticity, this.form_factor);
	          set_linear_factor(body, this.linear_factor);
	          set_angular_factor(body, this.angular_factor);
	          this.scene.rigid_bodies.push(this);
	        } else if (this.physics_type === 'DYNAMIC') {
	          body = new RigidBody(mass, shape, pos, rot, this.friction, this.elasticity, this.form_factor);
	          set_linear_factor(body, this.linear_factor);
	          set_angular_factor(body, [0, 0, 0]);
	          this.scene.rigid_bodies.push(this);
	        } else if (this.physics_type === 'STATIC' || this.physics_type === 'SENSOR') {
	          body = new StaticBody(shape, pos, rot, this.friction, this.elasticity);
	        } else if (this.physics_type === 'CHARACTER') {
	          body = CharacterBody(shape, pos, rot, this.step_height, 2, -this.scene.world.getGravity().z() * 1, this.jump_force, this.max_fall_speed, PI_2);
	          this.scene.rigid_bodies.push(this);
	        } else {
	          print("Warning: Type not handled", this.physics_type);
	        }
	        this.shape = shape;
	      } else {
	        body = null;
	      }
	      if (body) {
	        add_body(this.scene.world, body, this.collision_group, this.collision_mask);
	        body.owner = this;
	        if (this.no_sleeping) {
	          allow_sleeping(body, false);
	        }
	        if (this.is_ghost || this.physics_type === 'SENSOR') {
	          this.scene.static_ghosts.push(this);
	          make_ghost(body, true);
	        }
	        if (this.physics_type === 'CHARACTER') {
	          this.scene.kinematic_characters.push(this);
	        }
	        update_ob_physics(this);
	      }
	      return this.body = body;
	    }
	  };
	
	  GameObject.prototype._update_matrices = function() {
	    var a, axis, axisn, bi, cosa, isx, isy, isz, j, nm, ox, oy, oz, pos, rm, scl, sina, w, wm, x, y, z;
	    rm = this.rotation_matrix;
	    if (this.rotation_order === 'Q') {
	      x = this.rotation[0];
	      y = this.rotation[1];
	      z = this.rotation[2];
	      w = this.rotation[3];
	      rm[0] = w * w + x * x - y * y - z * z;
	      rm[1] = 2 * (x * y + z * w);
	      rm[2] = 2 * (x * z - y * w);
	      rm[3] = 2 * (x * y - z * w);
	      rm[4] = w * w - x * x + y * y - z * z;
	      rm[5] = 2 * (z * y + x * w);
	      rm[6] = 2 * (x * z + y * w);
	      rm[7] = 2 * (y * z - x * w);
	      rm[8] = w * w - x * x - y * y + z * z;
	    } else {
	      for (axisn = j = 0; j < 3; axisn = ++j) {
	        axis = this.rotation_order[axisn];
	        mat3.identity(rm);
	        a = this.rotation[{
	          'X': 0,
	          'Y': 1,
	          'Z': 2
	        }[axis]];
	        cosa = Math.cos(a);
	        sina = Math.sin(a);
	        if (axis === 'X') {
	          rm[4] = cosa;
	          rm[5] = sina;
	          rm[7] = -sina;
	          rm[8] = cosa;
	        } else if (axis === 'Y') {
	          rm[0] = cosa;
	          rm[2] = -sina;
	          rm[6] = sina;
	          rm[8] = cosa;
	        } else if (axis === 'Z') {
	          rm[0] = cosa;
	          rm[1] = sina;
	          rm[3] = -sina;
	          rm[4] = cosa;
	        }
	        mat3.multiply(m, rm, m);
	      }
	    }
	    pos = this.position;
	    ox = this.offset_scale[0];
	    oy = this.offset_scale[1];
	    oz = this.offset_scale[2];
	    scl = this.scale;
	    isx = 1 / scl[0];
	    isy = 1 / scl[1];
	    isz = 1 / scl[2];
	    nm = this.normal_matrix;
	    nm[0] = rm[0] * isx;
	    nm[1] = rm[1] * isx;
	    nm[2] = rm[2] * isx;
	    nm[3] = rm[3] * isy;
	    nm[4] = rm[4] * isy;
	    nm[5] = rm[5] * isy;
	    nm[6] = rm[6] * isz;
	    nm[7] = rm[7] * isz;
	    nm[8] = rm[8] * isz;
	    wm = this.world_matrix;
	    wm[0] = rm[0] * ox * scl[0];
	    wm[1] = rm[1] * oy * scl[0];
	    wm[2] = rm[2] * oz * scl[0];
	    wm[4] = rm[3] * ox * scl[1];
	    wm[5] = rm[4] * oy * scl[1];
	    wm[6] = rm[5] * oz * scl[1];
	    wm[8] = rm[6] * ox * scl[2];
	    wm[9] = rm[7] * oy * scl[2];
	    wm[10] = rm[8] * oz * scl[2];
	    wm[12] = pos[0];
	    wm[13] = pos[1];
	    wm[14] = pos[2];
	    if (this.parent) {
	      bi = this.parent_bone_index;
	      mat3.mul(rm, this.parent.rotation_matrix, rm);
	      mat3.mul(nm, this.parent.normal_matrix, nm);
	      return mat4.mul(this.world_matrix, this.parent.world_matrix, this.world_matrix);
	    }
	  };
	
	  GameObject.prototype.calc_bounding_box = function() {
	    var dim_half;
	    this.bounding_box_low = vec4.create();
	    this.bounding_box_high = vec4.create();
	    this.bounding_box_low[3] = this.bounding_box_high[3] = 1;
	    dim_half = vec3.create();
	    vec3.scale(dim_half, this.dimensions, 0.5);
	    vec3.sub(this.bounding_box_low, this.position, dim_half);
	    return vec3.add(this.bounding_box_high, this.position, dim_half);
	  };
	
	  GameObject.prototype.get_world_position = function() {
	    var p, pos;
	    p = this.parent;
	    pos = vec3.copy(this._world_position, this.position);
	    while (p) {
	      vec3.mul(pos, pos, p.scale);
	      vec3.transformQuat(pos, pos, p.rotation);
	      vec3.add(pos, pos, p.position);
	      p = p.parent;
	    }
	    return pos;
	  };
	
	  GameObject.prototype.get_world_rotation = function() {
	    var p, rot;
	    p = this.parent;
	    rot = quat.clone(this.rotation);
	    while (p) {
	      quat.mul(rot, p.rotation, rot);
	      p = p.parent;
	    }
	    return rot;
	  };
	
	  GameObject.prototype.get_world_pos_rot = function() {
	    var p, pos, rot;
	    p = this.parent;
	    pos = vec3.clone(this.position);
	    rot = quat.clone(this.rotation);
	    while (p) {
	      vec3.mul(pos, pos, p.scale);
	      vec3.transformQuat(pos, pos, p.rotation);
	      vec3.add(pos, pos, p.position);
	      quat.mul(rot, p.rotation, rot);
	      p = p.parent;
	    }
	    return [pos, rot];
	  };
	
	  GameObject.prototype.clone = function(scene) {
	    var i, j, mat, materials, n, ref2;
	    if (scene == null) {
	      scene = this.scene;
	    }
	    n = Object.create(this);
	    n.position = vec3.clone(this.position);
	    n.rotation = vec4.clone(this.rotation);
	    n.scale = vec3.clone(this.scale);
	    n.dimensions = vec3.clone(this.dimensions);
	    n.offset_scale = vec3.clone(this.offset_scale);
	    n.world_matrix = mat4.clone(this.world_matrix);
	    n.rotation_matrix = mat3.clone(this.rotation_matrix);
	    n.normal_matrix = mat3.clone(this.normal_matrix);
	    n.color = vec4.clone(this.color);
	    n.custom_uniform_values = this.custom_uniform_values.slice(0);
	    n.properties = Object.create(this.properties);
	    n.actions = this.actions.slice(0);
	    n.passes = this.passes && this.passes.slice(0);
	    if (n.materials && scene !== this.scene) {
	      n.materials = materials = n.materials.slice(0);
	      for (i = j = 0, ref2 = materials.length; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
	        mat = materials[i] = materials[i].clone_to_scene(scene);
	      }
	    }
	    scene.add_object(n, this.name);
	    if (this.body) {
	      n.body = null;
	      n.instance_physics(this._use_visual_mesh);
	    }
	    return n;
	  };
	
	  GameObject.prototype.remove = function(recursive) {
	    return this.scene.remove_object(recursive);
	  };
	
	  GameObject.prototype.add_animation = function(anim_id, action) {
	    var anim;
	    if (Object.keys(this.animations).length === 0) {
	      this.scene.context.all_anim_objects.push(this);
	    }
	    anim = this.animations[anim_id] = new Animation;
	    anim.action = action;
	    anim.owner = this;
	    this._recalc_affected_channels();
	    return anim;
	  };
	
	  GameObject.prototype.del_animation = function(anim_id) {
	    delete this.animations[anim_id];
	    if (Object.keys(this.animations.length === 0)) {
	      this.scene.context.all_anim_objects.remove(this);
	    }
	    return this._recalc_affected_channels();
	  };
	
	  GameObject.prototype._recalc_affected_channels = function() {
	    var affected, anim, c, i, key, path, ref2;
	    affected = {};
	    i = 0;
	    ref2 = this.animations;
	    for (key in ref2) {
	      anim = ref2[key];
	      for (path in anim.action.channels) {
	        c = affected[path];
	        if (c == null) {
	          c = affected[path] = true;
	        }
	      }
	      i += 1;
	    }
	    return this.affected_anim_channels = affected;
	  };
	
	  GameObject.prototype.set_altmesh = function(index) {
	    return set_altmesh(this, index);
	  };
	
	  return GameObject;
	
	})();
	
	STransform = (function() {
	  function STransform() {
	    this.position = [0, 0, 0];
	    this.rotation = [0, 0, 0, 1];
	    this.scale = 1;
	  }
	
	  STransform.prototype.to_mat4 = function(out) {
	    var s, w, x, y, z;
	    x = this.rotation[0];
	    y = this.rotation[1];
	    z = this.rotation[2];
	    w = this.rotation[3];
	    s = this.scale;
	    out[0] = (w * w + x * x - y * y - z * z) * s;
	    out[1] = 2 * (x * y + z * w) * s;
	    out[2] = 2 * (x * z - y * w) * s;
	    out[3] = 0;
	    out[4] = 2 * (x * y - z * w) * s;
	    out[5] = (w * w - x * x + y * y - z * z) * s;
	    out[6] = 2 * (z * y + x * w) * s;
	    out[7] = 0;
	    out[8] = 2 * (x * z + y * w) * s;
	    out[9] = 2 * (y * z - x * w) * s;
	    out[10] = (w * w - x * x - y * y + z * z) * s;
	    out[11] = 0;
	    out[12] = this.position[0];
	    out[13] = this.position[1];
	    out[14] = this.position[2];
	    return out[15] = 1;
	  };
	
	  STransform.prototype.transform = function(out, other) {
	    vec3.add(out.position, other.position, out.position);
	    quat.mul(out.rotation.other.rotation, out.rotation);
	    return out.scale *= other.scale;
	  };
	
	  STransform.prototype.invert = function(out) {
	    var pos, rot, scale;
	    scale = out.scale = 1 / this.scale;
	    rot = quat.invert(out.rotation, this.rotation);
	    pos = vec3.scale(out.position, this.position, -scale);
	    return vec3.transformQuat(pos, pos, rot);
	  };
	
	  STransform.prototype.randomize = function() {
	    this.rotation = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
	    quat.normalize(this.rotation, this.rotation);
	    this.position = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
	    return this.scale = Math.random() * 2 + 0.1;
	  };
	
	  return STransform;
	
	})();
	
	module.exports = {
	  GameObject: GameObject,
	  STransform: STransform
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var Action, Animation, actions, akEq, animations, cubic_root, evaluate_all_animations, mat2, mat3, mat4, quat, ref, solve_roots, stop_all_animations, update_ob_physics, vec2, vec3, vec4;
	
	actions = {};
	
	animations = {};
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	update_ob_physics = __webpack_require__(24).update_ob_physics;
	
	Action = (function() {
	  function Action(name, channels, markers) {
	    var ch, i, l, len, len1, m, path, ref1;
	    if (markers == null) {
	      markers = {};
	    }
	    this.name = name;
	    this.channels = {};
	    this.markers = markers;
	    for (l = 0, len = channels.length; l < len; l++) {
	      ch = channels[l];
	      path = ch[0] + '.' + ch[1] + '.' + ch[2];
	      this.channels[path] = ch;
	      ref1 = ch[3];
	      for (m = 0, len1 = ref1.length; m < len1; m++) {
	        i = ref1[m];
	        if (i.length === 0) {
	          console.error('Empty channel on ' + name + ' -> ' + path);
	        }
	      }
	    }
	    return;
	  }
	
	  Action.prototype.get = function(channel_path, time) {
	    var ch, idx, l, last_x, len, ref1, ret_vec, rr, spline, v;
	    ret_vec = [];
	    ref1 = this.channels[channel_path][3];
	    for (l = 0, len = ref1.length; l < len; l++) {
	      ch = ref1[l];
	      last_x = ch[ch.length - 4];
	      if (time > last_x) {
	        ret_vec.push(ch[ch.length - 3]);
	      } else if (time <= ch[2]) {
	        ret_vec.push(ch[3]);
	      } else {
	        idx = 2;
	        while (ch[idx] < time) {
	          idx += 6;
	        }
	        spline = ch.slice(idx - 6, idx + 2);
	        rr = solve_roots(time, spline[0], spline[2], spline[4], spline[6]);
	        rr = Math.max(0, Math.min(1, rr));
	        v = interpolate(rr, spline[1], spline[3], spline[5], spline[7]);
	        ret_vec.push(v);
	      }
	    }
	    return ret_vec;
	  };
	
	  return Action;
	
	})();
	
	Animation = (function() {
	  function Animation() {}
	
	  Animation.prototype.action = null;
	
	  Animation.prototype.speed = 0;
	
	  Animation.prototype.pos = 0;
	
	  Animation.prototype.weight = 1;
	
	  Animation.prototype.factor = 1;
	
	  Animation.prototype.blendin_total = 0;
	
	  Animation.prototype.blendout_total = 0;
	
	  Animation.prototype.blendin_remaining = 0;
	
	  Animation.prototype.blendout_remaining = 0;
	
	  Animation.prototype.owner = null;
	
	  return Animation;
	
	})();
	
	evaluate_all_animations = function(context, frame_duration_ms) {
	  var anim, anim_id, blend, blended, bo_r, chan, frame_factor, i, j, k, l, len, len1, m, n, name, o, ob, orig_chan, p, path, prop, r, ref1, ref2, ref3, ref4, ref5, s, target, type, v, w, weight, wi, wo;
	  frame_factor = frame_duration_ms * 0.06;
	  ref1 = context.all_anim_objects;
	  for (l = 0, len = ref1.length; l < len; l++) {
	    ob = ref1[l];
	    blended = [];
	    for (path in ob.affected_anim_channels) {
	      blend = null;
	      weight = 0;
	      type = name = prop = '';
	      ref2 = ob.animations;
	      for (k in ref2) {
	        anim = ref2[k];
	        orig_chan = anim.action.channels[path];
	        if (!orig_chan) {
	          continue;
	        }
	        v = anim.action.get(path, anim.pos);
	        w = anim.weight * anim.factor;
	        for (i = m = 0, ref3 = v.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
	          v[i] *= w;
	        }
	        if (blend == null) {
	          blend = v;
	          type = orig_chan[0];
	          name = orig_chan[1];
	          prop = orig_chan[2];
	        } else {
	          for (i = n = 0, ref4 = blend.length; 0 <= ref4 ? n < ref4 : n > ref4; i = 0 <= ref4 ? ++n : --n) {
	            blend[i] += v[i];
	          }
	        }
	        weight += w;
	      }
	      blended.push([type, name, prop, blend, weight]);
	    }
	    for (o = 0, len1 = blended.length; o < len1; o++) {
	      chan = blended[o];
	      type = chan[0];
	      name = chan[1];
	      prop = chan[2];
	      if (type === 'object') {
	        target = ob;
	      } else if (type === 'pose') {
	        target = ob.bones[name];
	      } else if (type === 'shape') {
	        target = ob.shapes;
	        prop = name;
	      } else {
	        console.log("Unknown channel type:", type);
	      }
	      v = chan[3];
	      wi = Math.max(1 - chan[4], 0);
	      wo = 1 / Math.max(chan[4], 1);
	      if (v.length === 1) {
	        v = v[0];
	        target[prop] = (target[prop] * wi) + v * wo;
	      } else {
	        p = target[prop];
	        for (j = r = 0, ref5 = v.length; 0 <= ref5 ? r < ref5 : r > ref5; j = 0 <= ref5 ? ++r : --r) {
	          p[j] = p[j] * wi + v[j] * wo;
	        }
	        if (prop === 'rotation') {
	          quat.normalize(p, p);
	        }
	      }
	      i += 1;
	    }
	    for (anim_id in ob.animations) {
	      anim = ob.animations[anim_id];
	      s = anim.speed * frame_factor;
	      anim.pos += s;
	      if (s === 0) {
	        continue;
	      }
	      bo_r = anim.blendout_remaining;
	      if (bo_r > 0) {
	        bo_r -= frame_factor;
	        if (bo_r <= 0) {
	          pass;
	        } else {
	          anim.blendout_remaining = bo_r;
	          anim.weight = bo_r / anim.blendout_total;
	        }
	      }
	    }
	    update_ob_physics(ob);
	  }
	};
	
	stop_all_animations = function() {
	  var anim_id, l, len, ob, ref1;
	  ref1 = _all_anim_objects.slice(0);
	  for (l = 0, len = ref1.length; l < len; l++) {
	    ob = ref1[l];
	    for (anim_id in ob.animations) {
	      ob.del_animation(anim_id);
	    }
	  }
	};
	
	cubic_root = function(d) {
	  if (d > 0) {
	    return Math.pow(d, 0.3333333333333333);
	  } else {
	    return -Math.pow(-d, 0.3333333333333333);
	  }
	};
	
	solve_roots = function(x, p0, p1, p2, p3, s) {
	  var S, a, aa, ao3, b, c, c0, c1, c2, c3, cp, d, p, phi, q, t, tPI, u, v;
	  tPI = (4.0 * Math.atan(1.0)) * 0.3333333333333333;
	  s = 0.0;
	  c0 = p0 - x;
	  c1 = -3.0 * p0 + 3.0 * p1;
	  c2 = 3.0 * p0 - 6.0 * p1 + 3.0 * p2;
	  c3 = -p0 + 3.0 * p1 - 3.0 * p2 + p3;
	  if (Math.abs(c3) <= 0.000000119209290) {
	    if (Math.abs(c1) > 0.000000119209290) {
	      s = -c0 / c1;
	    }
	    if (akEq(s)) {
	      return 1;
	    }
	    if (Math.abs(c0) <= 0.000000119209290) {
	      return 1;
	    }
	    return 0;
	  }
	  a = c2 / c3;
	  b = c1 / c3;
	  c = c0 / c3;
	  ao3 = a * 0.3333333333333333;
	  aa = a * a;
	  p = 0.3333333333333333 * (-0.3333333333333333 * aa + b);
	  q = 0.5 * (2 / 27 * a * aa - 0.3333333333333333 * a * b + c);
	  cp = p * p * p;
	  d = q * q + cp;
	  if (Math.abs(d) <= 0.000000119209290) {
	    if (Math.abs(q) <= 0.000000119209290) {
	      s = 0.0;
	      console.log('triple');
	      return s;
	    } else {
	      u = cubic_root(-q);
	      s = 2.0 * u;
	      if (!akEq(s - ao3)) {
	        s = -u;
	      }
	    }
	  } else if (d < 0.0) {
	    phi = 0.3333333333333333 * Math.acos(-q / Math.sqrt(-cp));
	    t = 2.0 * Math.sqrt(-p);
	    s = t * Math.cos(phi);
	    if (!akEq(s - ao3)) {
	      s = -t * Math.cos(phi + tPI);
	      if (!akEq(s - ao3)) {
	        s = -t * Math.cos(phi - tPI);
	      }
	    }
	  } else {
	    S = Math.sqrt(d);
	    u = cubic_root(S - q);
	    v = -cubic_root(S + q);
	    s = u + v;
	  }
	  s -= ao3;
	  return s;
	};
	
	akEq = function(v) {
	  return v >= -0.000000119209290 && v < 1 + 0.000000119209290;
	};
	
	module.exports = {
	  Action: Action,
	  Animation: Animation,
	  evaluate_all_animations: evaluate_all_animations,
	  stop_all_animations: stop_all_animations
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var BoxShape, CapsuleShape, CharacterBody, CompoundShape, ConvexShape, CylinderShape, PhyQuat, PhyVec3, PhysicsWorld, Ray, RigidBody, SphereShape, StaticBody, TriangleMeshShape, _character_controllers, _phy_obs_ptrs, _tmp_ClosestRayResultCallback, _tmp_Quaternion, _tmp_Transform, _tmp_Vector3, _tmp_Vector3b, _tmp_Vector3c, activate_body, add_body, add_child_shape, allow_sleeping, apply_central_force, apply_central_impulse, apply_force, character_jump, colliding_bodies, deactivate_body, destroy, destroy_body, destroy_world, get_angular_velocity, get_convex_hull_edges, get_last_char_phy, get_linear_velocity, get_mass, make_ghost, mat2, mat3, mat4, ob_to_phy, on_ground, phy_to_ob, physics_engine_init, quat, ray_intersect_body, ray_intersect_body_absolute, ray_intersect_body_bool, ray_intersect_body_bool_not_target, ref, remove_body, set_angular_factor, set_angular_velocity, set_body_activation_state, set_body_deactivation_time, set_character_jump_force, set_character_velocity, set_gravity, set_linear_factor, set_linear_velocity, set_mass, set_max_fall_speed, set_phy_scale, step_world, update_ob_physics, vec2, vec3, vec4, xyz;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	_phy_obs_ptrs = {};
	
	_tmp_Vector3 = _tmp_Vector3b = _tmp_Vector3c = _tmp_Quaternion = _tmp_Transform = _tmp_ClosestRayResultCallback = destroy = null;
	
	physics_engine_init = function() {
	  _tmp_Vector3 = new Ammo.btVector3(0, 0, 0);
	  _tmp_Vector3b = new Ammo.btVector3(0, 0, 0);
	  _tmp_Vector3c = new Ammo.btVector3(0, 0, 0);
	  _tmp_Quaternion = new Ammo.btQuaternion(0, 0, 0, 0);
	  _tmp_Transform = new Ammo.btTransform;
	  _tmp_ClosestRayResultCallback = new Ammo.ClosestRayResultCallback(new Ammo.btVector3(0, 0, 0), new Ammo.btVector3(0, 0, 0));
	  return destroy = Ammo.destroy || function(o) {
	    return o.destroy();
	  };
	};
	
	xyz = function(v) {
	  var p;
	  p = v.ptr >> 2;
	  return Ammo.HEAPF32.subarray(p, p + 3);
	};
	
	PhysicsWorld = function() {
	  var broadphase, configuration, dispatcher, solver, world;
	  configuration = new Ammo.btDefaultCollisionConfiguration;
	  dispatcher = new Ammo.btCollisionDispatcher(configuration);
	  broadphase = new Ammo.btDbvtBroadphase;
	  solver = new Ammo.btSequentialImpulseConstraintSolver;
	  world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, configuration);
	  world.pointers = [solver, broadphase, dispatcher, configuration];
	  return world;
	};
	
	destroy_world = function(world) {
	  var k, len, p, pointers;
	  pointers = world.pointers;
	  destroy(world);
	  for (k = 0, len = pointers.length; k < len; k++) {
	    p = pointers[k];
	    destroy(p);
	  }
	};
	
	PhyVec3 = function(x, y, z) {
	  return new Ammo.btVector3(x, y, z);
	};
	
	PhyQuat = function(x, y, z, w) {
	  return new Ammo.btQuaternion(x, y, z, w);
	};
	
	BoxShape = function(x, y, z, margin) {
	  var shape;
	  _tmp_Vector3.setValue(x, y, z);
	  shape = new Ammo.btBoxShape(_tmp_Vector3);
	  shape.setMargin(margin);
	  return shape;
	};
	
	SphereShape = function(radius, margin) {
	  var shape;
	  shape = new Ammo.btSphereShape(radius);
	  shape.setMargin(margin);
	  return shape;
	};
	
	CylinderShape = function(radius, height, margin) {
	  var shape;
	  _tmp_Vector3.setValue(radius, radius, height);
	  shape = new Ammo.btCylinderShapeZ(_tmp_Vector3);
	  shape.setMargin(margin);
	  return shape;
	};
	
	CapsuleShape = function(radius, height, margin) {
	  var shape;
	  shape = new Ammo.btCapsuleShapeZ(radius, (height - radius) * 2);
	  shape.setMargin(margin);
	  return shape;
	};
	
	ConvexShape = function(vertices, vstride, scale, margin) {
	  var i, j, k, p, ref1, shape, vlen;
	  vlen = vertices.length / vstride;
	  shape = new Ammo.btConvexHullShape;
	  p = shape.ptr;
	  i = 0;
	  for (i = k = 0, ref1 = vlen; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
	    j = i * vstride;
	    _tmp_Vector3.setValue(vertices[j], vertices[j + 1], vertices[j + 2]);
	    shape.addPoint(_tmp_Vector3);
	  }
	  _tmp_Vector3.setValue(scale[0], scale[1], scale[2]);
	  shape.setLocalScaling(_tmp_Vector3);
	  shape.setMargin(margin);
	  return shape;
	};
	
	get_convex_hull_edges = function(vertices, vstride) {
	  var f, faces, i, i3, i6, i9, indices, j, k, l, ref1, ref2, verts, vlen;
	  vlen = vertices.length / vstride;
	  verts = [];
	  for (i = k = 0, ref1 = vlen; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
	    j = i * vstride;
	    verts.push([vertices[j], vertices[j + 1], vertices[j + 2]]);
	  }
	  faces = convexHull(verts);
	  verts = new Float32Array(faces.length * 9);
	  indices = new Int16Array(faces.length * 6);
	  for (i = l = 0, ref2 = faces.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
	    i3 = i * 3;
	    i6 = i * 6;
	    i9 = i * 9;
	    f = faces[i].vertices;
	    verts.set(f[0], i9);
	    verts.set(f[1], i9 + 3);
	    verts.set(f[2], i9 + 6);
	    indices[i6] = i3;
	    indices[i6 + 1] = i3 + 1;
	    indices[i6 + 2] = i3 + 1;
	    indices[i6 + 3] = i3 + 2;
	    indices[i6 + 4] = i3 + 2;
	    indices[i6 + 5] = i3;
	    i += 1;
	  }
	  return [verts, indices];
	};
	
	TriangleMeshShape = function(vertices, indices, vstride, scale, margin, name) {
	  var HEAPF32, inds, k, mesh, offset, ref1, shape, v, verts, vlen;
	  vlen = vertices.length / vstride;
	  inds = Ammo._malloc(indices.length * 4);
	  Ammo.HEAPU32.set(indices, inds >> 2);
	  verts = Ammo._malloc(vlen * 3 * 4);
	  offset = verts >> 2;
	  HEAPF32 = Ammo.HEAPF32;
	  for (v = k = 0, ref1 = vlen; 0 <= ref1 ? k < ref1 : k > ref1; v = 0 <= ref1 ? ++k : --k) {
	    HEAPF32.set(vertices.subarray(v * vstride, v * vstride + 3), offset);
	    offset += 3;
	  }
	  mesh = new Ammo.btTriangleIndexVertexArray(indices.length / 3, inds, 3 * 4, vertices.length / 3, verts, 3 * 4);
	  shape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
	  _tmp_Vector3.setValue(scale[0], scale[1], scale[2]);
	  shape.setLocalScaling(_tmp_Vector3);
	  shape.setMargin(margin);
	  return shape;
	};
	
	CompoundShape = function() {
	  return new Ammo.btCompoundShape;
	};
	
	RigidBody = function(mass, shape, position, rotation, friction, elasticity, form_factor) {
	  var body, inertia, localInertia, myMotionState, rbInfo, startTransform;
	  inertia = form_factor * mass / 3;
	  localInertia = new Ammo.btVector3(inertia, inertia, inertia);
	  shape.calculateLocalInertia(mass, localInertia);
	  startTransform = new Ammo.btTransform;
	  _tmp_Vector3.setValue(position[0], position[1], position[2]);
	  startTransform.setOrigin(_tmp_Vector3);
	  _tmp_Quaternion.setValue(rotation[0], rotation[1], rotation[2], rotation[3]);
	  startTransform.setRotation(_tmp_Quaternion);
	  myMotionState = new Ammo.btDefaultMotionState(startTransform);
	  rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
	  rbInfo.set_m_friction(friction);
	  rbInfo.set_m_restitution(elasticity);
	  body = new Ammo.btRigidBody(rbInfo);
	  body.pointers = [rbInfo, myMotionState, startTransform, localInertia];
	  if (body.getPtr) {
	    _phy_obs_ptrs[body.getPtr()] = body;
	  } else {
	    _phy_obs_ptrs[body.ptr] = body;
	  }
	  return body;
	};
	
	StaticBody = function(shape, position, rotation, friction, elasticity) {
	  return RigidBody(0, shape, position, rotation, friction, elasticity, 0);
	};
	
	_character_controllers = [];
	
	CharacterBody = function(shape, position, rotation, step_height, axis, gravity, jump_speed, fall_speed, max_slope) {
	  var body, char, startTransform;
	  body = new Ammo.btPairCachingGhostObject;
	  body.setCollisionFlags(16);
	  body.setCollisionShape(shape);
	  char = body.char = new Ammo.btKinematicCharacterController(body, shape, step_height, axis);
	  char.setGravity(gravity);
	  char.setJumpSpeed(jump_speed);
	  char.setFallSpeed(fall_speed);
	  char.setMaxSlope(max_slope);
	  _character_controllers.push(body.char);
	  startTransform = new Ammo.btTransform;
	  _tmp_Vector3.setValue(position[0], position[1], position[2]);
	  startTransform.setOrigin(_tmp_Vector3);
	  _tmp_Quaternion.setValue(rotation[0], rotation[1], rotation[2], rotation[3]);
	  startTransform.setRotation(_tmp_Quaternion);
	  body.setWorldTransform(startTransform);
	  body.pointers = [body.char, startTransform];
	  if (body.getPtr) {
	    _phy_obs_ptrs[body.getPtr()] = body;
	  } else {
	    _phy_obs_ptrs[body.ptr] = body;
	  }
	  return body;
	};
	
	destroy_body = function(body) {
	  var k, len, p, pointers;
	  if (body.getPtr) {
	    delete _phy_obs_ptrs[body.getPtr()];
	  } else {
	    delete _phy_obs_ptrs[body.ptr];
	  }
	  if (body.char) {
	    _character_controllers.remove(body.char);
	  }
	  pointers = body.pointers;
	  destroy(body);
	  for (k = 0, len = pointers.length; k < len; k++) {
	    p = pointers[k];
	    destroy(p);
	  }
	};
	
	Ray = (function() {
	  function Ray() {
	    this.origin = new Ammo.btVector3(0, 0, 0);
	    this.rayto = new Ammo.btVector3(0, 0, 0);
	  }
	
	  Ray.prototype.destroy = function() {
	    destroy(this.origin);
	    return destroy(this.rayto);
	  };
	
	  return Ray;
	
	})();
	
	add_child_shape = function(comp, shape, p, o) {
	  _tmp_Vector3.setValue(p[0], p[1], p[2]);
	  _tmp_Quaternion.setValue(o[0], o[1], o[2], o[3]);
	  _tmp_Transform.setOrigin(_tmp_Vector3);
	  _tmp_Transform.setRotation(_tmp_Quaternion);
	  return comp.addChildShape(_tmp_Transform, shape);
	};
	
	set_gravity = function(world, x, y, z) {
	  _tmp_Vector3.setValue(x, y, z);
	  return world.setGravity(_tmp_Vector3);
	};
	
	add_body = function(world, body, collision_filter_group, collision_filter_mask) {
	  if (body.char) {
	    world.addCollisionObject(body, collision_filter_group, collision_filter_mask);
	    return world.addAction(body.char);
	  } else {
	    return world.addRigidBody(body, collision_filter_group, collision_filter_mask);
	  }
	};
	
	remove_body = function(world, body) {
	  if (body.char) {
	    world.removeAction(body.char);
	    world.removeCollisionObject(body);
	  } else {
	    world.removeRigidBody(body);
	  }
	  return destroy_body(body);
	};
	
	step_world = function(world, time_step) {
	  return world.stepSimulation(time_step, 10);
	};
	
	set_body_deactivation_time = function(body, time) {
	  return body.setDeactivationTime(time);
	};
	
	activate_body = function(body) {
	  return body.activate();
	};
	
	update_ob_physics = function(ob) {
	  var pos, posrot, rot;
	  if (ob.body != null) {
	    if (ob.parent) {
	      posrot = ob.get_world_pos_rot();
	      pos = posrot[0];
	      rot = posrot[1];
	    } else {
	      pos = ob.position;
	      rot = ob.rotation;
	    }
	    _tmp_Vector3.setValue(pos[0], pos[1], pos[2]);
	    _tmp_Transform.setOrigin(_tmp_Vector3);
	    _tmp_Quaternion.setValue(rot[0], rot[1], rot[2], rot[3]);
	    _tmp_Transform.setRotation(_tmp_Quaternion);
	    ob.body.setWorldTransform(_tmp_Transform);
	    return ob.body.activate();
	  }
	};
	
	set_phy_scale = function(ob, scale) {
	  var body, world;
	  world = ob.scene.world;
	  body = ob.body;
	  world.removeRigidBody(body);
	  ob.phy_he = scale;
	  _tmp_Vector3.setValue(scale[0], scale[1], scale[2]);
	  ob.shape.setImplicitShapeDimensions(_tmp_Vector3);
	  return world.addRigidBody(body, ob.collision_group, ob.collision_mask);
	};
	
	deactivate_body = function(body) {
	  return body.setActivationState(2);
	};
	
	set_body_activation_state = function(body, bool_state) {
	  if (bool_state) {
	    return body.activate();
	  } else {
	    return body.setActivationState(2);
	  }
	};
	
	allow_sleeping = function(body, allow) {
	  if (allow) {
	    return body.setActivationState(1);
	  } else {
	    return body.setActivationState(4);
	  }
	};
	
	make_ghost = function(body, is_ghost) {
	  if (is_ghost) {
	    return body.setCollisionFlags(body.getCollisionFlags() | 4);
	  } else {
	    return body.setCollisionFlags(body.getCollisionFlags() & -5);
	  }
	};
	
	colliding_bodies = function(body) {
	  var b0, b1, dispatcher, has_contact, i, j, k, l, m, num_contacts, p, point, ref1, ref2, ret;
	  ret = [];
	  p = body.ptr;
	  dispatcher = scene.world.getDispatcher();
	  for (i = k = 0, ref1 = dispatcher.getNumManifolds(); 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
	    m = dispatcher.getManifoldByIndexInternal(i);
	    num_contacts = m.getNumContacts();
	    if (num_contacts !== 0) {
	      has_contact = false;
	      for (j = l = 0, ref2 = num_contacts; 0 <= ref2 ? l < ref2 : l > ref2; j = 0 <= ref2 ? ++l : --l) {
	        point = m.getContactPoint(j);
	        if (point.get_m_distance1() < 0) {
	          has_contact = true;
	        }
	      }
	      if (has_contact) {
	        b0 = m.getBody0();
	        b1 = m.getBody1();
	        if (b0 === p) {
	          ret.push(_phy_obs_ptrs[b1]);
	        } else if (b1 === p) {
	          ret.push(_phy_obs_ptrs[b0]);
	        }
	      }
	    }
	  }
	  return ret;
	};
	
	get_linear_velocity = function(body, local) {
	  var ir, new_v, v;
	  if (local == null) {
	    local = false;
	  }
	  v = body.getLinearVelocity();
	  if (local) {
	    ir = quat.invert([], body.owner.get_world_rotation());
	    new_v = vec3.transformQuat([], [v.x(), v.y(), v.z()], ir);
	    return new_v;
	  }
	  return [v.x(), v.y(), v.z()];
	};
	
	set_linear_velocity = function(body, v) {
	  _tmp_Vector3.setValue(v[0], v[1], v[2]);
	  return body.setLinearVelocity(_tmp_Vector3);
	};
	
	set_character_velocity = function(body, v) {
	  _tmp_Vector3.setValue(v[0] * 0.016666666666666666, v[1] * 0.016666666666666666, v[2] * 0.016666666666666666);
	  return body.char.setWalkDirection(_tmp_Vector3);
	};
	
	set_character_jump_force = function(body, f) {
	  body.char.setJumpSpeed(f);
	  return body.owner.jump_force = f;
	};
	
	character_jump = function(body) {
	  return body.char.jump();
	};
	
	on_ground = function(body) {
	  return body.char.onGround();
	};
	
	set_max_fall_speed = function(body, f) {
	  body.char.setFallSpeed(f);
	  return body.owner.max_fall_speed = f;
	};
	
	get_angular_velocity = function(body, local) {
	  var ir, new_v, v;
	  if (local == null) {
	    local = false;
	  }
	  v = body.getAngularVelocity();
	  if (local) {
	    ir = quat.invert([], body.owner.get_world_rotation());
	    new_v = vec3.transformQuat([], [v.x(), v.y(), v.z()], ir);
	    return new_v;
	  }
	  return [v.x(), v.y(), v.z()];
	};
	
	set_angular_velocity = function(body, v) {
	  _tmp_Vector3.setValue(v[0], v[1], v[2]);
	  return body.setAngularVelocity(_tmp_Vector3);
	};
	
	get_mass = function(body) {
	  return body.owner.mass;
	};
	
	set_mass = function(body) {
	  return print('set_mass not implemented');
	};
	
	apply_force = function(body, force, rel_pos) {
	  _tmp_Vector3.setValue(force[0], force[1], force[2]);
	  _tmp_Vector3b.setValue(rel_pos[0], rel_pos[1], rel_pos[2]);
	  return body.applyForce(_tmp_Vector3, _tmp_Vector3b);
	};
	
	apply_central_force = function(body, force) {
	  var f;
	  f = Math.pow(1 / frame_factor, 1.025);
	  _tmp_Vector3.setValue(force[0] * f, force[1] * f, force[2] * f);
	  return body.applyCentralForce(_tmp_Vector3);
	};
	
	apply_central_impulse = function(body, force) {
	  _tmp_Vector3.setValue(force[0], force[1], force[2]);
	  return body.applyCentralImpulse(_tmp_Vector3);
	};
	
	set_linear_factor = function(body, factor) {
	  _tmp_Vector3.setValue(factor[0], factor[1], factor[2]);
	  return body.setLinearFactor(_tmp_Vector3);
	};
	
	set_angular_factor = function(body, factor) {
	  _tmp_Vector3.setValue(factor[0], factor[1], factor[2]);
	  return body.setAngularFactor(_tmp_Vector3);
	};
	
	ob_to_phy = function(ob_list) {
	  var k, len, ob, pos, posrot, rot;
	  for (k = 0, len = ob_list.length; k < len; k++) {
	    ob = ob_list[k];
	    if (ob.parent) {
	      posrot = ob.get_world_pos_rot();
	      pos = posrot[0];
	      rot = posrot[1];
	    } else {
	      pos = ob.position;
	      rot = ob.rotation;
	    }
	    _tmp_Vector3.setValue(pos[0], pos[1], pos[2]);
	    _tmp_Transform.setOrigin(_tmp_Vector3);
	    _tmp_Quaternion.setValue(rot[0], rot[1], rot[2], rot[3]);
	    _tmp_Transform.setRotation(_tmp_Quaternion);
	    ob.body.setWorldTransform(_tmp_Transform);
	  }
	};
	
	phy_to_ob = function(ob_list) {
	  var body, brot, k, len, ob, origin, pos, rot, transform;
	  for (k = 0, len = ob_list.length; k < len; k++) {
	    ob = ob_list[k];
	    body = ob.body;
	    if (body.getMotionState) {
	      transform = _tmp_Transform;
	      body.getMotionState().getWorldTransform(transform);
	    } else {
	      transform = body.getWorldTransform(transform);
	    }
	    pos = ob.position;
	    origin = transform.getOrigin();
	    pos[0] = origin.x();
	    pos[1] = origin.y();
	    pos[2] = origin.z();
	    rot = ob.rotation;
	    brot = transform.getRotation();
	    rot[0] = brot.x();
	    rot[1] = brot.y();
	    rot[2] = brot.z();
	    rot[3] = brot.w();
	  }
	};
	
	get_last_char_phy = function(ob_list) {
	  var body, k, len, ob, origin, pos, transform;
	  for (k = 0, len = ob_list.length; k < len; k++) {
	    ob = ob_list[k];
	    body = ob.body;
	    transform = body.getWorldTransform(transform);
	    pos = ob.last_position;
	    origin = transform.getOrigin();
	    pos[0] = origin.x();
	    pos[1] = origin.y();
	    pos[2] = origin.z();
	  }
	};
	
	ray_intersect_body = function(scene, origin, direction, int_mask) {
	  var callback, cob, hit_normal, hit_point, point, ray_origin, ray_rayto, result;
	  if (int_mask == null) {
	    int_mask = -1;
	  }
	  if (!scene.world) {
	    return [];
	  }
	  ray_origin = _tmp_Vector3b;
	  ray_origin.setValue(origin[0], origin[1], origin[2]);
	  ray_rayto = _tmp_Vector3c;
	  ray_rayto.setValue(origin[0] + direction[0], origin[1] + direction[1], origin[2] + direction[2]);
	  callback = _tmp_ClosestRayResultCallback;
	  callback.set_m_rayFromWorld(ray_origin);
	  callback.set_m_rayToWorld(ray_rayto);
	  callback.set_m_collisionFilterGroup(-1);
	  callback.set_m_collisionFilterMask(int_mask);
	  callback.set_m_collisionObject(0);
	  callback.set_m_closestHitFraction(1);
	  callback.set_m_flags(0);
	  scene.world.rayTest(ray_origin, ray_rayto, callback);
	  result = [];
	  point = vec3.create();
	  if (callback.hasHit()) {
	    hit_point = _tmp_Vector3;
	    hit_point.setInterpolate3(ray_origin, ray_rayto, callback.get_m_closestHitFraction());
	    hit_normal = callback.get_m_hitNormalWorld();
	    point[0] = hit_point.x();
	    point[1] = hit_point.y();
	    point[2] = hit_point.z();
	    cob = callback.get_m_collisionObject();
	    return {
	      body: _phy_obs_ptrs[cob.ptr || cob.getPtr()],
	      point: point,
	      normal: [hit_normal.x(), hit_normal.y(), hit_normal.z()],
	      distance: vec3.dist(point, origin)
	    };
	  }
	  return null;
	};
	
	ray_intersect_body_absolute = function(scene, rayfrom, rayto, int_mask) {
	  var callback, cob, hit_normal, hit_point, n, p, ray_origin, ray_rayto;
	  ray_origin = _tmp_Vector3;
	  ray_rayto = _tmp_Vector3b;
	  ray_origin.setValue(rayfrom[0], rayfrom[1], rayfrom[2]);
	  ray_rayto.setValue(rayto[0], rayto[1], rayto[2]);
	  callback = _tmp_ClosestRayResultCallback;
	  callback.set_m_rayFromWorld(ray_origin);
	  callback.set_m_rayToWorld(ray_rayto);
	  callback.set_m_collisionFilterGroup(-1);
	  callback.set_m_collisionFilterMask(int_mask);
	  callback.set_m_collisionObject(0);
	  callback.set_m_closestHitFraction(1);
	  callback.set_m_flags(0);
	  scene.world.rayTest(ray_origin, ray_rayto, callback);
	  if (callback.hasHit()) {
	    hit_point = _tmp_Vector3c;
	    hit_point.setInterpolate3(ray_origin, ray_rayto, callback.get_m_closestHitFraction());
	    hit_normal = callback.get_m_hitNormalWorld();
	    cob = callback.get_m_collisionObject();
	    p = hit_point.ptr >> 2;
	    n = hit_normal.ptr >> 2;
	    return [_phy_obs_ptrs[cob.ptr], new Float32Array(Ammo.HEAPF32.subarray(p, p + 3)), new Float32Array(Ammo.HEAPF32.subarray(n, n + 3))];
	  }
	  return null;
	};
	
	ray_intersect_body_bool = function(scene, rayfrom, rayto, mask) {
	  var callback, cp, cp32;
	  cp = _tmp_ClosestRayResultCallback.ptr;
	  cp32 = cp >> 2;
	  _tmp_Vector3.setValue(rayfrom[0], rayfrom[1], rayfrom[2]);
	  _tmp_Vector3b.setValue(rayto[0], rayto[1], rayto[2]);
	  callback = _tmp_ClosestRayResultCallback;
	  callback.set_m_collisionFilterGroup(-1);
	  callback.set_m_collisionFilterMask(mask);
	  callback.set_m_collisionObject(0);
	  callback.set_m_closestHitFraction(1);
	  callback.set_m_flags(0);
	  scene.world.rayTest(_tmp_Vector3, _tmp_Vector3b, callback);
	  return callback.hasHit();
	};
	
	ray_intersect_body_bool_not_target = function(scene, rayfrom, rayto, mask, target_body) {
	  var callback, cp, cp32;
	  cp = _tmp_ClosestRayResultCallback.ptr;
	  cp32 = cp >> 2;
	  _tmp_Vector3.setValue(rayfrom[0], rayfrom[1], rayfrom[2]);
	  _tmp_Vector3b.setValue(rayto[0], rayto[1], rayto[2]);
	  callback = _tmp_ClosestRayResultCallback;
	  callback.set_m_collisionFilterGroup(-1);
	  callback.set_m_collisionFilterMask(mask);
	  callback.set_m_collisionObject(0);
	  callback.set_m_closestHitFraction(1);
	  callback.set_m_flags(0);
	  scene.world.rayTest(_tmp_Vector3, _tmp_Vector3b, callback);
	  return callback.hasHit() && callback.get_m_collisionObject().ptr !== target_body.ptr;
	};
	
	module.exports = {
	  physics_engine_init: physics_engine_init,
	  PhysicsWorld: PhysicsWorld,
	  destroy_world: destroy_world,
	  set_gravity: set_gravity,
	  step_world: step_world,
	  update_ob_physics: update_ob_physics,
	  set_phy_scale: set_phy_scale,
	  ob_to_phy: ob_to_phy,
	  phy_to_ob: phy_to_ob,
	  get_last_char_phy: get_last_char_phy,
	  BoxShape: BoxShape,
	  SphereShape: SphereShape,
	  CylinderShape: CylinderShape,
	  CapsuleShape: CapsuleShape,
	  ConvexShape: ConvexShape,
	  TriangleMeshShape: TriangleMeshShape,
	  CompoundShape: CompoundShape,
	  get_convex_hull_edges: get_convex_hull_edges,
	  add_child_shape: add_child_shape,
	  RigidBody: RigidBody,
	  StaticBody: StaticBody,
	  CharacterBody: CharacterBody,
	  add_body: add_body,
	  remove_body: remove_body,
	  destroy_body: destroy_body,
	  set_body_deactivation_time: set_body_deactivation_time,
	  activate_body: activate_body,
	  deactivate_body: deactivate_body,
	  set_body_activation_state: set_body_activation_state,
	  colliding_bodies: colliding_bodies,
	  allow_sleeping: allow_sleeping,
	  make_ghost: make_ghost,
	  get_linear_velocity: get_linear_velocity,
	  set_linear_velocity: set_linear_velocity,
	  set_character_jump_force: set_character_jump_force,
	  character_jump: character_jump,
	  on_ground: on_ground,
	  set_max_fall_speed: set_max_fall_speed,
	  get_angular_velocity: get_angular_velocity,
	  set_angular_velocity: set_angular_velocity,
	  get_mass: get_mass,
	  set_mass: set_mass,
	  apply_force: apply_force,
	  apply_central_force: apply_central_force,
	  apply_central_impulse: apply_central_impulse,
	  set_linear_factor: set_linear_factor,
	  set_angular_factor: set_angular_factor,
	  Ray: Ray,
	  ray_intersect_body: ray_intersect_body,
	  ray_intersect_body_absolute: ray_intersect_body_absolute,
	  ray_intersect_body_bool: ray_intersect_body_bool,
	  ray_intersect_body_bool_not_target: ray_intersect_body_bool_not_target
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, __dirname, __filename) {var Action, Armature, Camera, Curve, EMULATE_WORKERS, GameObject, Group, Lamp, Loader, Mesh, NUM_WORKERS_32, NUM_WORKERS_64, Scene, Viewport, WEBSOCKET_PORT, WebSocketLoader, XhrLoader, get_scene, mat2, mat3, mat4, physics_engine_init, profile_tex_upload_times, quat, ref, ref1, ref2, script_tag_loaded_callbacks, set_altmesh, vec2, vec3, vec4,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	Action = __webpack_require__(23).Action;
	
	Group = __webpack_require__(27).Group;
	
	Viewport = __webpack_require__(28).Viewport;
	
	Camera = __webpack_require__(29).Camera;
	
	Lamp = __webpack_require__(30).Lamp;
	
	Mesh = __webpack_require__(21).Mesh;
	
	ref1 = __webpack_require__(31), Scene = ref1.Scene, get_scene = ref1.get_scene;
	
	Curve = __webpack_require__(32).Curve;
	
	GameObject = __webpack_require__(22).GameObject;
	
	Armature = __webpack_require__(33).Armature;
	
	ref2 = __webpack_require__(24), this.physics_engine_url = ref2.physics_engine_url, physics_engine_init = ref2.physics_engine_init;
	
	NUM_WORKERS_64 = 2;
	
	NUM_WORKERS_32 = 1;
	
	WEBSOCKET_PORT = 9971;
	
	EMULATE_WORKERS = !process.browser || navigator.userAgent.toString().indexOf('Edge/12.') !== -1;
	
	profile_tex_upload_times = [];
	
	script_tag_loaded_callbacks = {};
	
	Loader = (function() {
	  Loader.prototype.current_scene = null;
	
	  function Loader(context) {
	    this.context = context;
	  }
	
	  Loader.prototype.load = function(data) {
	    var d, j, len, onload, scene, start;
	    scene = null;
	    start = performance.now();
	    onload = (function(_this) {
	      return function() {
	        var base1;
	        scene.enabled = true;
	        console.log('Scene "' + scene.name + '" loaded in ' + ((performance.now() - start) * 0.001).toFixed(2) + ' seconds');
	        _this.remove_queue_listener(0, onload);
	        if (typeof (base1 = _this.context).onload_main_scene === "function") {
	          base1.onload_main_scene();
	        }
	        _this.context.onload_main_scene = null;
	        return scene.decrement_task_count();
	      };
	    })(this);
	    this.add_queue_listener(0, onload);
	    for (j = 0, len = data.length; j < len; j++) {
	      d = data[j];
	      this.load_datablock(d);
	    }
	    scene = this.current_scene;
	    scene.increment_task_count();
	    return console.log('Loading scene "' + scene.name + '"');
	  };
	
	  Loader.prototype.load_datablock = function(data) {
	    var j, len, len1, n, o, old_mat, ref3, ref4, scene, u, vp;
	    if (data.scene) {
	      this.current_scene = this.context.scenes[data.scene];
	    }
	    if (data.type === 'SCENE') {
	      this.current_scene = scene = get_scene(this.context, data.name);
	      scene.loader = scene.loader || this;
	      scene.set_gravity(data.gravity);
	      scene.background_color = data.background_color;
	      scene.debug_physics = this.context.MYOU_PARAMS.debug_physics || data.debug_physics;
	      scene.active_camera_name = data.active_camera;
	      scene.stereo = data.stereo;
	      scene.stereo_eye_separation = data.stereo_eye_separation;
	      scene.tree_name = data.tree_name;
	    } else if (data.type === 'MATERIAL') {
	      this.current_scene.unloaded_material_data[data.name] = data;
	      old_mat = this.current_scene.materials[data.name];
	      if (old_mat != null) {
	        old_mat.destroy();
	        ref3 = old_mat.users;
	        for (j = 0, len = ref3.length; j < len; j++) {
	          u = ref3[j];
	          u.materials = [];
	        }
	      }
	    } else if (data.type === 'SHADER_LIB') {
	      if (this.context.render_manager.extensions.compressed_texture_s3tc) {
	        this.context.SHADER_LIB = data.code.replace('normal = 2.0*(vec3(-color.r, color.g, color.b) - vec3(-0.5, 0.5, 0.5));', 'normal = 2.0*(vec3(-color.a, -color.g, color.b) - vec3(-0.5, -0.5, 0.5));');
	      } else {
	        this.context.SHADER_LIB = data.code.replace('normal = 2.0*(vec3(-color.r, color.g, color.b) - vec3(-0.5, 0.5, 0.5));', 'normal = 2.0*(vec3(-color.r, -color.g, color.b) - vec3(-0.5, -0.5, 0.5));').replace('normal = normalize(vec3(-color.a, -color.g, color.b) - vec3(-0.5, -0.5, 0.5));', 'normal = 2.0*(vec3(-color.r, -color.g, color.b) - vec3(-0.5, -0.5, 0.5));');
	      }
	    } else if (data.type === 'JSFILE') {
	      this.current_scene.loader.load_script_with_tag_callback(data.uri, function() {
	        return pass;
	      });
	    } else if (data.type === 'JSCODE') {
	      window["eval"](data.code);
	    } else if (data.type === 'ACTION') {
	      this.context.actions[data.name] = new Action(data.name, data.channels, data.markers);
	    } else if (data.type === 'GROUP') {
	      this.context.groups[data.name] = new Group(data.objects, data.offset);
	    } else if (data.type === 'DELETE') {
	      ref4 = data.names;
	      for (o = 0, len1 = ref4.length; o < len1; o++) {
	        n = ref4[o];
	        this.current_scene.remove_object(this.current_scene.objects[n]);
	      }
	    } else if (data.type === 'STOP_RENDER') {
	      this.current_scene.enabled = false;
	    } else if (data.type === 'START_RENDER') {
	      this.current_scene.enabled = true;
	    } else if (data.type === 'DEBUG_VIEW') {
	      vp = this.context.render_manager.viewports[0];
	      if (vp && vp.camera) {
	        if (!vp.debug_camera) {
	          vp.debug_camera = vp.camera.clone();
	          vp.debug_camera.projection_matrix = new Float32Array(16);
	          vp.debug_camera.projection_matrix_inv = new Float32Array(16);
	          vp.debug_camera.parent = null;
	        }
	        vp.debug_camera.cam_type = data.cam_type;
	        vp.debug_camera.position = data.position;
	        vp.debug_camera.rotation = data.rotation;
	        vp.debug_camera.recalculate_projection();
	        vp.debug_camera._update_matrices();
	      }
	    } else if (data.type === 'NO_DEBUG_VIEW') {
	      vp = this.context.render_manager.viewports[0];
	      if (vp) {
	        vp.debug_camera = null;
	      }
	    } else {
	      this.load_object(data);
	    }
	  };
	
	  Loader.prototype.load_object = function(data) {
	    var addme, alm, d, j, len, len1, len2, load_mesh_properties, lod_data, lod_ob, m, o, ob, p, q, r, ref3, ref4, scene, tex_size, v;
	    addme = false;
	    scene = this.current_scene;
	    ob = scene.objects[data.name];
	    if (data.type === 'MESH') {
	      if (!ob) {
	        ob = new Mesh(this.context);
	        ob.name = data.name;
	        ob["static"] = data["static"] || false;
	        ob.passes = data.passes;
	        scene.add_object(ob, data.name, data.parent, data.parent_bone);
	      }
	      vec4.copy(ob.color, data.color);
	      load_mesh_properties = (function(_this) {
	        return function(ob, data) {
	          if (ob.hash !== data.hash) {
	            ob.hash = data.hash;
	            ob.elements = data.elements;
	            ob.offsets = data.offsets;
	            ob.stride = data.stride;
	            ob.mesh_name = data.mesh_name;
	            ob.material_names = data.materials;
	            ob.all_f = data.all_f;
	            ob.shape_multiplier = data.shape_multiplier || 1;
	            ob.uv_multiplier = data.uv_multiplier || 1;
	            ob.pack_offset = data.pack_offset;
	            ob.packed_file = data.packed_file;
	            if (ob.hash in _this.context.mesh_datas) {
	              ob.data && ob.data.remove(ob);
	              ob.data = _this.context.mesh_datas[ob.hash];
	              ob.data.users.push(ob);
	              return ob.instance_physics();
	            } else if (data.visible) {
	              return scene.loader.load_mesh_data(ob);
	            }
	          }
	        };
	      })(this);
	      load_mesh_properties(ob, data);
	      if ('alternative_meshes' in data) {
	        alm = data.alternative_meshes;
	        ob.altmeshes.splice(0);
	        for (j = 0, len = alm.length; j < len; j++) {
	          d = alm[j];
	          d.visible = data.visible;
	          d.materials = data.materials;
	          m = new Mesh(this.context);
	          m.name = ob.name;
	          m.scene = ob.scene;
	          ob.altmeshes.push(m);
	          load_mesh_properties(m, d);
	        }
	        ob.active_mesh_index = data.active_mesh_index;
	      }
	      if ('phy_mesh' in data) {
	        data.phy_mesh.visible = data.visible;
	        m = ob.physics_mesh = new Mesh(this.context);
	        m.visible_mesh = ob;
	        m.name = ob.name;
	        m.scene = ob.scene;
	        load_mesh_properties(m, data.phy_mesh);
	      }
	      if (data.lod_levels) {
	        ob.lod_objects = [];
	        ref3 = data.lod_levels;
	        for (o = 0, len1 = ref3.length; o < len1; o++) {
	          lod_data = ref3[o];
	          lod_data.elements = data.elements;
	          lod_data.stride = data.stride;
	          lod_data.materials = data.materials;
	          lod_data.visible = data.visible;
	          lod_ob = new Mesh(this.context);
	          lod_ob.scene = ob.scene;
	          load_mesh_properties(lod_ob, lod_data);
	          ob.lod_objects.push({
	            factor: lod_data.factor,
	            distance: 1 / lod_data.factor,
	            object: lod_ob
	          });
	        }
	      }
	      ob.zindex = 1;
	      if ('zindex' in data) {
	        ob.zindex = data.zindex;
	      }
	    } else if (data.type === 'CURVE') {
	      if (!ob) {
	        ob = new Curve(this.context);
	        ob.name = data.name;
	        ob["static"] = data["static"] || false;
	        scene.add_object(ob, data.name, data.parent, data.parent_bone);
	      }
	      ob.set_curves(data.curves, data.resolution, data.nodes);
	    } else if (data.type === 'CAMERA') {
	      if (!ob) {
	        ob = new Camera(this.context);
	        ob.name = data.name;
	        ob["static"] = data["static"] || false;
	        scene.add_object(ob, data.name, data.parent, data.parent_bone);
	        if (data.name === scene.active_camera_name) {
	          scene.active_camera = ob;
	          if (this.context.render_manager.viewports.length === 0) {
	            v = new Viewport(this.context.render_manager, ob);
	          }
	          if (scene.stereo) {
	            stereo_manager.enable(v);
	          }
	        }
	      }
	      ob.near_plane = data.clip_start;
	      ob.far_plane = data.clip_end;
	      if (!this.context.render_manager.vrstate) {
	        ob.field_of_view = data.angle;
	      }
	      ob.ortho_scale = data.ortho_scale;
	      ob.cam_type = data.cam_type;
	      ob.sensor_fit = data.sensor_fit;
	      ob.recalculate_projection();
	    } else if (data.type === 'LAMP') {
	      if (!ob) {
	        ob = new Lamp(this.context);
	        ob.name = data.name;
	        ob["static"] = data["static"] || false;
	        if (data.lamp_type !== 'POINT' && data.shadow && (this.context.render_manager.extensions.texture_float_linear != null)) {
	          tex_size = data.tex_size != null ? data.tex_size : 256;
	          ob.init_shadow(data.frustum_size, data.clip_start, data.clip_end, closest_pow2(tex_size));
	        }
	        scene.add_object(ob, data.name, data.parent, data.parent_bone);
	      }
	      ob.lamp_type = data.lamp_type;
	      ob.color.set(data.color);
	      if (data.energy != null) {
	        ob.energy = data.energy;
	      }
	      ob.falloff_distance = data.falloff_distance;
	    } else if (data.type === 'ARMATURE') {
	      if (!ob) {
	        ob = new Armature(this.context);
	        ob.name = data.name;
	        ob["static"] = data["static"] || false;
	        scene.add_object(ob, data.name, data.parent, data.parent_bone);
	      }
	      if (data.bones) {
	        ob.bones = {};
	        ob.children = [];
	        ob.unfc = data.unfc;
	        ob.add_bones(data.bones);
	      }
	      ob.apply_pose(data.pose);
	    } else if (data.type === 'EMPTY') {
	      if (!ob) {
	        ob = new GameObject(this.context);
	        ob.name = data.name;
	        ob["static"] = data["static"] || false;
	        vec4.copy(ob.color, data.color);
	        scene.add_object(ob, data.name, data.parent, data.parent_bone);
	      }
	    } else {
	      console.log("Warning: unsupported type", data.type);
	      return;
	    }
	    if ('particles' in data) {
	      ob.particle_systems = [];
	      ref4 = data.particles;
	      for (q = 0, len2 = ref4.length; q < len2; q++) {
	        p = ref4[q];
	        if ('formula' in p) {
	          p.formula = (new Function('return ' + p.formula))();
	        }
	        ob.particle_systems.push({
	          'properties': p
	        });
	      }
	    }
	    vec3.copy(ob.position, data.pos);
	    r = data.rot;
	    quat.copy(ob.rotation, [r[1], r[2], r[3], r[0]]);
	    ob.rotation_order = data.rot_mode;
	    vec3.copy(ob.scale, data.scale);
	    vec3.copy(ob.offset_scale, data.offset_scale);
	    ob.visible = data.visible;
	    ob.mirrors = data.mirrors || 1;
	    vec3.copy(ob.dimensions, data.dimensions);
	    ob.radius = vec3.len(ob.dimensions) * 0.5;
	    ob.properties = data.properties || {};
	    ob.actions = data.actions || [];
	    ob.physics_type = data.phy_type;
	    if (this.context.MYOU_PARAMS.load_physics_engine) {
	      ob.physical_radius = data.radius;
	      ob.anisotropic_friction = data.use_anisotropic_friction;
	      ob.friction_coefficients = data.friction_coefficients;
	      ob.collision_group = data.collision_group;
	      ob.collision_mask = data.collision_mask;
	      ob.collision_shape = data.collision_bounds_type;
	      ob.collision_margin = data.collision_margin;
	      ob.collision_compound = data.collision_compound;
	      ob.mass = data.mass;
	      ob.no_sleeping = data.no_sleeping;
	      ob.is_ghost = data.is_ghost;
	      vec3.copy(ob.linear_factor, data.linear_factor);
	      vec3.copy(ob.angular_factor, data.angular_factor);
	      ob.form_factor = data.form_factor;
	      ob.friction = data.friction;
	      ob.elasticity = data.elasticity;
	      ob.step_height = data.step_height;
	      ob.jump_force = data.jump_force;
	      ob.max_fall_speed = data.max_fall_speed;
	      if (scene.world) {
	        ob.instance_physics();
	      }
	    }
	    if (ob["static"]) {
	      ob._update_matrices();
	    }
	    return ob.dupli_group = data.dupli_group;
	  };
	
	  Loader.prototype.load_texture = function(name, path, filter, wrap, size) {
	    var add_level_buffer, base, ext, f, gl, img, load_565, load_levels, load_single_level, reupload, src, tex, wrap_const;
	    if (wrap == null) {
	      wrap = 'R';
	    }
	    if (size == null) {
	      size = 0;
	    }
	    tex = this.context.render_manager.textures[name] || null;
	    if (tex != null) {
	      return tex;
	    }
	    gl = this.context.render_manager.gl;
	    wrap_const = {
	      'C': gl.CLAMP_TO_EDGE,
	      'R': gl.REPEAT,
	      'M': gl.MIRRORED_REPEAT
	    }[wrap];
	    if (name.startswith('special:')) {
	      return {
	        'name': name
	      };
	    }
	    tex = {
	      'tex': gl.createTexture(),
	      'size': size
	    };
	    this.context.render_manager.textures[name] = tex;
	    tex.name = name;
	    tex.users = [];
	    tex.loaded = false;
	    if (path.slice(-4) === '.crn') {
	      base = this.data_dir + '/textures/';
	      src = base + path;
	      ext = this.context.render_manager.extensions.compressed_texture_s3tc;
	      tex.level_buffers = null;
	      tex.num_additional_levels = 0;
	      load_levels = (function(_this) {
	        return function(num_additional_levels, width, height, format, buffers, common_data) {
	          var buffers_len, data, gl_linear_nearest, i, internal_format, j, mipmap_filter, ref3;
	          gl.bindTexture(gl.TEXTURE_2D, tex.tex);
	          if (format === 0) {
	            internal_format = ext.COMPRESSED_RGBA_S3TC_DXT1_EXT;
	          } else {
	            internal_format = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;
	          }
	          buffers_len = buffers.length;
	          if (_this.context.MYOU_PARAMS.no_mipmaps) {
	            buffers_len = 1;
	          }
	          for (i = j = 0, ref3 = buffers_len; 0 <= ref3 ? j < ref3 : j > ref3; i = 0 <= ref3 ? ++j : --j) {
	            data = new Uint8Array(buffers[i]);
	            gl.compressedTexImage2D(gl.TEXTURE_2D, i, internal_format, width >> i, height >> i, 0, data);
	          }
	          gl_linear_nearest = filter ? gl.LINEAR : gl.NEAREST;
	          if (buffers_len > 1) {
	            mipmap_filter = {
	              C: filter ? gl.LINEAR_MIPMAP_NEAREST : gl.NEAREST_MIPMAP_NEAREST,
	              R: filter ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_LINEAR
	            }[wrap];
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmap_filter);
	          } else {
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_linear_nearest);
	          }
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_linear_nearest);
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_const);
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_const);
	          tex.level_buffers = buffers;
	          tex.num_additional_levels = num_additional_levels;
	          tex.common_data = common_data;
	          tex.loaded = true;
	          tex.width = width;
	          tex.height = height;
	          tex.format = format;
	          _this.context.main_loop.reset_timeout();
	          return true;
	        };
	      })(this);
	      load_565 = (function(_this) {
	        return function(data) {
	          var gl_linear_nearest, height, width;
	          gl.bindTexture(gl.TEXTURE_2D, tex.tex);
	          data = new Uint16Array(data);
	          width = height = Math.sqrt(data.length);
	          gl_linear_nearest = filter ? gl.LINEAR : gl.NEAREST;
	          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, data);
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_linear_nearest);
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_linear_nearest);
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_const);
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_const);
	          tex.loaded = true;
	          tex.width = width;
	          tex.height = height;
	          _this.context.main_loop.reset_timeout();
	          return true;
	        };
	      })(this);
	      if (ext) {
	        this.add_task(src, load_levels, 'load_crunch');
	      } else {
	        this.add_task(src + '.565', load_565, '');
	      }
	      load_single_level = function(width, height, format, buffers) {
	        return pass;
	      };
	      reupload = tex.reupload = function() {
	        if (tex.tex) {
	          gl.deleteTexture(tex.tex);
	        }
	        tex.tex = gl.createTexture();
	        return load_levels(n, tex.width, tex.height, tex.format, tex.level_buffers, tex.common_data);
	      };
	      add_level_buffer = function(width, height, format, buffer) {
	        var buffers;
	        if (this.context.render_manager.context_lost_count) {
	          return;
	        }
	        gl.deleteTexture(tex.tex);
	        tex.tex = gl.createTexture();
	        buffers = tex.level_buffers;
	        buffers.insert(0, buffer);
	        return load_levels(tex.num_additional_levels, width, height, format, buffers, tex.common_data);
	      };
	      tex.load_additional_level = (function(_this) {
	        return function(queue_id) {
	          var common_data, file_name, n;
	          if (queue_id == null) {
	            queue_id = 1;
	          }
	          if (_this.context.render_manager.context_lost_count) {
	            return;
	          }
	          if (tex.num_additional_levels) {
	            n = tex.num_additional_levels = tex.num_additional_levels - 1;
	            file_name = src + '.' + n;
	            common_data = tex.common_data.slice(0);
	            _this.add_task(file_name, add_level_buffer, 'load_crunch_extra', common_data, queue_id);
	            return true;
	          }
	          return false;
	        };
	      })(this);
	    } else if (path.slice(-4) === '.dds') {
	      base = this.data_dir + '/textures/';
	      src = base + path;
	      ext = this.context.render_manager.extensions.compressed_texture_s3tc;
	      f = function(data) {
	        var mipmaps, x;
	        gl.bindTexture(gl.TEXTURE_2D, tex.tex);
	        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	        mipmaps = uploadDDSLevels(gl, ext, data);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	        x = mipmaps > 1 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, x);
	        tex.loaded = true;
	        return true;
	      };
	      this.add_task(src, f, '');
	    } else {
	      this.pending_operations += 1;
	      img = new Image;
	      tex.reupload = function() {
	        if (tex.tex) {
	          gl.deleteTexture(tex.tex);
	        }
	        tex.tex = gl.createTexture();
	        return img.onload();
	      };
	      img.onload = (function(_this) {
	        return function() {
	          var gl_linear_nearest, gl_linear_nearest_mipmap;
	          gl.bindTexture(gl.TEXTURE_2D, tex.tex);
	          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	          gl_linear_nearest = filter ? gl.LINEAR : gl.NEAREST;
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_linear_nearest);
	          gl_linear_nearest_mipmap = filter ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST;
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_linear_nearest_mipmap);
	          gl.generateMipmap(gl.TEXTURE_2D);
	          ext = _this.context.render_manager.extensions.texture_filter_anisotropic;
	          if (_this.context.MYOU_PARAMS.anisotropic_filter && ext) {
	            gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
	          }
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_const);
	          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_const);
	          gl.bindTexture(gl.TEXTURE_2D, null);
	          return tex.loaded = true;
	        };
	      })(this);
	      img.onerror = function() {
	        return console.log("Image not found: " + path);
	      };
	      if (path.slice(0, 5) === 'data:') {
	        img.src = path;
	      } else {
	        base = this.data_dir + '/textures/';
	        img.src = base + path;
	      }
	    }
	    tex.path = path;
	    return tex;
	  };
	
	  return Loader;
	
	})();
	
	WebSocketLoader = (function() {
	  function WebSocketLoader(address, loader) {
	    var ws;
	    this.pending = "";
	    this.num_pending = 0;
	    ws = new WebSocket(address);
	    this.keep_alive_int;
	    ws.onopen = (function(_this) {
	      return function(x) {
	        console.log("Connected to debug WebSocket");
	        f(function() {
	          return ws.send('keepalive');
	        });
	        return _this.keep_alive_int = setInterval(f, 10000);
	      };
	    })(this);
	    ws.onmessage = (function(_this) {
	      return function(e) {
	        var data;
	        if (!_this.num_pending && e.data[0] !== '{' && e.data[0] !== '[') {
	          _this.num_pending = Math.floor(e.data);
	        } else if (_this.num_pending) {
	          _this.pending += e.data;
	          _this.num_pending -= 1;
	        }
	        if (!_this.num_pending) {
	          data = JSON.parse(_this.pending || e.data);
	          _this.pending = "";
	          if (hasattr(data, 'length')) {
	            return _this.load(data);
	          } else {
	            return _this.load_datablock(data);
	          }
	        }
	      };
	    })(this);
	    ws.onclose = (function(_this) {
	      return function(x) {
	        var code, f;
	        console.log(x);
	        x = x || {
	          'code': 1006,
	          'reason': ''
	        };
	        code = ['NORMAL', 'GOING_AWAY', 'PROTOCOL_ERROR', 'UNSUPPORTED', '', 'NO_STATUS', 'ABNORMAL', 'INCONSISTENT_DATA', '', 'TOO_LARGE', '', '', '', '', '', 'TLS_ERROR'][x.code - 1000];
	        console.log("Disconnected with code", code, x.reason);
	        console.log("Reconnecting in 1 second");
	        clearInterval(_this.keep_alive_int);
	        f = function() {
	          return WebSocketLoader(address, loader);
	        };
	        return setTimeout(f, 1000);
	      };
	    })(this);
	  }
	
	  return WebSocketLoader;
	
	})();
	
	XhrLoader = (function(superClass) {
	  extend(XhrLoader, superClass);
	
	  function XhrLoader(context, data_dir, workers) {
	    var blob, coffee_compile, cs_load_worker, dir, dirname, ext, fs, j, num_workers, onmessage, path, prog, ref3, scripts_dir, task_cb, w, worker, worker_code, worker_uri, xhrloader;
	    if (data_dir == null) {
	      data_dir = '';
	    }
	    if (workers == null) {
	      workers = null;
	    }
	    scripts_dir = data_dir + '/scripts/';
	    this.context = context;
	    this.loaded = 0;
	    this.total = 0;
	    this.total_loaded = 0;
	    this.physics_engine_loaded = false;
	    this.pending_meshes = {};
	    this.data_dir = data_dir;
	    this.full_local_path = location.href.split('#')[0].split('/').slice(0, -1).join('/') + '/';
	    if (process.browser) {
	      this.physics_engine_url = __webpack_require__(34);
	      this.crunch_url = this.full_local_path + __webpack_require__(35);
	    } else {
	      dirname = __dirname.replace(/\\/g, '/');
	      this.physics_engine_url = 'file://' + dirname + "/libs/ammo.asm.js";
	      this.crunch_url = 'file://' + dirname + '/libs/crunch.js';
	    }
	    this.workers = workers = workers || [];
	    this.remaining_tasks = [0];
	    this.queue_listeners = [[]];
	    this.next_task_id = 0;
	    this.task_cb = task_cb = {};
	    prog = document.getElementById('progress');
	    xhrloader = this;
	    onmessage = function(e) {
	      var data, f, finished, j, len, len1, loaded, o, queue_id, ref3, total_loaded, w;
	      data = e.data;
	      if (data[0] === 'log') {
	        return console.log(data[1]);
	      } else if (data[0] === 'progress') {
	        queue_id = data[1];
	        loaded = data[2];
	        this.last_progress[queue_id] = Math.max(this.last_progress[queue_id], loaded);
	        total_loaded = 0;
	        for (j = 0, len = workers.length; j < len; j++) {
	          w = workers[j];
	          total_loaded += w.last_progress[queue_id];
	        }
	        this.total_loaded = total_loaded;
	        if (prog) {
	          return prog.style.width = (total_loaded / this.context.MYOU_PARAMS.total_size * 448) + 'px';
	        }
	      } else if (data[0] === 'done') {
	        return queue_id = data[1];
	      } else if (data[2] === 'error') {
	        return console.log('error', data[3], data[4], data);
	      } else {
	        queue_id = data[1];
	        finished = true;
	        ref3 = task_cb[data[0]];
	        for (o = 0, len1 = ref3.length; o < len1; o++) {
	          f = ref3[o];
	          finished = finished && f.apply(null, data[2]);
	        }
	        if (finished) {
	          this.remaining[queue_id] -= 1;
	          xhrloader.remaining_tasks[queue_id] -= 1;
	          return xhrloader.check_queue_finished(queue_id);
	        }
	      }
	    };
	    ext = this.context.render_manager.extensions.compressed_texture_s3tc;
	    worker_code = "COMPRESSED_TEXTURE_SUPPORT = " + (ext != null) + "\n" + "importScripts('" + this.crunch_url + "')\n";
	    if (process.browser) {
	      worker_code += __webpack_require__(36);
	    } else {
	      fs = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"fs\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	      path = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"path\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	      coffee_compile = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"coffee-script\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).compile;
	      dir = path.dirname(__filename);
	      cs_load_worker = fs.readFileSync(dir + '/load_worker.coffee', 'utf8');
	      worker_code += coffee_compile(cs_load_worker, {
	        bare: true
	      });
	    }
	    if (EMULATE_WORKERS) {
	      worker = new Function("function importScripts(url){\n    xhr = new XMLHttpRequest;\n    xhr.open('GET', url, false);\n    xhr.send();\n    window.eval(xhr.response.replace('var Crunch','window.Crunch'));\n}\n" + worker_code + "\nvar fake = {\n    onmessage: null,\n    postMessage: function(msg){\n        onmessage({data:msg})\n        }\n    }\n\npost_message = function(msg){\n    fake.onmessage({data:msg})\n    };\nreturn fake")();
	      worker.id = w;
	      worker.last_progress = [0];
	      worker.remaining = [0];
	      worker.onmessage = onmessage;
	      workers.push(worker);
	      NUM_WORKERS_32 = NUM_WORKERS_64 = 1;
	      return;
	    }
	    blob = new Blob([worker_code], {
	      'type': 'application/javascript'
	    });
	    worker_uri = (window.URL || window.webkitURL).createObjectURL(blob);
	    num_workers = NUM_WORKERS_32;
	    if (is_64_bit_os) {
	      num_workers = NUM_WORKERS_64;
	    }
	    for (w = j = 0, ref3 = num_workers; 0 <= ref3 ? j < ref3 : j > ref3; w = 0 <= ref3 ? ++j : --j) {
	      worker = new Worker(worker_uri);
	      worker.id = w;
	      worker.last_progress = [0];
	      worker.remaining = [0];
	      worker.onmessage = onmessage;
	      workers.push(worker);
	    }
	  }
	
	  XhrLoader.prototype.check_queue_finished = function(queue_id) {
	    var f, j, k, len, ref3, ref4, remaining, results, scene;
	    remaining = this.remaining_tasks[queue_id];
	    if (remaining === 0) {
	      ref3 = this.context.scenes;
	      for (k in ref3) {
	        scene = ref3[k];
	        if (scene && !scene.world && this.physics_engine_loaded) {
	          scene.on_physics_engine_loaded();
	        }
	      }
	      ref4 = this.queue_listeners[queue_id];
	      results = [];
	      for (j = 0, len = ref4.length; j < len; j++) {
	        f = ref4[j];
	        if (f) {
	          results.push(f());
	        } else {
	          results.push(void 0);
	        }
	      }
	      return results;
	    } else if (remaining < 0) {
	      return raise("Too many finished tasks!");
	    }
	  };
	
	  XhrLoader.prototype.add_task = function(uri, callback, decoder, extra_data, queue_id) {
	    var cb_list, id, num_workers, worker;
	    if (queue_id == null) {
	      queue_id = 0;
	    }
	    id = this.next_task_id;
	    cb_list = this.task_cb[id] = this.task_cb[id] || [];
	    cb_list.push(callback);
	    num_workers = NUM_WORKERS_32;
	    if (is_64_bit_os) {
	      num_workers = NUM_WORKERS_64;
	    }
	    worker = this.workers[id % num_workers];
	    this.remaining_tasks[queue_id] = (this.remaining_tasks[queue_id] | 0) + 1;
	    worker.remaining[queue_id] = (worker.remaining[queue_id] | 0) + 1;
	    if (!/^http/.test(uri)) {
	      uri = this.full_local_path + uri;
	    }
	    if (extra_data && (extra_data.byteArray != null)) {
	      worker.postMessage(['get', queue_id, id, uri, decoder, extra_data], [extra_data]);
	    } else {
	      worker.postMessage(['get', queue_id, id, uri, decoder, extra_data]);
	    }
	    return this.next_task_id += 1;
	  };
	
	  XhrLoader.prototype.add_anon_task = function(queue_id) {
	    var id;
	    id = this.next_task_id;
	    this.remaining_tasks[queue_id] = this.remaining_tasks[queue_id] | 0 + 1;
	    this.next_task_id += 1;
	    return this.next_task_id;
	  };
	
	  XhrLoader.prototype.finish_anon_task = function(queue_id) {
	    this.remaining_tasks[queue_id] -= 1;
	    return this.check_queue_finished(queue_id);
	  };
	
	  XhrLoader.prototype.add_queue_listener = function(queue_id, f) {
	    var l;
	    l = this.queue_listeners[queue_id] = this.queue_listeners[queue_id] || [];
	    return l.push(f);
	  };
	
	  XhrLoader.prototype.remove_queue_listener = function(queue_id, f) {
	    var l;
	    l = this.queue_listeners[queue_id];
	    if (l) {
	      return l.remove(f);
	    }
	  };
	
	  XhrLoader.prototype.load_scene = function(scene_name, filter_function) {
	    var base, f;
	    f = (function(_this) {
	      return function(data) {
	        var d;
	        d = JSON.parse(data);
	        if (filter_function) {
	          d = filter_function(d);
	        }
	        _this.load(d);
	        return true;
	      };
	    })(this);
	    base = this.data_dir + '/scenes/';
	    return this.add_task(base + scene_name + '/all.json', f, 'text');
	  };
	
	  XhrLoader.prototype.load_physics_engine = function() {
	    var script;
	    if (!window.global_ammo_promise) {
	      window.global_ammo_promise = new Promise(function(resolve, reject) {
	        var check_ammo_is_loaded;
	        check_ammo_is_loaded = function() {
	          var ref3;
	          if (typeof Ammo === "undefined" || Ammo === null) {
	            if ((ref3 = window.Module) != null ? ref3.allocate : void 0) {
	              return reject("There was an error initializing physics");
	            } else {
	              return setTimeout(check_ammo_is_loaded, 300);
	            }
	          } else {
	            return resolve();
	          }
	        };
	        return setTimeout(check_ammo_is_loaded, 300);
	      });
	      script = document.createElement('script');
	      script.type = 'text/javascript';
	      script.async = true;
	      script.src = this.physics_engine_url;
	      document.body.appendChild(script);
	    }
	    return window.global_ammo_promise = global_ammo_promise.then((function(_this) {
	      return function() {
	        var k, ref3, scene;
	        physics_engine_init();
	        _this.physics_engine_loaded = true;
	        ref3 = _this.context.scenes;
	        for (k in ref3) {
	          scene = ref3[k];
	          if (scene && !scene.world) {
	            scene.on_physics_engine_loaded();
	          }
	        }
	      };
	    })(this));
	  };
	
	  XhrLoader.prototype.load_script = function(uri, func) {
	    var f;
	    if (func == null) {
	      func = null;
	    }
	    if (location.protocol === "chrome-extension:") {
	      func();
	      return;
	    }
	    f = function(data) {
	      if (this.context.MYOU_PARAMS.debug) {
	        data = "console.log('Loading " + uri + "');\n" + data;
	      }
	      window["eval"](data);
	      if (func) {
	        func();
	      }
	      return true;
	    };
	    return this.add_task(this.data_dir + uri, f, 'text');
	  };
	
	  XhrLoader.prototype.load_script_with_tag_callback = function(uri, func) {
	    var f, queue_id, script, script_file_name;
	    if (func == null) {
	      func = null;
	    }
	    script_file_name = uri.split('/').pop(-1).split('?')[0];
	    queue_id = 0;
	    this.add_anon_task(queue_id);
	    f = (function(_this) {
	      return function() {
	        _this.finish_anon_task(queue_id);
	        delete script_tag_loaded_callbacks[script_file_name];
	        if (func) {
	          return func();
	        }
	      };
	    })(this);
	    script_tag_loaded_callbacks[script_file_name] = f;
	    script = document.createElement('script');
	    script.type = 'text/javascript';
	    script.async = true;
	    script.src = this.data_dir + uri;
	    return document.body.appendChild(script);
	  };
	
	  XhrLoader.prototype.load_mesh_data = function(mesh_object, min_lod) {
	    var alt, any_loaded, base, file_name, j, last_lod, len, len1, lod_ob, lod_objects, non_packed, o, packed, pending_meshes, ref3, uri;
	    if (min_lod == null) {
	      min_lod = 1;
	    }
	    if (mesh_object.type !== 'MESH') {
	      return false;
	    }
	    file_name = mesh_object.packed_file || mesh_object.hash;
	    pending_meshes = this.pending_meshes;
	    ref3 = mesh_object.altmeshes;
	    for (j = 0, len = ref3.length; j < len; j++) {
	      alt = ref3[j];
	      if (alt !== mesh_object) {
	        this.load_mesh_data(alt);
	      }
	    }
	    any_loaded = false;
	    lod_objects = mesh_object.lod_objects;
	    last_lod = lod_objects[lod_objects.length - 1];
	    if (last_lod) {
	      min_lod = Math.max(min_lod, last_lod.factor);
	    }
	    for (o = 0, len1 = lod_objects.length; o < len1; o++) {
	      lod_ob = lod_objects[o];
	      if (lod_ob.factor <= min_lod) {
	        any_loaded = this.load_mesh_data(lod_ob.object) || any_loaded;
	      }
	    }
	    if (min_lod < 1 || mesh_object.data) {
	      return any_loaded;
	    }
	    if (file_name in pending_meshes) {
	      if (pending_meshes[file_name].indexOf(mesh_object === -1)) {
	        pending_meshes[file_name].push(mesh_object);
	      }
	    } else {
	      pending_meshes[file_name] = [];
	      base = this.data_dir + '/scenes/';
	      uri = base + mesh_object.scene.name + '/' + file_name + '.mesh';
	      packed = (function(_this) {
	        return function(data) {
	          var m, others;
	          m = mesh_object;
	          others = pending_meshes[file_name];
	          while (m) {
	            m.data && m.data.remove(m);
	            m.data = _this.context.mesh_datas[m.hash];
	            if (m.data) {
	              m.data.users.push(m);
	            } else {
	              m.load_from_arraybuffer(data);
	            }
	            m = others.pop();
	          }
	          delete pending_meshes[file_name];
	          return true;
	        };
	      })(this);
	      non_packed = function(data) {
	        var len2, m, q, ref4;
	        mesh_object.load_from_arraybuffer(data);
	        ref4 = pending_meshes[file_name];
	        for (q = 0, len2 = ref4.length; q < len2; q++) {
	          m = ref4[q];
	          m.data && m.data.remove(m);
	          m.data = mesh_object.data;
	          m.data.users.push(m);
	          if (!m.body) {
	            m.instance_physics();
	          }
	        }
	        delete pending_meshes[file_name];
	        return true;
	      };
	      if (mesh_object.packed_file) {
	        this.add_task(uri, packed, '');
	      } else {
	        this.add_task(uri, non_packed, '');
	      }
	    }
	    return true;
	  };
	
	  return XhrLoader;
	
	})(Loader);
	
	set_altmesh = function(ob, i) {
	  return ob.active_mesh_index = i;
	};
	
	module.exports = {
	  XhrLoader: XhrLoader,
	  WebSocketLoader: WebSocketLoader,
	  Loader: Loader
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(26), "/", "/index.js"))

/***/ },
/* 26 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 27 */
/***/ function(module, exports) {

	var Group;
	
	Group = (function() {
	  function Group(objects, offset) {
	    this.objects = objects;
	    this.offset = offset;
	  }
	
	  return Group;
	
	})();
	
	module.exports = {
	  Group: Group
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var Viewport, mat2, mat3, mat4, quat, ref, vec2, vec3, vec4;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	Viewport = (function() {
	  function Viewport(render_manager, camera, rect, custom_size, dest_buffer) {
	    if (rect == null) {
	      rect = [0, 0, 1, 1];
	    }
	    if (custom_size == null) {
	      custom_size = [0, 0];
	    }
	    this.render_manager = render_manager;
	    if (dest_buffer == null) {
	      dest_buffer = render_manager.main_fb;
	    }
	    this.rect = rect;
	    this.rect_pix = rect;
	    this.dest_buffer = dest_buffer;
	    this.camera = camera;
	    this.post_processing_enabled = false;
	    this.post_processing_filters = [render_manager.dummy_filter];
	    this.custom_size = custom_size;
	    this.eye_shift = vec3.create();
	    this.debug_camera = null;
	    this.set_clear(true, true);
	    render_manager.viewports.push(this);
	    this.recalc_aspect();
	    render_manager.recalculate_fb_size();
	  }
	
	  Viewport.prototype.recalc_aspect = function() {
	    var cs, h, r, w;
	    r = this.rect;
	    w = this.dest_buffer.size_x;
	    h = this.dest_buffer.size_y;
	    this.camera.aspect_ratio = (r[2] * this.render_manager.width) / (r[3] * this.render_manager.height);
	    this.camera.recalculate_projection();
	    cs = this.custom_size;
	    if (cs[0] === 0 && cs[1] === 0) {
	      this.rect_pix = [r[0] * w, r[1] * h, r[2] * w, r[3] * h];
	    } else {
	      this.rect_pix = [r[0] * w, r[1] * h, cs[0], cs[1]];
	    }
	    return this.dest_rect_pix = [r[0] * w, r[1] * h, r[2] * w, r[3] * h];
	  };
	
	  Viewport.prototype.set_clear = function(color, depth) {
	    var c;
	    c = color ? 16384 : 0;
	    c |= depth ? 256 : 0;
	    return this.clear_bits = c;
	  };
	
	  return Viewport;
	
	})();
	
	module.exports = {
	  Viewport: Viewport
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var Camera, GameObject, VECTOR_X, VECTOR_Y, ZERO_MAT4, mat2, mat3, mat4, quat, ref, vec2, vec3, vec4,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	GameObject = __webpack_require__(22).GameObject;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	ZERO_MAT4 = new Float32Array(16);
	
	VECTOR_X = new Float32Array([1, 0, 0]);
	
	VECTOR_Y = new Float32Array([0, 1, 0]);
	
	Camera = (function(superClass) {
	  var type;
	
	  extend(Camera, superClass);
	
	  type = 'CAMERA';
	
	  function Camera(context, field_of_view, aspect_ratio, near_plane, far_plane) {
	    this.context = context;
	    if (field_of_view == null) {
	      field_of_view = 30.0;
	    }
	    if (aspect_ratio == null) {
	      aspect_ratio = 1;
	    }
	    if (near_plane == null) {
	      near_plane = 0.1;
	    }
	    if (far_plane == null) {
	      far_plane = 10000.0;
	    }
	    Camera.__super__.constructor.call(this, this.context);
	    this.near_plane = near_plane;
	    this.far_plane = far_plane;
	    this.field_of_view = field_of_view * Math.PI / 180.0;
	    this.aspect_ratio = aspect_ratio;
	    this.cam_type = 'PERSP';
	    this.sensor_fit = 'AUTO';
	    this.projection_matrix = new Float32Array(16);
	    this.projection_matrix_inv = new Float32Array(16);
	    this.world_to_screen_matrix = new Float32Array(16);
	    this.cull_left = new Float32Array(3);
	    this.cull_bottom = new Float32Array(3);
	    this.recalculate_projection();
	  }
	
	  Camera.prototype.instance_physics = function() {};
	
	  Camera.prototype.get_ray_direction = function(x, y) {
	    var pos_rot, v;
	    v = vec3.create();
	    v[0] = x * 2 - 1;
	    v[1] = 1 - y * 2;
	    v[2] = 1;
	    pos_rot = this.get_world_pos_rot();
	    vec3.transformMat4(v, v, this.projection_matrix_inv);
	    vec3.transformQuat(v, v, pos_rot[1]);
	    vec3.add(v, v, pos_rot[0]);
	    return v;
	  };
	
	  Camera.prototype.get_ray_direction_local = function(x, y) {
	    var v;
	    v = vec3.create();
	    v[0] = x * 2 - 1;
	    v[1] = 1 - y * 2;
	    v[2] = 1;
	    vec3.transformMat4(v, v, this.projection_matrix_inv);
	    vec3.transformQuat(v, v, this.rotation);
	    return v;
	  };
	
	  Camera.prototype.recalculate_projection = function() {
	    var a, b, bottom, c, d, far_plane, half_size, left, near_plane, pm, right, sensor_fit, top, v, x, y;
	    near_plane = this.near_plane;
	    far_plane = this.far_plane;
	    sensor_fit = this.sensor_fit;
	    if (this.cam_type === 'PERSP') {
	      half_size = near_plane * Math.tan(this.field_of_view / 2);
	    } else if (this.cam_type === 'ORTHO') {
	      half_size = this.ortho_scale / 2;
	    } else {
	      raise("Camera.cam_type must be PERSP or ORTHO.");
	    }
	    if (sensor_fit === 'AUTO') {
	      if (this.aspect_ratio > 1) {
	        sensor_fit = 'HORIZONTAL';
	      } else {
	        sensor_fit = 'VERTICAL';
	      }
	    }
	    if (sensor_fit === 'HORIZONTAL') {
	      right = half_size;
	      top = right / this.aspect_ratio;
	    } else if (sensor_fit === 'VERTICAL') {
	      top = half_size;
	      right = top * this.aspect_ratio;
	    } else {
	      raise("Camera.sensor_fit must be AUTO, HORIZONTAL or VERTICAL.");
	    }
	    bottom = -top;
	    left = -right;
	    pm = this.projection_matrix;
	    a = (right + left) / (right - left);
	    b = (top + bottom) / (top - bottom);
	    c = -(far_plane + near_plane) / (far_plane - near_plane);
	    if (this.cam_type === 'PERSP') {
	      d = -(2 * far_plane * near_plane) / (far_plane - near_plane);
	      x = (2 * near_plane) / (right - left);
	      y = (2 * near_plane) / (top - bottom);
	      pm.set(ZERO_MAT4);
	      pm[0] = x;
	      pm[5] = y;
	      pm[8] = a;
	      pm[9] = b;
	      pm[10] = c;
	      pm[11] = -1;
	      pm[14] = d;
	      mat4.invert(this.projection_matrix_inv, this.projection_matrix);
	      v = this.cull_left;
	      v[0] = -1;
	      v[1] = 0;
	      v[2] = 1;
	      vec3.transformMat4(v, v, this.projection_matrix_inv);
	      vec3.cross(v, v, VECTOR_Y);
	      vec3.normalize(v, v);
	      v = this.cull_bottom;
	      v[0] = 0;
	      v[1] = -1;
	      v[2] = 1;
	      vec3.transformMat4(v, v, this.projection_matrix_inv);
	      vec3.cross(v, VECTOR_X, v);
	      return vec3.normalize(v, v);
	    } else {
	      d = -2 / (far_plane - near_plane);
	      x = 2 / (right - left);
	      y = 2 / (top - bottom);
	      pm.set(ZERO_MAT4);
	      pm[0] = x;
	      pm[5] = y;
	      pm[10] = d;
	      pm[12] = -a;
	      pm[13] = -b;
	      pm[14] = c;
	      pm[15] = 1;
	      mat4.invert(this.projection_matrix_inv, this.projection_matrix);
	      return console.error("TODO: frustum culling for ortho!");
	    }
	  };
	
	  return Camera;
	
	})(GameObject);
	
	module.exports = {
	  Camera: Camera
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var Framebuffer, GameObject, Lamp, Material, mat2, mat3, mat4, quat, ref, vec2, vec3, vec4,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	GameObject = __webpack_require__(22).GameObject;
	
	Framebuffer = __webpack_require__(20).Framebuffer;
	
	Material = __webpack_require__(19).Material;
	
	Lamp = (function(superClass) {
	  extend(Lamp, superClass);
	
	  Lamp.prototype.type = 'LAMP';
	
	  function Lamp(context) {
	    this.context = context;
	    Lamp.__super__.constructor.call(this, this.context);
	    this.lamp_type = 'POINT';
	    this.shadow_fb = null;
	    this._color4 = vec4.fromValues(1, 1, 1, 1);
	    this.color = this._color4.subarray(0, 3);
	    this.energy = 1;
	    this._view_pos = vec3.create();
	    this._dir = vec3.create();
	    this._depth_matrix = mat4.create();
	    this._cam2depth = mat4.create();
	    this._projection_matrix = mat4.create();
	  }
	
	  Lamp.prototype.instance_physics = function() {};
	
	  Lamp.prototype.init_shadow = function(frustum_size, clip_start, clip_end, tex_size) {
	    var fs, mat, vs;
	    this.shadow_fb = new Framebuffer(this.context.render_manager, tex_size, tex_size);
	    vs = "precision highp float;\nuniform mat4 projection_matrix;\nuniform mat4 model_view_matrix;\nattribute vec3 vertex;\nvarying vec4 varposition;\nvoid main(){\n    gl_Position = varposition =\n    projection_matrix * model_view_matrix * vec4(vertex, 1.0);\n}";
	    fs = "#extension GL_OES_standard_derivatives : enable\nprecision highp float;\nvarying vec4 varposition;\nvoid main(){\n    float depth = varposition.z/varposition.w;\n    depth = depth * 0.5 + 0.5;\n    float dx = dFdx(depth);\n    float dy = dFdy(depth);\n    gl_FragColor = vec4(depth, pow(depth, 2.0) + 0.25*(dx*dx + dy*dy), 0.0, 1.0);\n}";
	    mat = new Material(this.context, this.name + '_shadow', fs, [], [], vs);
	    mat.is_shadow_material = true;
	    this._shadow_material = mat;
	    mat4.ortho(this._projection_matrix, -frustum_size, frustum_size, -frustum_size, frustum_size, clip_start, clip_end);
	    return mat4.multiply(this._depth_matrix, [0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0], this._projection_matrix);
	  };
	
	  return Lamp;
	
	})(GameObject);
	
	module.exports = {
	  Lamp: Lamp
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var PhysicsWorld, Scene, _collision_seq, get_scene, mat2, mat3, mat4, quat, ref, ref1, set_gravity, vec2, vec3, vec4;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	ref1 = __webpack_require__(24), PhysicsWorld = ref1.PhysicsWorld, set_gravity = ref1.set_gravity;
	
	_collision_seq = 0;
	
	get_scene = function(context, name) {
	  var scene;
	  scene = context.scenes[name] = context.scenes[name] || new Scene(context);
	  scene.name = name;
	  return scene;
	};
	
	Scene = (function() {
	  function Scene(context) {
	    this.context = context;
	    this.name = '';
	    this.loaded = false;
	    this.enabled = false;
	    this.children = [];
	    this.auto_updated_children = [];
	    this.mesh_passes = [[], [], []];
	    this.lamps = [];
	    this.armatures = [];
	    this.objects = {};
	    this.parents = {};
	    this.rigid_bodies = [];
	    this.static_ghosts = [];
	    this.kinematic_characters = [];
	    this.debug_physics = false;
	    this.materials = {};
	    this.unloaded_material_data = {};
	    this.active_camera = null;
	    this.loader = null;
	    this.world = null;
	    this.gravity = vec3.create();
	    this.tree_name = null;
	    this.tree = null;
	    this._children_are_ordered = true;
	    this.last_render_tick = 0;
	    this.load_callbacks = [];
	    this.logic_ticks = [];
	    this.pre_draw_callbacks = [];
	    this.post_draw_callbacks = [];
	    this._pending_tasks = 0;
	    this.active_particle_systems = [];
	  }
	
	  Scene.prototype.on_physics_engine_loaded = function() {
	    var g, j, len, ob, ref2;
	    this.world = new PhysicsWorld;
	    g = this.gravity;
	    set_gravity(this.world, g[0], g[1], g[2]);
	    ref2 = this.children;
	    for (j = 0, len = ref2.length; j < len; j++) {
	      ob = ref2[j];
	      ob.instance_physics();
	    }
	  };
	
	  Scene.prototype.set_gravity = function(gravity) {
	    var g;
	    g = this.gravity;
	    vec3.copy(g, gravity);
	    if (this.world) {
	      return set_gravity(this.world, g[0], g[1], g[2]);
	    }
	  };
	
	  Scene.prototype.add_object = function(ob, name, parent_name, parent_bone) {
	    var j, len, n, p, ref2;
	    if (name == null) {
	      name = 'no_name';
	    }
	    if (parent_name == null) {
	      parent_name = '';
	    }
	    ob.scene = this;
	    this.children.push(ob);
	    if (!ob["static"]) {
	      this.auto_updated_children.push(ob);
	    }
	    n = name;
	    while (this.context.objects[n]) {
	      _collision_seq += 1;
	      n = name + '$' + _collision_seq;
	    }
	    ob.name = n;
	    ob.original_name = name;
	    this.objects[n] = this.context.objects[n] = ob;
	    this.parents[name] = ob;
	    p = this.parents[parent_name];
	    if (p) {
	      ob.parent = p;
	      p.children.push(ob);
	      if (p.type === 'ARMATURE' && parent_bone) {
	        ob.parent_bone_index = p._bone_list.indexOf(p.bones[parent_bone]);
	      }
	    }
	    if (ob.type === 'MESH') {
	      ref2 = ob.passes;
	      for (j = 0, len = ref2.length; j < len; j++) {
	        p = ref2[j];
	        this.mesh_passes[p].push(ob);
	      }
	    }
	    if (ob.type === 'LAMP') {
	      this.lamps.push(ob);
	    }
	    if (ob.type === 'ARMATURE') {
	      return this.armatures.push(ob);
	    }
	  };
	
	  Scene.prototype.remove_object = function(ob, recursive) {
	    var child, children, i, j, ref2;
	    if (recursive == null) {
	      recursive = true;
	    }
	    this.children.remove(ob);
	    if (!ob["static"]) {
	      this.auto_updated_children.remove(ob);
	    }
	    delete this.objects[ob.name];
	    delete this.parents[ob.original_name];
	    if (ob.type === 'MESH') {
	      this.mesh_passes[0].remove(ob);
	      this.mesh_passes[1].remove(ob);
	      this.fg_pass && this.fg_pass.remove(ob);
	      this.bg_pass && this.bg_pass.remove(ob);
	      if (ob.data) {
	        ob.data.remove(ob);
	      }
	    }
	    if (ob.type === 'LAMP') {
	      this.lamps.remove(ob);
	    }
	    if (ob.type === 'ARMATURE') {
	      this.armatures.remove(ob);
	    }
	    if (ob.body) {
	      remove_body(this.world, ob.body);
	      this.rigid_bodies.remove(ob);
	      this.static_ghosts.remove(ob);
	    }
	    if (recursive) {
	      children = ob.children;
	      for (i = j = 0, ref2 = children.length; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
	        child = l - i - 1;
	        this.remove_object(children[i]);
	      }
	    }
	  };
	
	  Scene.prototype.make_parent = function(parent, child, keep_transform) {
	    var p_rot, pos, rot;
	    if (keep_transform == null) {
	      keep_transform = true;
	    }
	    if (child.parent) {
	      this.clear_parent(child, keep_transform);
	    }
	    if (keep_transform) {
	      pos = child.position;
	      rot = child.rotation;
	      vec3.sub(pos, pos, parent.get_world_position());
	      p_rot = quat.invert([], parent.get_world_rotation());
	      vec3.transformQuat(pos, pos, p_rot);
	      quat.mul(rot, p_rot, rot);
	    }
	    child.parent = parent;
	    if (this.children.indexOf(parent) > this.children.indexOf(child)) {
	      return this._children_are_ordered = false;
	    }
	  };
	
	  Scene.prototype.clear_parent = function(child, keep_transform, reorder) {
	    var ns, parent, s;
	    if (keep_transform == null) {
	      keep_transform = true;
	    }
	    if (reorder == null) {
	      reorder = true;
	    }
	    parent = child.parent;
	    if (parent) {
	      if (keep_transform) {
	        vec3.copy(child.position, child.get_world_position());
	        quat.copy(child.rotation, child.get_world_rotation());
	      }
	      s = parent.first_child;
	      if (s === child) {
	        parent.first_child = child.next_sibling;
	      } else {
	        ns = s.next_sibling;
	        while (ns !== child) {
	          s = ns;
	          ns = s.next_sibling;
	        }
	        s.next_sibling = child.next_sibling;
	      }
	      return child.parent = child.next_sibling = null;
	    }
	  };
	
	  Scene.prototype.reorder_children = function() {
	    'Makes sure all scene children are in order for correct matrix calculations';
	    var children, index, name, ob, objects, reorder;
	    children = this.children;
	    reorder = function(ob, index) {
	      var c, j, len, ref2, results;
	      children[index] = ob;
	      ref2 = ob.children;
	      results = [];
	      for (j = 0, len = ref2.length; j < len; j++) {
	        c = ref2[j];
	        results.push(reorder(c, index));
	      }
	      return results;
	    };
	    index = 0;
	    objects = this.objects;
	    for (name in objects) {
	      ob = objects[name];
	      if (!ob.parent) {
	        reorder(ob, index);
	        index += 1;
	      }
	    }
	    return this._children_are_ordered = true;
	  };
	
	  Scene.prototype.load = function() {
	    var loader;
	    if (!this.loaded) {
	      loader = scene.loader;
	      return loader.load_scene(this.name);
	    }
	  };
	
	  Scene.prototype.unload = function() {
	    var j, k, len, len1, ob, ref2, ref3, stub, v;
	    ref2 = this.children.slice(0);
	    for (j = 0, len = ref2.length; j < len; j++) {
	      ob = ref2[j];
	      this.remove_object(ob, false);
	      delete this.context.objects[ob.name];
	    }
	    destroy_world(this.world);
	    stub = this.context.scenes[this.name] = new Scene(this.context);
	    stub.name = this.name;
	    stub.load_callbacks = this.load_callbacks;
	    stub.pre_draw_callbacks = this.pre_draw_callbacks;
	    stub.post_draw_callbacks = this.post_draw_callbacks;
	    stub.logic_ticks = this.logic_ticks;
	    ref3 = render_manager.viewports.slice(0);
	    for (k = 0, len1 = ref3.length; k < len1; k++) {
	      v = ref3[k];
	      if (v.camera.scene === this) {
	        render_manager.viewports.remove(v);
	      }
	    }
	    if (this.context.scene === this) {
	      return this.context.scene = null;
	    }
	  };
	
	  Scene.prototype.reload = function() {
	    this.unload();
	    return this.loader.load_scene(this.name);
	  };
	
	  Scene.prototype.increment_task_count = function() {
	    return this._pending_tasks += 1;
	  };
	
	  Scene.prototype.decrement_task_count = function() {
	    var f, j, len, ref2, results;
	    if (this._pending_tasks !== 0) {
	      this._pending_tasks -= 1;
	      if (this._pending_tasks === 0 && !this.loaded) {
	        this.context.loaded_scenes.push(this);
	        this.loaded = true;
	        ref2 = this.load_callbacks;
	        results = [];
	        for (j = 0, len = ref2.length; j < len; j++) {
	          f = ref2[j];
	          results.push(f(this));
	        }
	        return results;
	      }
	    }
	  };
	
	  return Scene;
	
	})();
	
	module.exports = {
	  Scene: Scene,
	  get_scene: get_scene
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var Curve, GameObject, mat2, mat3, mat4, quat, ref, vec2, vec3, vec4,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty,
	  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	GameObject = __webpack_require__(22).GameObject;
	
	Curve = (function(superClass) {
	  extend(Curve, superClass);
	
	  function Curve(context) {
	    this.context = context;
	    Curve.__super__.constructor.call(this, this.context);
	    this.type = 'CURVE';
	  }
	
	  Curve.prototype.instance_physics = function() {};
	
	  Curve.prototype.set_curves = function(curves, resolution, nodes) {
	    var c, c_indices, c_vertices, cia, cn, curve_index, cva, e, i, i9, ia, indices, j, k, len, len1, len2, m, n, o, origins, p0x, p0y, p0z, p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z, r, ref1, ref2, ref3, ref4, results, s, va, vertices, x, y, z;
	    if (nodes == null) {
	      nodes = false;
	    }
	    this.curves = curves;
	    this.calculated_curves = [];
	    indices = [];
	    vertices = [];
	    n = 0;
	    this.origins = origins = [];
	    for (k = 0, len = curves.length; k < len; k++) {
	      c = curves[k];
	      cn = 0;
	      c_indices = [];
	      c_vertices = [];
	      for (i = m = 0, ref1 = Math.floor((c.length / 9) - 1); 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
	        i9 = i * 9;
	        p0x = c[i9 + 3];
	        p0y = c[i9 + 4];
	        p0z = c[i9 + 5];
	        p1x = c[i9 + 6];
	        p1y = c[i9 + 7];
	        p1z = c[i9 + 8];
	        p2x = c[i9 + 9];
	        p2y = c[i9 + 10];
	        p2z = c[i9 + 11];
	        p3x = c[i9 + 12];
	        p3y = c[i9 + 13];
	        p3z = c[i9 + 14];
	        for (j = o = 0, ref2 = resolution; 0 <= ref2 ? o < ref2 : o > ref2; j = 0 <= ref2 ? ++o : --o) {
	          x = interpolate(j / resolution, p0x, p1x, p2x, p3x);
	          y = interpolate(j / resolution, p0y, p1y, p2y, p3y);
	          z = interpolate(j / resolution, p0z, p1z, p2z, p3z);
	          vertices.extend([x, y, z]);
	          indices.append(n);
	          indices.append(n + 1);
	          c_vertices.extend([x, y, z]);
	          c_indices.append(cn);
	          c_indices.append(cn + 1);
	          n += 1;
	          cn += 1;
	        }
	      }
	      c_vertices.extend([p3x, p3y, p3z]);
	      cva = new Float32Array(c_vertices);
	      cia = new Uint16Array(c_indices);
	      this.calculated_curves.append({
	        'ia': cia,
	        'va': cva
	      });
	      vertices.extend([p3x, p3y, p3z]);
	      n += 1;
	    }
	    va = this.va = new Float32Array(vertices);
	    ia = this.ia = new Uint16Array(indices);
	    this.phy_he = [1, 1, 1];
	    curve_index = 0;
	    ref3 = this.calculated_curves;
	    results = [];
	    for (r = 0, len1 = ref3.length; r < len1; r++) {
	      c = ref3[r];
	      if (nodes) {
	        c.nodes = nodes[curve_index];
	      } else {
	        c.nodes = this.get_nodes(curve_index);
	      }
	      c.la = this.get_curve_edges_length(curve_index);
	      c.da = this.get_curve_direction_vectors(curve_index);
	      c.curve = this;
	      c.length = 0;
	      ref4 = c.la;
	      for (s = 0, len2 = ref4.length; s < len2; s++) {
	        e = ref4[s];
	        c.length += e;
	      }
	      results.push(curve_index += 1);
	    }
	    return results;
	  };
	
	  Curve.prototype.closest_point = function(q, scale) {
	    var d1, d2, dp1, dp2, ds, ds_, f, i, i2, ia, k, np1, np2, p, p1, p2, ref1, sum, va, wn, wp;
	    if (scale == null) {
	      scale = [1, 1, 1];
	    }
	    wp = vec3.create();
	    wn = vec3.create();
	    ds = Infinity;
	    p1 = vec3.create();
	    p2 = vec3.create();
	    np1 = vec3.create();
	    np2 = vec3.create();
	    d1 = vec3.create();
	    d2 = vec3.create();
	    p = vec3.create();
	    va = this.va;
	    ia = this.ia;
	    for (i = k = 0, ref1 = Math.floor(ia.length * 0.5); 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
	      i2 = i * 2;
	      vec3.mul(p1, va.subarray(ia[i2] * 3, ia[i2] * 3 + 3), scale);
	      vec3.mul(p2, va.subarray(ia[i2 + 1] * 3, ia[i2 + 1] * 3 + 3), scale);
	      vec3.sub(np1, p2, p1);
	      vec3.sub(np2, p1, p2);
	      vec3.sub(d1, q, p1);
	      vec3.sub(d2, q, p2);
	      dp1 = vec3.dot(np1, d1);
	      dp2 = vec3.dot(np2, d2);
	      sum = dp1 + dp2;
	      f = max(0, min(1, dp1 / sum));
	      vec3.lerp(p, p1, p2, f);
	      ds_ = vec3.sqrDist(p, q);
	      if (ds_ < ds) {
	        ds = ds_;
	        vec3.copy(wp, p);
	        vec3.sub(wn, p2, p1);
	      }
	    }
	    vec3.normalize(wn, wn);
	    return [wp, wn];
	  };
	
	  Curve.prototype.get_curve_edges_length = function(curve_index) {
	    var curve, i, i2, ia, k, l, p1, p2, ref1, scale, va;
	    scale = this.scale;
	    curve = this.calculated_curves[curve_index];
	    ia = curve.ia;
	    va = curve.va;
	    l = [];
	    for (i = k = 0, ref1 = Math.floor(ia.length * 0.5); 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
	      p1 = vec3.create();
	      p2 = vec3.create();
	      i2 = i * 2;
	      vec3.mul(p1, va.subarray(ia[i2] * 3, ia[i2] * 3 + 3), scale);
	      vec3.mul(p2, va.subarray(ia[i2 + 1] * 3, ia[i2 + 1] * 3 + 3), scale);
	      l.append(vec3.dist(p1, p2));
	    }
	    return new Float32Array(l);
	  };
	
	  Curve.prototype.get_curve_direction_vectors = function(curve_index) {
	    var curve, i, i2, ia, k, l, p1, p2, ref1, scale, va;
	    scale = this.scale;
	    curve = this.calculated_curves[curve_index];
	    ia = curve.ia;
	    va = curve.va;
	    l = [];
	    for (i = k = 0, ref1 = Math.floor(ia.length * 0.5); 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
	      p1 = vec3.create();
	      p2 = vec3.create();
	      i2 = i * 2;
	      vec3.mul(p1, va.subarray(ia[i2] * 3, ia[i2] * 3 + 3), scale);
	      vec3.mul(p2, va.subarray(ia[i2 + 1] * 3, ia[i2 + 1] * 3 + 3), scale);
	      l = l.concat(vec3.normalize([], vec3.sub([], p2, p1)));
	    }
	    return new Float32Array(l);
	  };
	
	  Curve.prototype.get_nodes = function(main_curve_index, precission) {
	    var ci, curve, d, i, i2, ii, ii2, k, len, m, main_curve, main_p, nodes, o, p, ref1, ref2, ref3;
	    if (main_curve_index == null) {
	      main_curve_index = 0;
	    }
	    if (precission == null) {
	      precission = 0.0001;
	    }
	    main_curve = this.calculated_curves[main_curve_index];
	    nodes = {};
	    for (i = k = 0, ref1 = Math.floor(main_curve.ia.length * 0.5); 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
	      i2 = i * 2;
	      main_p = main_curve.va.subarray(main_curve.ia[i2] * 3, main_curve.ia[i2] * 3 + 3);
	      ci = 0;
	      ref2 = this.calculated_curves;
	      for (m = 0, len = ref2.length; m < len; m++) {
	        curve = ref2[m];
	        if (ci !== main_curve_index) {
	          for (ii = o = 0, ref3 = Math.floor(curve.ia.length * 0.5); 0 <= ref3 ? o < ref3 : o > ref3; ii = 0 <= ref3 ? ++o : --o) {
	            ii2 = ii * 2;
	            p = curve.va.subarray(curve.ia[ii2] * 3, curve.ia[ii2] * 3 + 3);
	            d = vec3.dist(main_p, p);
	            if (d < precission) {
	              if (!(indexOf.call(nodes, i) >= 0)) {
	                nodes[i] = [[ci, ii]];
	              } else {
	                nodes[i].append([ci, ii]);
	              }
	            }
	          }
	        }
	      }
	      ci += 1;
	    }
	    return nodes;
	  };
	
	  return Curve;
	
	})(GameObject);
	
	module.exports = {
	  Curve: Curve
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var Armature, Bone, BoneConstraints, GameObject, mat2, mat3, mat4, quat, ref, rotation_to, vec2, vec3, vec4,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	GameObject = __webpack_require__(22).GameObject;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	Bone = (function(superClass) {
	  extend(Bone, superClass);
	
	  function Bone(context) {
	    this.context = context;
	    this.base_position = new Float32Array(3);
	    this.base_rotation = new Float32Array(4);
	    this.position = [0, 0, 0];
	    this.rotation = [0, 0, 0, 1];
	    this.scale = [1, 1, 1];
	    this.final_position = [0, 0, 0];
	    this.final_rotation = [0, 0, 0, 1];
	    this.final_scale = [1, 1, 1];
	    this.matrix = mat4.create();
	    this.ol_matrix = mat4.create();
	    this.inv_rest_matrix = mat4.create();
	    this.deform_id = -1;
	    this.constraints = [];
	  }
	
	  return Bone;
	
	})(GameObject);
	
	Armature = (function(superClass) {
	  extend(Armature, superClass);
	
	  Armature.prototype.type = 'ARMATURE';
	
	  function Armature(context) {
	    this.context = context;
	    Armature.__super__.constructor.call(this, this.context);
	    this.bones = {};
	    this._bone_list = [];
	    this.deform_bones = [];
	    this.unfc = 0;
	    this._m = mat4.create();
	  }
	
	  Armature.prototype.add_bones = function(bones) {
	    var b, bone, c, deform_id, i, k, l, len, len1, len2, len3, n, o, parent, ref1, ref2;
	    for (k = 0, len = bones.length; k < len; k++) {
	      b = bones[k];
	      bone = new Bone(this.context);
	      vec3.copy(bone.base_position, b['position']);
	      vec4.copy(bone.base_rotation, b['rotation']);
	      deform_id = b['deform_id'];
	      if (deform_id !== -1) {
	        bone.deform_id = deform_id;
	        this.deform_bones[deform_id] = bone;
	      }
	      parent = b['parent'];
	      if (parent !== "") {
	        bone.parent = this.bones[parent];
	      }
	      bone.blength = b.blength;
	      this._bone_list.push(bone);
	      this.bones[b.name] = bone;
	    }
	    this.recalculate_bone_matrices();
	    i = 0;
	    ref1 = this._bone_list;
	    for (l = 0, len1 = ref1.length; l < len1; l++) {
	      bone = ref1[l];
	      mat4.invert(bone.inv_rest_matrix, bone.matrix);
	      i += 1;
	    }
	    for (n = 0, len2 = bones.length; n < len2; n++) {
	      b = bones[n];
	      ref2 = b['constraints'];
	      for (o = 0, len3 = ref2.length; o < len3; o++) {
	        c = ref2[o];
	        c[0] = BoneConstraints.prototype[c[0]];
	        c[1] = this.bones[c[1]];
	        c[2] = this.bones[c[2]];
	      }
	      this.bones[b.name].constraints = b['constraints'];
	    }
	  };
	
	  Armature.prototype.recalculate_bone_matrices = function() {
	    var bone, con, k, l, len, len1, len2, m, n, parent, pos, ref1, ref2, ref3, rot, scl;
	    ref1 = this._bone_list;
	    for (k = 0, len = ref1.length; k < len; k++) {
	      bone = ref1[k];
	      pos = bone.final_position;
	      rot = quat.copy(bone.final_rotation, bone.rotation);
	      scl = vec3.copy(bone.final_scale, bone.scale);
	      vec3.transformQuat(pos, bone.position, bone.base_rotation);
	      vec3.add(pos, bone.base_position, pos);
	      quat.mul(rot, bone.base_rotation, bone.rotation);
	      parent = bone.parent;
	      if (parent) {
	        vec3.mul(scl, parent.final_scale, scl);
	        quat.mul(rot, parent.final_rotation, rot);
	        vec3.mul(pos, pos, parent.final_scale);
	        vec3.transformQuat(pos, pos, parent.final_rotation);
	        vec3.add(pos, pos, parent.final_position);
	      }
	      ref2 = bone.constraints;
	      for (l = 0, len1 = ref2.length; l < len1; l++) {
	        con = ref2[l];
	        con[0](con[1], con[2], con[3], con[4]);
	      }
	    }
	    ref3 = this._bone_list;
	    for (n = 0, len2 = ref3.length; n < len2; n++) {
	      bone = ref3[n];
	      m = bone.matrix;
	      pos = bone.final_position;
	      rot = bone.final_rotation;
	      scl = bone.final_scale;
	      mat4.fromRotationTranslation(m, rot, pos);
	      m[0] *= scl[0];
	      m[1] *= scl[0];
	      m[2] *= scl[0];
	      m[4] *= scl[1];
	      m[5] *= scl[1];
	      m[6] *= scl[1];
	      m[8] *= scl[2];
	      m[9] *= scl[2];
	      m[10] *= scl[2];
	      mat4.mul(bone.ol_matrix, m, bone.inv_rest_matrix, m);
	    }
	  };
	
	  Armature.prototype.apply_pose = function(pose) {
	    var b, bname, p;
	    for (bname in pose) {
	      p = pose[bname];
	      b = this.bones[bname];
	      vec3.copy(b.position, p.position);
	      vec4.copy(b.rotation, p.rotation);
	      vec3.copy(b.scale, p.scale);
	    }
	  };
	
	  return Armature;
	
	})(GameObject);
	
	rotation_to = function(out, p1, p2, maxang) {
	  var angle, axis;
	  angle = Math.atan2(vec3.len(vec3.cross([], p1, p2)), vec3.dot(p1, p2));
	  angle = Math.max(-maxang, Math.min(maxang, angle));
	  axis = vec3.cross([], p1, p2);
	  vec3.normalize(axis, axis);
	  quat.setAxisAngle(out, axis, angle);
	  quat.normalize(out, out);
	  return out;
	};
	
	BoneConstraints = (function() {
	  function BoneConstraints() {}
	
	  BoneConstraints.prototype.copy_location = function(owner, target) {
	    return quat.copy(owner.final_position, target.final_position);
	  };
	
	  BoneConstraints.prototype.copy_rotation = function(owner, target) {
	    return quat.copy(owner.final_rotation, target.final_rotation);
	  };
	
	  BoneConstraints.prototype.copy_scale = function(owner, target) {
	    return quat.copy(owner.final_scale, target.final_scale);
	  };
	
	  BoneConstraints.prototype.track_to_y = function(owner, target) {
	    return pass;
	  };
	
	  BoneConstraints.prototype.copy_rotation_one_axis = function(owner, target, axis) {
	    var q, rot, t;
	    rot = target.final_rotation;
	    q = quat.create();
	    if (target.parent) {
	      quat.invert(q, target.parent.final_rotation);
	      rot = quat.mul([], q, rot);
	    }
	    t = vec3.transformQuat(vec3.create(), axis, rot);
	    q = rotation_to(q, t, axis, 9999);
	    quat.mul(q, q, rot);
	    return quat.mul(owner.final_rotation, owner.final_rotation, q);
	  };
	
	  BoneConstraints.prototype.stretch_to = function(owner, target, rest_length, bulge) {
	    var XZ, dist, q, scl, v, v2;
	    dist = vec3.dist(owner.final_position, target.final_position);
	    scl = owner.final_scale;
	    scl[1] *= dist / rest_length;
	    XZ = 1 - Math.sqrt(bulge) + Math.sqrt(bulge * (rest_length / dist));
	    scl[0] *= XZ;
	    scl[2] *= XZ;
	    v = vec3.sub(vec3.create(), target.final_position, owner.final_position);
	    v2 = vec3.transformQuat(vec3.create(), VECTOR_Y, owner.final_rotation);
	    q = rotation_to(quat.create(), v2, v, 9999);
	    return quat.mul(owner.final_rotation, q, owner.final_rotation);
	  };
	
	  BoneConstraints.prototype.ik = function(owner, target, chain_length, num_iterations) {
	    var b, bones, first, i, iteration, j, k, l, len, len1, n, o, original_points, p, points, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, results, s, tip, tip_bone, u, v, w, x, y;
	    bones = [];
	    tip_bone = b = owner;
	    while (chain_length && b) {
	      bones.push(b);
	      b = b.parent;
	      chain_length -= 1;
	    }
	    first = bones[bones.length - 1].final_position;
	    target = vec3.clone(target.final_position);
	    vec3.sub(target, target, first);
	    points = [];
	    ref1 = bones.slice(0, -1);
	    for (k = 0, len = ref1.length; k < len; k++) {
	      b = ref1[k];
	      points.push(vec3.sub([], b.final_position, first));
	    }
	    tip = vec3.transformQuat([], [0, tip_bone.blength, 0], tip_bone.final_rotation);
	    vec3.add(tip, tip, tip_bone.final_position);
	    vec3.sub(tip, tip, first);
	    points.insert(0, tip);
	    original_points = [];
	    for (l = 0, len1 = points.length; l < len1; l++) {
	      p = points[l];
	      original_points.push(vec3.clone(p));
	    }
	    q = [];
	    for (iteration = n = 0, ref2 = num_iterations; 0 <= ref2 ? n < ref2 : n > ref2; iteration = 0 <= ref2 ? ++n : --n) {
	      vec3.sub(target, target, points[0]);
	      for (i = o = 0, ref3 = points.length - 1; 0 <= ref3 ? o < ref3 : o > ref3; i = 0 <= ref3 ? ++o : --o) {
	        vec3.sub(points[i], points[i], points[i + 1]);
	      }
	      for (i = s = 0, ref4 = points.length; 0 <= ref4 ? s < ref4 : s > ref4; i = 0 <= ref4 ? ++s : --s) {
	        vec3.add(target, target, points[i]);
	        for (j = u = 0, ref5 = i; 0 <= ref5 ? u < ref5 : u > ref5; j = 0 <= ref5 ? ++u : --u) {
	          vec3.add(points[j], points[j], points[i]);
	        }
	        rotation_to(q, points[0], target, 0.4);
	        for (j = w = 0, ref6 = i + 1; 0 <= ref6 ? w < ref6 : w > ref6; j = 0 <= ref6 ? ++w : --w) {
	          vec3.transformQuat(points[j], points[j], q);
	        }
	      }
	    }
	    for (i = x = 0, ref7 = points.length; 0 <= ref7 ? x < ref7 : x > ref7; i = 0 <= ref7 ? ++x : --x) {
	      vec3.add(points[i], points[i], first);
	      vec3.add(original_points[i], original_points[i], first);
	    }
	    v = vec3.create();
	    points.push(first);
	    original_points.push(first);
	    points.push([0, 0, 0]);
	    original_points.push([0, 0, 0]);
	    results = [];
	    for (i = y = 0, ref8 = points.length - 2; 0 <= ref8 ? y < ref8 : y > ref8; i = 0 <= ref8 ? ++y : --y) {
	      vec3.copy(bones[i].final_position, points[i + 1]);
	      vec3.sub(points[i], points[i], points[i + 1]);
	      vec3.sub(original_points[i], original_points[i], original_points[i + 1]);
	      rotation_to(q, original_points[i], points[i], 100);
	      r = bones[i].final_rotation;
	      results.push(quat.mul(r, q, r));
	    }
	    return results;
	  };
	
	  return BoneConstraints;
	
	})();
	
	module.exports = {
	  Armature: Armature,
	  Bone: Bone,
	  BoneConstraints: BoneConstraints
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "/libs/ammo.asm.js";

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "/libs/crunch.js";

/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = "var CRUNCH_MEM, MAX_ACTIVE_TASKS, Queue, console, dxtToRgb565, load_crunch, load_crunch_extra, onmessage, post_message, queues, remove_from_array, worker;\n\nCRUNCH_MEM = 64;\n\nMAX_ACTIVE_TASKS = 6;\n\nworker = this;\n\nremove_from_array = function(array, i) {\n  i = array.indexOf(i);\n  if (i !== -1) {\n    return array.splice(i, 1);\n  }\n};\n\nload_crunch = function(task_id, queue_id, data, extra_data, uri) {\n  var additional_levels, block_bytes, buffer, common_data, common_data_size, context, data_length, data_offset, data_view, faces, format, height, i, j, level_buffers, levels, ref, src, src_size, transfer, width;\n  data = new Uint8Array(data);\n  data_view = new DataView(data.buffer);\n  src_size = data.length;\n  src = Crunch._malloc(src_size);\n  Crunch.HEAPU8.set(data, src);\n  width = data_view.getUint16(12);\n  height = data_view.getUint16(14);\n  levels = data[16];\n  faces = data[17];\n  format = data[18];\n  additional_levels = data[25];\n  level_buffers = [];\n  if (format === 0) {\n    block_bytes = 8;\n  } else {\n    block_bytes = 16;\n  }\n  context = Crunch._crn_unpack_begin(src, src_size);\n  for (i = j = 0, ref = levels; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {\n    data_length = (Math.max(4, width >> i) >> 2) * (Math.max(4, height >> i) >> 2) * block_bytes;\n    data_offset = Crunch._crn_unpack_level(context, src, src_size, i);\n    buffer = Crunch.HEAPU8.buffer.slice(data_offset, data_offset + data_length);\n    if (!COMPRESSED_TEXTURE_SUPPORT) {\n      buffer = dxtToRgb565(new Uint16Array(buffer), 0, width >> i, height >> i).buffer;\n    }\n    level_buffers.push(buffer);\n    Crunch._free(data_offset);\n  }\n  common_data = null;\n  transfer = level_buffers;\n  if (additional_levels) {\n    common_data_size = data_view.getUint32(70);\n    common_data = data.buffer.slice(0, common_data_size);\n    transfer = level_buffers.concat([data.buffer]);\n  }\n  post_message([task_id, queue_id, [additional_levels, width, height, format, level_buffers, common_data, uri]], transfer);\n  Crunch._crn_unpack_end(context);\n  return Crunch._free(src);\n};\n\nload_crunch_extra = function(task_id, queue_id, data, original_common_data, uri) {\n  var block_bytes, buffer, context, data_length, data_offset, data_view, faces, format, height, level_buffers, src, src_size, width;\n  global(max_size);\n  data = new Uint8Array(data);\n  original_common_data = new Uint8Array(original_common_data);\n  data_view = new DataView(data.buffer);\n  src_size = original_common_data.length + data.length - 16;\n  src = Crunch._malloc(src_size);\n  Crunch.HEAPU8.set(original_common_data, src);\n  Crunch.HEAPU8.set(data.subarray(0, 16), src);\n  Crunch.HEAPU8.set(data.subarray(6, 10), src + 74);\n  Crunch.HEAPU8.set(data.subarray(16), src + original_common_data.length);\n  width = data_view.getUint16(12);\n  height = data_view.getUint16(14);\n  faces = original_common_data[17];\n  format = original_common_data[18];\n  level_buffers = [];\n  if (format === 0) {\n    block_bytes = 8;\n  } else {\n    block_bytes = 16;\n  }\n  context = Crunch._crn_unpack_begin(src, src_size);\n  data_length = (Math.max(4, width) >> 2) * (Math.max(4, height) >> 2) * block_bytes;\n  data_offset = Crunch._crn_unpack_level(context, src, src_size, 0);\n  buffer = Crunch.HEAPU8.buffer.slice(data_offset, data_offset + data_length);\n  Crunch._free(data_offset);\n  post_message([task_id, queue_id, [width, height, format, buffer, uri]], [buffer]);\n  Crunch._crn_unpack_end(context);\n  return Crunch._free(src);\n};\n\nif (typeof window !== 'undefined') {\n  window.load_crunch = load_crunch;\n  window.load_crunch_extra = load_crunch_extra;\n}\n\ndxtToRgb565 = function(src, src16Offset, width, height) {\n  var b0, b1, blockHeight, blockWidth, blockX, blockY, c, dst, dstI, g0, g1, i, j, k, m, nWords, r0, r1, ref, ref1;\n  c = new Uint16Array(4);\n  dst = new Uint16Array(width * height);\n  nWords = (width * height) / 4;\n  m = dstI = i = r0 = g0 = b0 = r1 = g1 = b1 = 0;\n  blockWidth = width / 4;\n  blockHeight = height / 4;\n  for (blockY = j = 0, ref = blockHeight; 0 <= ref ? j < ref : j > ref; blockY = 0 <= ref ? ++j : --j) {\n    for (blockX = k = 0, ref1 = blockWidth; 0 <= ref1 ? k < ref1 : k > ref1; blockX = 0 <= ref1 ? ++k : --k) {\n      i = src16Offset + 4 * (blockY * blockWidth + blockX);\n      c[0] = src[i];\n      c[1] = src[i + 1];\n      r0 = c[0] & 0x1f;\n      g0 = c[0] & 0x7e0;\n      b0 = c[0] & 0xf800;\n      r1 = c[1] & 0x1f;\n      g1 = c[1] & 0x7e0;\n      b1 = c[1] & 0xf800;\n      c[2] = ((5 * r0 + 3 * r1) >> 3) | (((5 * g0 + 3 * g1) >> 3) & 0x7e0) | (((5 * b0 + 3 * b1) >> 3) & 0xf800);\n      c[3] = ((5 * r1 + 3 * r0) >> 3) | (((5 * g1 + 3 * g0) >> 3) & 0x7e0) | (((5 * b1 + 3 * b0) >> 3) & 0xf800);\n      m = src[i + 2];\n      dstI = (blockY * 4) * width + blockX * 4;\n      dst[dstI] = c[m & 0x3];\n      dst[dstI + 1] = c[(m >> 2) & 0x3];\n      dst[dstI + 2] = c[(m >> 4) & 0x3];\n      dst[dstI + 3] = c[(m >> 6) & 0x3];\n      dstI += width;\n      dst[dstI] = c[(m >> 8) & 0x3];\n      dst[dstI + 1] = c[(m >> 10) & 0x3];\n      dst[dstI + 2] = c[(m >> 12) & 0x3];\n      dst[dstI + 3] = c[m >> 14];\n      m = src[i + 3];\n      dstI += width;\n      dst[dstI] = c[m & 0x3];\n      dst[dstI + 1] = c[(m >> 2) & 0x3];\n      dst[dstI + 2] = c[(m >> 4) & 0x3];\n      dst[dstI + 3] = c[(m >> 6) & 0x3];\n      dstI += width;\n      dst[dstI] = c[(m >> 8) & 0x3];\n      dst[dstI + 1] = c[(m >> 10) & 0x3];\n      dst[dstI + 2] = c[(m >> 12) & 0x3];\n      dst[dstI + 3] = c[m >> 14];\n    }\n  }\n  return dst;\n};\n\npost_message = this.postMessage.bind(this);\n\nconsole = {\n  log: function(msg) {\n    return post_message(['log', msg]);\n  }\n};\n\nQueue = (function() {\n  function Queue(id) {\n    this.tasks = [];\n    this.loaded = 0;\n    this.active_tasks = 0;\n    this.id = id;\n  }\n\n  Queue.prototype.add_progress = function(progress) {\n    this.loaded += progress;\n    return post_message(['progress', this.id, this.loaded]);\n  };\n\n  Queue.prototype.clear = function() {\n    var j, len, ref, xhr;\n    this.loaded = 0;\n    this.active_tasks = 0;\n    ref = this.tasks;\n    for (j = 0, len = ref.length; j < len; j++) {\n      xhr = ref[j];\n      xhr.abort();\n    }\n  };\n\n  Queue.prototype.init_tasks = function() {\n    var results;\n    results = [];\n    while (this.active_tasks < Math.min(MAX_ACTIVE_TASKS, this.tasks.length)) {\n      this.tasks[this.active_tasks].send();\n      results.push(this.active_tasks += 1);\n    }\n    return results;\n  };\n\n  Queue.prototype.finish_task = function(xhr) {\n    remove_from_array(this.tasks, xhr);\n    this.active_tasks -= 1;\n    this.init_tasks();\n    if (this.active_tasks === 0) {\n      return post_message(['done', this.id]);\n    }\n  };\n\n  Queue.prototype.add_task = function(task_id, uri, decode_function, extra_data, tries, retry_time) {\n    var do_json, loaded, queue, retry, total, xhr;\n    if (tries == null) {\n      tries = 6;\n    }\n    if (retry_time == null) {\n      retry_time = 1;\n    }\n    xhr = new XMLHttpRequest;\n    xhr.open('GET', uri, true);\n    do_json = false;\n    if (decode_function === 'text') {\n      xhr.responseType = 'text';\n      decode_function = null;\n    } else if (decode_function === 'json') {\n      xhr.responseType = 'text';\n      decode_function = null;\n      do_json = true;\n    } else {\n      xhr.responseType = 'arraybuffer';\n    }\n    this.tasks.push(xhr);\n    total = 0;\n    loaded = 0;\n    queue = this;\n    retry = function() {\n      return queue.add_task(task_id, uri, decode_function, extra_data, tries - 1, retry_time * 2);\n    };\n    xhr.onload = function(evt) {\n      var data;\n      if (xhr.status === 200 || xhr.status === 0) {\n        data = xhr.response;\n        if (do_json) {\n          data = JSON.parse(data);\n        }\n        if (decode_function) {\n          worker[decode_function](task_id, queue.id, data, extra_data, uri);\n        } else {\n          if (data.byteLength != null) {\n            total = data.byteLength;\n            post_message([task_id, queue.id, [xhr.response], [xhr.response]]);\n          } else {\n            post_message([task_id, queue.id, [xhr.response]]);\n            total = data.length || total;\n          }\n        }\n      } else {\n        if (tries) {\n          post_message([task_id, queue.id, 'error', xhr.status, xhr.response, 'retrying ' + uri.split('/').pop() + ' in ' + retry_time + ' seconds']);\n          setTimeout(retry, retry_time * 1000);\n          return;\n        } else {\n          post_message([task_id, queue.id, 'error', xhr.status, xhr.response, 1]);\n        }\n      }\n      queue.add_progress(total - loaded);\n      return queue.finish_task(xhr);\n    };\n    xhr.onerror = function(evt) {\n      if (tries) {\n        post_message([task_id, queue.id, 'error', xhr.status, xhr.response, 'retrying ' + uri.split('/').pop() + ' in ' + retry_time + ' seconds']);\n        return setTimeout(retry, retry_time * 1000);\n      } else {\n        post_message([task_id, queue.id, 'error', xhr.status, xhr.response, 2]);\n        queue.add_progress(total - loaded);\n        return queue.finish_task(xhr);\n      }\n    };\n    xhr.onprogress = function(evt) {\n      if (evt.lengthComputable) {\n        queue.add_progress(evt.loaded - loaded);\n        total = evt.total;\n        return loaded = evt.loaded;\n      }\n    };\n    return this.init_tasks();\n  };\n\n  return Queue;\n\n})();\n\nqueues = [];\n\nonmessage = function(e) {\n  var d, q;\n  d = e.data;\n  if (d[0] === 'clear') {\n    return queues[d[1]].clear();\n  } else if (d[0] === 'get') {\n    q = queues[d[1]];\n    if (!q) {\n      q = queues[d[1]] = new Queue(d[1]);\n    }\n    return q.add_task(d[2], d[3], d[4], d[5]);\n  } else {\n    return console.log('error ' + d[0]);\n  }\n};\n"

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var Events, vec2;
	
	vec2 = __webpack_require__(8).vec2;
	
	Events = (function() {
	  function Events(root_element) {
	    var contextmenu, keydown, keyup, locked_mousemove, mouse, mousedown, mousemove, mousemove_pressed, mouseup, pointerlockchange, touch_end, touch_move, touch_start, wheel;
	    this.keys_pressed = new Uint8Array(256);
	    this.keys_just_pressed = new Uint8Array(256);
	    this.keys_just_released = new Uint8Array(256);
	    this.keys_pressed_count = 0;
	    this.NO_MOVE_TICKS = 3;
	    this._empty_key_array = new Uint8Array(256);
	    this.tmpv = vec2.create();
	    this.mouse = {
	      x: 0,
	      y: 0,
	      rel_x: 0,
	      rel_y: 0,
	      page_x: 0,
	      page_y: 0,
	      movement_since_mousedown: 0,
	      move_events_since_mousedown: 0,
	      left: false,
	      middle: false,
	      right: false,
	      any_button: false,
	      wheel: 0,
	      cancel_wheel: false,
	      target: null,
	      down_target: null,
	      lock_element: false
	    };
	    this.touch = {
	      touch_events: [],
	      touches: 0
	    };
	    keydown = (function(_this) {
	      return function(event) {
	        var ae, code, jp;
	        ae = document.activeElement;
	        code = event.keyCode;
	        if ((ae.value != null) || ae.isContentEditable || code === 123) {
	          return;
	        }
	        jp = _this.keys_just_pressed[code] = _this.keys_pressed[code] ^ 1;
	        _this.keys_pressed[code] = 1;
	        _this.keys_pressed_count += jp;
	        if (code === 116) {
	          location.href = location.href;
	          return event.preventDefault();
	        }
	      };
	    })(this);
	    document.body.addEventListener('keydown', keydown, false);
	    keyup = (function(_this) {
	      return function(event) {
	        var ae, code;
	        ae = document.activeElement;
	        code = event.keyCode;
	        if ((ae.value != null) || ae.isContentEditable || code === 123) {
	          return;
	        }
	        _this.keys_pressed[code] = 0;
	        _this.keys_just_released[code] = 1;
	        return _this.keys_pressed_count -= 1;
	      };
	    })(this);
	    document.body.addEventListener('keyup', keyup, false);
	    touch_start = (function(_this) {
	      return function(event) {
	        var i, len, ref, t, touch;
	        event.preventDefault();
	        ref = event.touches;
	        for (i = 0, len = ref.length; i < len; i++) {
	          t = ref[i];
	          touch = {};
	          touch.touching = true;
	          touch.id = t.identifier;
	          touch.client_x = t.clientX;
	          touch.client_y = t.clientY;
	          touch.page_x = t.pageX;
	          touch.page_y = t.pageY;
	          touch.force = t.force;
	          touch.radius_x = t.radiusX;
	          touch.radius_y = t.radiusY;
	          touch.rotation_angle = t.rotationAngle;
	          touch.x = t.clientX - root_element.rect.left;
	          touch.y = t.clientY - root_element.rect.top;
	          touch.rel_x = 0;
	          touch.rel_y = 0;
	          touch.movement_since_touch = 0;
	          touch.touch_target = touch.target = t.target;
	          _this.touch.touch_events[touch.id] = touch;
	        }
	        return _this.touch.touches = event.touches.length;
	      };
	    })(this);
	    root_element.addEventListener('touchstart', touch_start, false);
	    touch_end = (function(_this) {
	      return function(event) {
	        var i, j, len, len1, ref, ref1, t, touch;
	        event.preventDefault();
	        ref = _this.touch.touch_events;
	        for (i = 0, len = ref.length; i < len; i++) {
	          touch = ref[i];
	          touch.touching = 0;
	        }
	        ref1 = event.touches;
	        for (j = 0, len1 = ref1.length; j < len1; j++) {
	          t = ref1[j];
	          touch = _this.touch.touch_events[t.identifier];
	          touch.touching = true;
	          touch.force = 0;
	          touch.radius_x = 0;
	          touch.radius_y = 0;
	          touch.rel_x = 0;
	          touch.rel_y = 0;
	        }
	        return _this.touch.touches = event.touches.length;
	      };
	    })(this);
	    root_element.addEventListener('touchend', touch_end, false);
	    root_element.addEventListener('touchcancel', touch_end, false);
	    touch_move = (function(_this) {
	      return function(event) {
	        var i, len, ref, t, touch, x, y;
	        event.preventDefault();
	        ref = event.touches;
	        for (i = 0, len = ref.length; i < len; i++) {
	          t = ref[i];
	          touch = {};
	          touch.id = t.identifier;
	          touch.touching = true;
	          touch.client_x = t.clientX;
	          touch.client_y = t.clientY;
	          touch.page_x = t.pageX;
	          touch.page_y = t.pageY;
	          touch.force = t.force;
	          touch.radius_x = t.radiusX;
	          touch.radius_y = t.radiusY;
	          touch.rotation_angle = t.rotationAngle;
	          touch.x = t.clientX - root_element.rect.left;
	          touch.y = t.clientY - root_element.rect.top;
	          x = t.clientX;
	          y = t.clientY;
	          if (_this.touch.touch_events[touch.id] != null) {
	            touch.rel_x = x - _this.touch.touch_events[touch.id].client_x;
	            touch.rel_y = y - _this.touch.touch_events[touch.id].client_y;
	          } else {
	            touch.rel_x = 0;
	            touch.rel_y = 0;
	          }
	          touch.movement_since_touch = Math.abs(touch.rel_x) + Math.abs(touch.rel_y);
	          _this.touch.touch_events[touch.id] = touch;
	        }
	        return _this.touch.touches = event.touches.length;
	      };
	    })(this);
	    root_element.addEventListener('touchmove', touch_move, false);
	    mouse = this.mouse;
	    mousedown = function(event) {
	      var p, x, y;
	      event.preventDefault();
	      mouse[['left', 'middle', 'right'][event.button]] = true;
	      mouse.any_button = true;
	      mouse.page_x = event.pageX;
	      mouse.page_y = event.pageY;
	      x = event.layerX;
	      y = event.layerY;
	      p = event.target;
	      while (p !== root_element) {
	        x += p.offsetLeft;
	        y += p.offsetTop;
	        p = p.offsetParent;
	      }
	      mouse.x = x;
	      mouse.y = y;
	      mouse.rel_x = 0;
	      mouse.rel_y = 0;
	      mouse.movement_since_mousedown = 0;
	      mouse.move_events_since_mousedown = 0;
	      return mouse.down_target = mouse.target = event.target;
	    };
	    root_element.addEventListener('mousedown', mousedown, false);
	    contextmenu = function(event) {
	      return event.preventDefault();
	    };
	    root_element.addEventListener('contextmenu', contextmenu, false);
	    mousemove = function(event) {
	      var rel_x, rel_y, x, y;
	      if (mouse.any_button) {
	        return;
	      }
	      event.preventDefault();
	      x = event.pageX;
	      y = event.pageY;
	      rel_x = x - mouse.page_x;
	      rel_y = y - mouse.page_y;
	      mouse.page_x = x;
	      mouse.page_y = y;
	      mouse.rel_x += rel_x;
	      mouse.rel_y += rel_y;
	      mouse.x += rel_x;
	      mouse.y += rel_y;
	      return mouse.target = event.target;
	    };
	    root_element.addEventListener('mousemove', mousemove, false);
	    mousemove_pressed = function(event) {
	      var rel_x, rel_y, x, y;
	      if (!mouse.any_button || mouse.lock_element) {
	        return;
	      }
	      event.preventDefault();
	      x = event.pageX;
	      y = event.pageY;
	      rel_x = x - mouse.page_x;
	      rel_y = y - mouse.page_y;
	      mouse.move_events_since_mousedown += 1;
	      if (mouse.move_events_since_mousedown < this.NO_MOVE_TICKS) {
	        return;
	      }
	      mouse.page_x = x;
	      mouse.page_y = y;
	      mouse.rel_x += rel_x;
	      mouse.rel_y += rel_y;
	      mouse.x += rel_x;
	      mouse.y += rel_y;
	      mouse.target = event.target;
	      return mouse.movement_since_mousedown += Math.abs(rel_x) + Math.abs(rel_y);
	    };
	    window.addEventListener('mousemove', mousemove_pressed, false);
	    mouseup = function(event) {
	      var rel_x, rel_y, x, y;
	      if (!mouse.any_button) {
	        return;
	      }
	      event.preventDefault();
	      mouse[['left', 'middle', 'right'][event.button]] = false;
	      mouse.any_button = mouse.left || mouse.middle || mouse.right;
	      x = event.pageX;
	      y = event.pageY;
	      rel_x = x - mouse.page_x;
	      rel_y = y - mouse.page_y;
	      mouse.page_x = x;
	      mouse.page_y = y;
	      mouse.rel_x += rel_x;
	      mouse.rel_y += rel_y;
	      mouse.x += rel_x;
	      mouse.y += rel_y;
	      return mouse.target = event.target;
	    };
	    window.addEventListener('mouseup', mouseup, false);
	    wheel = function(event) {
	      mouse.wheel += Math.max(-1, Math.min(1, event.deltaY));
	      if (mouse.cancel_wheel) {
	        return event.preventDefault();
	      }
	    };
	    root_element.addEventListener('wheel', wheel, false);
	    locked_mousemove = function(event) {
	      var rel_x, rel_y;
	      rel_x = event.mozMovementX || event.webkitMovementX || event.movementX || 0;
	      rel_y = event.mozMovementY || event.webkitMovementY || event.movementY || 0;
	      mouse.move_events_since_mousedown += 1;
	      if (mouse.move_events_since_mousedown < NO_MOVE_TICKS) {
	        return;
	      }
	      mouse.rel_x += rel_x;
	      mouse.rel_y += rel_y;
	      return mouse.movement_since_mousedown += Math.abs(rel_x) + Math.abs(rel_y);
	    };
	    pointerlockchange = function(event) {
	      var e;
	      if (mouse.lock_element) {
	        mouse.lock_element.removeEventListener('mousemove', locked_mousemove);
	      }
	      e = document.mozPointerLockElement || document.webkitPointerLockElement || document.pointerLockElement;
	      if (e) {
	        mouse.lock_element = e;
	        e.addEventListener('mousemove', locked_mousemove);
	      }
	      return mouse.rel_x = mouse.rel_y = 0;
	    };
	    document.addEventListener('pointerlockchange', pointerlockchange);
	    document.addEventListener('mozpointerlockchange', pointerlockchange);
	    document.addEventListener('webkitpointerlockchange', pointerlockchange);
	  }
	
	  Events.prototype.get_touch_events = function() {
	    var i, len, ref, t, touch_events;
	    touch_events = [];
	    ref = this.touch.touch_events;
	    for (i = 0, len = ref.length; i < len; i++) {
	      t = ref[i];
	      if ((t != null) && t.touching) {
	        touch_events.push(t);
	      }
	    }
	    return touch_events;
	  };
	
	  Events.prototype.reset_frame_events = function() {
	    this.keys_just_pressed.set(this._empty_key_array);
	    this.keys_just_released.set(this._empty_key_array);
	    this.mouse.rel_x = 0;
	    this.mouse.rel_y = 0;
	    return this.mouse.wheel = 0;
	  };
	
	  return Events;
	
	})();
	
	module.exports = {
	  Events: Events
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var MAX_FRAME_DURATION, MainLoop, evaluate_all_animations, get_last_char_phy, phy_to_ob, ref, step_world,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
	evaluate_all_animations = __webpack_require__(23).evaluate_all_animations;
	
	ref = __webpack_require__(24), get_last_char_phy = ref.get_last_char_phy, step_world = ref.step_world, step_world = ref.step_world, phy_to_ob = ref.phy_to_ob;
	
	MAX_FRAME_DURATION = 167;
	
	MainLoop = (function() {
	  function MainLoop(context) {
	    this.reset_timeout = bind(this.reset_timeout, this);
	    this.set_timeout = bind(this.set_timeout, this);
	    this.frame_duration = 16;
	    this.last_frame_durations = [16, 16, 16, 16, 16, 16, 16, 16, 16, 16];
	    this._fdi = 0;
	    this.timeout = context.MYOU_PARAMS.timeout;
	    (this.timeout != null) && console.log('WARNING: Timeout set: ' + this.timeout);
	    this.pause_time = 0;
	    this.last_time = 0;
	    this.timeout_timer = this.timeout;
	    this.enabled = false;
	    this.context = context;
	    this._bound_tick = this.tick.bind(this);
	  }
	
	  MainLoop.prototype.run = function() {
	    if (this.enabled) {
	      return;
	    }
	    requestAnimationFrame(this._bound_tick);
	    !this.enabled && (this.timeout != null) && console.log('Main loop running: ' + Math.floor(performance.now()));
	    this.enabled = true;
	    this.pause_time = 0;
	    return this.last_time = performance.now();
	  };
	
	  MainLoop.prototype.stop = function() {
	    cancelAnimationFrame(this._bound_tick);
	    this.pause_time = Infinity;
	    return this.enabled = false;
	  };
	
	  MainLoop.prototype.pause = function(pause_time) {
	    if (pause_time == null) {
	      console.log('WARNING: Undefined pause_time.');
	    }
	    return this.pause_time = pause_time;
	  };
	
	  MainLoop.prototype.tick = function() {
	    var f, frame_duration, i, j, k, l, len, len1, len2, len3, len4, len5, m, n, p, ref1, ref2, ref3, ref4, ref5, ref6, scene, time;
	    requestAnimationFrame(this._bound_tick);
	    time = performance.now();
	    this.frame_duration = frame_duration = Math.min(time - this.last_time, MAX_FRAME_DURATION);
	    this.last_time = time;
	    if (!this.enabled || this.pause_time > 0) {
	      this.pause_time -= frame_duration;
	      return;
	    }
	    if (this.enabled && this.timeout_timer <= 0) {
	      console.log('Main loop paused: ' + Math.floor(time));
	      this.enabled = false;
	      return;
	    }
	    this.timeout_timer -= frame_duration;
	    this.last_frame_durations[this._fdi] = frame_duration;
	    this._fdi = (this._fdi + 1) % this.last_frame_durations.length;
	    ref1 = this.context.loaded_scenes;
	    for (i = 0, len = ref1.length; i < len; i++) {
	      scene = ref1[i];
	      if (!scene.enabled) {
	        continue;
	      }
	      ref2 = scene.pre_draw_callbacks;
	      for (j = 0, len1 = ref2.length; j < len1; j++) {
	        f = ref2[j];
	        f(scene, frame_duration);
	      }
	      ref3 = scene.logic_ticks;
	      for (k = 0, len2 = ref3.length; k < len2; k++) {
	        f = ref3[k];
	        f(frame_duration);
	      }
	      ref4 = scene.active_particle_systems;
	      for (l = 0, len3 = ref4.length; l < len3; l++) {
	        p = ref4[l];
	        p._eval();
	      }
	      if (scene.rigid_bodies.length || scene.kinematic_characters.length) {
	        get_last_char_phy(scene.kinematic_characters);
	        step_world(scene.world, frame_duration * 0.001);
	        phy_to_ob(scene.rigid_bodies);
	      }
	    }
	    evaluate_all_animations(this.context, frame_duration);
	    this.context.render_manager.draw_all();
	    ref5 = this.context.loaded_scenes;
	    for (m = 0, len4 = ref5.length; m < len4; m++) {
	      scene = ref5[m];
	      ref6 = scene.post_draw_callbacks;
	      for (n = 0, len5 = ref6.length; n < len5; n++) {
	        f = ref6[n];
	        f(scene, frame_duration);
	      }
	    }
	    return this.context.events.reset_frame_events();
	  };
	
	  MainLoop.prototype.set_timeout = function(timeout, reset) {
	    if (reset == null) {
	      reset = true;
	    }
	    'WARNING: Timeout set: ' + timeout;
	    this.timeout = timeout;
	    if (reset) {
	      return this.reset_timeout();
	    }
	  };
	
	  MainLoop.prototype.reset_timeout = function() {
	    if (!this.enabled) {
	      console.log('Main loop running: ' + Math.floor(performance.now()));
	    }
	    this.timeout_timer = this.timeout;
	    return this.enabled = true;
	  };
	
	  return MainLoop;
	
	})();
	
	module.exports = {
	  MainLoop: MainLoop
	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var FLOW, FOLLOW, ParticleSystem, clear_unused_particle_clones, mat2, mat3, mat4, quat, ref, vec2, vec3, vec4,
	  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	FLOW = 0;
	
	FOLLOW = 1;
	
	clear_unused_particle_clones = function(original) {
	  var j, len, ob, ref1;
	  ref1 = original.unused_clones;
	  for (j = 0, len = ref1.length; j < len; j++) {
	    ob = ref1[j];
	    ob.remove();
	  }
	  return original.unused_clones = [];
	};
	
	ParticleSystem = (function() {
	  function ParticleSystem(context, properties1) {
	    this.context = context;
	    this.properties = properties1;
	    this.order = 0;
	    this.start_time = this.context.main_loop.last_time * 0.001;
	    this.time = 0;
	    this.launched = false;
	    this.auto_pause = false;
	    this.paused = false;
	    this.paused_time = 0;
	    this.pause_start = 0;
	    this.particles = [];
	    this.configure_particles(this.properties);
	  }
	
	  ParticleSystem.prototype._get_max_path_time = function() {
	    var max_time, sqrt;
	    if (this.accel) {
	      sqrt = Math.sqrt(Math.pow(this.speed, 2) + 2 * this.accel * this.max_length);
	      max_time = Math.abs(Math.max(-this.speed + sqrt, -this.speed(-sqrt)) / this.accel);
	    } else {
	      max_time = Math.abs(this.max_length / this.speed);
	    }
	    return max_time;
	  };
	
	  ParticleSystem.prototype.set_new_flow_speed_and_freq = function(new_speed, new_freq) {
	    var new_freq_is_bigger, new_speed_is_smaller;
	    if (new_speed == null) {
	      new_speed = this.speed;
	    }
	    if (new_freq == null) {
	      new_freq = this.freq;
	    }
	    new_speed_is_smaller = new_speed < this.speed;
	    new_freq_is_bigger = new_freq > this.freq;
	    if (new_speed_is_smaller) {
	      this._get_max_path_time();
	    }
	    if (new_speed_is_smaller || new_freq_is_bigger) {
	      this._add_particles();
	    }
	    return this.time_offset = 1 / this.freq;
	  };
	
	  ParticleSystem.prototype._add_particles = function() {
	    var i, j, number_of_particles, p, ref1, results;
	    number_of_particles = Math.ceil(this.max_time / this.time_offset);
	    i = 0;
	    results = [];
	    for (p = j = 0, ref1 = Math.max(number_of_particles - this.particles.length, 0); 0 <= ref1 ? j < ref1 : j > ref1; p = 0 <= ref1 ? ++j : --j) {
	      this.particles.push({
	        'index': i,
	        'time_offset': -i * this.time_offset,
	        'particle_system': this,
	        'used_clones': [],
	        'random_n': Math.random()
	      });
	      results.push(i += 1);
	    }
	    return results;
	  };
	
	  ParticleSystem.prototype._basic_curve_conf = function() {
	    var basic_formula, p_scn, ref1, ref2, ref3, t_scn, track;
	    basic_formula = function(ob, position) {
	      return vec3.copy(ob.position, position);
	    };
	    if (ref1 = !'tracker_scene', indexOf.call(this.properties, ref1) >= 0) {
	      this.properties.tracker_scene = 'Scene';
	    }
	    this.tracker_scene = t_scn = this.context.scenes[this.properties.tracker_scene];
	    if (!t_scn) {
	      return console.error('Error: no scene found "' + this.properties.tracker_scene + '" for tracker "' + this.properties.tracker + '"');
	    }
	    this.tracker = t_scn.parents[this.properties.tracker];
	    if (!this.tracker) {
	      return console.error('Error: no tracker found "' + this.properties.tracker + '"');
	    }
	    t_scn.active_particle_systems.push(this);
	    if (ref2 = !'particle_scene', indexOf.call(this.properties, ref2) >= 0) {
	      this.properties.particle_scene = 'Scene';
	    }
	    this.particle_scene = p_scn = this.context.scenes[this.properties.particle_scene];
	    if (!p_scn) {
	      return console.error('Error: no scene found "' + this.properties.particle_scene + '" for particle "' + this.properties.particle + '"');
	    }
	    this.particle = p_scn.parents[this.properties.particle];
	    if (!this.particle) {
	      return console.error('Error: no particle found "' + this.properties.particle + '" for tracker "' + this.properties.tracker + '"');
	    }
	    if (this.particle.type === 'MESH' && !this.particle.data) {
	      p_scn.loader.load_mesh_data(this.particle);
	    }
	    if (ref3 = !'unused_clones', indexOf.call(this.particle, ref3) >= 0) {
	      this.particle.unused_clones = [];
	    }
	    this.speed = this.properties.speed;
	    this.accel = 0;
	    if (indexOf.call(this.properties, 'accel') >= 0) {
	      this.accel = this.properties.accel;
	    }
	    this.start_time = main_loop.last_time * 0.001;
	    track = this.track = Track(this.tracker);
	    if (indexOf.call(this.properties, 'auto_pause') >= 0) {
	      this.last_tracker_position = vec3.copy([], this.tracker.position);
	      this.auto_pause = this.properties.auto_pause;
	    }
	    if (indexOf.call(this.properties, 'formula') >= 0 && (this.properties.formula != null)) {
	      this.formula = this.properties.formula;
	    } else {
	      this.formula = basic_formula;
	    }
	    this.max_length = this.track.get_max_path_length();
	    this.max_time = this._get_max_path_time();
	    this._delete_particles();
	    this.init_space = 0;
	    if (this.speed < 0) {
	      return this.init_space = this.max_length;
	    }
	  };
	
	  ParticleSystem.prototype.configure_particles = function(properties) {
	    properties = this.properties = properties || this.properties;
	    if (properties['type'] === 'follow' || properties['type'] === FOLLOW) {
	      this.type = FOLLOW;
	      this._basic_curve_conf();
	      this.particles = [
	        {
	          'index': 0,
	          'particle_system': this,
	          'used_clones': [this.particle]
	        }
	      ];
	    }
	    if (properties['type'] === 'flow' || properties['type'] === FLOW) {
	      this.type = FLOW;
	      this._basic_curve_conf();
	      this.freq = properties.freq;
	      if (properties['fill']) {
	        this.fill = true;
	      }
	      this.time_offset = 1 / this.freq;
	      this.sync_time = this.max_time + (this.time_offset - this.max_time % this.time_offset);
	      this._add_particles();
	    }
	    return this._eval();
	  };
	
	  ParticleSystem.prototype._delete_particles = function() {
	    var c, j, k, len, len1, p, ref1, ref2;
	    ref1 = this.particles;
	    for (j = 0, len = ref1.length; j < len; j++) {
	      p = ref1[j];
	      ref2 = p.used_clones;
	      for (k = 0, len1 = ref2.length; k < len1; k++) {
	        c = ref2[k];
	        c.visible = false;
	        this.particle.unused_clones.push(c);
	      }
	    }
	    return this.particles = [];
	  };
	
	  ParticleSystem.prototype._add_clones_to_particle = function(needed_clones, p) {
	    var c, j, k, n_clones_to_add, new_clon, original, ref1, ref2, results, results1, tracker_scene, unused_clon;
	    n_clones_to_add = needed_clones - p.used_clones.length;
	    if (n_clones_to_add < 0) {
	      results = [];
	      for (c = j = 0, ref1 = -n_clones_to_add; 0 <= ref1 ? j < ref1 : j > ref1; c = 0 <= ref1 ? ++j : --j) {
	        unused_clon = p.used_clones.pop();
	        unused_clon.visible = false;
	        results.push(this.particle.unused_clones.push(unused_clon));
	      }
	      return results;
	    } else {
	      original = this.particle;
	      tracker_scene = this.tracker_scene;
	      ({
	        create_new_clon: function() {
	          var is_static, new_clon;
	          is_static = original["static"];
	          original["static"] = false;
	          new_clon = original.clone(tracker_scene);
	          original["static"] = is_static;
	          p.used_clones.push(new_clon);
	          return new_clon;
	        }
	      });
	      results1 = [];
	      for (c = k = 0, ref2 = n_clones_to_add; 0 <= ref2 ? k < ref2 : k > ref2; c = 0 <= ref2 ? ++k : --k) {
	        if (original.unused_clones.length) {
	          new_clon = original.unused_clones.pop();
	          if (new_clon.scene.name === tracker_scene.name) {
	            p.used_clones.push(new_clon);
	            vec3.copy(new_clon.position, original.position);
	            vec4.copy(new_clon.rotation, original.rotation);
	            vec3.copy(new_clon.scale, original.scale);
	            vec4.copy(new_clon.color, original.color);
	          } else {
	            original.unused_clones.push(new_clon);
	            new_clon = create_new_clon();
	          }
	        } else {
	          new_clon = create_new_clon();
	        }
	        new_clon.random_n = Math.random();
	        new_clon.visible = true;
	        results1.push(new_clon.particle = p);
	      }
	      return results1;
	    }
	  };
	
	  ParticleSystem.prototype.pause = function() {
	    if (!this.paused) {
	      this.paused = true;
	      return this.pause_starts = main_loop.last_time * 0.001 - this.start_time;
	    }
	  };
	
	  ParticleSystem.prototype.play = function() {
	    if (!this.particles.length) {
	      this.configure_particles();
	    }
	    if (this.paused) {
	      this.paused = false;
	      return this.paused_time += main_loop.last_time * 0.001 - this.start_time(-this.pause_starts);
	    }
	  };
	
	  ParticleSystem.prototype.stop = function() {
	    return this._delete_particles();
	  };
	
	  ParticleSystem.prototype.restart = function() {
	    this.configure_particles();
	    this.paused_time = 0;
	    return this.pause_starts = 0;
	  };
	
	  ParticleSystem.prototype.remove = function() {
	    this.stop();
	    return this.tracker_scene.active_particle_systems.splice(this.tracker_scene.active_particle_systems.indexOf(), 1);
	  };
	
	  ParticleSystem.prototype._eval = function() {
	    var direction, fill_offset, i, j, len, n, p, pd, point, point_and_directions, points_and_directions, ref1, results, s, t;
	    if (this.paused) {
	      return;
	    }
	    if (this.auto_pause && (this.time >= this.max_time || this.fill)) {
	      this.pause();
	    }
	    if (!this.paused) {
	      this.time = main_loop.last_time * 0.001 - this.start_time - this.paused_time;
	    }
	    n = Math.ceil(this.time / this.max_time);
	    if (this.type === FLOW) {
	      ref1 = this.particles;
	      results = [];
	      for (j = 0, len = ref1.length; j < len; j++) {
	        p = ref1[j];
	        fill_offset = 0;
	        if (this.fill) {
	          fill_offset = this.max_time;
	        }
	        t = (this.time + p.time_offset + fill_offset) % this.sync_time;
	        s = this.init_space + this.speed * t + 0.5 * this.accel * Math.pow(t, 2);
	        p.space = s;
	        p.time = t;
	        p.index += (n - 1) * this.particles.length;
	        points_and_directions = this.track.get_all_tracked_points(p.space, true);
	        this._add_clones_to_particle(points_and_directions.length, p);
	        i = 0;
	        results.push((function() {
	          var k, len1, results1;
	          results1 = [];
	          for (k = 0, len1 = points_and_directions.length; k < len1; k++) {
	            pd = points_and_directions[k];
	            point = pd[0];
	            direction = pd[1];
	            this.formula(p.used_clones[i], point, direction);
	            results1.push(i += 1);
	          }
	          return results1;
	        }).call(this));
	      }
	      return results;
	    } else if (this.type === FOLLOW) {
	      t = this.time % this.max_time;
	      s = this.init_space + this.speed * t + 0.5 * this.accel * Math.pow(t, 2);
	      p = this.particles[0];
	      p.space = s;
	      p.time = t;
	      p.index = n;
	      point_and_directions = this.track.get_all_tracked_points(p.space, true);
	      if (point_and_directions.length) {
	        p.used_clones[0].visible = true;
	        pd = point_and_directions[0];
	        point = pd[0];
	        direction = pd[1];
	        return this.formula(p.used_clones[0], point, direction);
	      } else {
	        return p.used_clones[0].visible = false;
	      }
	    }
	  };
	
	  return ParticleSystem;
	
	})();
	
	module.exports = {
	  ParticleSystem: ParticleSystem,
	  clear_unused_particle_clones: clear_unused_particle_clones
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var Framebuffer, GLRay, MAX_PICK, MIN_PICK, Material, asign_group_and_mesh_id, gl_ray_fs, gl_ray_vs, mat2, mat3, mat4, next_group_id, next_mesh_id, quat, ref, vec2, vec3, vec4;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	Framebuffer = __webpack_require__(20).Framebuffer;
	
	Material = __webpack_require__(19).Material;
	
	MIN_PICK = new Float32Array([-0.434, -0.126, -0.948]);
	
	MAX_PICK = new Float32Array([0.434, 0.164, 0.931]);
	
	gl_ray_vs = function(max_distance) {
	  var shader;
	  shader = "precision highp float;\nuniform mat4 projection_matrix;\nuniform mat4 model_view_matrix;\nattribute vec3 vertex;\nattribute vec4 vnormal;\nvarying float vardepth;\nvarying float mesh_id;\nvoid main(){\n    vec4 pos = model_view_matrix * vec4(vertex, 1.0);\n    pos.z = min(pos.z, " + (max_distance.toFixed(20)) + ");\n    gl_Position = projection_matrix * pos;\n    mesh_id = vnormal.w;\n    vardepth = -pos.z;\n}";
	  return shader;
	};
	
	gl_ray_fs = function(max_distance) {
	  var shader;
	  shader = "precision highp float;\nvarying float vardepth;\nuniform float mesh_id;\nuniform float group_id;\n\nvoid main(){\n    float depth = vardepth * " + ((255 / max_distance).toFixed(20)) + ";\n    float f = floor(depth);\n    gl_FragColor = vec4(vec3(mesh_id, group_id, f) * " + (1 / 255) + ", depth-f);\n    //gl_FragColor = vec4(vec3(mesh_id, group_id, 0) * " + (1 / 255) + ", 1);\n}";
	  return shader;
	};
	
	next_group_id = 0;
	
	next_mesh_id = 0;
	
	asign_group_and_mesh_id = function(ob) {
	  var id;
	  if (next_group_id === 256) {
	    console.log('ERROR: Max number of meshes exceeded');
	    return;
	  }
	  ob.group_id = next_group_id;
	  ob.mesh_id = next_mesh_id;
	  id = ob.ob_id = (ob.group_id << 8) | ob.mesh_id;
	  if (next_mesh_id === 255) {
	    next_group_id += 1;
	    next_mesh_id = 0;
	  } else {
	    next_mesh_id += 1;
	  }
	  return id;
	};
	
	GLRay = (function() {
	  function GLRay(context, debug_canvas, w, h, max_distance1, render_steps, wait_steps) {
	    this.context = context;
	    this.debug_canvas = debug_canvas;
	    this.w = w != null ? w : 512;
	    this.h = h != null ? h : 256;
	    this.max_distance = max_distance1 != null ? max_distance1 : 10;
	    this.render_steps = render_steps != null ? render_steps : 8;
	    this.wait_steps = wait_steps != null ? wait_steps : 3;
	    this.buffer = new Framebuffer(this.context.render_manager, this.w, this.h, this.context.render_manager.gl.UNSIGNED_BYTE);
	    this.pixels = new Uint8Array(this.w * this.h * 4);
	    this.pixels16 = new Uint16Array(this.pixels.buffer);
	    this.distance = 0;
	    this.step = 0;
	    this.rounds = 0;
	    this.mat = new Material(this.context, 'gl_ray', gl_ray_fs(this.max_distance), [], [], gl_ray_vs(this.max_distance));
	    this.m4 = mat4.create();
	    this.world2cam = mat4.create();
	    this.world2cam_mx = mat4.create();
	    this.cam_pos = vec3.create();
	    this.cam_rot = quat.create();
	    this.last_cam_pos = vec3.create();
	    this.last_cam_rot = quat.create();
	    this.meshes = [];
	    this.sorted_meshes = null;
	    this.mesh_by_id = [];
	    this.debug_x = 0;
	    this.debug_y = 0;
	    return;
	  }
	
	  GLRay.prototype.init = function(scene, camera) {
	    var do_step_callback;
	    this.add_scene(scene);
	    do_step_callback = (function(_this) {
	      return function(scene, frame_duration) {
	        return _this.do_step(scene, camera);
	      };
	    })(this);
	    return scene.post_draw_callbacks.push(do_step_callback);
	  };
	
	  GLRay.prototype.add_scene = function(scene) {
	    var alt, id, j, len, ob, ref1, ref2, results;
	    ref1 = scene.children;
	    results = [];
	    for (j = 0, len = ref1.length; j < len; j++) {
	      ob = ref1[j];
	      if (ob.type === 'MESH') {
	        id = asign_group_and_mesh_id(ob);
	        this.mesh_by_id[id] = ob;
	        if ((ref2 = ob.altmeshes) != null ? ref2.length : void 0) {
	          results.push((function() {
	            var k, len1, ref3, results1;
	            ref3 = ob.altmeshes;
	            results1 = [];
	            for (k = 0, len1 = ref3.length; k < len1; k++) {
	              alt = ref3[k];
	              if (!(alt.mesh_id != null)) {
	                continue;
	              }
	              id = asign_group_and_mesh_id(alt);
	              results1.push(this.mesh_by_id[id] = alt);
	            }
	            return results1;
	          }).call(this));
	        } else {
	          results.push(void 0);
	        }
	      } else {
	        results.push(void 0);
	      }
	    }
	    return results;
	  };
	
	  GLRay.prototype.debug_xy = function(x, y) {
	    x = (x * this.w) | 0;
	    y = ((1 - y) * this.h) | 0;
	    this.debug_x = x;
	    return this.debug_y = y;
	  };
	
	  GLRay.prototype.pick_object = function(x, y, radius) {
	    var cam, coord, coord16, depth, depth_h, depth_l, distance, id, object, point, xf, yf;
	    if (radius == null) {
	      radius = 1;
	    }
	    xf = (x * 2 - 1) * this.inv_proj_x;
	    yf = (y * -2 + 1) * this.inv_proj_y;
	    x = (x * (this.w - 1)) | 0;
	    y = ((1 - y) * (this.h - 1)) | 0;
	    coord = (x + this.w * y) << 2;
	    coord16 = coord >> 1;
	    depth_h = this.pixels[coord + 2];
	    depth_l = this.pixels[coord + 3];
	    id = this.pixels16[coord16];
	    depth = ((depth_h << 8) | depth_l) * this.max_distance * 0.000015318627450980392;
	    if (id === 65535 || depth === 0 || this.rounds <= 1) {
	      radius -= 1;
	      if (radius > 0) {
	        return this.pick_object((x + 1) / this.w, y / this.h) || this.pick_object((x - 1) / this.w, y / this.h) || this.pick_object(x / this.w, (y + 1) / this.h) || this.pick_object(x / this.w, (y - 1) / this.h);
	      }
	      return null;
	    }
	    object = this.mesh_by_id[id];
	    if (!object) {
	      return null;
	    }
	    cam = object.scene.active_camera;
	    point = vec3.create();
	    point[0] = xf * depth;
	    point[1] = yf * depth;
	    point[2] = -depth;
	    vec3.transformQuat(point, point, this.last_cam_rot);
	    vec3.add(point, point, this.last_cam_pos);
	    distance = vec3.distance(point, cam.position);
	    vec3.min(point, point, MAX_PICK);
	    vec3.max(point, point, MIN_PICK);
	    return {
	      object: object,
	      point: point,
	      distance: distance,
	      normal: vec3.clone(point)
	    };
	  };
	
	  GLRay.prototype.do_step = function(scene, camera) {
	    var attr, attr_loc_normal, attr_loc_vertex, bb_high, bb_low, d, data, gl, i, j, k, l, len, len1, len2, m, m4, mat, mesh, mesh2world, mirrors, n, o, old_near, p, part, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, restore_near, sort_function, submesh_idx, world2cam, world2cam_mx, x, y;
	    gl = this.context.render_manager.gl;
	    m4 = this.m4;
	    mat = this.mat;
	    mat.use();
	    attr_loc_vertex = mat.a_vertex;
	    attr_loc_normal = this.mat.attrib_locs.vnormal;
	    world2cam = this.world2cam;
	    world2cam_mx = this.world2cam_mx;
	    this.buffer.enable();
	    restore_near = false;
	    if (this.step === 0) {
	      if (((ref1 = this.pick_object(0.5, 0.5)) != null ? ref1.distance : void 0) < 0.01) {
	        old_near = camera.near_plane;
	        camera.near_plane = 0.00001;
	        camera.recalculate_projection();
	        camera.near_plane = old_near;
	        restore_near = true;
	      }
	      gl.clearColor(1, 1, 1, 1);
	      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	      mat4.copy(world2cam, this.context.render_manager._world2cam);
	      mat4.copy(world2cam_mx, this.context.render_manager._world2cam_mx);
	      vec3.copy(this.cam_pos, camera.position);
	      quat.copy(this.cam_rot, camera.rotation);
	      this.inv_proj_x = camera.projection_matrix_inv[0];
	      this.inv_proj_y = camera.projection_matrix_inv[5];
	      this.meshes = (function() {
	        var j, len, ref2, results;
	        ref2 = scene.mesh_passes[0];
	        results = [];
	        for (j = 0, len = ref2.length; j < len; j++) {
	          m = ref2[j];
	          if (m.visible && m.physics_type !== 'NO_COLLISION') {
	            results.push(m);
	          }
	        }
	        return results;
	      })();
	      ref2 = scene.mesh_passes[1];
	      for (j = 0, len = ref2.length; j < len; j++) {
	        m = ref2[j];
	        if (m.visible && m.alpha >= alpha_treshold && m.physics_type !== 'NO_COLLISION') {
	          this.meshes.push(m);
	        }
	      }
	    }
	    gl.uniformMatrix4fv(mat.u_projection_matrix, false, camera.projection_matrix);
	    if (restore_near) {
	      camera.recalculate_projection();
	    }
	    this.context.render_manager.change_enabled_attributes(1 | 2);
	    part = (this.meshes.length / this.render_steps | 0) + 1;
	    if (this.step < this.render_steps) {
	      ref3 = this.meshes.slice(this.step * part, (this.step + 1) * part);
	      for (k = 0, len1 = ref3.length; k < len1; k++) {
	        mesh = ref3[k];
	        data = ((ref4 = mesh.last_lod_object) != null ? ref4.data : void 0) || mesh.data;
	        if (data && data.attrib_pointers.length !== 0 && !mesh.culled_in_last_frame) {
	          if ((mat.u_group_id != null) && mat.group_id !== mesh.group_id) {
	            mat.group_id = mesh.group_id;
	            gl.uniform1f(mat.u_group_id, mat.group_id);
	          }
	          if ((mat.u_mesh_id != null) && mat.mesh_id !== mesh.mesh_id) {
	            mat.mesh_id = mesh.mesh_id;
	            gl.uniform1f(mat.u_mesh_id, mat.mesh_id);
	          }
	          mesh2world = mesh.world_matrix;
	          data = ((ref5 = mesh.last_lod_object) != null ? ref5.data : void 0) || mesh.data;
	          for (submesh_idx = l = 0, ref6 = data.vertex_buffers.length; 0 <= ref6 ? l < ref6 : l > ref6; submesh_idx = 0 <= ref6 ? ++l : --l) {
	            gl.bindBuffer(gl.ARRAY_BUFFER, data.vertex_buffers[submesh_idx]);
	            attr = data.attrib_pointers[submesh_idx][0];
	            gl.vertexAttribPointer(attr_loc_vertex, attr[1], attr[2], false, data.stride, attr[3]);
	            attr = data.attrib_pointers[submesh_idx][1];
	            gl.vertexAttribPointer(attr_loc_normal, 4, 5121, false, data.stride, 12);
	            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.index_buffers[submesh_idx]);
	            mirrors = mesh.mirrors;
	            if (mirrors & 1) {
	              mat4.multiply(m4, world2cam, mesh2world);
	              gl.uniformMatrix4fv(mat.u_model_view_matrix, false, m4);
	              gl.drawElements(data.draw_method, data.num_indices[submesh_idx], 5123, 0);
	            }
	            if (mirrors & 178) {
	              mat4.multiply(m4, world2cam_mx, mesh2world);
	              gl.uniformMatrix4fv(mat.u_model_view_matrix, false, m4);
	              gl.frontFace(2304);
	              gl.drawElements(data.draw_method, data.num_indices[submesh_idx], 5123, 0);
	              gl.frontFace(2305);
	            }
	          }
	        }
	      }
	    }
	    this.step += 1;
	    if (this.step === this.render_steps + this.wait_steps - 1) {
	      mat = scene.active_camera.world_to_screen_matrix;
	      bb_low = vec4.create();
	      bb_high = vec4.create();
	      ref7 = this.meshes;
	      for (n = 0, len2 = ref7.length; n < len2; n++) {
	        mesh = ref7[n];
	        if (mesh.bounding_box_low == null) {
	          mesh.calc_bounding_box();
	        }
	        vec4.transformMat4(bb_low, mesh.bounding_box_low, mat);
	        vec3.scale(bb_low, bb_low, 1 / bb_low[3]);
	        vec4.transformMat4(bb_high, mesh.bounding_box_high, mat);
	        vec3.scale(bb_high, bb_high, 1 / bb_high[3]);
	        mesh.visual_size = vec3.dist(bb_low, bb_high);
	      }
	      sort_function = window.sort_function || (function(a, b) {
	        return a.visual_size - b.visual_size;
	      });
	      this.meshes.sort(sort_function);
	      this.sorted_meshes = this.meshes.slice(0);
	      window.sort_test = function() {
	        var len3, o, ref8, step;
	        ref8 = this.sorted_meshes;
	        for (o = 0, len3 = ref8.length; o < len3; o++) {
	          m = ref8[o];
	          m.visible = false;
	        }
	        step = function() {
	          m = test_meshes.pop();
	          if (m) {
	            m.visible = true;
	            main_loop.reset_timeout();
	            return requestAnimationFrame(step);
	          }
	        };
	        return step();
	      };
	    }
	    if (this.step === 1 && this.sorted_meshes) {
	      this.build_longest_rows();
	    }
	    if (this.step === this.render_steps + this.wait_steps) {
	      gl.readPixels(0, 0, this.w, this.h, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);
	      this.step = 0;
	      this.rounds += 1;
	      vec3.copy(this.last_cam_pos, this.cam_pos);
	      quat.copy(this.last_cam_rot, this.cam_rot);
	    }
	    if (this.debug_canvas != null) {
	      if (!this.ctx) {
	        this.debug_canvas.width = this.w;
	        this.debug_canvas.height = this.h;
	        this.ctx = this.debug_canvas.getContext('2d', {
	          alpha: false
	        });
	        this.imagedata = this.ctx.createImageData(this.w, this.h);
	      }
	      this.imagedata.data.set(this.pixels);
	      d = this.imagedata.data;
	      i = 3;
	      for (y = o = 0, ref8 = this.h; 0 <= ref8 ? o < ref8 : o > ref8; y = 0 <= ref8 ? ++o : --o) {
	        for (x = p = 0, ref9 = this.w; 0 <= ref9 ? p < ref9 : p > ref9; x = 0 <= ref9 ? ++p : --p) {
	          d[i] = x === this.debug_x || y === this.debug_y ? 0 : 255;
	          i += 4;
	        }
	      }
	      this.ctx.putImageData(this.imagedata, 0, 0);
	    }
	  };
	
	  GLRay.prototype.build_longest_rows = function() {
	    var current_id, i, id, inv_h, inv_w, j, k, pixels16, ref1, ref2, rlen, x, y;
	    this.longest_rows_len = [];
	    this.longest_rows_x = [];
	    this.longest_rows_y = [];
	    inv_w = 1 / (this.w - 1);
	    inv_h = 1 / (this.h - 1);
	    pixels16 = this.pixels16;
	    i = 0;
	    for (y = j = 0, ref1 = this.h; 0 <= ref1 ? j < ref1 : j > ref1; y = 0 <= ref1 ? ++j : --j) {
	      current_id = pixels16[i];
	      rlen = 1;
	      i += 2;
	      for (x = k = 1, ref2 = this.w; 1 <= ref2 ? k < ref2 : k > ref2; x = 1 <= ref2 ? ++k : --k) {
	        id = pixels16[i];
	        if (current_id === id) {
	          rlen += 1;
	        } else {
	          if (rlen > (this.longest_rows_len[current_id] | 0)) {
	            this.longest_rows_len[current_id] = rlen;
	            this.longest_rows_x[current_id] = (x - (rlen >> 1)) * inv_w;
	            this.longest_rows_y[current_id] = 1 - (y * inv_h);
	          }
	          current_id = id;
	          rlen = 1;
	        }
	        i += 2;
	      }
	    }
	  };
	
	  GLRay.prototype.debug_random = function() {
	    var i, j, pick;
	    for (i = j = 0; j < 1000; i = ++j) {
	      pick = null;
	      while (pick === null) {
	        pick = this.pick_object(Math.random(), Math.random());
	      }
	    }
	    return pick;
	  };
	
	  return GLRay;
	
	})();
	
	module.exports = {
	  GLRay: GLRay
	};


/***/ },
/* 41 */
/***/ function(module, exports) {

	var LogicBlock;
	
	LogicBlock = (function() {
	  function LogicBlock(context, scene_name) {
	    this.context = context;
	    this.context.on_scene_ready(scene_name, (function(_this) {
	      return function() {
	        return _this.init(_this.context.scenes[scene_name]);
	      };
	    })(this));
	    if (this.tick != null) {
	      this.context.on_scene_ready(scene_name, (function(_this) {
	        return function() {
	          return _this.context.scenes[scene_name].logic_ticks.push(_this.tick.bind(_this));
	        };
	      })(this));
	    }
	  }
	
	  LogicBlock.prototype.init = function(scene) {
	    this.scene = scene;
	  };
	
	  return LogicBlock;
	
	})();
	
	module.exports = {
	  LogicBlock: LogicBlock
	};


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var DragGesture, LogicBlock, PinchGesture, RotationGesture, TouchGesturesOver, axis_objet_mapper, curve_closest_point, digital_to_axes, mat2, mat3, mat4, phy, pointer_over, quat, ref, trackball_rotation, vec2, vec3, vec4,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty,
	  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	phy = __webpack_require__(24);
	
	LogicBlock = __webpack_require__(41).LogicBlock;
	
	TouchGesturesOver = (function(superClass) {
	  extend(TouchGesturesOver, superClass);
	
	  function TouchGesturesOver() {
	    return TouchGesturesOver.__super__.constructor.apply(this, arguments);
	  }
	
	  TouchGesturesOver.prototype.init = function(scene1) {
	    this.scene = scene1;
	    this.hits = {};
	    return this.hits_by_touch_id = {};
	  };
	
	  TouchGesturesOver.prototype["eval"] = function(int_mask) {
	    var angular_velocity, cam, cam_pos, cam_view, fingers, height, hit, i, id, len, linear_velocity, new_touch_events, new_touches, ob, ob_name, ob_pos, obhit, output, pinch, pos, rayto, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, rel_pinch, rel_pos, rel_rot, rot, tid, touch, touch_events, touch_events_3D, touch_ids, width, x, y;
	    new_touches = this.context.events.get_touch_events();
	    touch_ids = [];
	    cam = this.scene.active_camera;
	    ref1 = this.context.canvas_rect, width = ref1.width, height = ref1.height;
	    cam_pos = cam.get_world_position();
	    cam_view = [0, 0, -1];
	    vec3.transformQuat(cam_view, cam_view, cam.rotation);
	    for (i = 0, len = new_touches.length; i < len; i++) {
	      touch = new_touches[i];
	      x = touch.x, y = touch.y, id = touch.id;
	      touch_ids.push(id + '');
	      x = x / width;
	      y = y / height;
	      rayto = cam.get_ray_direction(x, y);
	      hit = phy.ray_intersect_body_absolute(this.scene, cam_pos, rayto, int_mask);
	      ob_name = this.hits_by_touch_id[id];
	      if (hit != null) {
	        ob = hit[0].owner;
	        ob_pos = ob.position;
	        ob_name = ob_name || hit[0].owner.name;
	        touch.hit = hit;
	      }
	      if (ob_name != null) {
	        obhit = this.hits[ob_name] = this.hits[ob_name] || {
	          touch_events: {},
	          init_ratio: null,
	          pinch_gesture: new PinchGesture(this.context, this.scene.name),
	          rot_gesture: new RotationGesture(this.context, this.scene.name),
	          drag_gesture: new DragGesture(this.context, this.scene.name),
	          ob: ob
	        };
	        if (obhit.init_ratio == null) {
	          obhit.init_ratio = obhit.init_ratio || vec3.len(vec3.sub([], obhit.ob.position, cam_pos)) / vec3.len(vec3.sub([], rayto, cam_pos));
	        }
	        touch.world_position = vec3.scale([], rayto, obhit.init_ratio);
	        obhit.touch_events[id] = touch;
	        this.hits_by_touch_id[id] = ob_name;
	      }
	    }
	    ref2 = this.hits_by_touch_id;
	    for (id in ref2) {
	      ob_name = ref2[id];
	      if (indexOf.call(touch_ids, id) < 0 && ob_name) {
	        this.hits_by_touch_id[id] = null;
	        new_touch_events = {};
	        ref3 = this.hits[ob_name].touch_events;
	        for (tid in ref3) {
	          touch = ref3[tid];
	          if (tid !== id) {
	            new_touch_events[tid] = touch;
	          }
	        }
	        this.hits[ob_name].touch_events = new_touch_events;
	      }
	    }
	    ref4 = this.hits;
	    for (ob_name in ref4) {
	      hit = ref4[ob_name];
	      if (!Object.keys(hit.touch_events).length) {
	        this.hits[ob_name].init_ratio = null;
	      }
	    }
	    output = {};
	    ref5 = this.hits;
	    for (ob_name in ref5) {
	      hit = ref5[ob_name];
	      touch_events = [];
	      fingers = Object.keys(hit.touch_events);
	      if (fingers.length) {
	        pinch = rot = rel_pinch = rel_rot = 0;
	        touch_events_3D = [];
	        touch_events = [];
	        ref6 = hit.touch_events;
	        for (id in ref6) {
	          touch = ref6[id];
	          touch_events_3D.push({
	            id: touch.id,
	            x: touch.world_position[0],
	            y: touch.world_position[1],
	            z: touch.world_position[2]
	          });
	          touch_events.push(touch);
	        }
	        ref7 = hit.drag_gesture["eval"](touch_events_3D), pos = ref7.pos, rel_pos = ref7.rel_pos, linear_velocity = ref7.linear_velocity;
	        if (fingers.length > 1) {
	          ref8 = hit.pinch_gesture["eval"](touch_events_3D), pinch = ref8.pinch, rel_pinch = ref8.rel_pinch;
	          ref9 = hit.rot_gesture["eval"](touch_events), rot = ref9.rot, rel_rot = ref9.rel_rot, angular_velocity = ref9.angular_velocity;
	        } else {
	          hit.pinch_gesture.init();
	          hit.rot_gesture.init();
	          ref10 = hit.pinch_gesture["eval"](touch_events_3D), pinch = ref10.pinch, rel_pinch = ref10.rel_pinch;
	          ref11 = hit.rot_gesture["eval"](touch_events), rot = ref11.rot, rel_rot = ref11.rel_rot, angular_velocity = ref11.angular_velocity;
	        }
	        output[ob_name] = {
	          pos: pos,
	          rel_pos: rel_pos,
	          linear_velocity: linear_velocity,
	          pinch: pinch,
	          rel_pinch: rel_pinch,
	          rot: rot,
	          rel_rot: rel_rot,
	          angular_velocity: angular_velocity
	        };
	      } else {
	        hit.drag_gesture.init();
	      }
	    }
	    return output;
	  };
	
	  return TouchGesturesOver;
	
	})(LogicBlock);
	
	DragGesture = (function(superClass) {
	  extend(DragGesture, superClass);
	
	  function DragGesture() {
	    return DragGesture.__super__.constructor.apply(this, arguments);
	  }
	
	  DragGesture.prototype.init = function(scene1) {
	    this.scene = scene1;
	    this.pos = [];
	    this.last_pos = null;
	    this.rel_pos = [0, 0, 0];
	    this.id = null;
	    return this.linear_velocity = [0, 0, 0];
	  };
	
	  DragGesture.prototype["eval"] = function(pointer_events) {
	    var frame_duration, i, id, ix, iy, iz, len, linear_velocity, n, new_id, pointer, pos, rel_pos, x, y, z;
	    frame_duration = this.context.main_loop.frame_duration;
	    new_id = '';
	    ix = iy = iz = 0;
	    for (i = 0, len = pointer_events.length; i < len; i++) {
	      pointer = pointer_events[i];
	      id = pointer.id, x = pointer.x, y = pointer.y, z = pointer.z;
	      new_id += id + '_';
	      ix += x;
	      iy += y;
	      iz += z;
	    }
	    n = pointer_events.length;
	    ix /= n;
	    iy /= n;
	    iz /= n;
	    if (new_id !== this.id) {
	      this.init();
	    }
	    this.id = new_id;
	    pos = this.pos;
	    pos[0] = ix;
	    pos[1] = iy;
	    pos[2] = iz || 0;
	    linear_velocity = vec3.scale(this.linear_velocity, this.rel_pos, 1 / frame_duration);
	    this.last_pos = this.last_pos != null ? this.last_pos : pos;
	    rel_pos = vec3.sub(this.rel_pos, pos, this.last_pos);
	    this.last_pos = [ix, iy, iz];
	    return {
	      pos: pos,
	      rel_pos: rel_pos,
	      linear_velocity: linear_velocity
	    };
	  };
	
	  return DragGesture;
	
	})(LogicBlock);
	
	PinchGesture = (function(superClass) {
	  extend(PinchGesture, superClass);
	
	  function PinchGesture() {
	    return PinchGesture.__super__.constructor.apply(this, arguments);
	  }
	
	  PinchGesture.prototype.init = function() {
	    this.pos1 = [];
	    this.pos2 = [];
	    this.pinch = null;
	    this.id1 = null;
	    return this.id2 = null;
	  };
	
	  PinchGesture.prototype["eval"] = function(pointer_events) {
	    var id1, id2, last_pinch, pinch, pos1, pos2, rel_pinch;
	    if (pointer_events.length < 2) {
	      return {
	        pinch: 0,
	        rel_pinch: 0
	      };
	    }
	    id1 = pointer_events[0].id;
	    id2 = pointer_events[1].id;
	    if (this.id1 !== id1 || this.id2 !== id2) {
	      this.init();
	    }
	    this.id1 = id1;
	    this.id2 = id2;
	    pos1 = this.pos1;
	    pos2 = this.pos2;
	    pos1[0] = pointer_events[0].x;
	    pos1[1] = pointer_events[0].y;
	    pos1[2] = pointer_events[0].z || 0;
	    pos2[0] = pointer_events[1].x;
	    pos2[1] = pointer_events[1].y;
	    pos2[2] = pointer_events[1].z || 0;
	    pinch = vec3.dist(pos1, pos2);
	    last_pinch = this.pinch != null ? this.pinch : pinch;
	    rel_pinch = pinch - last_pinch;
	    this.pinch = pinch;
	    return {
	      pinch: pinch,
	      rel_pinch: rel_pinch
	    };
	  };
	
	  return PinchGesture;
	
	})(LogicBlock);
	
	RotationGesture = (function(superClass) {
	  extend(RotationGesture, superClass);
	
	  function RotationGesture() {
	    return RotationGesture.__super__.constructor.apply(this, arguments);
	  }
	
	  RotationGesture.prototype.init = function() {
	    this.pos1 = [];
	    this.pos2 = [];
	    this.rot = null;
	    this.id1 = null;
	    this.id2 = null;
	    return this.tmpv = this.tmpv || vec2.create();
	  };
	
	  RotationGesture.prototype["eval"] = function(pointer_events) {
	    var angular_velocity, frame_duration, id1, id2, last_rot, pos1, pos2, r, rel_rot, rot, x, y;
	    frame_duration = this.context.main_loop.frame_duration;
	    if (pointer_events.length < 2) {
	      return {
	        rot: 0,
	        rel_rot: 0
	      };
	    }
	    id1 = pointer_events[0].id;
	    id2 = pointer_events[1].id;
	    if (this.id1 !== id1 || this.id2 !== id2) {
	      this.init();
	    }
	    this.id1 = id1;
	    this.id2 = id2;
	    pos1 = this.pos1;
	    pos2 = this.pos2;
	    pos1[0] = pointer_events[0].x;
	    pos1[1] = pointer_events[0].y;
	    pos2[0] = pointer_events[1].x;
	    pos2[1] = pointer_events[1].y;
	    r = this.tmpv;
	    vec2.sub(r, pos2, pos1);
	    x = r[0];
	    y = r[1];
	    if (x > 0) {
	      rot = Math.atan(y / x);
	    } else if (x < 0) {
	      rot = Math.atan(y / x) + Math.PI;
	    } else {
	      if (y > 0) {
	        rot = -Math.PI;
	      } else if (y < 0) {
	        rot = Math.PI;
	      } else {
	        rot = this.rot;
	      }
	    }
	    last_rot = this.rot != null ? this.rot : rot;
	    rel_rot = rot - last_rot;
	    if (this.rel_rot > 0.9 * PI_2) {
	      this.rel_rot = this.rel_rot - PI_2;
	    }
	    this.rot = rot;
	    angular_velocity = vec3.scale([], rel_rot, 1 / frame_duration);
	    return {
	      rot: rot,
	      rel_rot: rel_rot,
	      angular_velocity: angular_velocity
	    };
	  };
	
	  return RotationGesture;
	
	})(LogicBlock);
	
	pointer_over = function(pointer_event, cam, int_mask) {
	  var context, events, height, pos, rayto, ref1, scene, width, x, y;
	  scene = cam.scene;
	  context = cam.scene.context;
	  events = context.events;
	  pos = cam.get_world_position();
	  ref1 = context.canvas_rect, width = ref1.width, height = ref1.height;
	  x = pointer_event.x, y = pointer_event.y;
	  x = x / width;
	  y = y / height;
	  rayto = cam.get_ray_direction(x, y);
	  return phy.ray_intersect_body_absolute(scene, pos, rayto, int_mask);
	};
	
	trackball_rotation = function(pointer_event, scale_x, scale_y, z_influence) {
	  var fdist, fdist2, lastpos, pos, rel, rel_x, rel_y, rot, rot1, rot2, x, y;
	  if (scale_x == null) {
	    scale_x = 1;
	  }
	  if (scale_y == null) {
	    scale_y = 1;
	  }
	  if (z_influence == null) {
	    z_influence = 0.2;
	  }
	  x = pointer_event.x, y = pointer_event.y, rel_x = pointer_event.rel_x, rel_y = pointer_event.rel_y;
	  pos = [x, y];
	  rel = [scale * rel_x, scale * rel_y];
	  fdist = vec2.len(pos);
	  fdist2 = Math.pow(fdist, 2);
	  lastpos = vec2.sub([], pos, rel);
	  if (pos[1] < 0 && lastpos[1] < 0) {
	    vec2.negate(pos, pos);
	    vec2.negate(lastpos, lastpos);
	  }
	  rot1 = Math.atan2(pos[0], pos[1]);
	  rot2 = Math.atan2(lastpos[0], lastpos[1]);
	  rot = rot2 - rot1;
	  return [rel[1] * PI * (1 - pos[1] * z_influence), fdist2 * rot * 4 * z_influence, rel[0] * PI * (1 - pos[0] * z_influence)];
	};
	
	curve_closest_point = function(point, curve) {
	  var p, p_n, point_in_curve, tangent;
	  if (point == null) {
	    point = [0, 0, 0];
	  }
	  p = vec3.clone(point);
	  vec3.sub(p, p, curve.position);
	  curve.rotation[3] *= -1;
	  vec3.transformQuat(p, p, curve.rotation);
	  curve.rotation[3] *= -1;
	  p_n = curve.closest_point(p);
	  point_in_curve = p_n[0];
	  tangent = p_n[1];
	  vec3.transformQuat(point_in_curve, point_in_curve, curve.rotation);
	  vec3.transformQuat(tangent, tangent, curve.rotation);
	  vec3.add(point_in_curve, point_in_curve, curve.position);
	  return [point_in_curve, tangent];
	};
	
	digital_to_axes = function(digital, normalize) {
	  var axis, x, y, z;
	  if (digital == null) {
	    digital = [0, 0, 0, 0, 0, 0];
	  }
	  if (normalize == null) {
	    normalize = false;
	  }
	  x = digital[0] - digital[1];
	  y = digital[2] - digital[3];
	  z = digital[4] - digital[5];
	  axis = [x, y, z];
	  if (normalize) {
	    vec3.normalize(axis, axis);
	  }
	  return axis;
	};
	
	axis_objet_mapper = function(pos, cam, axis) {
	  var a, cpos, m;
	  if (axis == null) {
	    axis = [0, 0, 0];
	  }
	  m = cam.world_matrix;
	  cpos = [m[8], m[9], m[10]];
	  vec3.transformQuat(cpos, cpos, quat.invert([], ob.rotation));
	  a = atan2(cpos[0], cpos[1]);
	  return [-axis[0] * cos(-a) + axis[1] * sin(-a), -axis[1] * cos(a) + axis[0] * sin(a), 0];
	};
	
	module.exports = {
	  TouchGesturesOver: TouchGesturesOver,
	  RotationGesture: RotationGesture,
	  PinchGesture: PinchGesture,
	  pointer_over: pointer_over,
	  trackball_rotation: trackball_rotation,
	  curve_closest_point: curve_closest_point,
	  digital_to_axes: digital_to_axes,
	  axis_objet_mapper: axis_objet_mapper
	};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var LogicBlock, LookAt, RotateAround, SIGNED_AXES, SnapToCurve, mat2, mat3, mat4, quat, ref, vec2, vec3, vec4,
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	ref = __webpack_require__(8), mat2 = ref.mat2, mat3 = ref.mat3, mat4 = ref.mat4, vec2 = ref.vec2, vec3 = ref.vec3, vec4 = ref.vec4, quat = ref.quat;
	
	LogicBlock = __webpack_require__(41).LogicBlock;
	
	SIGNED_AXES = {
	  'X': 1,
	  'Y': 2,
	  'Z': 3,
	  '-X': -1,
	  '-Y': -2,
	  '-Z': -3
	};
	
	RotateAround = (function(superClass) {
	  extend(RotateAround, superClass);
	
	  function RotateAround() {
	    return RotateAround.__super__.constructor.apply(this, arguments);
	  }
	
	  RotateAround.prototype.init = function() {
	    this.invrot = quat.create();
	    return this.obrot = quat.create();
	  };
	
	  RotateAround.prototype["eval"] = function(ob, target, rotation) {
	    var invrot, obrot, pos, rot;
	    if (target == null) {
	      target = [0, 0, 0];
	    }
	    if (rotation == null) {
	      rotation = [0, 0, 0];
	    }
	    invrot = this.invrot, obrot = this.obrot;
	    obrot[0] = 0;
	    obrot[1] = 0;
	    obrot[2] = 0;
	    obrot[3] = 1;
	    quat.rotateX(obrot, obrot, rotation[0]);
	    quat.rotateY(obrot, obrot, rotation[1]);
	    quat.rotateZ(obrot, obrot, rotation[2]);
	    rot = ob.rotation;
	    pos = ob.position;
	    vec3.sub(pos, pos, target);
	    quat.invert(invrot, rot);
	    vec3.transformQuat(pos, pos, invrot);
	    vec3.transformQuat(pos, pos, obrot);
	    vec3.transformQuat(pos, pos, rot);
	    vec3.add(pos, pos, target);
	    return quat.mul(rot, rot, obrot);
	  };
	
	  return RotateAround;
	
	})(LogicBlock);
	
	LookAt = (function(superClass) {
	  extend(LookAt, superClass);
	
	  function LookAt() {
	    return LookAt.__super__.constructor.apply(this, arguments);
	  }
	
	  LookAt.prototype.init = function() {
	    this.tup = [0, 0, 1];
	    this.side = vec3.create();
	    this.front = vec3.create();
	    this.m = mat3.create();
	    return this.q = quat.create();
	  };
	
	  LookAt.prototype["eval"] = function(viewer, target, viewer_up, viewer_front, smooth, frame_duration) {
	    var f, f_idx, front, m, n, origin, q, s, side, tup, u, u_idx;
	    if (target == null) {
	      target = [0, 0, 0];
	    }
	    if (viewer_up == null) {
	      viewer_up = 'Z';
	    }
	    if (viewer_front == null) {
	      viewer_front = '-Y';
	    }
	    if (smooth == null) {
	      smooth = 0;
	    }
	    if (frame_duration == null) {
	      frame_duration = this.context.main_loop.frame_duration;
	    }
	    q = this.q, m = this.m, tup = this.tup, front = this.front, side = this.side;
	    u_idx = SIGNED_AXES[viewer_up];
	    f_idx = SIGNED_AXES[viewer_front];
	    tup[0] = 0;
	    tup[1] = 0;
	    tup[2] = 1;
	    if (u_idx < 0) {
	      vec3.negate(tup, tup);
	    }
	    origin = viewer.get_world_position();
	    u = Math.abs(u_idx) - 1;
	    f = Math.abs(f_idx) - 1;
	    s = 3 - u - f;
	    if (f_idx < 0) {
	      vec3.sub(front, origin, target);
	    } else {
	      vec3.sub(front, target, origin);
	    }
	    if (u === 1 || f === 2) {
	      vec3.cross(side, tup, front);
	    } else {
	      vec3.cross(side, front, tup);
	    }
	    if ([0, 1, 0, 0, 1][2 - f + s]) {
	      vec3.cross(tup, side, front);
	    } else {
	      vec3.cross(tup, front, side);
	    }
	    vec3.normalize(side, side);
	    vec3.normalize(tup, tup);
	    vec3.normalize(front, front);
	    m[u] = tup[0];
	    m[u + 3] = tup[1];
	    m[u + 6] = tup[2];
	    m[f] = front[0];
	    m[f + 3] = front[1];
	    m[f + 6] = front[2];
	    m[s] = side[0];
	    m[s + 3] = side[1];
	    m[s + 6] = side[2];
	    mat3.transpose(m, m);
	    quat.fromMat3(q, m);
	    q[0] = -q[0];
	    q[1] = -q[1];
	    q[2] = -q[2];
	    q[3] = -q[3];
	    n = frame_duration * 0.06;
	    smooth = Math.max(0, 1 - smooth);
	    smooth = 1 - Math.pow(smooth, n) * Math.pow(1 / smooth - 1, n);
	    quat.slerp(viewer.rotation, viewer.rotation, q, smooth);
	    return quat.normalize(viewer.rotation, viewer.rotation);
	  };
	
	  return LookAt;
	
	})(LogicBlock);
	
	SnapToCurve = (function(superClass) {
	  extend(SnapToCurve, superClass);
	
	  function SnapToCurve() {
	    return SnapToCurve.__super__.constructor.apply(this, arguments);
	  }
	
	  SnapToCurve.prototype.init = function() {
	    this.antifilter = vec3.create();
	    this.pre_filtered = vec3.create();
	    this.v_one = [1, 1, 1];
	    return this.look_at = new LookAt(this.context, this.scene.name);
	  };
	
	  SnapToCurve.prototype["eval"] = function(ob, curve, pos_axes, front, up, position_factor, rotation_factor, frame_duration) {
	    var antifilter, filter, n, normal, p_n, point, pre_filtered, smooth, t, target;
	    if (pos_axes == null) {
	      pos_axes = [1, 1, 1];
	    }
	    if (front == null) {
	      front = '-Y';
	    }
	    if (up == null) {
	      up = 'Z';
	    }
	    if (position_factor == null) {
	      position_factor = 1;
	    }
	    if (rotation_factor == null) {
	      rotation_factor = 1;
	    }
	    antifilter = this.antifilter, pre_filtered = this.pre_filtered;
	    if (frame_duration == null) {
	      frame_duration = this.context.main_loop.frame_duration;
	    }
	    filter = pos_axes;
	    vec3.sub(antifilter, this.v_one, filter);
	    vec3.sub(ob.position, ob.position, curve.position);
	    curve.rotation[3] *= -1;
	    vec3.transformQuat(ob.position, ob.position, curve.rotation);
	    curve.rotation[3] *= -1;
	    p_n = curve.closest_point(ob.position, filter);
	    point = p_n[0];
	    vec3.mul(point, point, filter);
	    vec3.mul(pre_filtered, ob.position, antifilter);
	    vec3.add(point, point, pre_filtered);
	    t = position_factor;
	    n = frame_factor;
	    t = 1 - Math.pow(t, n) * Math.pow(1 / t - 1, n);
	    vec3.lerp(ob.position, ob.position, point, t);
	    vec3.transformQuat(ob.position, ob.position, curve.rotation);
	    vec3.add(ob.position, ob.position, curve.position);
	    if (rotation_factor) {
	      normal = p_n[1];
	      vec3.transformQuat(normal, normal, curve.rotation);
	      smooth = 1 - Math.abs(rotation_factor);
	      target = vec3.add(normal, normal, ob.position);
	      return this.look_at(ob, target, [1, 1, 1], front, up, smooth, frame_duration);
	    }
	  };
	
	  return SnapToCurve;
	
	})(LogicBlock);
	
	module.exports = {
	  RotateAround: RotateAround,
	  LookAt: LookAt,
	  SnapToCurve: SnapToCurve
	};


/***/ }
/******/ ])
});
;
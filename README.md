# SoSoEasy.js

> An utility script for web development.

## ***WARNING: This library is currently unstable, there may be bugs in it. Further test is required. Do NOT use it in production!***

## Introduction

### Yet Another JS Library, Why?

Nowadays, Web Development is domainated by Webpack and Babel, which becomes overkill when developing small projects like Demo Programs and Online Utilities. So I created the small library. It has some utility functions and some DOM operation functions. It is possible to use only one of those two parts.

## Overview


- **Assertion** &nbsp; JavaScript has a lot of bad design, including opinionated implicit type conversion. This library provides functions for expression assertion and type assertion.

```js
/* Expression Assertion */
__.assert(1+1 != 2)  // Error: Asserstion Failed
__.assert(1+1 == 2)  // true

/* Type Assertion */
__('1234').require('Array')  // Error: Asserstion Failed
__([1,2,3,4]).require('Array') // true
__(123).require('String')  // Error: Asserstion Failed
__('123').require('String') // true

/* Type Check */
__([]).is('Array')  // true
__('123').is('Number')  // false
__(123).is('Number')  // true
```

- **Iterator Operation** &nbsp; ES6 added `map()`, `filter()` and `reduce()` on `Array.prototype`, it is good, but for iterators (returned by generators), those methods are not available. This library provides generator version of those methods.
    
```js
__.range(0,10)
// Handle { operand: Generator }

__.range(0,10).collect()
// Array(10) [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]

__.range(0,10).map(x => 2**x).filter(y => y > 20).collect()
// Array(5) [ 32, 64, 128, 256, 512 ]

__([1,2,3,4,5]).every(n => n > 0)
// true

__([{x:1,y:2},{x:3,y:4}]).find(p => p.x == 3)
// Object { x: 3, y: 4 }

__([{x:1,y:2},{x:3,y:4}]).find(p => p.x == 5)
// null
```

- **Hash Table Operation** &nbsp; JavaScript lacks functional-style methods for pure objects (aka hash tables). This library provides methods like `map_key()`, `map_value()`, `map_entry()` and `filter_entry()` for pure objects.

```js
__({x:1,y:2,z:3,w:4}).map_value(x => x*100)
// Object { x: 100, y: 200, z: 300, w: 400 }

_({x:1,y:2,z:3,w:4}).filter_entry((key, value) => key != 'x' && value != 4)
// Object { y: 2, z: 3 }

__({x:1,y:2,z:3,w:4}).map_entry((key, value) => `${key}=${value}`)
// Handle { operand: Generator }

__({x:1,y:2,z:3,w:4}).map_entry((key, value) => `${key}=${value}`).join(', ')
// "x=1, y=2, z=3, w=4"
```

- **Shallow Copy and Shallow Equal** &nbsp; This library provides a quick way to do shallow copy and shallow equality test for arrays and pure objects.

```js
let p = {x:1,y:2,z:3,w:4}
let q = __(p).copy()
q.x = 100000
q  // Object { x: 100000, y: 2, z: 3, w: 4 }
p  // Object { x: 1, y: 2, z: 3, w: 4 }
__(p).equals(q)  // false
__(p).equals(p)  // true

```

- **Reactive Data Binding on Actual DOM** &nbsp; Unlike libraries designed for big apps, which tend to use virtual DOM, this library provides a way to bind data on actual DOM, and update DOM content reactively. Unlike other libraries, this library does not use templates. It provides a simple way to describe DOM structure and data binding by vanilla JS, so it does not contain a template parser, which makes it very lightweight.

```js
let Data = { count: 0 }
let Counter = ['div', {}, [
    ['button', { text: '-', on: { click: ev => { Data.count-- } } }],
    ['span', { text: count => ` count: ${count} ` }],
    ['button', { text: '+', on: { click: ev => { Data.count++ } } }]
]]
document.body.appendChild(__.bind(Data, Counter))
```

For more examples, this repository contains a `sample` folder, there is a sample todo list app in it.

## Build

```console
$ yarn build    # output: 'lib/so-so-easy.js'
```
Note that Babel is not used, so the compiled code is **still ES6** and does NOT include any polyfill.

But `module` field in `package.json` has pointed to the original code file, so it is possible to import this library as a ES6 module in order to make it adopted by the Babel config of your own project.

## License

MIT

## API Reference

###  __&lt;T&gt; (x: T) -> Handle&lt;T&gt;

Returns a handle for operand  `x`. (Invoke `new Handle(x)`)

```js
__(12345)
// Handle { operand: 12345 }
```

### Handle :: unwrap()

Returns the wrapped operand of the handle.

```js
__(12345).unwrap()
// 12345
```

### Handle :: is (type_name: String) -> Boolean

Checks if the operand of the handle is of the type indicated by `type_name`.

```js
__([1,2,3]).is('Array')  // true
__({}).is('HashTable')  // true
__(t=>t+1).is('Function') // true
__([1]).is('Iterable')  // true
__((function*() { yield 1 })()).is('Iterable')  // true
__('1234').is('Number')  // false
__([1,2,3]).is('Object')  // true
__([1,2,3]).is('HashTable')  // false
__(null).is('Object')  // false
```

| Type Name | Definition                                       |
|-----------|--------------------------------------------------|
| Boolean   | `typeof operand == 'boolean'`                    |
| String    | `typeof operand == 'string'`                     |
| Number    | `typeof operand == 'number'`                     |
| Symbol    | `typeof operand == 'symbol'`                     |
| Key       | String or Symbol                                 |
| Object    | `typeof operand == 'object' && operand !== null` |
| HashTable | Object with `[[Prototype]] === Object.prototype`                   |
| Array     | `operand instanceof Array`                       |
| Iterable  | Object with `[Symbol.iterator]` is Function      |
| Function  | `typeof operand == 'function'`                   |
| Null      | operand === null                                 |
| Empty     | `typeof operand == 'undefined'`                  |
| NotEmpty  | `typeof operand != 'undefined'`                  |

### Handle :: require (type_name: String) -> Boolean

Similar to `is()`, but throws an error if the type check failed.

```js
__('1').require('Number')
// Error: Assertion Failed
__(1).require('Number')
// true
```

### Handle&lt;HashTable&gt; :: has (key: String) -> Boolean

Invokes `Object.prototype.hasOwnProperty` to check if `key` is an own-property of the operand.

```js
__({a:1,b:2}).has('a')  // true
__({a:1,b:2}).has('42')  // false
__([0,1]).has('1')  // Error: Assertion Failed
__(Object.create({})).has('1')  // Error: Assertion Failed
```

### Handle&lt;HashTable&gt; :: merge (hash: HashTable) -> HashTable

Invokes `Object.assign(operand, hash)` to merge `hash` into the operand and returns the operand itself.

```js
let h = { a: 1, b: 2 }
__(h).merge({ c: 3 })  // Object { a: 1, b: 2, c: 3 }
h  // Object { a: 1, b: 2, c: 3 }
```

### Handle&lt;HashTable&gt; :: merged (hash: HashTable) -> HashTable

Invokes `Object.assign({}, operand, hash)` to merge `hash` and the operand into a new object and returns the new object.

```js
let h1 = { a: 1, b: 2 }
let h2 = __(h1).merged({ c: 3 })
h1  // Object { a: 1, b: 2 }
h2 // Object { a: 1, b: 2, c: 3 }
```

### Handle&lt;HashTable&gt; :: keys() -> Array

Equivalent to `Object.keys(operand)`.

```js
__({ a: 1, b: 2 }).keys()
// Array [ "a", "b" ]
```

### Handle&lt;HashTable&gt; :: values() -> Array

Equivalent to `Object.keys(operand).map(key => operand[key])`

```js
__({ a: 1, b: 2 }).values()
// Array [ 1, 2 ]
```

### Handle&lt;HashTable&gt; :: entries() -> Array

Equivalent to `Object.keys(operand).map(key => ({ key, value: operand[key]}) )`

```js
__({ a: 1, b: 2 }).entries()
// Array [ Object { key: "a", value: 1 }, Object { key: "b", value: 2 } ]
```

### Handle&lt;HashTable&gt; :: for_each_entry (f: Function) -> Null

Calls `f(key, value)` for each entry of the operand.

```js
__({ a: 1, b: 2 }).for_each_entry((key, value) => { console.log(`${key} = ${value}`) })
// a = 1
// b = 2
```

### Handle&lt;HashTable&gt; :: map_entry (f: Function) -> Handle&lt;Iterable&gt;

Creates an iterator that yields `f(key, value)` for each entry of the operand, and returns a handle of the iterator.

```js
__({ a: 1, b: 2 }).map_entry((key, value) => `${key} = ${value}`)
// Handle { operand: Generator }
__({ a: 1, b: 2 }).map_entry((key, value) => `${key} = ${value}`).collect()
// Array [ "a = 1", "b = 2" ]
```

### Handle&lt;HashTable&gt; :: map_key (f: Function) -> HashTable

Creates a new hash table with keys mapped by `f(key, value)` for each entry of the operand, and returns the new hash table.

```js
__({ a: 1, b: 2 }).map_key(k => k.toUpperCase())
// Object { A: 1, B: 2 }
__({ a: 1, b: 2 }).map_key((_, v) => v.toString())
// Object { 1: 1, 2: 2 }
```

### Handle&lt;HashTable&gt; :: map_value (f: Function) -> HashTable

Creates a new hash table with values mapped by `f(value, key)` for each entry of the operand, and returns the new hash table.

```js
__({ a: 1, b: 2 }).map_value(v => v*1000)
// Object { a: 1000, b: 2000 }
__({ a: 1, b: 2 }).map_value((v, k) => v*1000 + k.codePointAt(0))
// Object { a: 1097, b: 2098 }
```

### Handle&lt;HashTable&gt; :: filter_entry (f: Function) -> HashTable

Creates a new hash table with entries filtered by `f(key, value)` for each entry of the operand, and returns the new hash table.

```js
__({ a: 1, b: 2, c: 3 }).filter_entry((k, v) => k != 'a' && v != 3)
// Object { b: 2 }
```

### Handle&lt;Iterable&gt; :: map (f: Function) -> Handle&lt;Iterable&gt;

Create a new iterator with elements mapped by `f(element, index)` for each element yielded by the operand, and returns a handle of the new iterator.

```js
__([ 1, 2, 3, 4, 5 ]).map(n => 2**n)
// Handle { operand: Generator }
__([ 1, 2, 3, 4, 5 ]).map(n => 2**n).collect()
// Array(5) [ 2, 4, 8, 16, 32 ]
__([  'a', 'b', 'c' ]).map((_, i) => i).collect()
// Array(3) [ 0, 1, 2 ]
__({ a: 1, b: 2 }).map((_, i) => i).collect()
// Error: Assertion Failed
```

### Handle&lt;Iterable&gt; :: filter (f: Function) -> Handle&lt;Iterable&gt;

Create a new iterator with elements filtered by `f(element, index)` for each element yielded by the operand, and returns a handle of the new iterator.

```js
__([ 1, 2, 3, 4, 5 ]).filter(n => n > 3).collect()
// Array [ 4, 5 ]
__([ 'a', 'b', 'c', 'd' ]).filter((_, i) => i > 1).collect()
// Array [ "c", "d" ]
```
### Handle&lt;Iterable&gt; :: reduce (initial: any, f: Function) -> any

Let `v` to be the `initial` value. For each element yielded by the operand,  re-assign `v` to the value of `f(element, v, index)`, and  return the final value of `v` when all elements have been yielded.

```js
let sum = it => __(it).reduce(0, (e, s) => s + e)
sum([ 1, 2, 3, 4 ])
// 10
sum(__.range(0, 101).unwrap())
// 5050
```

### Handle&lt;Iterable&gt; :: every (f: Function) -> Boolean

Checks if for all elements yielded by the operand, `f(element, index)` is a truthy value.

```js
__([ 1, 2, 3 ]).every(n => __(n).is('Number'))
// true
__([ 1, '2', 3 ]).every(n => __(n).is('Number'))
// false
__([ 6, 11, 88 ]).every((n, i) => i == 0 || n > 10)
// true
```

### Handle&lt;Iterable&gt; :: some (f: Function) -> Boolean

Checks if there exists an element yielded by the operand that satisfies that `f(element, index)` is a truthy value.

```js
__([ 1, '2', 3 ]).some(n => __(n).is('String'))
// true
__([ 1, 2, 3 ]).some(n => __(n).is('String'))
// false
__([ 6, 11, 88 ]).some((n, i) => i > 0 && n < 10)
// false
```

### Handle&lt;Iterable&gt; :: find (f: Function) -> any

Finds the first element which satisfies that `f(element)` is a truthy value, in all elements yielded by the operand, and returns it. If all the elements do not satisfy the condition, `null` will be returned.

```js
__([{ x: 1, y: 2 }, { x: -1, y: 3 }]).find(p => p.x < 0)
// Object {x: -1, y: 3}
__([{ x: 1, y: 2 }, { x: -1, y: 3 }]).find(p => p.y < 0)
// null
```

### Handle&lt;Iterable&gt; :: for_each_item (f: Function) -> Null

Invokes `f(element, index)` for each element yielded by the operand.

```js
__.range(10, 15).for_each_item((e, i) => { console.log(`#${i}: ${e}`) })
/*
#1: 11
#2: 12
#3: 13
#4: 14
*/
```

### Handle&lt;Iterable&gt; :: join (separator: String) -> String

Behaves like `Array.prototype.join(separator)` but operates on the iterable operand, which does not have to be an array.

```js
__.range(0,10).map(n => 2**n).join('-')
// "1-2-4-8-16-32-64-128-256-512"
```

### Handle&lt;Iterable&gt; :: collect () -> Array

Collects all elements yielded by the operand into an array, and returns the array.

```js
__((function*() { yield 1; yield 2 })()).collect()
// Array(2) [ 1, 2 ]
```

### Handle&lt;Array&gt; :: reversed () -> Handle&lt;Iterable&gt;

Creates a reversed iterator of the operand array, and returns a handle of the iterator.

```js
__([ 5, 7, 9 ]).reversed()
// Handle { operand: Generator }
__([ 5, 7, 9 ]).reversed().collect()
// Array(3) [ 9, 7, 5 ]
```

### Handle&lt;Array&gt; :: prepended (element: any) -> Array

Creates a copy of the operand array with `element` prepended, and returns the new array.

```js
let l = [ 1, 2, 3 ]
let m = __(l).prepended(0)
l  // Array(3) [ 1, 2, 3 ]
m  // Array(4) [ 0, 1, 2, 3 ]
```

### Handle&lt;Array&gt; :: appended (element: any) -> Array

Creates a copy of the operand array with `element` appended, and returns the new array.

```js
let l = [ 1, 2, 3 ]
let m = __(l).appended(4)
l  // Array(3) [ 1, 2, 3 ]
m  // Array(4) [ 1, 2, 3, 4 ]
```

### Handle&lt;Array&gt; :: removed (index: Number) -> Array

Creates a copy of the operand array with element at `index` removed, and returns the new array. Note that `index` should be a valid index of the operand array, otherwise the method will throw an error.

```js
__([ 0, 1, 2, 3, 4 ]).removed(2)
// Array(4) [ 0, 1, 3, 4 ]
__([ 0, 1, 2, 3, 4]).removed(5)
// Error: Assertion Failed
```

### Handle&lt;Array&gt; :: copy () -> Array 
### Handle&lt;HashTable&gt; :: copy() -> HashTable

Creates a shallow copy of the operand and returns the copy.

```js
let a1 = [ 0, 1 ]
let a2 = __(a1).copy()
a1[0] = 777
a1  // Array(2) [ 777, 1 ]
a2  // Array(2) [ 0, 1 ]
let h1 = { a: 1, b: 2 }
let h2 = __(h1).copy()
h2.b *= 500
h1  // Object { a: 1, b: 2 }
h2  // Object { a: 1, b: 1000 }
```

### Handle&lt;Array&gt; :: equals (another: Array) -> Array 
### Handle&lt;HashTable&gt; :: equals (another: HashTable) -> HashTable 

Checks the shallow equality of the operand and the argument `another`. (each element or value is checked by `===` operator)

```js
__([ 1, 2, 3 ]).equals([ 1, 2, 3 ])
// true
__([ '1', 2, 3 ]).equals([ 1, 2, 3 ])
// false
__([ 1, 2, {} ]).equals([ 1, 2, {} ])
// false
__({ a: 1, b: 2 }).equals({ a: 1, b: 2 })
// true
__({ a: 1, b: [2] }).equals({ a: 1, b: [2] })
// false
```

### Handle&lt;HTMLElement&gt; :: $ (selector: String) -> HTMLElement | Null

Equivalent to `operand.querySelector(selector)`.

```js
__(document.head).$('meta')
// <meta charset="UTF-8">
```

### Handle&lt;HTMLElement&gt; :: $$ (selector: String) -> HTMLElement[]

Invokes `operand.querySelectorAll(selector)`, returns an array created from the result NodeList.

```js
__(document.head).$$('script')
// Array(2) [script, script]
__(document.head).$$('vrgwegvergvqe')
// Array []
```

### Handle&lt;Object&gt; :: track (key: String) -> Null

Makes `operand[key]` a reactive property, that is, when the value of `operand[key]` changes, the watchers of the `key` will be notified. If `operand[key]` is already a reactive property, does nothing. If `operand[key]` does not exist, throws an error.

```js
let o = { t: 0 }
__(o).track('t')
__(o).watch(t => { console.log(`The value of t changed to ${t}`) })
o.t = 1
// The value of t changed to 1
o.t = 2
// The value of t changed to 2
__(o).track('cwn2390vnwriovn3i')
// Error: Assertion Failed
```

### Handle&lt;Object&gt; :: define (key: String, get: Function) -> Null

> Warning: Use of this method causes you **CANNOT** minify, uglify or obscure your JavaScript code. That is because the names of properties depended by the computed property is determined by the parameter list of the `get` function, this behaviour relies on the result of `Function.prototype.toString()`, which will break when the code is minified. Moreover, using default value for parameters, or putting comments between parameters of the `get` function, is **NOT** allowed.

Defines `key` as a computed property on the operand, with parameters of the `get` function as its dependecies.

```js
let o = { u: 1, v: 2 }
__(o).define('computed', (u, v) => u+v)
o.computed  // 3
o.u = -2
o.computed  // 0
__(o).track('u')
__(o).track('v')
__(o).watch(computed => { console.log(`The computed value changed to ${computed}`) })
o.u = 5
// The computed value changed to 7
o.v = 5
// The computed value changed to 10
o.v = 100
// The computed value changed to 105
```

### Handle&lt;Object&gt; :: watch (callback: Function) -> Watcher

> Warning: Use of this method causes you **CANNOT** minify, uglify or obscure your JavaScript code. That is because the names of properties depended by the watcher is determined by the parameter list of the `callback` function, this behaviour relies on the result of `Function.prototype.toString()`, which will break when the code is minified. Moreover, using default value for parameters, or putting comments between parameters of the `callback` function, is **NOT** allowed.

For each parameter of the `callback` function, when the value of the property having the same name as the parameter changes, the `callback` function will be called (only if the property is set reactive by `track()`, `define()`, or `__.bind()`), and returns a watcher object, which can be used when calling `unwatch()`.

```js
let o = { name: 'ABC' }
__(o).watch(name => { console.log(`new name: ${name}`) })
o.name = 'DEF'
// Nothing Happended
__(o).track('name')
o.name = 'Foo'
// new name: Foo
o.name = 'Bar'
// new name: Bar
```

### Handle&lt;Object&gt; :: unwatch (watcher: Watcher) -> Boolean

If `watcher` exists on the operand object, remove it and returns `true`. Otherwise returns `false`.

```js
let o = { x: 3.5 }
let w1 = __(o).watch(x => { console.log(`x = ${x}`) })
let w2 = __(o).watch(x => { console.log(`2x = ${2*x}`) })
__(o).track('x')
o.x = 7
// x = 7
// 2x = 14
o.x = 8
// x = 8
// 2x = 16
__(o).unwatch(w1)
// true
__(o).unwatch(w1)
// false
o.x = 9
// 2x = 18
__(o).unwatch(w2)
// true
o.x = 10
// Nothing Happended
```

### __.assert (value: any) -> Boolean

If `value` is a truthy value, returns `true`, otherwise throws and error.

```js
__.assert('a'.toUpperCase() == 'A')
// true
__.assert('a'.toUpperCase() == 'B')
// Error: Assertion Failed
```

### __.concat (...args: Iterable[]) -> Handle&lt;Iterable&gt;

Concatenates all the arguments.

```js
__.concat([ 1, 2, 3 ], [ 4, 5, 6 ]).collect()
// Array(6) [ 1, 2, 3, 4, 5, 6 ]
__.concat(__.range(0, 5).unwrap(), [ 4, 3, 2 ]).map(n => n/10).collect()
// Array(8) [ 0, 0.1, 0.2, 0.3, 0.4, 0.4, 0.3, 0.2 ]
```

### __.zip (...args: Iterable[]) -> Handle&lt;Iterable&gt;

Converges all arguments.

```js
__.zip([1,2,3],['1','2','3'],['one','two','three']).collect()
// Array(3) [ [ 1, "1", "one" ], [ 2, "2", "two" ], [ 3, "3", "three" ] ]
```

### __.range (start: Number, end: Number) -> Handle&lt;Iterable&gt;

Similar to the `range()` function in Python.

```js
__.range(0, 10).collect()
// Array(10) [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
__.range(-10, 0).collect()
// Array(10) [ -10, -9, -8, -7, -6, -5, -4, -3, -2, -1 ]
```

### __.$ (selector: String) -> HTMLElement | Null

Invokes `document.querySelector(selector)`.

```js
__.$('body')
// <body>
__.$('rveirvne')
// null
```

### __.$$ (selector: String) -> HTMLElement[]

Invokes `document.querySelectorAll(selector)`, returns an array created from the result NodeList.

```js
__.$$('div')
// Array(18) [ ... ]
__.$$('vgwksbvke')
// Array []
```

### __.bind (data: Object, parameters: Array) -> HTMLElement

> Warning: Use of this function causes you **CANNOT** minify, uglify or obscure your JavaScript code. That is because the names of properties of `data` that are depended by the create HTML element is determined by the parameter list of the functions defined in the `Props` or `Children` part of the array argument `parameters`, this behaviour relies on the result of `Function.prototype.toString()`, which will break when the code is minified. Moreover, using default value for function parameters, or putting comments between parameters of those functions, is **NOT** allowed.

Creates a HTML element by the `parameters` and bind `data` on it. All the properties of `data` that are depended by the created HTML element will be set reactive.

The schema of `parameters` is

```
Parameters := [TagName, Props, Children] or [TagName, Props]
```

`TagName` is a String, `Props` is a HashTable, and `Children` is an Array or a Function.

#### Props

`Props` is a HashTable, consists with some name-value pairs, for example:

```js
__.bind({}, ['div', { text: 'Text Content', style: { 'color': 'red', 'font-size': '20px' } }])
// <div style="color: red; font-size: 20px;">Text Content</div>
```

The values may be functions:

```js
{ text: name => `Your name is ${name}` }
{ class: enabled => [ enabled? 'enabled': 'disabled' ] }
```

If a functional value is set to a Prop, it behaves like `watch()`. When the dependencies defined by the parameters of the function are updated, the Prop will be updated successively.

```js
let d = { name: 'Alice' }
let e = __.bind(d, ['div', { text: name => `Your name is ${name}` }])
e  // <div>Your name is Alice</div>
d.name = 'Bob'
e  // <div>Your name is Bob</div>
```

The values for Props are treated according to the following schema table:

| Prop Name | Value Schema                   | Behaviour                                                                                                                                                                               |
|-----------|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| class     | ['c1', 'c2', 'c3', ...]        | `element.className = 'c1 c2 c3 ...'`                                                                                                                                                    |
| style     | { 'name': 'value', ... }       | `element.style = 'name: value; ...'`                                                                                                                                                    |
| dataset   | { 'name': 'value', ... }       | Mutates `element.dataset` to make it become the desired value                                                                                                                           |
| show      | (Boolean Value)                | `element.style.display = value? '': 'none'`                                                                                                                                             |
| text      | (String Value)                 | `element.textContent = value`                                                                                                                                                           |
| on        | { 'event_name': handler, ... } | `element['on'+'event_name'] = handler; ...`                                                                                                                                             |
|           | { 'enter': handler, ... }      | Binds `handler` to `keyup` event, emit the handler when the pressed key is Enter key.                                                                                                   |
| ref       | (String Value)                 | Creates a reference on the element, just like `ref="..."` in `React` and `Vue`. The `refs` object will be passed as the second argument of each event handler defined in the `on` Prop. |
| (others)  | value                          | `element[prop_name] = value`                                                                                                                                                            |

#### Children

`Children` may be an array of `Parameters` or `HTMLElement`, like this:

```js
[['li', { text: '1' }], ['li', { text: '2' }, ['li', { text: '3' }]]
[document.createElement('div'), __.bind({}, ['div', { text: 'div2' }])]
```

And, it can also be a function, like this:

```js
items => items.map(item => ['li', { text: `${item}` }])
```

Just like a Prop with a functional value, the dependencies defined by the parameters of the function are updated, the Children will be updated successively. All the previous child elements will be removed from DOM (if the child has a data binding, `__.unbind()` will be called to cancel the data binding), and the new child elements will be added.

```js
let d = { list: [1, 2, 3]  }
let e = __.bind(d, ['ul', {}, list => list.map(i => ['div', { text: `${i}` }])])
e
// <ul>
//   <div>1</div>
//   <div>2</div>
//   <div>3</div>
// </ul>
d.list = __(d.list).appended(4)
e
// <ul>
//   <div>1</div>
//   <div>2</div>
//   <div>3</div>
//   <div>4</div>
// </ul>
```

### __.unbind (element: HTMLElement) -> Null

Cancels the data binding on the `element`. If there isn't a data binding on the `element`, throws an error.

```js
let d = { text: 'Text' }
let e = __.bind(d, ['p', { text: text => text }])
e.textContent  // "Text"
d.text = 'New Text 1'
e.textContent  // "New Text 1"
__.unbind(e)
d.text = 'New Text 2'
e.textContent  // "New Text 1"
__.unbind(e)  // Error: Assertion Failed
```

# SoSoEasy.js

> An utility script for web development.

## ***WARNING: This library is currently unstable, there may be bugs in it. Further test is required. Do NOT use it in production!***

## Introduction

### Yet Another JS Library, Why?

Nowadays, Web Development is domainated by Webpack and Babel, which becomes overkill when developing small projects like Demo Programs and Online Utilities. So I created the small library. (very small)

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

- **Reactive Data Binding on Actual DOM** &nbsp; Unlike libraries designed for big apps, which tend to use virtual DOM, this library provides a way to bind data on actual DOM, and update DOM content reactively. Unlike other libraries, this library does not use templates. It provides a simple way to describe DOM structure and data binding by vanilla JS, so it does not contain a template parser, which makes it very small.

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

```
__(12345).unwrap()
// 12345
```

### Handle :: is (type_name: String) -> Boolean

Checks if the operand of the handle is of the type indicated by `type_name`.

```
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

### Handle&lt;HashTable&gt; :: has (key: Key) -> Boolean

Invokes `Object.prototype.hasOwnProperty` to check if `key` is an own-property of the operand.

```js
__({a:1,b:2}).has('a')  // true
__({a:1,b:2}).has('42')  // false
__([0,1]).has('1')  // Error: Assertion Failed
__(Object.create({})).has('1')  // Error: Assertion Failed
```

### Handle&lt;HashTable&gt; :: merge (hash: HashTable) -> HashTable

Invokes `Object.assign(operand, hash)` to merge `hash` into the operand and return the operand itself.

```js
let h = { a: 1, b: 2 }
__(h).merge({ c: 3 })  // Object { a: 1, b: 2, c: 3 }
h  // Object { a: 1, b: 2, c: 3 }
```

### Handle&lt;HashTable&gt; :: merged (hash: HashTable) -> HashTable

Invokes `Object.assign({}, operand, hash)` to merge `hash` and the operand into a new object and return the new object.

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

Creates an iterator that yields `f(key, value)` for each entry of the operand, and return a handle of the iterator.

```js
__({ a: 1, b: 2 }).map_entry((key, value) => `${key} = ${value}`)
// Handle { operand: Generator }
__({ a: 1, b: 2 }).map_entry((key, value) => `${key} = ${value}`).collect()
// Array [ "a = 1", "b = 2" ]
```

### Handle&lt;HashTable&gt; :: map_key (f: Function) -> HashTable

Creates a new hash table with keys mapped by `f(key, value)` for each entry of the operand, and return the new hash table.

```js
__({ a: 1, b: 2 }).map_key(k => k.toUpperCase())
// Object { A: 1, B: 2 }
__({ a: 1, b: 2 }).map_key((_, v) => v.toString())
// Object { 1: 1, 2: 2 }
```

### Handle&lt;HashTable&gt; :: map_value (f: Function) -> HashTable

Creates a new hash table with values mapped by `f(value, key)` for each entry of the operand, and return the new hash table.

```js
__({ a: 1, b: 2 }).map_value(v => v*1000)
// Object { a: 1000, b: 2000 }
__({ a: 1, b: 2 }).map_value((v, k) => v*1000 + k.codePointAt(0))
// Object { a: 1097, b: 2098 }
```

### Handle&lt;HashTable&gt; :: filter_entry (f: Function) -> HashTable

Creates a new hash table with entries filtered by `f(key, value)` for each entry of the operand, and return the new hash table.

```js
__({ a: 1, b: 2, c: 3 }).filter_entry((k, v) => k != 'a' && v != 3)
// Object { b: 2 }
```

### Handle&lt;Iterable&gt; :: map (f: Function) -> Handle&lt;Iterable&gt;

Create a new iterator with elements mapped by `f(element, index)` for each element yielded by the operand, and return a handle of the new iterator.

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

Create a new iterator with elements filtered by `f(element, index)` for each element yielded by the operand, and return a handle of the new iterator.

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

Checks if for all elements yielded by the operand, `f(element)` is a truthy value.

# DOCUMENT CURRENTLY UNFINISHED, TO BE CONTINUED
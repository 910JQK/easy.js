'use strict';


// const ExportName = '__'
const DataBinding = Symbol('DataBinding')
const Storage = Symbol('Storage')
const Watchers = Symbol('Watchers')


function assert (value) {
    if (!value) {
        throw new Error('Assertion Failed')
    }
    return true
}

function is_empty (x) {
    return typeof x == 'undefined'
}

function not_empty (x) {
    return !is_empty(x)
}

function is_real_object (x) {
    return typeof x == 'object' && x !== null
}

function is_of_proto (object, proto) {
    return Object.getPrototypeOf(object) === proto
}

function is_iterable (object) {
    return typeof object[Symbol.iterator] == 'function'
}

function has_key (object, key) {
    return Object.prototype.hasOwnProperty.call(object, key)
}


function extract_parameters (f) {
    let code = f.toString()
    let match = code.match(/^function *\(([^\)]*)\)/)
    if (match == null) {
        match = code.match(/^\(?([^)>]*)\)?=>/)
    }
    assert(match != null)
    if (match[1].trim() == '') {
        return []
    } else {
        return match[1].split(',').map(p => p.trim())
    }
}

function set_prop (e, refs, name, value) {
    if (name == 'class') {
        require_type(value, 'Array')
        e.className = value.join(' ')
    } else if (name == 'style') {
        require_type(value, 'HashTable')
        let t = operate(value).map_entry((k,v) => `${k}: ${v}`).collect()
        e.style = t.join('; ')
    } else if (name == 'dataset') {
        require_type(value, 'HashTable')
        for (let k in e.dataset) {
            if (!has_key(value, k)) {
                delete e.dataset[k]
            }
        }
        for (let k of Object.keys(value)) {
            e.dataset[k] = value[k]
        }
    } else if (name == 'on') {
        require_type(value, 'HashTable')
        for (let name of Object.keys(value)) {
            require_type(value[name], 'Function')
            if (name == 'enter') {
                e['onkeyup'] = ev => {
                    if (ev.key == 'Enter' || ev.keyCode==13) {
                        value[name](ev, refs)
                    }
                }
            } else {
                let handler = ev => value[name](ev, refs)
                e[`on${name}`] = handler
            }
        }
    } else if (name == 'show') {
        require_type(value, 'Boolean')
        e.style.display = value? '': 'none'
    } else if (name == 'text') {
        e.textContent = value
    } else {
        e[name] = value
    }
}

function set_children (e, new_children, create_element) {
    require_type(new_children, 'Array')
    new_children = new_children.map(child => {
        if (check_type(child, 'Array')) {
            return create_element(child)
        } else {
            return child
        }
    })
    let old_children = e.children
    let old_length = e.children.length                    
    let new_length = new_children.length
    for (let i = 0; i < old_length; i += 1) {
        if (old_children[i][DataBinding]) {
            operate.unbind(old_children[i])
        }
        if (i < new_length) {
            e.replaceChild(new_children[i], old_children[i])
        } else {
            e.removeChild(old_children[i])
        }
    }
    if (new_length > old_length) {
        for (let i=old_length; i < new_length; i += 1) {
            e.appendChild(new_children[i])
        }
    }
}


function notify_update (object, key) {
    if (!object[Watchers]) { return }
    for (let watcher of object[Watchers]) {
        if (!watcher[key]) { continue }
        for (let do_update of watcher[key]) {
            do_update()
        }
    }
}


function make_reactive (object, key) {
    let d = Object.getOwnPropertyDescriptor(object, key)
    if (d.set) { return }
    if (!object[Storage]) {
        object[Storage] = {}
    }
    object[Storage][key] = object[key]
    Object.defineProperty(object, key, {
        enumerable: true,
        get: function () {
            return object[Storage][key]
        },
        set: function (value) {
            object[Storage][key] = value
            notify_update(object, key)
        }
    })
}


function define_computed (object, key, get) {
    let deps = extract_parameters(get)
    let compute = () => get.apply(null, deps.map(dep => object[dep]))
    let cache = null
    let cache_enabled = false
    let do_update = () => {
        cache = compute()
        cache_enabled = true
        notify_update(object, key)
        cache_enabled = false
        cache = null
    }
    let watcher = {}
    for (let dep of deps) {
        watcher[dep] = [do_update]
    }
    if (!object[Watchers]) { object[Watchers] = [] }
    object[Watchers].push(watcher)
    Object.defineProperty(object, key, {
        enumerable: true,
        get: function () {
            if (cache_enabled) {
                return cache
            } else {
                return compute()
            }
        },
        set: function () {
            throw Error('cannot set value of computed property')
        }
    })
}


function add_watcher (object, callback) {
    let deps = extract_parameters(callback)
    let do_update = () => callback.apply(null, deps.map(dep => object[dep]))
    let watcher = {}
    for (let dep of deps) {
        watcher[dep] = [do_update]
    }
    if (!object[Watchers]) { object[Watchers] = [] }
    object[Watchers].push(watcher)
    return watcher
}


function remove_watcher (object, watcher) {
    if (!object[Watchers]) { return false }
    let i = object[Watchers].indexOf(watcher)
    if (i != -1) {
        object[Watchers].splice(i, 1)
        return true
    } else {
        return false
    }
}


let Types = {
    Boolean: x => typeof x == 'boolean',
    String: x => typeof x == 'string',
    Number: x => typeof x == 'number',
    Symbol: x => typeof x == 'symbol',
    Key: x => typeof x == 'string' || typeof x == 'symbol',
    Object: x => is_real_object(x),
    HashTable: x => is_real_object(x) && is_of_proto(x, Object.prototype),
    Array: x => x instanceof Array,
    Iterable: x => is_real_object(x) && is_iterable(x),
    Function: x => typeof x == 'function',
    Null: x => x === null,
    Empty: x => is_empty(x),
    NotEmpty: x => not_empty(x)
}

function check_type (x, type_name) {
    let checker = Types[type_name]
    assert(not_empty(checker))
    let result = checker(x)
    assert(typeof result == 'boolean')
    return result
}

function require_type (x, type_name) {
    return assert(check_type(x, type_name))
}


function operate (object) {
    return new Handle(object)
}

class Handle {
    constructor (operand) {
        this.operand = operand
    }
    unwrap () {
        return this.operand
    }
    is (type_name) {
        return check_type(this.operand, type_name)
    }
    require (type_name) {
        return require_type(this.operand, type_name)
    }
    has (key) {
        assert(this.is('HashTable'))
        require_type(key, 'Key')
        return has_key(this.operand, key)
    }
    merge (hash) {
        assert(this.is('HashTable'))
        require_type(hash, 'HashTable')
        Object.assign(this.operand, hash)
        return this.operand
    }
    merged (hash) {
        assert(this.is('HashTable'))
        require_type(hash, 'HashTable')
        return Object.assign({}, this.operand, hash)
    }
    entries () {
        assert(this.is('HashTable'))
        let op = this.operand
        return Object.keys(op).map(key => ({ key, value: op[key] }))
    }
    for_each_entry (f) {
        assert(this.is('HashTable'))
        require_type(f, 'Function')
        for (let key of Object.keys(this.operand)) {
            f(key, this.operand[key])
        }
        return null
    }
    map_entry (f) {
        assert(this.is('HashTable'))
        let op = this.operand
        return operate((function* () {
            for (let key of Object.keys(op)) {
                yield f(key, op[key])
            }
        })())
    }
    keys () {
        assert(this.is('HashTable'))
        return Object.keys(this.operand)
    }
    map_key (f) {
        assert(this.is('HashTable'))
        require_type(f, 'Function')
        let result = {}
        for (let key of Object.keys(this.operand)) {
            let value = this.operand[key]
            result[f(key, value)] = value
        }
        return result
    }
    values () {
        assert(this.is('HashTable'))
        return Object.keys(this.operand).map(k => this.operand[k])
    }
    map_value (f) {
        assert(this.is('HashTable'))
        require_type(f, 'Function')
        let result = {}
        for (let key of Object.keys(this.operand)) {
            let value = this.operand[key]
            result[key] = f(value, key)
        }
        return result
    }
    filter_entry (f) {
        assert(this.is('HashTable'))
        require_type(f, 'Function')
        let result = {}
        for (let key of Object.keys(this.operand)) {
            let value = this.operand[key]
            if (f(key, value)) {
                result[key] = value
            }
        }
        return result
    }
    map (f) {
        assert(this.is('Iterable'))
        require_type(f, 'Function')
        let op = this.operand
        return operate((function* () {
            let i = 0
            for (let item of op) {
                yield f(item, i)
                i += 1
            }
        })())
    }
    filter (f) {
        assert(this.is('Iterable'))
        require_type(f, 'Function')
        let op = this.operand
        return operate((function* () {
            let i = 0
            for (let item of op) {
                if (f(item, i)) {
                    yield item
                }
                i += 1
            }
        })())
    }
    every (f) {
        assert(this.is('Iterable'))
        require_type(f, 'Function')
        let i = 0
        for (let item of this.operand) {
            if (!f(item, i)) {
                return false
            }
            i += 1
        }
        return true
    }
    some (f) {
        return !this.every((item, i) => !f(item, i))
    }
    reduce (initial, f) {
        assert(this.is('Iterable'))
        require_type(f, 'Function')
        let value = initial
        let i = 0
        for (let item of this.operand) {
            value = f(item, value, i)
            i += 1
        }
        return value
    }
    find (f) {
        assert(this.is('Iterable'))
        require_type(f, 'Function')
        let i = 0
        for (let item of this.operand) {
            if (f(item, i)) {
                return item
            }
            i += 1
        }
        return null
    }
    for_each_item (f) {
        assert(this.is('Iterable'))
        require_type(f, 'Function')
        let i = 0
        for (let item of this.operand) {
            f(item, i)
            i += 1
        }
        return null
    }
    collect () {
        assert(this.is('Iterable'))
        return Array.from(this.operand)
    }
    join (separator) {
        assert(this.is('Iterable'))
        require_type(separator, 'String')
        let first = true
        let result = ''
        for (let item of this.operand) {
            if (!first) {
                result += separator                    
            } else {
                first = false
            }
            result += item
        }
        return result
    }
    reversed () {
        assert(this.is('Array'))
        let op = this.operand
        return operate((function* () {
            for (let i = op.length-1; i >= 0; i -= 1) {
                yield op[i]
            }
        })())
    }
    copy () {
        assert(this.is('Array') || this.is('HashTable'))
        if (this.is('Array')) {
            return this.operand.map(item => item)
        } else {
            return this.map_value(value => value)
        }
    }
    appended (element) {
        assert(this.is('Array'))
        let copy = this.copy()
        copy.push(element)
        return copy
    }
    prepended (element) {
        assert(this.is('Array'))
        let copy = this.copy()
        copy.unshift(element)
        return copy
    }
    removed (index) {
        assert(this.is('Array'))
        assert(Number.isInteger(index))
        assert(0 <= index && index < this.operand.length)
        let copy = this.copy()
        copy.splice(index, 1)
        return copy
    }
    equals (another) {
        assert(this.is('Array') || this.is('HashTable'))
        if (this.is('Array')) {
            require_type(another, 'Array')
            return this.every((value, index) => another[index] === value)
        } else {
            require_type(another, 'HashTable')
            let hash = this.operand
            let keys = Object.keys(hash)
            let keys_another = Object.keys(another)
            if (keys.length != keys_another.length) {
                return false
            }
            if (!keys.every(key => has_key(another, key))) {
                return false
            }
            if (!keys_another.every(key => has_key(hash, key))) {
                return false
            }
            return keys.every(key => hash[key] === another[key])
        }
    }
    $ (selector) {
        let element = this.operand
        assert(element instanceof HTMLElement)
        return element.querySelector(selector)            
    }
    $$ (selector) {
        let element = this.operand
        assert(element instanceof HTMLElement)
        return Array.from(element.querySelectorAll(selector))
    }
    track (key) {
        assert(this.is('Object'))
        require_type(key, 'String')
        assert(this.has(key))
        make_reactive(this.operand, key)
    }
    define (key, get) {
        assert(this.is('Object'))
        require_type(key, 'String')
        require_type(get, 'Function')
        define_computed(this.operand, key, get)
    }
    watch (callback) {
        assert(this.is('Object'))
        require_type(callback, 'Function')
        return add_watcher(this.operand, callback)
    }
    unwatch (watcher) {
        assert(this.is('Object'))
        require_type(watcher, 'Object')
        return remove_watcher(this.operand, watcher)
    }
}


let static_tools = {
    assert (value) {
        return assert(value)
    },
    concat (...args) {
        args.forEach(arg => require_type(arg, 'Iterable'))
        let iterators = args.map(arg => arg[Symbol.iterator]())
        return operate((function* () {
            for (let iterator of iterators) {
                for (let item of iterator) {
                    yield item
                }
            }
        })())
    },
    zip (...args) {
        args.forEach(arg => require_type(arg, 'Iterable'))
        let iterators = args.map(arg => arg[Symbol.iterator]())
        return operate((function* () {
            let next = true
            while (next) {
                let item = []
                for (let iterator of iterators) {
                    let t = iterator.next()
                    if (t.done) {
                        next = false
                        break
                    } else {
                        item.push(t.value)
                    }
                }
                yield item
            }
        })())
    },
    range (start, end) {
        require_type(start, 'Number')
        require_type(end, 'Number')
        assert(start <= end)
        return operate((function* () {
            for (let i = start; i < end; i += 1) {
                yield i
            }
        })())
    },
    $ (selector) {
        return document.querySelector(selector)
    },
    $$ (selector) {
        return Array.from(document.querySelectorAll(selector))
    },
    bind (data, parameters) {
        require_type(data, 'Object')
        let update = {}
        let refs = {}
        function create_element (parameters) {
            require_type(parameters, 'Array')
            let [tag, props, children] = parameters
            require_type(tag, 'String')
            require_type(props, 'HashTable')
            children = children || []
            let is_arr = check_type(children, 'Array')
            let is_fun = check_type(children, 'Function')
            assert(is_arr || is_fun)
            let e = document.createElement(tag)
            for (let name of Object.keys(props)) {
                let value = props[name]
                if (name == 'ref') {
                    require_type(value, 'String')
                    refs[value] = e
                    continue
                }
                if (typeof value == 'function') {
                    let deps = extract_parameters(value)
                    let do_update = () => {
                        let args = deps.map(d => data[d])
                        set_prop(e, refs, name, value.apply(null, args))
                    }
                    for (let dep of deps) {
                        assert(has_key(data, dep))
                        if (!update[dep]) { update[dep] = [] }
                        update[dep].push(do_update)
                    }
                    do_update()
                } else {
                    set_prop(e, refs, name, value)
                }
            }
            if (typeof children == 'function') {
                let deps = extract_parameters(children)
                let do_update = () => {
                    let args = deps.map(d => data[d])
                    let computed = children.apply(null, args)
                    set_children(e, computed, create_element)
                }
                for (let dep of deps) {
                    assert(has_key(data, dep))
                    if (!update[dep]) { update[dep] = [] }
                    update[dep].push(do_update)
                }
                do_update()
            } else {
                set_children(e, children, create_element)
            }
            return e
        }
        let element = create_element(parameters)
        for (let key of Object.keys(update)) {
            if (update[key]) {
                make_reactive(data, key)
            }
        }
        if (!data[Watchers]) { data[Watchers] = [] }
        if (data[Watchers].indexOf(update) == -1) {
            data[Watchers].push(update)
        }
        Object.freeze(refs)
        element[DataBinding] = { data, watcher: update }            
        return element
    },
    unbind (element) {
        assert(element instanceof HTMLElement)
        require_type(element[DataBinding], 'HashTable')
        let { data, watcher } = element[DataBinding]
        let i = data[Watchers].indexOf(watcher)
        assert(i != -1)
        data[Watchers].splice(i, 1)
    }
}

Object.assign(operate, static_tools)


export default operate

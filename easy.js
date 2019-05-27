'use strict';


(function () {
    
    const ExportName = '__'
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

    function extract_parameters (arrow_function) {
        let code = arrow_function.toString()
        let match = code.match(/\(?([^)]*)\)?=>/)
        assert(match != null)
        return match[1].split(',').map(p => p.trim())
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
        assert(check_type(x, type_name))
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
            return operate((function* () {
                for (let key of Object.keys(op)) {
                    yield { key: key, value: op[key] }
                }
            })())
        }
        for_each_entry (f) {
            assert(this.is('HashTable'))
            require_type(f, 'Function')
            for (let key of Object.keys(this.operand)) {
                f(key, this.operand[key])
            }
            return null
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
            for (let item of this.operand) {
                if (!f(item)) {
                    return false
                }
            }
            return true
        }
        some (f) {
            return !this.every(item => !f(item))
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
            for (let item of this.operand) {
                f(item)
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
    }

    let static_tools = {
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
        bind (data, parameters) {
            require_type(data, 'HashTable')
            let update = operate(data).map_value(_ => [])
            function create_element (parameters) {
                require_type(parameters, 'Array')
                let [tag, props, children] = parameters
                require_type(tag, 'String')
                require_type(props, 'HashTable')
                children = children || []
                require_type(children, 'Array')
                let e = document.createElement(tag)
                function set_prop (name, value) {
                    if (name == 'class') {
                        require_type(value, 'Array')
                        e.className = value.join(' ')
                    } else if (name == 'style') {
                        require_type(value, 'HashTable')
                        let t = operate(value).map_entry((k,v) => `${k}: ${v}`)
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
                            let handler = value[name]
                            require_type(handler, 'Function')
                            e[`on${name}`] = handler
                        }
                    } else if (name == 'text') {
                        e.textContent = value
                    } else {
                        e[name] = value
                    }
                }
                function set_children (new_children) {
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
                            static_tools.unbind(old_children[i])
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
                for (let name of Object.keys(props)) {
                    let value = props[name]
                    if (typeof value == 'function') {
                        let deps = extract_parameters(value)
                        for (let dep of deps) {
                            assert(has_key(data, dep))
                            let do_update = () => {
                                let args = deps.map(d => data[d])
                                set_prop(name, value.apply(null, args))
                            }
                            update[dep].push(do_update)
                            do_update()
                        }
                    } else {
                        set_prop(name, value)
                    }
                }
                if (typeof children == 'function') {
                    let deps = extract_parameters(children)
                    for (let dep of deps) {
                        assert(has_key(data, dep))
                        let do_update = () => {
                            let args = deps.map(d => data[d])
                            set_children(children.apply(null, args))
                        }
                        update[dep].push(do_update)
                        do_update()
                    }
                } else {
                    set_children(children)
                }
                return e
            }
            let element = create_element(parameters)
            function set_reactive (data, key) {
                if (!data[Storage]) {
                    data[Storage] = {}
                }
                data[Storage][key] = data[key]
                Object.defineProperty(data, key, {
                    get: function () {
                        return data[Storage][key]
                    },
                    set: function (value) {
                        data[Storage][key] = value
                        for (let update of data[Watchers]) {
                            if (!update[key]) { continue }
                            for (let do_update of update[key]) {
                                do_update()
                            }
                        }
                    }
                })
            }
            for (let key of Object.keys(update)) {
                if (update[key].length > 0) {
                    let d = Object.getOwnPropertyDescriptor(data, key)
                    if (!d.set) {
                        set_reactive(data, key)
                    }
                }
            }
            if (!data[Watchers]) {
                data[Watchers] = []
            }
            data[Watchers].push(update)
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

    if (typeof window != 'undefined') {
        window[ExportName] = operate
    } else {
        module.exports = operate
    }
    
})()

'use strict';


let data = {
    list: [
        { content: 'Learn React', editing: false },
        { content: 'Learn Vue', editing: false },
        { content: 'Know about ES Next', editing: false },
        { content: 'Study V8 source code', editing: false }
    ],
    input: '',
    add_input () {
        if (this.input) {
            this.list = __(this.list).appended({
                content: this.input,
                editing: false
            })
            this.input = ''
        }
    },
    remove (index) {
        this.list = __(this.list).removed(index)
    }
}


let List = ['div', { class: ['list-wrapper'] }, [
    ['ul', { class: ['list', 'list-group'] },
     list => list.map((item, i) => __.bind(item, [
         'li', { class: ['item', 'list-group-item'] }, [
             ['div', { class: ['item-content'] }, [
                 ['div', {
                     show: editing => !editing,                
                     text: content => content
                 }],
                 ['input', {
                     ref: 'item_input',
                     show: editing => editing,
                     type: 'text',                
                     value: content => content,
                     spellcheck: false,
                     on: {
                         input: event => { item.content = event.target.value },
                         enter: event => { item.editing = false }
                     }
                 }]
             ]],
             ['div', { class: ['item-ops', 'd-flex'] }, [
                 ['button', {
                     class: editing => [
                         'btn', 'mr-4', 'edit-button',
                         editing? 'btn-success': 'btn-primary'
                     ],
                     text: editing => editing? 'Save': 'Edit',
                     on: { click: (event, refs) => {
                         item.editing = !item.editing
                         if (item.editing) { refs.item_input.focus() }
                     }}
                 }],
                 ['button', {
                     class: ['btn', 'btn-danger'],
                     text: 'Remove',
                     on: { click: event => { data.remove(i) } }
                 }]
             ]]
         ]
     ]))]
]]


let Panel = ['div', { class: ['panel', 'form-inline my-3'] }, [
    ['div', { class: ['form-group'] }, [
        ['input', {
            class: ['form-control', 'todo-input'],
            type: 'text',
            placeholder: 'What do you plan to do?',
            value: input => input,
            spellcheck: false,
            on: {
                input: event => { data.input = event.target.value },
                enter: event => { data.add_input() }
            }
        }],
        ['button', {
            class: ['ml-3', 'btn', 'btn-primary'],
            text: 'Add',
            disabled: input => input == '',
            on: {
                click: ev => { data.add_input() }
            }
        }]
    ]]
]]
    

function SetupUI () {    
    let UI = __.bind(data, [
        'div', { class: ['ui'] }, [
            ['nav', { class: ['navbar', 'navbar-dark', 'bg-primary'] }, [
                ['h1', {
                    class: ['navbar-brand'],
                    text: 'Sample Todo List App'
                }]
            ]],
            ['div', { class: ['content', 'container'] }, [
                ['h1', { text: 'Todo List', class: ['mt-3'] }],
                Panel, List
            ]]
        ]
    ])
    document.querySelector('#root').appendChild(UI)    
}


window.addEventListener('DOMContentLoaded', ev => SetupUI())

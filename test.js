'use strict';


const BTN_HREF = 'javascript:void(0)'


let data = {
    list: [],
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
    ['ul', { class: ['list'] }, list => list.map((item, i) => __.bind(item, [
        'li', { class: ['item'] }, [
            ['span', {
                class: ['item-content'],
                show: editing => !editing,                
                text: content => content
            }],
            ['input', {
                class: ['item-content', 'item-input'],
                show: editing => editing,
                type: 'text',
                value: content => content,
                on: {
                    input: event => { item.content = event.target.value },
                    enter: event => { item.editing = false }
                }
            }],
            ['a', {
                href: BTN_HREF,
                text: editing => editing? 'Save': 'Edit',
                on: { click: event => {
                    item.editing = !item.editing
                    if (item.editing) { __(item).$('.item-input').focus() }
                }}
            }],
            ['a', {
                href: BTN_HREF,
                text: 'Remove',
                on: { click: event => { data.remove(i) } }
            }]
        ]
    ]))]
]]


let Panel = ['div', { class: ['panel'] }, [
    ['input', {
        type: 'text',
        placeholder: 'What do you plan to do?',
        value: input => input,
        on: {
            input: event => { data.input = event.target.value },
            enter: event => { data.add_input() }
        }
    }],
    ['button', {
        text: 'Add',
        disabled: input => input == '',
        on: {
            click: ev => { data.add_input() }
        }
    }]
]]
    

function SetupUI () {    
    let UI = __.bind(data, [
        'div', { class: ['ui'] }, [
            ['header', {}, [
                ['h1', { text: 'Sample Todo List App' }]
            ]],
            ['div', { class: ['content'] }, [
                List, Panel
            ]]
        ]
    ])
    document.querySelector('#root').appendChild(UI)    
}


window.addEventListener('DOMContentLoaded', ev => SetupUI())

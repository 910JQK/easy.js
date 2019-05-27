'use strict';


const BTN_HREF = 'javascript:void(0)'


let data = {
    list: [],
    input: '',
    add_input () {
        if (this.input) {
            this.list = __(this.list).appended(this.input)
            this.input = ''
        }
    },
    remove (index) {
        this.list = __(this.list).removed(index)
    }
}


let List = ['div', { class: ['list-wrapper'] }, [
    ['ul', { class: ['list'] }, list => list.map((item, index) => [
        'li', { class: ['item'] }, [
            ['span', { text: item }],
            ['a', { href: BTN_HREF, text: 'Remove', on: {
                click: (ev, data) => { data.remove(index) }
            }}]
        ]
    ])]
]]


let Panel = ['div', { class: ['panel'] }, [
    ['input', {
        placeholder: 'What do you plan to do?',
        value: input => input,
        on: {
            input: (ev, data) => {
                data.input = ev.target.value
            },
            keyup: (ev, data) => {
                if (ev.key == 'Enter') {
                    data.add_input()
                }
            }
        }
    }],
    ['button', {
        text: 'Add',
        disabled: input => input == '',
        on: {
            click: (ev, data) => {
                data.add_input()
            }
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

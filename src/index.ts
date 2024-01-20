import { state } from './state'
// import { get, set } from './state/utils'

let data = state(undefined);

let events = [
    'beforeCreate',
    'created',
    'beforeRead',
    'read',
    'beforeUpdate',
    'updated',
    'beforeDelete',
    'deleted',
]

let paths = [
    '',
    'a',
    'a.b',
    'a.b.c',
    'a.b.c.d',
    'a.b.c.d.e',
]

events.forEach(event => {
    paths.forEach(path => {
        data.on(event, path, async (newData, oldData) => {
            console.log(`event: ${event}  \npath: ${path}  \noldData: ${JSON.stringify(oldData)}  \nnewData: ${JSON.stringify(newData)}`)
        })
    })
});

(async () => {
    await data.set('a', 1)
    console.log(await data.get())
})()
import { memo, useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { buildData } from '../apps/shared.js';

const reducer = (state, action) => {
    switch (action.type) {
        case 'run': return { rows: buildData(action.count), selected: 0 };
        case 'add': return { ...state, rows: [...state.rows, ...buildData(action.count)] };
        case 'update': return {
            ...state,
            rows: state.rows.map((row, index) => index % 10 === 0 ? { ...row, label: row.label + ' !!!' } : row),
        };
        case 'select': return { ...state, selected: action.id };
        case 'swap': {
            if (state.rows.length < 999) return state;
            const rows = state.rows.slice();
            const row = rows[1];
            rows[1] = rows[998];
            rows[998] = row;
            return { ...state, rows };
        }
        case 'remove': return { ...state, rows: state.rows.filter(row => row.id !== action.id) };
        case 'clear': return { rows: [], selected: 0 };
        default: return state;
    }
};

const Row = memo(({ row, selected, dispatch }) => (
    <tr className={selected ? 'danger' : ''}>
        <td>{row.id}</td>
        <td><a onClick={() => dispatch({ type: 'select', id: row.id })}>{row.label}</a></td>
        <td><a onClick={() => dispatch({ type: 'remove', id: row.id })}>x</a></td>
    </tr>
));

let state;
let dispatch;
const App = () => {
    [state, dispatch] = useReducer(reducer, { rows: [], selected: 0 });
    return (
        <table><tbody id="tbody">
            {state.rows.map(row => <Row key={row.id} row={row} selected={state.selected === row.id} dispatch={dispatch} />)}
        </tbody></table>
    );
};

const root = createRoot(document.getElementById('app'));
flushSync(() => root.render(<App />));
// flushSync commits each action before returning, the same synchronous contract the other pages use.
const send = action => flushSync(() => dispatch(action));

window.bench = {
    name: 'react',
    run: count => send({ type: 'run', count }),
    add: count => send({ type: 'add', count }),
    update: () => send({ type: 'update' }),
    select: index => send({ type: 'select', id: state.rows[index].id }),
    swap: () => send({ type: 'swap' }),
    remove: index => send({ type: 'remove', id: state.rows[index].id }),
    clear: () => send({ type: 'clear' }),
    settle: () => Promise.resolve(),
};
window.benchReady = true;

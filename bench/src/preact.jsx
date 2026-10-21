import { render } from 'preact';
import { memo } from 'preact/compat';
import { useReducer } from 'preact/hooks';
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
    <tr class={selected ? 'danger' : ''}>
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

render(<App />, document.getElementById('app'));

window.bench = {
    name: 'preact',
    run: count => dispatch({ type: 'run', count }),
    add: count => dispatch({ type: 'add', count }),
    update: () => dispatch({ type: 'update' }),
    select: index => dispatch({ type: 'select', id: state.rows[index].id }),
    swap: () => dispatch({ type: 'swap' }),
    remove: index => dispatch({ type: 'remove', id: state.rows[index].id }),
    clear: () => dispatch({ type: 'clear' }),
    // Preact renders in a microtask queued by the dispatch, which runs before this one resolves.
    settle: () => Promise.resolve(),
};
window.benchReady = true;

<script>
    import { store } from './svelte-store.svelte.js';
</script>

<table><tbody id="tbody">
    {#each store.rows as row (row.id)}
        <tr class={store.selected === row.id ? 'danger' : ''}>
            <td>{row.id}</td>
            <td><a onclick={() => (store.selected = row.id)}>{row.label}</a></td>
            <td><a onclick={() => store.rows.splice(store.rows.findIndex(item => item.id === row.id), 1)}>x</a></td>
        </tr>
    {/each}
</tbody></table>

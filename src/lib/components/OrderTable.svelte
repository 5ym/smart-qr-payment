<script lang="ts">
import type { OrderLine } from '$lib/server/orders';

let { lines, total }: { lines: OrderLine[]; total: number } = $props();
</script>

<div class="scroll-x">
	<table>
		<thead>
			<tr>
				<th>商品ID</th>
				<th>商品名</th>
				<th class="num">価格</th>
				<th class="num">購入数</th>
				<th class="num">小計</th>
			</tr>
		</thead>
		<tbody>
			{#each lines as line (line.id)}
				<tr>
					<td>{line.id}</td>
					<td>{line.title}</td>
					<td class="num">{line.price.toLocaleString()}円</td>
					<td class="num">{line.count}</td>
					<td class="num">{line.subtotal.toLocaleString()}円</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr class="total">
				<td colspan="4" class="num">合計</td>
				<td class="num">{total.toLocaleString()}円</td>
			</tr>
		</tfoot>
	</table>
</div>

<style>
/* 行を一つおきに塗る(元の table-zebra) */
tbody tr:nth-child(even) {
	background: var(--ui-base-200);
}
.total {
	font-size: 1rem;
	font-weight: 700;
}
</style>

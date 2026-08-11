<script lang="ts">
import type { OrderLine } from '$lib/server/orders';

let { lines, total }: { lines: OrderLine[]; total: number } = $props();
</script>

<div class="overflow-x-auto">
	<table class="table-zebra table">
		<thead>
			<tr>
				<th>商品ID</th>
				<th>商品名</th>
				<th class="text-right">価格</th>
				<th class="text-right">購入数</th>
				<th class="text-right">小計</th>
			</tr>
		</thead>
		<tbody>
			{#each lines as line (line.id)}
				<tr>
					<td>{line.id}</td>
					<td>{line.title}</td>
					<td class="text-right">{line.price.toLocaleString()}円</td>
					<td class="text-right">{line.count}</td>
					<td class="text-right">{line.subtotal.toLocaleString()}円</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr class="text-base font-bold">
				<td colspan="4" class="text-right">合計</td>
				<td class="text-right">{total.toLocaleString()}円</td>
			</tr>
		</tfoot>
	</table>
</div>

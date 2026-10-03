<script lang="ts">
import type { OrderLine } from '#lib/server/orders.js';

let { lines, total }: { lines: OrderLine[]; total: number } = $props();
</script>

<div class="overflow-auto">
	<table class="striped">
		<thead>
			<tr>
				<th>商品ID</th>
				<th>商品名</th>
				<th>価格</th>
				<th>購入数</th>
				<th>小計</th>
			</tr>
		</thead>
		<tbody>
			{#each lines as line (line.id)}
				<tr>
					<td>{line.id}</td>
					<td>{line.title}</td>
					<td>{line.price.toLocaleString()}円</td>
					<td>{line.count}</td>
					<td>{line.subtotal.toLocaleString()}円</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<th colspan="4">合計</th>
				<th>{total.toLocaleString()}円</th>
			</tr>
		</tfoot>
	</table>
</div>

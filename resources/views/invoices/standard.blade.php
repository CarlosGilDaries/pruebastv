<!DOCTYPE html>
<html lang="es">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title>Factura #{{ $invoice['number'] }}</title>
		<style>
			.main-content {
				padding-left: 40px; /* Espacio entre el texto vertical y el contenido */
			}
			/* Reset y estilos base */
			body {
				font-family: 'Helvetica Neue', Arial, sans-serif;
				font-size: 14px;
				line-height: 1.6;
				color: #333;
				margin: 0;
				padding: 40px 40px 40px 10px; /* top right bottom left */
				position: relative;
				max-width: 800px;
				margin: 0 auto;
				border: 1px solid #e0e0e0;
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
				padding: 40px;
			}

			/* Estilo para el encabezado */
			.header {
				width: 100%;
				margin-bottom: 30px;
				padding-bottom: 15px;
				border-bottom: 2px solid #2c3e50;
			}

			.header h1 {
				color: #2c3e50;
				font-size: 24px;
			}

			.header p {
				color: #7f8c8d;
			}

			/* Texto vertical del registro comercial */
			.vertical-text {
				position: absolute;
				left: 2px;
				top: 80%;
				transform: translateY(-50%) rotate(-90deg);
				transform-origin: left top;
				color: #7f8c8d;
				font-size: 12px;
				padding: 10px;
				white-space: nowrap;
				height: 200px;
				display: flex;
				align-items: center;
			}

			.vertical-text p {
				margin: 0;
				display: inline-block;
			}

			/* Bloques de información */
			.info-block {
				margin-bottom: 30px;
				padding: 15px;
				background-color: #f9f9f9;
				border-radius: 4px;
			}

			/*.company-info {
				border-left: 4px solid #3498db;
			}*/

			.client-info {
				border-left: 4px solid #e74c3c;
				margin-top: 40px;
			}

			.info-block .title {
				margin-top: 0;
				margin-bottom: 10px;
				font-size: 18px;
				color: #2c3e50;
			}

			/* Tablas */
			table {
				width: 100%;
				border-collapse: collapse;
				margin: 20px 0;
			}

			table thead th {
				background-color: #2c3e50;
				color: white;
				padding: 10px;
				text-align: left;
			}

			table tbody td {
				padding: 10px;
			}

			table.totals {
				width: 50%;
				margin-left: auto;
				margin-top: 30px;
				margin-bottom: 30px;
			}

			table.totals td {
				padding: 8px;
				border-bottom: 1px solid #e0e0e0;
			}

			table.totals tr:last-child td {
				font-weight: bold;
				border-bottom: 2px solid #2c3e50;
			}

			/* Footer */
			.footer-spacer {
				height: 1px;
				background-color: #e0e0e0;
				margin: 30px 0 15px;
			}

			.footer {
				font-size: 12px;
				color: #95a5a6;
				padding-top: 10px;
			}

			/* Cantidades monetarias */
			td:last-child {
				text-align: right;
			}

			/* Responsive */
			@media print {
				body {
					border: none;
					box-shadow: none;
					padding: 0;
				}

				.vertical-text {
					left: 5px;
				}
			}
		</style>
	</head>
	<body>
		<div class="vertical-text">
			@php
			// Eliminar solo los párrafos pero mantener otros formatos
			$text = str_replace(['<p>', '</p>'], '', $company['commercial_registry_text']);
			@endphp
			{!! $text !!}
		</div>

		<div class="main-content">
			<div class="header">
				<table style="width:100%; border-collapse: collapse;">
					<tr>
						<td style="width:50%; vertical-align: middle;">
							<img src={{ $company['logo'] }} style="width:200px; height:90px; object-fit: contain;">
						</td>
						<td style="width:50%; text-align:right; vertical-align: middle;">
							<h1>Factura Nº {{ $invoice['number'] }}</h1>
							<p>Fecha: {{ $invoice['date'] }}</p>
						</td>
					</tr>
				</table>
			</div>
			
			{{--<div class="info-block company-info">
				<p class="title"><strong>{{ $company['name'] }}</strong></p>
				Dirección: {{ $company['address'] }}<br>
				CIF: {{ $company['cif'] }}
			</div>--}}

			<div class="info-block client-info">
				<p class="title"><strong>Cliente</strong></p>
				Nombre: {{ $client['name'] }}<br>
				Dirección: {{ $client['address'] }}<br>
				DNI: {{ $client['dni'] }}<br>
			</div>

			<table>
				<thead>
					<tr>
						<th>Descripción</th>
						<th>Fecha Fin</th>
						<th>Forma de pago</th>
						<th>Importe</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>{{ $invoice['description'] }}</td>
						@if ($client['expires_at'] != null)
							<td>{{ \Carbon\Carbon::parse($client['expires_at'])->format('d/m/Y') }}</td>
						@else
							<td>N/A</td>
						@endif
						<td>{{ $invoice['payment_method'] }}</td>
						<td>{{ $invoice['amount'] }}</td>
					</tr>
				</tbody>
			</table>

			<table class="totals">
				<tr>
					<td><strong>Tipo de IVA:</strong></td>
					<td>{{ $invoice['iva_percentage'] }}</td>
				</tr>
				<tr>
					<td><strong>IVA:</strong></td>
					<td>{{ $invoice['iva'] }}</td>
				</tr>
				<tr>
					<td><strong>Total:</strong></td>
					<td>{{ $invoice['amount'] }}</td>
				</tr>
			</table>

			<div class="footer-spacer"></div>
			<div class="footer">
				{!! $company['lopd'] !!}
			</div>
		</div>
	</body>
</html>
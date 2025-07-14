<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="{{ asset('css/invoice.css') }}">
    <title>Factura #{{ $invoice['number'] }}</title>
</head>
<body>
    <div class="header">
        <div>
            <h1>Factura Nº {{ $invoice['number'] }}</h1>
            <p>Fecha: {{ $invoice['date'] }}</p>
        </div>
    </div>

    <div class="vertical-text">
        {{ $company['commercial_registry_text'] }}
    </div>

    <div class="info-block company-info">
        <p class="title"><strong>{{ $company['name'] }}</strong></p>
        Dirección: {{ $company['address'] }}<br>
        CIF: {{ $company['cif'] }}
    </div>

    <div class="info-block client-info">
        <p class="title"><strong>Cliente</strong></p>
        Nombre: {{ $client['name'] }}<br>
        Dirección: {{ $client['address'] }}<br>
		DNI: {{ $client['dni'] }}
    </div>

    <table>
        <thead>
            <tr>
                <th>Descripción</th>
                <th>Forma de pago</th>
                <th>Importe</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $invoice['description'] }}</td>
                <td>{{ $invoice['payment_method'] }}</td>
                <td>{{ $invoice['amount'] }}</td>
            </tr>
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td><strong>Tipo de IVA:</strong></td>
            <td><strong>{{ $invoice['iva_percentage'] }}:</strong></td>
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
        {{ $company['lopd'] }}
    </div>
</body>
</html>

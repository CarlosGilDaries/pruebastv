<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura #{{ $invoice['number'] }}</title>
    <style>
        /* Reset y estilos base */
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            position: relative;
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e0e0e0;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 40px;
        }

        /* Estilo para el encabezado */
        .header {
            text-align: right;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2c3e50;
        }

        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 24px;
        }

        .header p {
            margin: 5px 0 0;
            color: #7f8c8d;
        }

        /* Texto vertical del registro comercial */
        .vertical-text {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%) rotate(-90deg);
            transform-origin: left top;
            color: #7f8c8d;
            font-size: 12px;
            padding: 10px;
            border-left: 1px solid #e0e0e0;
            max-height: 80%;
            width: 200px;
            overflow: hidden;
        }

        .vertical-text p {
            margin: 0;
            display: inline-block;
            white-space: nowrap;
            transform: rotate(90deg);
            transform-origin: left top;
            position: relative;
            left: 100%;
        }

        /* Bloques de información */
        .info-block {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
        }

        .company-info {
            border-left: 4px solid #3498db;
        }

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
            border-bottom: 1px solid #e0e0e0;
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
            text-align: center;
            padding-top: 10px;
        }

        /* Cantidades monetarias */
        td:last-child {
            text-align: right;
            font-family: 'Courier New', monospace;
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
    <div class="header">
        <div>
            <h1>Factura Nº {{ $invoice['number'] }}</h1>
            <p>Fecha: {{ $invoice['date'] }}</p>
        </div>
    </div>

    <div class="vertical-text">
        {!! $company['commercial_registry_text'] !!}
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
        {!! $company['lopd'] !!}
    </div>
</body>
</html>

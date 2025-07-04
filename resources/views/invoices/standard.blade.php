<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura #{{ $invoice['number'] }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 40px;
        }

        .header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            max-height: 50px;
        }
		
		.title {
			margin-bottom: 5px;
		}

        .company-info, .client-info {
            margin-bottom: 20px;
        }
		
		.company-info {
			padding-right: 5px;
		}

        .info-block {
            width: 48%;
            display: inline-block;
            vertical-align: top;
        }

        h1 {
            font-size: 20px;
            margin: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }

        th, td {
            border: 1px solid #aaa;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f4f4f4;
        }

        .totals {
            margin-top: 20px;
            width: 40%;
            float: right;
        }

        .totals td {
            border: none;
            padding: 5px;
        }
		
		.footer-spacer {
			height: 90px; 
		}

        .footer {
			width: 100%;
            margin-top: 60px;
            font-size: 10px;
            text-align: center;
            color: #999;
		}

		.no-print {
			display: none;
		}

		@media screen {
			.download-button {
				position: fixed;
				bottom: 50px;
				right: 20px;
				background-color: #28a745;
				color: white;
				padding: 10px 20px;
				text-decoration: none;
				border-radius: 5px;
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
                <th>Importe</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $invoice['description'] }}</td>
                <td>{{ $invoice['amount'] }}</td>
            </tr>
        </tbody>
    </table>

    <table class="totals">
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
        Esta factura ha sido generada electrónicamente y no requiere firma.
    </div>

    <div class="download-button no-print">
        <a href="{{ route('bill.download', ['id' => $invoice['id']]) }}">
            Descargar
        </a>
    </div>
</body>
</html>

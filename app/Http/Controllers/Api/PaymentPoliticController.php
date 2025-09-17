<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Language;
use Illuminate\Http\Request;
use App\Models\PaymentPolitic;
use App\Models\Translation;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Facades\DB;

class PaymentPoliticController extends Controller
{
    public function index()
    {
        try {
        $paymentPolitics = paymentPolitic::all();

        return response()->json([
            'success' => true,
            'paymentPolitics' => $paymentPolitics,
            'message' => 'Política de Pago obtenido con éxito.',
        ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function datatable()
    {
        try {
            $paymentPolitics = paymentPolitic::all();

			return DataTables::of($paymentPolitics)
				->addColumn('id', function($paymentPolitic) {
					return $paymentPolitic->id;
				})
				->addColumn('title', function($paymentPolitic) {
					return $paymentPolitic->title;
				})
				->addColumn('actions', function($paymentPolitic) {
					return $this->getActionButtons($paymentPolitic);
				})
				->rawColumns(['actions'])
				->make(true);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $paymentPolitic = new paymentPolitic();
            $title = $request->input('title');
            $text = $request->input('text');

            $paymentPolitic->title = $title;
            $paymentPolitic->text = $text;
            $paymentPolitic->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "payment_politic_" . $paymentPolitic->id . "_title"
                ],
                ['value' => $title]
            );
            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "payment_politic_" . $paymentPolitic->id . "_text"
                ],
                ['value' => $text]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['title', 'text'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "payment_politic_{$paymentPolitic->id}_$field",
                                ],
                                ['value' => $translationData[$field]]
                            );
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'paymentPolitic' => $paymentPolitic,
                'message' => 'Política de Pago creado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $paymentPolitic = paymentPolitic::where('id', $id)->first();

            return response()->json([
                'success' => true,
                'paymentPolitic' => $paymentPolitic,
                'message' => 'Política de Pago obtenido con éxito.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        DB::beginTransaction();

        try {
            $paymentPolitic = paymentPolitic::where('id', $id)->first();
            $title = $request->input('title');
            $text = $request->input('text');

            $paymentPolitic->title = $title;
            $paymentPolitic->text = $text;
            $paymentPolitic->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "payment_politic_" . $paymentPolitic->id . "_title"
                ],
                ['value' => $title]
            );
            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "payment_politic_" . $paymentPolitic->id . "_text"
                ],
                ['value' => $text]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['title', 'text'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "payment_politic_{$paymentPolitic->id}_$field",
                                ],
                                ['value' => $translationData[$field]]
                            );
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'paymentPolitic' => $paymentPolitic,
                'message' => 'Política de Pago editado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            $id = $request->input('content_id');
            $paymentPolitic = paymentPolitic::where('id', $id)->first();
            $paymentPolitic->delete();

            return response()->json([
                'success' => true,
                'message' => 'Política de Pago eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el Política de Pago: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($paymentPolitic)
	{
		$id = $paymentPolitic->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-payment-policy.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="payment-policy-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}

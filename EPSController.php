<?php

namespace App\Http\Controllers\EPS;

use App\Models\Merchant;
use App\Traits\ApiResponser;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Payment\PaymentProcessRequest;

class EPSController extends Controller {
    use ApiResponser;

    public function processPayment( PaymentProcessRequest $request ) {
        $merchantTransactionId = 'MTID' . time() . rand(1000, 9999);
        $xHashForGetToken = $request->token;
        $xHashForInitialize = processXHash(env('EPS_HASH_KEY'), $merchantTransactionId); // key, merchantTransactionId
        $merchant = Merchant::where( 'token', $request->merchant_token )->first();


        $processedEPSGetTokenData = $this->processEPSGetToken( $request );
        $bearerToken = $processedEPSGetTokenData['token'] ?? null;
        $processedEPSInitializeData = $this->processEPSInitialize( $request, $bearerToken, $merchantTransactionId, $xHashForInitialize );

        $validatedData = $request->validated();

        return $this->set_response(
            [
                'validatedData' => $validatedData,
                'GetTokenResponse' => $processedEPSGetTokenData,
                'InitializeResponse' => $processedEPSInitializeData,
                'xHashForGetToken' => $xHashForGetToken,
                'xHashForInitialize' => $xHashForInitialize,
            ],
            200,
            'success',
            [ 'Payment processed successfully' ]
        );
    }


    public function generateHmacHash( Request $request ) {
        // Validate required fields ( optional but safer )
        $request->validate( [
            'key' => 'required|string',
            'userID' => 'required|string',
        ] );

        // Step 1: Encode key as UTF-8
        $utf8Key = mb_convert_encoding( $request->key, 'UTF-8' );

        // Step 2 & 3: Generate HMAC-SHA512 hash
        $hash = hash_hmac(
            'sha512',
            $request->userID,   // UserID or other userID
            $utf8Key,
            true              // raw binary output
        );

        // Step 4: Return Base64-encoded string
        return $this->set_response(
            base64_encode( $hash ),
            200,
            'success',
            [ 'userID' ]
        );
    }

    private function processEPSGetToken($request){
        return $response = curlPost(
            env('EPS_ENDPOINT').'/Auth/GetToken',
            [
                'userName' => env('EPS_USERNAME'),
                'password' => env('EPS_PASSWORD'),
            ],
            [
                'x-hash' => $request->token,
            ]
        );


    }

    private function processEPSInitialize($request, $bearerToken, $merchantTransactionId, $xHashForInitialize){
        return $response = curlPost(
            env('EPS_ENDPOINT').'/EPSEngine/InitializeEPS',
            [
                'storeId' => env('EPS_STORE_ID'),
                'merchantTransactionId' => $merchantTransactionId,
                'CustomerOrderId'=>  'COID'.time().rand(1000,9999),
                'transactionTypeId' => 1,
                'totalAmount' => $request->total_price,
            ],
            [
                'x-hash' => $xHashForInitialize,
                'Authorization' => 'Bearer ' . $bearerToken,
            ]
        );
    }


    // public function initializeEPS( Request $request ) {
    //     // 1. Required IDs from config/file
    //     $storeId   = env( 'EPS_STORE_ID' );
    //     $secretKey = env( 'EPS_SECRET_KEY' );
    //     $endpoint  = env( 'EPS_ENDPOINT' );
    //     $token     = env( 'EPS_AUTH_TOKEN' );

    //     // 2. Generate unique merchantTransactionId
    //     $merchantTransactionId = ( string ) \Str::uuid();

    //     // 3. Generate x-hash
    //     $utf8Key = mb_convert_encoding( $secretKey, 'UTF-8' );
    //     $rawHash = hash_hmac( 'sha512', $merchantTransactionId, $utf8Key, true );
    //     $xHash   = base64_encode( $rawHash );

    //     // 4. Build body ( you can adjust fields )
    //     $payload = [
    //         'storeId' => $storeId,
    //         'merchantTransactionId' => $merchantTransactionId,
    //         'CustomerOrderId' => $request->CustomerOrderId ?? 'Order' . time(),
    //         'transactionTypeId' => 1,
    //         'financialEntityId' => 0,
    //         'transitionStatusId' => 0,
    //         'totalAmount' => $request->amount,
    //         'ipAddress' => $request->ip(),
    //         'version' => '1',

    //         'successUrl' => $request->successUrl,
    //         'failUrl' => $request->failUrl,
    //         'cancelUrl' => $request->cancelUrl,

    //         'customerName' => $request->customerName,
    //         'customerEmail' => $request->customerEmail,
    //         'customerAddress' => $request->customerAddress,
    //         'customerAddress2' => $request->customerAddress2 ?? '',
    //         'customerCity' => $request->customerCity,
    //         'customerState' => $request->customerState,
    //         'customerPostcode' => $request->customerPostcode,
    //         'customerCountry' => $request->customerCountry,
    //         'customerPhone' => $request->customerPhone,

    //         'shipmentName' => $request->shipmentName ?? '',
    //         'shipmentAddress' => $request->shipmentAddress ?? '',
    //         'shipmentAddress2' => $request->shipmentAddress2 ?? '',
    //         'shipmentCity' => $request->shipmentCity ?? '',
    //         'shipmentState' => $request->shipmentState ?? '',
    //         'shipmentPostcode' => $request->shipmentPostcode ?? '',
    //         'shipmentCountry' => $request->shipmentCountry ?? '',

    //         'valueA' => $request->valueA ?? '',
    //         'valueB' => $request->valueB ?? '',
    //         'valueC' => $request->valueC ?? '',
    //         'valueD' => $request->valueD ?? '',

    //         'shippingMethod' => $request->shippingMethod ?? 'NO',
    //         'noOfItem' => $request->noOfItem ?? '1',
    //         'productName' => $request->productName,
    //         'productProfile' => $request->productProfile ?? 'general',
    //         'productCategory' => $request->productCategory ?? 'demo',

    //         'ProductList' => $request->ProductList ?? [],
    //     ];

    //     // 5. Send API request
    //     $response = Http::withHeaders( [
    //         'x-hash' => $xHash,
    //         'Authorization' => 'Bearer ' . $token,
    //         'Content-Type' => 'application/json',
    //     ] )->post( $endpoint, $payload );

    //     // 6. Return EPS response
    //     return response()->json( [
    //         'merchantTransactionId' => $merchantTransactionId,
    //         'x_hash' => $xHash,
    //         'request' => $payload,
    //         'eps_response' => $response->json(),
    //     ] );
    // }

}

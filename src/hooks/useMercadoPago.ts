import { useMercadopago } from "react-sdk-mercadopago";

type getPaymentMethodsType = {
  paging: {
    total: number;
    limit: number;
    offset: number;
  };
  results: [
    {
      secure_thumbnail: string;
      min_accreditation_days: number;
      max_accreditation_days: number;
      id: string;
      payment_type_id: string;
      accreditation_time: number;
      thumbnail: string;
      marketplace: string;
      deferred_capture: string;
      labels: string[];
      name: string;
      site_id: string;
      processing_mode: string;
      additional_info_needed: string[];
      status: string;
      settings: [
        {
          security_code: {
            mode: string;
            card_location: string;
            length: number;
          };
          card_number: {
            length: number;
            validation: string;
          };
          bin: {
            pattern: string;
            installments_pattern: string;
            exclusion_pattern: string;
          };
        }
      ];
      issuer: {
        default: boolean;
        name: string;
        id: number;
      };
    }
  ];
};

type getInstallmentsType = [
  {
    issuer: {
      id: string;
      name: string;
      secure_thumbnail: string;
      thumbnail: string;
    };
    merchant_account_id?: string;
    payer_costs: [
      {
        installments: number;
        installment_rate: number;
        discount_rate: number;
        reimbursement_rate: number;
        labels: string[];
        installment_rate_collector: string[];
        min_allowed_amount: number;
        max_allowed_amount: number;
        recommended_message: string;
        installment_amount: number;
        total_amount: number;
        payment_method_option_id: string;
      }
    ];
    payment_method_id: string;
    payment_type_id: string;
    processing_mode: string;
  }
];

type createCardTokenType = {
  card_number_length: number;
  cardholder: {
    identification: { number: string; type: string };
  };
  date_created: string;
  date_due: string;
  date_last_updated: string;
  first_six_digits: string;
  id: string;
  last_four_digits: string;
  live_mode: boolean;
  luhn_validation: boolean;
  public_key: string;
  require_esc: false;
  security_code_length: number;
  status: string;
};

type processPaymentType = {
  amount: number;
  description: string;
  cardNumber: string;
  cardExpirationMonth: number;
  cardExpirationYear: number;
  holderName: string;
  email: string;
  securityCode: string;
  issuer: string;
  paymentMethodId: string;
  identificationType: string;
  identificationNumber: string;
  installments: number;
};

export function useMercadoPago() {
  const mercadopago = useMercadopago.v2(
    String(process.env.NEXT_PUBLIC_MERCADO_PAGO_SAMPLE_PUBLIC_KEY),
    {
      locale: "en-US",
    }
  );

  const getPaymentMethods = (bin: string) =>
    mercadopago?.getPaymentMethods({
      bin,
    }) as Promise<getPaymentMethodsType>;

  const getInstallments = (amount: string, bin: string) =>
    mercadopago?.getInstallments({
      amount,
      locale: "en-US",
      bin,
    }) as Promise<getInstallmentsType>;

  const createCardToken = (data: {
    cardNumber: string;
    cardHolderName: string;
    cardHolderEmail: string;
    identificationType: string;
    identificationNumber: string;
    securityCode: string;
    cardExpirationMonth: number;
    cardExpirationYear: number;
  }) => {
    return mercadopago?.createCardToken(
      {
        cardholderName: data.cardHolderName,
        identificationType: data.identificationType,
        identificationNumber: data.identificationNumber,
        cardNumber: data.cardNumber,
        securityCode: data.securityCode,
      },
      {}
    ) as Promise<createCardTokenType>;
  };

  const processPayment = async (data: processPaymentType) => {
    const token = await createCardToken({
      cardNumber: data.cardNumber,
      cardHolderName: data.holderName,
      cardHolderEmail: data.email,
      identificationType: data.identificationType,
      identificationNumber: data.identificationNumber,
      securityCode: data.securityCode,
      cardExpirationMonth: data.cardExpirationMonth,
      cardExpirationYear: data.cardExpirationYear,
    });

    const checkout = await fetch("/api/process_payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        token: token.id,
        issuerId: data.issuer,
        paymentMethodId: data.paymentMethodId,
        transactionAmount: data.amount,
        installments: data.installments,
        description: data.description,
        payer: {
          email: data.email,
          identification: {
            type: data.identificationType,
            number: data.identificationNumber,
          },
        },
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (!result.hasOwnProperty("error_message")) {
          return {
            id: result.id,
            status: result.status,
            detail: result.detail,
          };
        } else {
          console.log(result.error_message);
        }
      })
      .catch((error) => {
        console.error("Unexpected error\n" + JSON.stringify(error));
      });

    return checkout;
  };

  return {
    getPaymentMethods,
    getInstallments,
    createCardToken,
    processPayment,
  };
}

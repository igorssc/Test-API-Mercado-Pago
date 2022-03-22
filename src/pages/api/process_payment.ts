import mercadopago from "mercadopago";
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | { error_message: string }
  | { detail: string; status: number; id: number };

export default function processPayment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { body } = req;
  const { payer } = body;
  const paymentData = {
    transaction_amount: body.transactionAmount,
    token: body.token,
    description: body.description,
    installments: body.installments,
    payment_method_id: body.paymentMethodId,
    issuer_id: body.issuerId,
    payer: {
      email: payer.email,
      identification: {
        type: payer.identification.docType,
        number: payer.identification.docNumber,
      },
    },
  };

  mercadopago.payment
    .save(paymentData)
    .then(function (response) {
      const { response: data } = response;

      res.status(201).json({
        detail: data.status_detail,
        status: data.status,
        id: data.id,
      } as Data);
    })

    .catch(function (error) {
      console.error(error);
      const { errorMessage, errorStatus } = validateError(error);
      res.status(errorStatus).json({ error_message: errorMessage });
    });
}

function validateError(error: { cause: { description: any }[]; status: any }) {
  let errorMessage = "Unknown error cause";
  let errorStatus = 400;

  if (error.cause) {
    const sdkErrorMessage = error.cause[0]?.description;
    errorMessage = sdkErrorMessage || errorMessage;

    const sdkErrorStatus = error.status;
    errorStatus = sdkErrorStatus || errorStatus;
  }

  return { errorMessage, errorStatus };
}

export const config = {
  api: {
    externalResolver: true,
  },
};

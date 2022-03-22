import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useMercadoPago } from "../../hooks/useMercadoPago";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../modal";
import styles from "./styles.module.css";

export const Card = () => {
  const currentYear = new Date().getFullYear();

  const nextYears = Array(11)
    .fill(0)
    .map((_, index) => currentYear + index);

  const [description, setDescription] = useState("Produto X");
  const [amount, setAmount] = useState(1000);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpirationMonth, setCardExpirationMonth] = useState(1);
  const [cardExpirationYear, setCardExpirationYear] = useState(currentYear);
  const [holderName, setHolderName] = useState("");
  const [holderEmail, setHolderEmail] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuerId, setIssuerId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [identificationType, setIdentificationType] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [installments, setInstallments] = useState(1);
  const [installmentsOptions, setInstallmentsOptions] = useState<
    {
      installments: number;
      message: string;
    }[]
  >([]);
  const [disabledButtonSubmit, setDisabledButtonSubmit] = useState(false);

  const {
    setOpen: setOpenModal,
    setTitle: setTitleModal,
    setMessage: setMessageModal,
    setType: setTypeModal,
  } = useModal();

  const { getPaymentMethods, getInstallments, processPayment } =
    useMercadoPago();

  useEffect(() => {
    let currentIssuer: string;

    const updatePaymentData = async () =>
      await getPaymentMethods(cardNumber.substring(0, 6)).then(
        async (response) => {
          currentIssuer = response.results[0]?.name;
          setIssuer(response.results[0]?.name);
          setIssuerId(String(response.results[0]?.issuer.id));

          await getInstallments(
            String(amount),
            cardNumber.substring(0, 6)
          ).then((response) => {
            response.forEach((item) => {
              if (
                item.issuer.name == currentIssuer &&
                item.payment_type_id == "credit_card"
              ) {
                const installmentsFormated = item.payer_costs.map((cost) => {
                  return {
                    installments: cost.installments,
                    message: cost.recommended_message,
                  };
                });

                setInstallmentsOptions(installmentsFormated);
                setPaymentMethodId(item.payment_method_id);
              }
            });
          });
        }
      );

    if (cardNumber.length >= 6) {
      updatePaymentData();
    } else {
      setIssuer("");
      setIssuerId("");
      setPaymentMethodId("");
      setInstallmentsOptions([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, cardNumber]);

  const sendForm = () => {
    processPayment({
      amount,
      description,
      cardNumber,
      cardExpirationMonth,
      cardExpirationYear,
      holderName,
      email: holderEmail,
      securityCode,
      issuer: issuerId,
      paymentMethodId,
      identificationType,
      identificationNumber,
      installments,
    }).then((response) => {
      console.log(response);
      setOpenModal(true);
      if (response) {
        setTitleModal("Success");
        setMessageModal("Success of transaction");
        setTypeModal("success");

        setCardNumber("");
        setCardExpirationMonth(1);
        setCardExpirationYear(currentYear);
        setHolderName("");
        setHolderEmail("");
        setSecurityCode("");
        setIssuer("");
        setIdentificationType("");
        setIdentificationNumber("");
        setInstallments(1);
        setInstallmentsOptions([]);
      } else {
        setTitleModal("Error");
        setMessageModal("Error of transaction");
        setTypeModal("error");
      }
      setDisabledButtonSubmit(false);
    });
  };

  return (
    <>
      <Modal />
      <h2 className={styles.methodPayment}>Credit Card</h2>
      <p className={styles.productDescription}>{description}</p>
      <form
        className={styles.formCheckout}
        onSubmit={(e) => {
          e.preventDefault();
          setDisabledButtonSubmit(true);
          sendForm();
        }}
      >
        <FormControl className={styles.formCheckoutInput}>
          <InputLabel htmlFor="form-checkout__cardNumber">
            Card Number
          </InputLabel>
          <OutlinedInput
            label="card number"
            id="form-checkout__cardNumber"
            type="number"
            value={cardNumber}
            required
            onChange={(e) => {
              setCardNumber(e.target.value);
            }}
          />
        </FormControl>

        <FormControl
          className={`${styles.formCheckoutInput} ${styles.formCheckoutInputExpirationMonth}`}
        >
          <InputLabel id="form-checkout__cardExpirationMonth-label">
            MM
          </InputLabel>
          <Select
            labelId="form-checkout__cardExpirationMonth-label"
            value={cardExpirationMonth}
            onChange={(e) => setCardExpirationMonth(Number(e.target.value))}
            required
          >
            {Array(12)
              .fill(0)
              .map((_, index) => (
                <MenuItem value={String(index + 1)} key={index}>
                  {index + 1}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl
          className={`${styles.formCheckoutInput} ${styles.formCheckoutInputExpirationYear}`}
        >
          <InputLabel id="form-checkout__cardExpirationYear-label">
            YY
          </InputLabel>
          <Select
            labelId="form-checkout__cardExpirationYear-label"
            value={cardExpirationYear}
            onChange={(e) => setCardExpirationYear(Number(e.target.value))}
            required
          >
            {nextYears.map((year) => (
              <MenuItem value={String(year)} key={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className={styles.formCheckoutInput}>
          <InputLabel htmlFor="form-checkout__cardholderName">
            Holder name
          </InputLabel>
          <OutlinedInput
            label="holder name"
            id="form-checkout__cardholderName"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            required
          />
        </FormControl>

        <FormControl className={styles.formCheckoutInput}>
          <InputLabel htmlFor="form-checkout__cardholderEmail">
            E-mail
          </InputLabel>
          <OutlinedInput
            label="holder email"
            id="form-checkout__cardholderEmail"
            value={holderEmail}
            onChange={(e) => setHolderEmail(e.target.value)}
            required
          />
        </FormControl>

        <FormControl
          className={`${styles.formCheckoutInput} ${styles.formCheckoutInputSecurityCode}`}
        >
          <InputLabel htmlFor="form-checkout__securityCode">
            Security code
          </InputLabel>
          <OutlinedInput
            label="security code"
            id="form-checkout__securityCode"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            required
          />
        </FormControl>

        <FormControl
          className={`${styles.formCheckoutInput} ${styles.formCheckoutInputSecurityCode}`}
        >
          <InputLabel htmlFor="form-checkout__issuer">Issuer</InputLabel>
          <OutlinedInput
            disabled
            label="security code"
            id="form-checkout__issuer"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            required
          />
        </FormControl>

        <FormControl className={styles.formCheckoutInput}>
          <InputLabel id="form-checkout__identificationType-label">
            Identification type
          </InputLabel>
          <Select
            labelId="form-checkout__identificationType-label"
            value={identificationType}
            onChange={(e) => setIdentificationType(e.target.value)}
            required
          >
            <MenuItem value="CPF">CPF</MenuItem>
            <MenuItem value="CNPJ">CNPJ</MenuItem>
          </Select>
        </FormControl>

        <FormControl className={styles.formCheckoutInput}>
          <InputLabel htmlFor="form-checkout__identificationNumber">
            Identification number
          </InputLabel>
          <OutlinedInput
            label="identification number"
            id="form-checkout__identificationNumber"
            value={identificationNumber}
            onChange={(e) => setIdentificationNumber(e.target.value)}
            required
          />
        </FormControl>

        <FormControl className={styles.formCheckoutInput}>
          <InputLabel id="form-checkout__installments-label">
            Installments
          </InputLabel>
          <Select
            labelId="form-checkout__installments-label"
            value={installmentsOptions.length > 0 ? installments : ""}
            onChange={(e) => setInstallments(Number(e.target.value))}
            required
          >
            {installmentsOptions.map((installment) => (
              <MenuItem
                value={installment.installments}
                key={installment.installments}
              >
                {installment.message}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <button
          type="submit"
          id="form-checkout__submit"
          className={styles.submit}
          disabled={disabledButtonSubmit}
        >
          Pay
        </button>
        <div id="loading-message"></div>
      </form>
    </>
  );
};

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import ModalComponent from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import errorImage from "../../../public/assets/error.svg";
import successImage from "../../../public/assets/success.svg";
import { useModal } from "../../hooks/useModal";
import styles from "./styles.module.css";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

export const Modal = () => {
  const { open, handleClose, title, message, type } = useModal();

  return (
    <div>
      <ModalComponent
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              {title}
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              <Image
                src={type === "error" ? errorImage : successImage}
                height={100}
                width={100}
                alt="success on transaction"
              />
              <p>{message}</p>
              <button className={styles.button} onClick={handleClose}>
                Back
              </button>
            </Typography>
          </Box>
        </Fade>
      </ModalComponent>
    </div>
  );
};

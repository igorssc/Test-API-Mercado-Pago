import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

type ModalContextType = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  handleOpen: () => void;
  handleClose: () => void;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  type: "success" | "error";
  setType: Dispatch<SetStateAction<"success" | "error">>;
};

type ModalContextProviderProps = {
  children: ReactNode;
};

export const ModalContext = createContext({} as ModalContextType);

export function ModalContextProvider(props: ModalContextProviderProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error">("success");

  return (
    <ModalContext.Provider
      value={{
        open,
        setOpen,
        handleOpen,
        handleClose,
        title,
        setTitle,
        message,
        setMessage,
        type,
        setType,
      }}
    >
      {props.children}
    </ModalContext.Provider>
  );
}

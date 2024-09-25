import { log } from "console";

export type PayOSConfig = {
  RETURN_URL: string;
  ELEMENT_ID: string;
  CHECKOUT_URL: string;
  embedded?: boolean;
  onSuccess?: (data: any) => void;
  onExit?: (data: any) => void;
  onCancel?: (data: any) => void;
};

const PAYOS_CONSTANT = {
  RESPONSE_IFRAME_TYPE: {
    STATUS: "status",
    ERROR: "error",
    PAYMENT_RESPONSE: "payment_response",
  },

  PAYMENT_STATUS: {
    PENDING: "PENDING",
    PAID: "PAID",
    PROCESSING: "PROCESSING",
    CANCELLED: "CANCELLED",
    DELETED: "DELETED",
  },

  ORIGIN: [
    // "https://dev.pay.payos.vn",
    // "https://next.dev.pay.payos.vn",
    // "https://pay.payos.vn",
    "http://localhost:3000",
  ],
};

class PayOSCheckout {
  RETURN_URL: string;
  ELEMENT_ID: string;
  CHECKOUT_URL: string;
  onSuccess: (data: any) => void;
  onExit: (data: any) => void;
  onCancel: (data: any) => void;

  constructor(props: PayOSConfig) {
    this.RETURN_URL = props.RETURN_URL;
    this.ELEMENT_ID = props.ELEMENT_ID;
    this.CHECKOUT_URL = props.CHECKOUT_URL;

    this.onSuccess = props.onSuccess || (() => {});
    this.onExit = props.onExit || (() => {});
    this.onCancel = props.onCancel || (() => {});

    this.receiveMessage = this.receiveMessage.bind(this);
  }

  receiveMessage(event: MessageEvent) {
    console.log("RECEIVE MESSAGE :", event);

    // Check origin
    if (PAYOS_CONSTANT.ORIGIN.includes(event.origin)) {
      try {
        const data = JSON.parse(event.data);

        if (
          [
            PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.STATUS,
            PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.ERROR,
          ].includes(data?.type)
        ) {
          this.closeIframe();
          this.onExit(data.data);
        } else if (
          data?.type === PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.PAYMENT_RESPONSE
        ) {
          if (data.data.status === PAYOS_CONSTANT.PAYMENT_STATUS.CANCELLED) {
            this.closeIframe();
            this.onCancel(data.data);
          } else if (data.data.status === PAYOS_CONSTANT.PAYMENT_STATUS.PAID) {
            this.closeIframe();
            this.onSuccess(data.data);
          }
        }
      } catch (e) {
        console.error("Error parsing message event data", e);
      }
    }
  }

  openIframe(isEmbedded: boolean) {
    window.addEventListener("message", this.receiveMessage, false);
    const divElement = document.getElementById(this.ELEMENT_ID);
    if (!divElement) {
      console.error(`Element ID: ${this.ELEMENT_ID} not exist`);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.allow = "clipboard-write";
    iframe.width = "100%";

    if (isEmbedded) {
      iframe.src = `${this.CHECKOUT_URL}?iframe=true&embedded=true&redirect_uri=${this.RETURN_URL}`;
      iframe.height = "100%";
    } else {
      iframe.src = `${this.CHECKOUT_URL}?iframe=true&redirect_uri=${this.RETURN_URL}`;
      iframe.height = window.innerHeight.toString();
      iframe.allowFullscreen = true;
      iframe.style.zIndex = "1000";
      iframe.style.position = "fixed";
    }

    divElement.appendChild(iframe);
  }

  closeIframe() {
    const divElement = document.getElementById(this.ELEMENT_ID);
    if (!divElement) {
      console.error(`Element ID: ${this.ELEMENT_ID} not exist`);
      return;
    }
    const iframe = divElement.querySelector("iframe");
    if (iframe) {
      divElement.removeChild(iframe);
      window.removeEventListener("message", this.receiveMessage, false);
      return;
    }
    console.error("No iframe to remove");
  }
}

export function usePayOS(config: PayOSConfig) {
  const payOSCheckout = new PayOSCheckout(config);

  return {
    open: () => {
      payOSCheckout.openIframe(config.embedded || false);
    },
    exit: () => payOSCheckout.closeIframe(),
  };
}

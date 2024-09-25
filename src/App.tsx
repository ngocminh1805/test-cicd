import React from "react";
import "./App.css";
// import { PayOSConfig, usePayOS } from "payos-checkout";
import { PayOSConfig, usePayOS } from "./lib";

function App() {
  const payOSConfig: PayOSConfig = {
    RETURN_URL: "http://localhost:3001", // required
    ELEMENT_ID: "payment-frame", // required
    CHECKOUT_URL: "http://localhost:3000", // required
    embedded: true, // Nếu dùng giao diện nhúng
    onSuccess: (event: any) => {
      //TODO: Hành động sau khi người dùng thanh toán đơn hàng thành công
      console.log("onSuccess : ", event);
      
    },
    onCancel: (event: any) => {
      //TODO: Hành động sau khi người dùng Hủy đơn hàng
      console.log("onCancel : ", event);
    },
    onExit: (event: any) => {
      //TODO: Hành động sau khi người dùng tắt Pop up
      console.log("onExit :", event);
    },
  };

  const { open, exit } = usePayOS(payOSConfig);

  return (
    <div
      className="App"
      id="iframe"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={() => {
          open();
        }}
        style={{
          margin: 50
        }}
      >
        {" "}
        TEST{" "}
      </button>

      <div id = 'payment-frame' style={{ height: 500, width: 1000, backgroundColor: "red" }}></div>
    </div>
  );
}

export default App;

// const WEBSOCKET_URL = process.env.WEBSOCKET_URL;

// export const sendTwoFactorTokenSms = async (contact: string, token: string) => {
//   const ws = new WebSocket(WEBSOCKET_URL as string);
//   ws.addEventListener("open", (event) => {
//     const data = {
//       "receiver": contact,
//       "message": `Your 2FA code: ${token}`,
//     }
//     ws.send(JSON.stringify(data))
//   });
// };
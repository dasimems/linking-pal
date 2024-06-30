import { app, env, httpServer } from "./app";

const port = env.PORT || 8000;

httpServer.listen(port, () => {
  console.log(
    `Server started running on https://localhost:${port}`,
    new Date("4-30-2023").getTime()
  );
});
// app.listen(port, () => {
//   console.log(
//     `Server started running on https://localhost:${port}`,
//     new Date("4-30-2023").getTime()
//   );
// });

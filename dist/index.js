"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const port = app_1.env.PORT || 8000;
app_1.app.listen(port, () => {
    console.log(`Server started running on https://localhost:${port}`, new Date("4-30-2023").getTime());
});

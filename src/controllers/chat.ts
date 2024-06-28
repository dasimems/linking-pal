import { internalServerResponse } from "../utils/responses";
import { ControllerType } from "../utils/types";

export const getChannelController: ControllerType = (req, res) => {
  let response = {
    ...internalServerResponse
  };

  res.status(response.status).send(response);
};

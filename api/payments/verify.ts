import { handlePayment } from "../../server/payments/http.js";
export default {
  fetch: (request: Request) => handlePayment(request, "verify"),
};

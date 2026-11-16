// Import Middlewares
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
// Import Routes
import eventRoutes from "./routes/events.routes";
import systemRoutes from "./routes/system.routes";
import webhookRoutes from "./routes/webhook.routes";
// Import Utils
import { createRouter } from "./utils/http";

/* -------------------------------------- App -------------------------------------- */

// Config Hono app
const app = createRouter();

/* -------------------------------------- Routes -------------------------------------- */

app.route("/", systemRoutes);
app.route("/webhook", webhookRoutes);
app.route("/events", eventRoutes);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;

import { registerTelemetry } from "ai";
import { OpenTelemetry } from "@ai-sdk/otel";
import { getTracer, Laminar } from "@lmnr-ai/lmnr";
import React from "react";
import { render } from "ink";
import { App } from "./ui/index.tsx";

Laminar.initialize({
  projectApiKey: process.env.LMNR_PROJECT_API_KEY,
});

registerTelemetry(new OpenTelemetry({ tracer: getTracer() }));

render(React.createElement(App));

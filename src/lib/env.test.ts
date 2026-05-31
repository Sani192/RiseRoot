import { afterEach, describe, expect, it } from "vitest";

import {
  envKeys,
  InvalidProductionEnvError,
  validateProductionStartupEnv,
} from "@/lib/env";

const originalNodeEnv = process.env.NODE_ENV;

function setNodeEnv(value: string) {
  Object.defineProperty(process.env, "NODE_ENV", {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
}

describe("production startup environment validation", () => {
  afterEach(() => {
    setNodeEnv(originalNodeEnv);
    delete process.env[envKeys.localDevUserId];
    delete process.env[envKeys.legacyDevelopmentUserId];
    delete process.env[envKeys.legacyPublicAppUserId];
  });

  it("fails in production when local development identity is configured", () => {
    setNodeEnv("production");
    process.env[envKeys.localDevUserId] = "u1";

    expect(() => validateProductionStartupEnv()).toThrow(
      InvalidProductionEnvError,
    );
  });

  it("allows local development identity outside production", () => {
    setNodeEnv("development");
    process.env[envKeys.localDevUserId] = "u1";

    expect(() => validateProductionStartupEnv()).not.toThrow();
  });
});

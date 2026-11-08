
import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../src/app";
import { redis } from "../src/config/redis";
import { pingDB } from "../src/config/db";

vi.mock("../src/config/redis", () => ({
  redis: {
    ping: vi.fn(),
  },
}));

vi.mock("../src/config/db", () => ({
  pingDB: vi.fn(),
  closeDB: vi.fn(),
}));

vi.mock("../src/routes", () => ({
  default: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("../src/config/swagger", () => ({
  swaggerSpec: {},
}));

describe("SaySo API", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /health", () => {
    it("returns healthy status when API is running", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        status: "ok",
        message: "SaySo API is running",
        services: {
          api: "up",
        },
      });

      expect(response.body.timestamp).toBeDefined();

      // Liveness should not depend on external services.
      expect(redis.ping).not.toHaveBeenCalled();
      expect(pingDB).not.toHaveBeenCalled();
    });
  });

  describe("GET /ready", () => {
    it("returns ready when MySQL and Redis are up", async () => {
      vi.mocked(redis.ping).mockResolvedValue("PONG");
      vi.mocked(pingDB).mockResolvedValue(true);

      const response = await request(app).get("/ready");

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        status: "ok",
        services: {
          api: "up",
          redis: "up",
          mysql: "up",
        },
      });

      expect(response.body.timestamp).toBeDefined();
      expect(redis.ping).toHaveBeenCalledOnce();
      expect(pingDB).toHaveBeenCalledOnce();
    });

    it("returns 503 when Redis is unavailable", async () => {
      vi.mocked(redis.ping).mockRejectedValue(
        new Error("Redis unavailable"),
      );
      vi.mocked(pingDB).mockResolvedValue(true);

      const response = await request(app).get("/ready");

      expect(response.status).toBe(503);
      expect(response.body.status).toBe("degraded");
      expect(response.body.services.redis).toBe("down");
      expect(response.body.services.mysql).toBe("up");
    });

    it("returns 503 when MySQL is unavailable", async () => {
      vi.mocked(redis.ping).mockResolvedValue("PONG");
      vi.mocked(pingDB).mockResolvedValue(false);

      const response = await request(app).get("/ready");

      expect(response.status).toBe(503);
      expect(response.body.status).toBe("degraded");
      expect(response.body.services.redis).toBe("up");
      expect(response.body.services.mysql).toBe("down");
    });

    it("returns 503 when both dependencies are unavailable", async () => {
      vi.mocked(redis.ping).mockRejectedValue(
        new Error("Redis unavailable"),
      );
      vi.mocked(pingDB).mockResolvedValue(false);

      const response = await request(app).get("/ready");

      expect(response.status).toBe(503);

      expect(response.body.services).toEqual({
        api: "up",
        redis: "down",
        mysql: "down",
      });
    });
  });

  describe("Unknown routes", () => {
    it("returns 404 for a nonexistent endpoint", async () => {
      const response = await request(app).get(
        "/route-that-does-not-exist",
      );

      expect(response.status).toBe(404);
    });
  });
});

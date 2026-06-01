import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { userRepository } = vi.hoisted(() => ({
  userRepository: { upsertOnboardingProfile: vi.fn() },
}));

vi.mock("@/repositories", () => ({ userRepository }));

import { POST } from "@/app/api/onboarding/profile/route";
import { localDevUserIdEnvKey } from "@/lib/api/identity";

const userId = "00000000-0000-4000-8000-000000000001";

function request(body: unknown) {
  return new NextRequest("http://localhost/api/onboarding/profile", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("onboarding profile API contract", () => {
  beforeEach(() => {
    process.env[localDevUserIdEnvKey] = userId;
    userRepository.upsertOnboardingProfile.mockReset();
    userRepository.upsertOnboardingProfile.mockResolvedValue({
      user: {
        id: userId,
        displayName: "Ari",
        email: null,
        timezone: "America/New_York",
        unitSystem: "imperial",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
      profile: {
        userId,
        age: 29,
        heightText: "5'8\"",
        weightText: "165 lb",
        goals: ["Build strength"],
        preferredGymTiming: "Early morning",
        wakeTime: "06:30",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
    });
  });

  it("creates onboarding from an empty database by upserting the server-derived user and profile", async () => {
    const response = await POST(
      request({
        name: "Ari",
        age: 29,
        height: "5'8\"",
        weight: "165 lb",
        goals: ["Build strength"],
        gymTiming: "Early morning",
        wakeTime: "06:30",
        timezone: "America/New_York",
      }),
    );

    expect(response.status).toBe(200);
    expect(userRepository.upsertOnboardingProfile).toHaveBeenCalledWith({
      userId,
      displayName: "Ari",
      age: 29,
      heightText: "5'8\"",
      weightText: "165 lb",
      goals: ["Build strength"],
      preferredGymTiming: "Early morning",
      wakeTime: "06:30",
      timezone: "America/New_York",
    });
    await expect(response.json()).resolves.toMatchObject({
      data: {
        user: { id: userId, displayName: "Ari" },
        profile: {
          age: 29,
          goals: ["Build strength"],
          gymTiming: "Early morning",
        },
      },
    });
  });

  it("returns validation errors without writing invalid onboarding data", async () => {
    const response = await POST(
      request({
        name: "",
        age: 12,
        goals: [],
        gymTiming: "Midnight",
        wakeTime: "25:00",
      }),
    );

    expect(response.status).toBe(400);
    expect(userRepository.upsertOnboardingProfile).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "VALIDATION_ERROR" },
    });
  });
});

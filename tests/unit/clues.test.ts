import { describe, it, expect } from "vitest";
import { CLUES, DOOR_CODE } from "@/lib/clues";
import { formatTime } from "@/lib/time";

describe("door code", () => {
  it("is the clue digits in color order: Green, Blue, Red", () => {
    expect(CLUES.map((c) => c.color)).toEqual(["Green", "Blue", "Red"]);
    expect(DOOR_CODE).toBe("246");
  });
});

describe("formatTime", () => {
  it("formats as h:mm:ss", () => {
    expect(formatTime(0)).toBe("0:00:00");
    expect(formatTime(65_000)).toBe("0:01:05");
    expect(formatTime(3_725_000)).toBe("1:02:05");
  });
});

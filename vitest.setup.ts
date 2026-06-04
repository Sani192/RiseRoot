import * as React from "react";
import "@testing-library/jest-dom/vitest";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

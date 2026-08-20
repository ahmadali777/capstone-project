import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.stubGlobal('scrollTo', vi.fn());

if (typeof Element !== 'undefined' && typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = () => {};
}

if (typeof globalThis.TransformStream === 'undefined') {
  globalThis.TransformStream = class TransformStream {
    constructor() {}
    readable = new ReadableStream();
    writable = new WritableStream();
  } as unknown as typeof TransformStream;
}

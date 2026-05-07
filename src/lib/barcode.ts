"use client";

import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

export type BarcodeReader = {
    start: (videoEl: HTMLVideoElement, onResult: (text: string) => void) => Promise<void>;
    stop: () => void;
};

export function createBarcodeReader(): BarcodeReader {
    let controls: IScannerControls | null = null;
    const reader = new BrowserMultiFormatReader();

    return {
        async start(videoEl, onResult) {
            controls = await reader.decodeFromVideoDevice(undefined, videoEl, (result) => {
                if (result) onResult(result.getText());
            });
        },
        stop() {
            controls?.stop();
            controls = null;
        },
    };
}

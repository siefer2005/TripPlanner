declare module '@react-native-voice/voice' {
    export interface SpeechResultsEvent {
        value?: string[];
    }

    const Voice: {
        destroy: () => Promise<void>;
        removeAllListeners: () => void;
        onSpeechResults: ((e: SpeechResultsEvent) => void) | null;
        start: (locale: string) => Promise<void>;
        stop: () => Promise<void>;
    };

    export default Voice;
}

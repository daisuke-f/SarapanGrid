declare namespace Slick {
    export interface IEditor {
        init(): void;
        destroy(): void;
        focus(): void;
        getValue(): any;
        loadValue(item: any): void;
        serializeValue(): string;
        applyValue(item: any, state: any): void;
        isValueChanged(): boolean;
        validate(): { valid: boolean, msg: any };
    }
    export class Editors {
        static Text: IEditor;
        static Integer: IEditor;
        static Float: IEditor;
        static Date: IEditor;
        static YesNoSelect: IEditor;
        static Checkbox: IEditor;
        static PercentComplete: IEditor;
        static LongText: IEditor;
    }
}
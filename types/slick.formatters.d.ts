declare namespace Slick {
    export interface IFormatterResult {
        addClasses: string;
        toolTip: string;
        text: string;
    }
    export interface IFormatter {
        (row: number, cell: HTMLElement, value: any, columnDef: IColumnOptions, dataContext: object): string | IFormatterResult;
    }
    export class Formatters {
        static PercentComplete: IFormatter;
        static PercentCompleteBar: IFormatter;
        static YesNo: IFormatter;
        static Checkmark: IFormatter;
        static Checkbox: IFormatter;
    }
}
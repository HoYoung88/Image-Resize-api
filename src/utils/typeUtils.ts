export class T {
    static isNumeric(value: any): value is number {
        return !Number.isNaN(parseFloat(value)) && Number.isFinite(parseInt(value, 10));
    }
}

export class NumberUtils {
    static getValueOrDefault(value: unknown, defaultValue: number): number {
        return T.isNumeric(value) ? Number(value) : defaultValue;
    }
}

export default {};

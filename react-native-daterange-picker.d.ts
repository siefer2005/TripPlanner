declare module 'react-native-daterange-picker' {
    import { Moment } from 'moment';
    import * as React from 'react';
    import { Component } from 'react';

    export interface DateRange {
        startDate?: Date | Moment | null;
        endDate?: Date | Moment | null;
        displayedDate?: Moment;
    }

    export interface DateRangePickerProps {
        onChange?: (dates: DateRange) => void;
        startDate?: Date | Moment | null;
        endDate?: Date | Moment | null;
        displayedDate?: Moment;
        range?: boolean;
        children?: React.ReactNode;
    }

    export default class DateRangePicker extends Component<DateRangePickerProps> {}
}


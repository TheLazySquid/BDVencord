import { useCallbackRef } from "@bd/ui/hooks";
import { React } from "@webpack/common";

export type BaseSettingProps<T> = ({
    value: T;
    defaultValue?: never;
} | {
    value?: never;
    defaultValue: T;
}) & {
    onChange?(value: T): void;
    disabled?: boolean;
};

interface HandledValue<T, V> {
    disabled: boolean | undefined;
    state: T;
    original: T;
    setState(value: V, stateOnly?: boolean): void;
}

export function useItemProps<T, V extends any = T>(props: BaseSettingProps<T>, convertValue: (newValue: V, currentValue: T) => T = (x) => x as unknown as T): HandledValue<T, V> {
    const [usesDefaultValue] = React.useState(() => !("value" in props));
    const [internalState, setState] = React.useState(props.defaultValue);

    const [original] = React.useState(() => (usesDefaultValue ? props.defaultValue : props.value) as T);

    const change = useCallbackRef<HandledValue<T, V>["setState"]>((value, stateOnly) => {
        if (props.disabled) return;

        const out = convertValue(value, (usesDefaultValue ? internalState : props.value) as T);

        if (!stateOnly) props.onChange?.(out);

        setState(out);
    });

    return {
        original: original,
        disabled: props.disabled,
        state: (usesDefaultValue ? internalState : props.value) as T,

        setState: change
    };
}
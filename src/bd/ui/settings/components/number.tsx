import {React} from "@webpack/common";
import {none, GetSettingsContext} from "bd/ui/contexts";
import Button from "bd/ui/base/button";
import {LucideIcon} from "bd/ui/icons";
import {Plus, Minus} from "lucide";
import type {ChangeEvent} from "react";


export interface NumberInputProps {
    value: number | string;
    min?: number;
    max?: number;
    step?: number;
    onChange?(newValue: number | string): void;
    disabled?: boolean;
}

export default function Number({value: initialValue, min, max, step = 1, onChange, disabled}: NumberInputProps) {
    const {useState, useCallback, useContext} = React;

    const [internalValue, setValue] = useState(initialValue);
    const {value: contextValue, disabled: contextDisabled} = useContext(GetSettingsContext());

    const value = (contextValue !== none ? contextValue : internalValue) as number | string;
    const isDisabled = contextValue !== none ? contextDisabled : disabled;

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
        setValue(e.target.value);
    }, [onChange]);

    const increment = useCallback(() => {
        const currentValue = parseFloat(String(value));
        const incrementedValue = currentValue + step;
        if (max !== undefined && incrementedValue > max) return;
        onChange?.(incrementedValue);
        setValue(incrementedValue);
    }, [onChange, value, max, step]);

    const decrement = useCallback(() => {
        const currentValue = parseFloat(String(value));
        const decrementedValue = currentValue - step;
        if (min !== undefined && decrementedValue < min) return;
        onChange?.(decrementedValue);
        setValue(decrementedValue);
    }, [onChange, value, min, step]);

    return <div className={`bd-number-input-wrapper ${isDisabled ? "bd-number-input-disabled" : ""}`}>
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={Button.Colors.PRIMARY} className="bd-number-input-decrement" onClick={decrement}><LucideIcon icon={Minus} size={24} /></Button>
        <input onChange={change} type="number" className="bd-number-input" min={min} max={max} step={step} value={value} disabled={isDisabled} />
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={Button.Colors.PRIMARY} className="bd-number-input-increment" onClick={increment}><LucideIcon icon={Plus} size={24} /></Button>
    </div>;
}
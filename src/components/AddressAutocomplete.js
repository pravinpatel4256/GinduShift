'use client';

import { useEffect } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import styles from './AddressAutocomplete.module.css';

export default function AddressAutocomplete({
    value,
    onChange,
    onSelect,
    name,
    className,
    ...props
}) {
    const {
        ready,
        value: inputValue,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            // Optional: Restrict search scope
        },
        debounce: 300,
        defaultValue: value || ''
    });

    // Sync with parent value updates (e.g. form reset or initial load)
    useEffect(() => {
        if (value !== undefined && value !== inputValue) {
            setValue(value, false);
        }
    }, [value, setValue, inputValue]);

    const handleInput = (e) => {
        setValue(e.target.value);
        if (onChange) onChange(e);
    };

    const handleSelect = (suggestion) => {
        // When user selects a place, we use the description as the address
        const address = suggestion.description;
        setValue(address, false);
        clearSuggestions();

        // 1. Notify parent via standard change event (for form state)
        if (onChange) {
            onChange({
                target: {
                    name: name,
                    value: address
                }
            });
        }

        // 2. Optional: Provide full suggestion object if needed (coordinates etc)
        if (onSelect) {
            onSelect(address, suggestion);
        }
    };

    return (
        <div className={styles.wrapper}>
            <input
                {...props}
                type="text"
                name={name}
                value={inputValue}
                onChange={handleInput}
                className={className}
                autoComplete="off"
            />
            {status === "OK" && (
                <ul className={styles.suggestions}>
                    {data.map((suggestion) => {
                        const {
                            place_id,
                            structured_formatting: { main_text, secondary_text },
                        } = suggestion;

                        return (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(suggestion)}
                                className={styles.suggestion}
                            >
                                <span className={styles.mainText}>{main_text}</span>
                                <span className={styles.secondaryText}>{secondary_text}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

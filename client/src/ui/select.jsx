import { cn } from "@/lib/utils"
import { Listbox, Transition } from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"
import * as React from "react"

const Select = ({ value, onChange, options = [], placeholder = "Select...", className, multiple = false }) => {
    return (
        <div className={cn("relative w-full", className)}>
            <Listbox value={value} onChange={onChange} multiple={multiple}>
                <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-input bg-transparent py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm h-9">
                        <span className="block truncate text-foreground">
                            {multiple && Array.isArray(value)
                                ? (value.length > 0 ? value.join(", ") : placeholder)
                                : (value || placeholder)}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown
                                className="h-4 w-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={React.Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {options.map((option, personIdx) => (
                                <Listbox.Option
                                    key={personIdx}
                                    className={({ active }) =>
                                        cn(
                                            "relative cursor-default select-none py-2 pl-10 pr-4",
                                            active ? "bg-accent text-accent-foreground" : "text-popover-foreground"
                                        )
                                    }
                                    value={option}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={cn(
                                                    "block truncate",
                                                    selected ? "font-medium" : "font-normal"
                                                )}
                                            >
                                                {option}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    )
}

export { Select }


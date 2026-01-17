import { cn } from "@/lib/utils"
import { RadioGroup as HeadlessRadioGroup } from "@headlessui/react"; // Aliased to avoid conflict if I export as RadioGroup

const RadioGroup = ({ value, onChange, options = [], className }) => {
    return (
        <HeadlessRadioGroup value={value} onChange={onChange} className={cn("flex space-x-4", className)}>
            {options.map((option) => (
                <HeadlessRadioGroup.Option
                    key={option}
                    value={option}
                    className={({ active, checked }) =>
                        cn(
                            "relative flex cursor-pointer rounded-full px-5 py-2 shadow-md focus:outline-none",
                            active ? "ring-2 ring-ring ring-offset-2" : "",
                            checked ? "bg-primary text-primary-foreground" : "bg-popover text-popover-foreground hover:bg-accent hover:text-accent-foreground border border-input"
                        )
                    }
                >
                    {({ checked }) => (
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center">
                                <div className="text-sm">
                                    <HeadlessRadioGroup.Label
                                        as="p"
                                        className={cn("font-medium", checked ? "text-primary-foreground" : "text-foreground")}
                                    >
                                        {option}
                                    </HeadlessRadioGroup.Label>
                                </div>
                            </div>
                        </div>
                    )}
                </HeadlessRadioGroup.Option>
            ))}
        </HeadlessRadioGroup>
    )
}

export { RadioGroup }


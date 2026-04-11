import { Host, CircularProgress, LinearProgress, Picker } from "@expo/ui/swift-ui";

type SegmentedPickerProps = {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

export function SegmentedPicker({ options, selectedIndex, onChange }: SegmentedPickerProps) {
  return (
    <Host matchContents>
      <Picker
        options={options}
        selectedIndex={selectedIndex}
        onOptionSelected={(event) => onChange(event.nativeEvent.index)}
        variant="segmented"
      />
    </Host>
  );
}

export function ProgressRing({ progress, color }: { progress: number; color: string }) {
  return (
    <Host matchContents>
      <CircularProgress progress={progress} color={color} />
    </Host>
  );
}

export function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <Host matchContents>
      <LinearProgress color={color} progress={progress} />
    </Host>
  );
}

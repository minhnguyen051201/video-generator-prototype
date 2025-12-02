export const SliderControl: React.FC<{
  label: string;
  min: number;
  max: number;
  value: number;
  setValue: (v: number) => void;
  unit: string;
}> = ({ label, min, max, value, setValue, unit }) => (
  <div className="mb-8">
    <div className="flex justify-between items-baseline mb-2">
      <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
        {label}
      </h3>
      <span className="text-white text-sm">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => setValue(parseInt(e.target.value, 10))}
      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6633]"
    />
  </div>
);

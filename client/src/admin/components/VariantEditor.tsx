import { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';

export interface VariantRow {
  name: string;
  options: string[];
}

interface Props {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
}

const PRESETS: Record<string, string[]> = {
  'גודל':    ['קטן', 'בינוני', 'גדול', 'XL', 'XXL'],
  'מידה':    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '10', '12', '14', '16'],
  'צבע':     ['שחור', 'לבן', 'כחול', 'חום', 'אפור', 'אדום', 'ירוק'],
  'חלקים':   ['4 חלקים', '6 חלקים', '8 חלקים', '10 חלקים'],
  'סוג':     ['רש"י', 'ר"ת', 'שניהם'],
  'חומר':    ['צמר', 'משי', 'פוליאסטר', 'כותנה', 'עור'],
  'גובה ס"מ': ['7', '10', '12', '15', '20'],
};

const VARIANT_SUGGESTIONS = Object.keys(PRESETS);

export default function VariantEditor({ variants, onChange }: Props) {
  const [optionInputs, setOptionInputs] = useState<Record<number, string>>({});
  const [showPresets, setShowPresets] = useState<Record<number, boolean>>({});

  const addVariant = () => {
    onChange([...variants, { name: '', options: [] }]);
  };

  const removeVariant = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx));
  };

  const updateName = (idx: number, name: string) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], name };
    onChange(updated);
  };

  const addOption = (idx: number, opt: string) => {
    const trimmed = opt.trim();
    if (!trimmed) return;
    const updated = [...variants];
    if (!updated[idx].options.includes(trimmed)) {
      updated[idx] = { ...updated[idx], options: [...updated[idx].options, trimmed] };
      onChange(updated);
    }
    setOptionInputs((p) => ({ ...p, [idx]: '' }));
  };

  const removeOption = (varIdx: number, optIdx: number) => {
    const updated = [...variants];
    updated[varIdx] = { ...updated[varIdx], options: updated[varIdx].options.filter((_, i) => i !== optIdx) };
    onChange(updated);
  };

  const applyPreset = (idx: number, presetName: string) => {
    updateName(idx, presetName);
    const presetOptions = PRESETS[presetName] || [];
    const updated = [...variants];
    updated[idx] = { ...updated[idx], name: presetName, options: [...presetOptions] };
    onChange(updated);
    setShowPresets((p) => ({ ...p, [idx]: false }));
  };

  return (
    <div className="space-y-3">
      {variants.map((variant, idx) => {
        const presets = variant.name && PRESETS[variant.name] ? PRESETS[variant.name] : [];
        const allPresets = Object.entries(PRESETS);

        return (
          <div key={idx} className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
            {/* Variant name */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  value={variant.name}
                  onChange={(e) => updateName(idx, e.target.value)}
                  placeholder="שם האפשרות (למשל: גודל, צבע, חלקים...)"
                  className="input bg-white text-sm w-full pl-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPresets((p) => ({ ...p, [idx]: !p[idx] }))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  title="בחר מהגדרות מוכנות"
                >
                  <ChevronDown size={16} />
                </button>
                {showPresets[idx] && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3 min-w-56">
                    <p className="text-xs text-gray-400 mb-2 font-semibold">בחר סוג מוכן:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allPresets.map(([name]) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => applyPreset(idx, name)}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary hover:text-white transition-colors font-semibold"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Current options as chips */}
            <div className="flex flex-wrap gap-2 min-h-8">
              {variant.options.map((opt, oi) => (
                <span key={oi} className="inline-flex items-center gap-1 bg-primary text-white text-sm px-3 py-1 rounded-full font-medium">
                  {opt}
                  <button type="button" onClick={() => removeOption(idx, oi)} className="hover:bg-white/30 rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {variant.options.length === 0 && (
                <span className="text-xs text-gray-400 py-1">טרם הוספו אפשרויות</span>
              )}
            </div>

            {/* Preset quick-add chips */}
            {presets.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">הוסף מהיר:</p>
                <div className="flex flex-wrap gap-1.5">
                  {presets.filter((p) => !variant.options.includes(p)).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => addOption(idx, p)}
                      className="px-2.5 py-0.5 border-2 border-dashed border-gray-300 text-gray-500 text-xs rounded-full hover:border-primary hover:text-primary transition-colors"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom option input */}
            <div className="flex gap-2">
              <input
                value={optionInputs[idx] || ''}
                onChange={(e) => setOptionInputs((p) => ({ ...p, [idx]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(idx, optionInputs[idx] || ''); } }}
                placeholder="הוסף אפשרות מותאמת..."
                className="input bg-white text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => addOption(idx, optionInputs[idx] || '')}
                className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-600 flex-shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addVariant}
        className="w-full py-2.5 border-2 border-dashed border-primary/40 text-primary rounded-xl hover:border-primary hover:bg-primary/5 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
      >
        <Plus size={16} />הוסף סוג/גודל/מאפיין
      </button>
    </div>
  );
}

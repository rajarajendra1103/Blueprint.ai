import React from 'react';
import {
  Palette,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sliders,
  Type,
  Sun,
  Moon,
  Sparkles,
  Layout,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { DesignDirection } from '@blueprint/shared';

export const DesignPicker: React.FC = () => {
  const {
    designDirections,
    selectedDesignDirectionId,
    setSelectedDesignDirectionId,
    setActiveStep,
  } = useSession();

  if (!designDirections || designDirections.length < 2) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-subtle">
          Design directions not yet generated. Please complete the Tech Stack checkpoint.
        </p>
      </div>
    );
  }

  const [dir1, dir2] = designDirections;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#EAE5DC] text-terracotta border border-border-warm shadow-nm-inset-sm mb-3">
          <Palette className="w-3.5 h-3.5" />
          Checkpoint 2
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
          Select Visual Design Direction
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-subtle font-normal">
          Compare two complete, coherent design bundles. Test live interactive component previews below.
        </p>
      </div>

      {/* Two Comparative Design Directions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Direction 1 Card */}
        <DirectionCard
          direction={dir1}
          isSelected={selectedDesignDirectionId === 'direction-1'}
          onSelect={() => setSelectedDesignDirectionId('direction-1')}
        />

        {/* Direction 2 Card */}
        <DirectionCard
          direction={dir2}
          isSelected={selectedDesignDirectionId === 'direction-2'}
          onSelect={() => setSelectedDesignDirectionId('direction-2')}
        />
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border-warm">
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className="px-5 py-2.5 rounded-2xl text-xs font-semibold btn-nm text-charcoal flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tech Stack</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(4)}
          className="px-7 py-3 rounded-2xl text-xs font-semibold btn-terracotta text-white flex items-center gap-2 shadow-nm-terracotta"
        >
          <span>Lock Design & Proceed to Final Export</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface DirectionCardProps {
  direction: DesignDirection;
  isSelected: boolean;
  onSelect: () => void;
}

const DirectionCard: React.FC<DirectionCardProps> = ({ direction, isSelected, onSelect }) => {
  const isDark = direction.colors.isDark;

  return (
    <div
      onClick={onSelect}
      className={`card-nm rounded-3xl overflow-hidden cursor-pointer border-2 transition-all p-6 sm:p-7 relative flex flex-col justify-between ${
        isSelected
          ? 'border-terracotta ring-2 ring-terracotta/20 shadow-nm-terracotta bg-white/60'
          : 'border-transparent hover:border-border-warm'
      }`}
    >
      <div>
        {/* Direction Badge & Title */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              direction.id === 'direction-1'
                ? 'bg-terracotta/15 text-terracotta border-terracotta/30'
                : 'bg-sky-500/15 text-sky-700 border-sky-500/30'
            }`}
          >
            {direction.badge}
          </span>
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="w-4 h-4 text-slate-500" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isSelected ? 'bg-terracotta text-white' : 'border border-border-warm bg-white'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>
        </div>

        <h3 className="font-editorial text-2xl font-bold text-charcoal">{direction.name}</h3>
        <p className="text-xs text-subtle mt-1 mb-5 leading-relaxed">{direction.philosophy}</p>

        {/* Color Palette Swatches */}
        <div className="mb-6">
          <label className="block text-[11px] font-semibold text-charcoal uppercase tracking-wider mb-2">
            Curated Color Palette
          </label>
          <div className="flex items-center gap-2">
            <ColorChip label="Base" hex={direction.colors.base} />
            <ColorChip label="Surface" hex={direction.colors.surface} />
            <ColorChip label="Primary" hex={direction.colors.primary} />
            <ColorChip label="Secondary" hex={direction.colors.secondary} />
            <ColorChip label="Accent" hex={direction.colors.accent} />
          </div>
        </div>

        {/* Typography Preview */}
        <div className="mb-6 p-4 rounded-2xl bg-[#EFECE6] border border-border-warm shadow-nm-inset-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal mb-2">
            <Type className="w-3.5 h-3.5 text-terracotta" />
            <span>Typography System</span>
          </div>
          <p
            className="text-base font-bold text-charcoal tracking-tight"
            style={{ fontFamily: direction.id === 'direction-1' ? 'Fraunces, serif' : 'Space Grotesk, sans-serif' }}
          >
            {direction.typography.sampleHeadline}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-subtle font-mono">
            <span>Headings: {direction.typography.headingFont}</span>
            <span>Body: {direction.typography.bodyFont}</span>
            <span>Code: {direction.typography.monoFont}</span>
          </div>
        </div>

        {/* Layout & Grid Composition Suggestion */}
        <div className="mb-6 p-4 rounded-2xl bg-[#EFECE6] border border-border-warm shadow-nm-inset-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal mb-2">
            <Layout className="w-3.5 h-3.5 text-terracotta" />
            <span>Layout & Grid Composition</span>
          </div>
          <p className="text-sm font-bold text-charcoal tracking-tight mb-2">
            {direction.layout.style}
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white/60 p-2.5 rounded-xl border border-border-warm/60">
              <span className="block text-[10px] uppercase font-bold text-subtle mb-0.5">Spacing Density</span>
              <span className="font-mono text-charcoal text-xs">{direction.layout.density}</span>
            </div>
            <div className="bg-white/60 p-2.5 rounded-xl border border-border-warm/60">
              <span className="block text-[10px] uppercase font-bold text-subtle mb-0.5">Grid Architecture</span>
              <span className="font-mono text-charcoal text-xs">{direction.layout.gridSystem}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-warm/50 flex items-center justify-between text-[11px] text-subtle">
            <span>Container: <strong className="font-mono text-charcoal">{direction.layout.containerWidth}</strong></span>
            <span>Icons: <strong className="font-mono text-charcoal">{direction.icons.library} ({direction.icons.style})</strong></span>
          </div>
        </div>

        {/* Live Interactive Mini-Preview Sandbox */}
        <div className="mb-6">
          <label className="flex items-center gap-1 text-[11px] font-semibold text-charcoal uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            Live Component Sandbox
          </label>

          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#0B0F19] text-slate-100 border-white/10'
                : 'bg-[#F4F1EC] text-[#2C2825] border-[#E2DDD3]'
            }`}
          >
            <div className="space-y-3">
              {/* Sample Card & Badge */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-white/10' : 'bg-[#F4F1EC] border-[#ECE7DC] shadow-nm-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isDark
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-[#EAE5DC] text-[#7A8B6F] shadow-nm-inset-sm'
                    }`}
                  >
                    STATUS: ACTIVE
                  </span>
                  <span className="text-[10px] opacity-60 font-mono">v1.0.4</span>
                </div>
                <h5 className="text-sm font-bold">API Rate Limiting Guard</h5>
                <p className="text-xs opacity-75 mt-0.5">
                  Token bucket algorithms implemented with microsecond precision.
                </p>
              </div>

              {/* Interactive Sample Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Interacted with ${direction.name} tactile button!`);
                  }}
                  className={direction.componentPreview.buttonClass}
                >
                  Click Me (Tactile)
                </button>

                <span className="text-xs opacity-60 font-mono text-[11px]">
                  {direction.style.cornerRadius}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility & Contrast Note */}
        <div className="flex items-start gap-2 text-xs text-subtle bg-white/50 p-3 rounded-xl border border-border-warm">
          <ShieldCheck className="w-4 h-4 text-sage shrink-0 mt-0.5" />
          <p className="leading-tight">{direction.accessibilityNotes}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border-warm flex items-center justify-between">
        <span className="text-xs font-semibold text-charcoal">
          {isSelected ? 'Currently Selected' : 'Click card to select'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            isSelected
              ? 'btn-terracotta text-white shadow-nm-sm'
              : 'btn-nm text-charcoal hover:bg-white'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Direction'}
        </button>
      </div>
    </div>
  );
};

const ColorChip: React.FC<{ label: string; hex: string }> = ({ label, hex }) => {
  return (
    <div className="flex-1 text-center">
      <div
        className="w-full h-8 rounded-xl shadow-nm-inset-sm border border-border-warm/80 mb-1"
        style={{ backgroundColor: hex }}
      />
      <div className="text-[10px] font-bold text-charcoal line-clamp-1">{label}</div>
      <div className="text-[9px] font-mono text-subtle">{hex}</div>
    </div>
  );
};

import React, { useState } from 'react';
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
    updateDesignDirection,
    setActiveStep,
  } = useSession();

  const [customizing, setCustomizing] = useState<boolean>(false);

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
  const activeDirection = selectedDesignDirectionId === 'direction-1' ? dir1 : dir2;

  const handleColorChange = (key: 'primary' | 'accent' | 'surface' | 'base', hex: string) => {
    updateDesignDirection(selectedDesignDirectionId, {
      colors: {
        ...activeDirection.colors,
        [key]: hex,
      },
    });
  };

  const handleTypographyChange = (key: 'headingFont' | 'bodyFont', font: string) => {
    updateDesignDirection(selectedDesignDirectionId, {
      typography: {
        ...activeDirection.typography,
        [key]: font,
      },
    });
  };

  const handleLayoutChange = (key: 'density' | 'style', val: string) => {
    updateDesignDirection(selectedDesignDirectionId, {
      layout: {
        ...activeDirection.layout,
        [key]: val,
      },
    });
  };

  const handleCornerRadiusChange = (radius: string) => {
    updateDesignDirection(selectedDesignDirectionId, {
      style: {
        ...activeDirection.style,
        cornerRadius: radius,
      },
    });
  };

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

      {/* Customize Design System Overrides (Same as CP1 Tech Stack Overrides) */}
      <div className="card-nm p-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-charcoal flex items-center gap-2">
              <Sliders className="w-4 h-4 text-terracotta" />
              <span>Custom Design System Overrides</span>
            </h4>
            <p className="text-xs text-subtle mt-0.5">
              Fine-tune primary brand palette, typography, layout density, and corner styling for{' '}
              <strong className="text-terracotta">{activeDirection.name}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCustomizing(!customizing)}
            className="px-4 py-2 rounded-xl text-xs font-semibold btn-nm text-charcoal shrink-0"
          >
            {customizing ? 'Lock Design Tokens' : 'Customize Design Tokens'}
          </button>
        </div>

        {customizing && (
          <div className="mt-5 space-y-5 pt-5 border-t border-border-warm animate-fade-in">
            {/* Color Palette Row */}
            <div>
              <span className="block text-xs font-semibold text-charcoal mb-2">Curated Color Tokens</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Primary Color */}
                <div className="p-3 bg-[#EFECE6] rounded-2xl border border-border-warm flex items-center gap-3">
                  <input
                    type="color"
                    value={activeDirection.colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-bold text-charcoal">Primary Brand</label>
                    <input
                      type="text"
                      value={activeDirection.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-full bg-transparent text-xs font-mono text-charcoal outline-none border-b border-border-warm focus:border-terracotta"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="p-3 bg-[#EFECE6] rounded-2xl border border-border-warm flex items-center gap-3">
                  <input
                    type="color"
                    value={activeDirection.colors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-bold text-charcoal">Accent Color</label>
                    <input
                      type="text"
                      value={activeDirection.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-full bg-transparent text-xs font-mono text-charcoal outline-none border-b border-border-warm focus:border-terracotta"
                    />
                  </div>
                </div>

                {/* Surface Color */}
                <div className="p-3 bg-[#EFECE6] rounded-2xl border border-border-warm flex items-center gap-3">
                  <input
                    type="color"
                    value={activeDirection.colors.surface}
                    onChange={(e) => handleColorChange('surface', e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-bold text-charcoal">Card Surface</label>
                    <input
                      type="text"
                      value={activeDirection.colors.surface}
                      onChange={(e) => handleColorChange('surface', e.target.value)}
                      className="w-full bg-transparent text-xs font-mono text-charcoal outline-none border-b border-border-warm focus:border-terracotta"
                    />
                  </div>
                </div>

                {/* Base Background */}
                <div className="p-3 bg-[#EFECE6] rounded-2xl border border-border-warm flex items-center gap-3">
                  <input
                    type="color"
                    value={activeDirection.colors.base}
                    onChange={(e) => handleColorChange('base', e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-bold text-charcoal">Base Background</label>
                    <input
                      type="text"
                      value={activeDirection.colors.base}
                      onChange={(e) => handleColorChange('base', e.target.value)}
                      className="w-full bg-transparent text-xs font-mono text-charcoal outline-none border-b border-border-warm focus:border-terracotta"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Layout Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Heading Font</label>
                <input
                  type="text"
                  value={activeDirection.typography.headingFont}
                  onChange={(e) => handleTypographyChange('headingFont', e.target.value)}
                  className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
                  placeholder="e.g. Newsreader, Inter, Playfair"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Body Font</label>
                <input
                  type="text"
                  value={activeDirection.typography.bodyFont}
                  onChange={(e) => handleTypographyChange('bodyFont', e.target.value)}
                  className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
                  placeholder="e.g. Plus Jakarta Sans, Roboto"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Layout Density</label>
                <select
                  value={activeDirection.layout.density}
                  onChange={(e) => handleLayoutChange('density', e.target.value)}
                  className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
                >
                  <option value="Compact / High-Information">Compact / High-Information</option>
                  <option value="Balanced / Modern Dashboard">Balanced / Modern Dashboard</option>
                  <option value="Spacious / Editorial Canvas">Spacious / Editorial Canvas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Corner Radius</label>
                <select
                  value={activeDirection.style.cornerRadius}
                  onChange={(e) => handleCornerRadiusChange(e.target.value)}
                  className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3 py-2 text-xs text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
                >
                  <option value="rounded-3xl (24px)">Pill / Smooth (rounded-3xl)</option>
                  <option value="rounded-2xl (16px)">Modern Soft (rounded-2xl)</option>
                  <option value="rounded-xl (12px)">Subtle (rounded-xl)</option>
                  <option value="rounded-none (0px)">Sharp / Brutalist (0px)</option>
                </select>
              </div>
            </div>
          </div>
        )}
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

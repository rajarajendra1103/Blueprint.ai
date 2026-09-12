"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPATIBILITY_PRESETS = void 0;
exports.getDomainAdaptivePresets = getDomainAdaptivePresets;
exports.generateDesignDirections = generateDesignDirections;
const adapters_1 = require("../adapters");
const design_prompt_1 = require("../prompts/design.prompt");
const json_parser_1 = require("../utils/json-parser");
// Domain-Adaptive Presets for guaranteed coherent design dimensions
exports.COMPATIBILITY_PRESETS = {
    cyberMonoline: {
        id: 'direction-1',
        name: 'Cyber Monoline Dark',
        badge: 'Recommended for Developer Tools',
        philosophy: 'High-precision obsidian terminal aesthetic with emerald accents, monolinear borders, and dense typography engineered for technical clarity.',
        style: {
            name: 'Cyber Monolinear Slate',
            description: 'Deep obsidian cards with 1px slate-800 borders, emerald status indicators, and subtle terminal glows.',
            surface: 'bg-[#0B0F17] text-slate-100',
            shadow: 'shadow-[0_4px_20px_rgba(16,185,129,0.08)]',
            border: 'border border-slate-800',
            cornerRadius: 'rounded-xl',
        },
        typography: {
            headingFont: 'Space Grotesk',
            bodyFont: 'Inter',
            monoFont: 'JetBrains Mono',
            scaleDescription: 'Sharp geometric headers paired with dense monospaced metadata and high-legibility body text.',
            sampleHeadline: 'High-Throughput Collaborative Intelligence',
        },
        layout: {
            style: 'High-density modular command center',
            density: 'Compact and space-efficient (16px grid)',
            containerWidth: 'max-w-6xl mx-auto',
            gridSystem: 'Multi-pane responsive grid',
        },
        colors: {
            base: '#0B0F17',
            surface: '#131B2E',
            primary: '#10B981',
            secondary: '#38BDF8',
            accent: '#F59E0B',
            textPrimary: '#F8FAFC',
            textSecondary: '#94A3B8',
            border: '#1E293B',
            isDark: true,
        },
        icons: {
            style: 'Precise 1.5px monolinear stroke',
            library: 'Lucide Linear',
            description: 'Fine-line technical iconography with emerald hover glow',
        },
        accessibilityNotes: 'Emerald on obsidian provides 11.4:1 contrast ratio, surpassing WCAG AAA requirements.',
        contrastRatio: '11.4:1',
        contrastRating: 'WCAG AAA Pass',
        responsiveNotes: 'Dense 3-column desktop layout collapses to stacked cards with sticky drawer navigation on mobile.',
        componentPreview: {
            buttonClass: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all',
            cardClass: 'bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-xl',
            badgeClass: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs px-3 py-1 rounded-full',
            inputClass: 'bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-slate-100 font-mono text-xs focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none',
        },
    },
    minimalistSlate: {
        id: 'direction-2',
        name: 'Modern Silicon Valley Light',
        badge: 'Clean Modern Alternative',
        philosophy: 'Minimalist clarity with crisp white cards, refined neutral slate typography, and electric indigo brand accents.',
        style: {
            name: 'Clean Modernist Minimal',
            description: 'Bright pure white cards floating on light slate canvas with subtle hairline borders and smooth shadow elevation.',
            surface: 'bg-white text-slate-900',
            shadow: 'shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
            border: 'border border-slate-200',
            cornerRadius: 'rounded-2xl',
        },
        typography: {
            headingFont: 'Plus Jakarta Sans',
            bodyFont: 'Inter',
            monoFont: 'JetBrains Mono',
            scaleDescription: 'Modern tech sans-serif with distinct weight hierarchies and airy line heights.',
            sampleHeadline: 'Accelerated Development with Absolute Clarity',
        },
        layout: {
            style: 'Card-based fluid grid layout',
            density: 'Balanced and breathable (24px padding)',
            containerWidth: 'max-w-5xl mx-auto',
            gridSystem: '12-column responsive layout',
        },
        colors: {
            base: '#F8FAFC',
            surface: '#FFFFFF',
            primary: '#4F46E5',
            secondary: '#06B6D4',
            accent: '#8B5CF6',
            textPrimary: '#0F172A',
            textSecondary: '#64748B',
            border: '#E2E8F0',
            isDark: false,
        },
        icons: {
            style: 'Modern rounded glyphs',
            library: 'Lucide Rounded',
            description: 'Harmonious geometric outlines with soft rounded corners',
        },
        accessibilityNotes: 'Indigo text on white canvas provides 8.6:1 contrast ratio, ensuring seamless daylight readability.',
        contrastRatio: '8.6:1',
        contrastRating: 'WCAG AAA Pass',
        responsiveNotes: 'Fluid responsive layout maintaining 44px touch targets on mobile viewports.',
        componentPreview: {
            buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all',
            cardClass: 'bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow',
            badgeClass: 'bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs px-3 py-1 rounded-full',
            inputClass: 'bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none',
        },
    },
    swissLuxe: {
        id: 'direction-1',
        name: 'High-Trust Swiss Luxe',
        badge: 'Executive & Enterprise Standard',
        philosophy: 'Authoritative deep navy and rich gold accents inspired by Swiss private banking and precision instrumentation.',
        style: {
            name: 'Swiss Precision Luxe',
            description: 'Deep navy background with champagne gold accents, razor-thin borders, and high-density financial tables.',
            surface: 'bg-[#0A1128] text-slate-100',
            shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
            border: 'border border-[#1E2E5D]',
            cornerRadius: 'rounded-xl',
        },
        typography: {
            headingFont: 'Playfair Display',
            bodyFont: 'Plus Jakarta Sans',
            monoFont: 'JetBrains Mono',
            scaleDescription: 'Distinguished serif headlines paired with ultra-clean modern corporate sans body.',
            sampleHeadline: 'Enterprise-Grade Security and Asset Governance',
        },
        layout: {
            style: 'Structured multi-column executive dashboard',
            density: 'Dense and information-rich (16px to 20px padding)',
            containerWidth: 'max-w-6xl mx-auto',
            gridSystem: 'Structured financial grid',
        },
        colors: {
            base: '#0A1128',
            surface: '#101F42',
            primary: '#D4AF37',
            secondary: '#4A90E2',
            accent: '#E6C665',
            textPrimary: '#FFFFFF',
            textSecondary: '#A0AEC0',
            border: '#1E2E5D',
            isDark: true,
        },
        icons: {
            style: 'Crisp hairline luxury icons',
            library: 'Lucide Linear',
            description: 'Gold-accented fine stroke iconography',
        },
        accessibilityNotes: 'Champagne gold on deep navy delivers 9.4:1 contrast ratio, surpassing WCAG AAA.',
        contrastRatio: '9.4:1',
        contrastRating: 'WCAG AAA Pass',
        responsiveNotes: 'Data tables adapt to horizontal scroll cards with frozen identifier columns on mobile.',
        componentPreview: {
            buttonClass: 'bg-[#D4AF37] hover:bg-[#C29D2C] text-slate-950 font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/15 transition-all',
            cardClass: 'bg-[#101F42] border border-[#1E2E5D] p-6 rounded-xl shadow-xl',
            badgeClass: 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-xs px-3 py-1 rounded-full',
            inputClass: 'bg-[#0A1128] border border-[#1E2E5D] px-4 py-2.5 rounded-xl text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none',
        },
    },
    clinicalClarity: {
        id: 'direction-1',
        name: 'Clinical Clarity Teal',
        badge: 'Recommended for Health & Wellness',
        philosophy: 'Calm, sterile precision with pure white canvas, soft oceanic teal accents, and high-legibility typographic scale.',
        style: {
            name: 'Clinical Precision Modern',
            description: 'Ultra-clean white surfaces with gentle teal borders and high-empathy soft corners.',
            surface: 'bg-white text-slate-800',
            shadow: 'shadow-[0_4px_20px_rgba(20,184,166,0.06)]',
            border: 'border border-teal-100',
            cornerRadius: 'rounded-2xl',
        },
        typography: {
            headingFont: 'Outfit',
            bodyFont: 'Inter',
            monoFont: 'Roboto Mono',
            scaleDescription: 'Friendly yet authoritative modern sans typography designed for patient and practitioner accessibility.',
            sampleHeadline: 'Empowering Transparent, Patient-Centered Outcomes',
        },
        layout: {
            style: 'Single-column content-first guided flow',
            density: 'Generous and calming (28px padding)',
            containerWidth: 'max-w-4xl mx-auto',
            gridSystem: 'Card stream with generous whitespace',
        },
        colors: {
            base: '#F0FDFA',
            surface: '#FFFFFF',
            primary: '#0D9488',
            secondary: '#0284C7',
            accent: '#14B8A6',
            textPrimary: '#134E4A',
            textSecondary: '#64748B',
            border: '#CCFBF1',
            isDark: false,
        },
        icons: {
            style: 'Smooth rounded medical icons',
            library: 'Lucide Rounded',
            description: 'Gentle rounded shapes that evoke safety and clinical rigor',
        },
        accessibilityNotes: 'Teal-900 on mint achieves 10.2:1 contrast ratio, ideal for high accessibility needs.',
        contrastRatio: '10.2:1',
        contrastRating: 'WCAG AAA Pass',
        responsiveNotes: 'Fluid layout optimized for one-thumb mobile accessibility and large touch areas.',
        componentPreview: {
            buttonClass: 'bg-teal-600 hover:bg-teal-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-md shadow-teal-500/20 transition-all',
            cardClass: 'bg-white border border-teal-100 p-6 rounded-2xl shadow-sm hover:border-teal-200 transition-colors',
            badgeClass: 'bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs px-3 py-1 rounded-full',
            inputClass: 'bg-teal-50/50 border border-teal-100 px-4 py-2.5 rounded-xl text-slate-800 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none',
        },
    },
};
function getDomainAdaptivePresets(classification) {
    const domain = (classification.domain || '').toLowerCase();
    if (domain.includes('developer') || domain.includes('tool') || domain.includes('security') || domain.includes('cloud')) {
        return [exports.COMPATIBILITY_PRESETS.cyberMonoline, exports.COMPATIBILITY_PRESETS.minimalistSlate];
    }
    if (domain.includes('finance') || domain.includes('fintech') || domain.includes('banking') || domain.includes('enterprise')) {
        return [exports.COMPATIBILITY_PRESETS.swissLuxe, exports.COMPATIBILITY_PRESETS.minimalistSlate];
    }
    if (domain.includes('health') || domain.includes('medical') || domain.includes('wellness')) {
        return [exports.COMPATIBILITY_PRESETS.clinicalClarity, exports.COMPATIBILITY_PRESETS.minimalistSlate];
    }
    // Default adaptive pair: Cyber Monoline Dark + Modern Silicon Valley Light
    return [exports.COMPATIBILITY_PRESETS.cyberMonoline, exports.COMPATIBILITY_PRESETS.minimalistSlate];
}
async function generateDesignDirections(idea, classification, config) {
    const adapter = (0, adapters_1.getAdapter)(config.provider);
    const { prompt, systemPrompt } = (0, design_prompt_1.buildDesignPrompt)(idea, classification);
    try {
        const raw = await adapter.generate(prompt, config.apiKey, config.model, {
            systemPrompt,
            responseFormatJson: true,
            temperature: 0.4,
        });
        const parsed = (0, json_parser_1.extractAndParseJson)(raw);
        if (Array.isArray(parsed.directions) && parsed.directions.length >= 2) {
            return {
                directions: [parsed.directions[0], parsed.directions[1]],
                rationale: parsed.rationale || `Generated 2 distinct design bundles tailored specifically to the ${classification.domain} theme.`,
            };
        }
    }
    catch (err) {
        console.warn('Design generation fallback triggered:', err);
    }
    const fallbackPair = getDomainAdaptivePresets(classification);
    return {
        directions: fallbackPair,
        rationale: `Direction 1 provides the tailored flagship aesthetic for ${classification.domain}, while Direction 2 provides a clean modern contrasting alternative.`,
    };
}

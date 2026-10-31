'use client';

import React from 'react';
import Image from 'next/image';
import {
  TbX,
  TbSparkles,
  TbShield,
  TbCpu,
  TbHeart,
  TbExternalLink,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const AboutModal: React.FC = () => {
  const { isAboutModalOpen, setAboutModalOpen } = useEditorStore();
  const { t } = useTranslation();

  if (!isAboutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#F9F6F0] rounded-3xl border-2 border-[#D9C9B4] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Splash Header */}
        <div className="relative bg-gradient-to-r from-[#4B382C] via-[#8F4938] to-[#B85F45] px-6 py-5 text-white flex items-center justify-between border-b border-[#D9C9B4]/40 shadow-inner">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg p-1 shrink-0 backdrop-blur-xs">
              <Image
                src="/killaplayground-tranparent.png"
                alt="The Killa Playground Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-yatra text-xl sm:text-2xl tracking-wide text-white drop-shadow-sm">
                  The Killa Playground
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E85D04] text-[10px] font-sans font-bold uppercase tracking-wider text-white shadow-xs">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-[#F2EBE1]/90 font-sans mt-0.5">
                किल्ला प्लेग्राउंड • 3D Diwali Mud Fort Diorama Builder
              </p>
            </div>
          </div>

          <button
            onClick={() => setAboutModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Close"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Main Hero Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#F2EBE1] border border-[#D9C9B4]">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
              <Image
                src="/killaplayground-tranparent.png"
                alt="Killa Playground Mascot"
                width={128}
                height={128}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-yatra text-lg text-[#2B1E16] mb-1">
                A Tribute to Sahyadri Fort Heritage
              </h3>
              <p className="text-xs text-[#634E40] leading-relaxed">
                During the festive weeks of Diwali across Maharashtra, children and families come together to mold miniature mud forts in house courtyards—honoring Chhatrapati Shivaji Maharaj and the historic bastions of the Maratha Empire.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <span className="px-2 py-0.5 rounded-md bg-[#EADECF] text-[#4B382C] text-[10px] font-bold">
                  तांबडी माती (Mud)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EADECF] text-[#4B382C] text-[10px] font-bold">
                  तटबंदी (Ramparts)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EADECF] text-[#4B382C] text-[10px] font-bold">
                  बुरूज (Bastions)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#EADECF] text-[#4B382C] text-[10px] font-bold">
                  भगवा ध्वज (Saffron Flag)
                </span>
              </div>
            </div>
          </div>

          {/* Architecture & Tech Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F2EBE1]/80 border border-[#D9C9B4]/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4B382C] text-white flex items-center justify-center shrink-0">
                <TbCpu className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <span className="font-bold text-[#2B1E16] block">100% Client-Side 3D</span>
                <span className="text-[#634E40] text-[11px] leading-snug block mt-0.5">
                  High-performance WebGL2 with Three.js, React Three Fiber & BVH raycasting at ₹0 server compute.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2EBE1]/80 border border-[#D9C9B4]/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8F4938] text-white flex items-center justify-center shrink-0">
                <TbShield className="w-4 h-4 text-[#FAF8F5]" />
              </div>
              <div>
                <span className="font-bold text-[#2B1E16] block">Privacy & Local Storage</span>
                <span className="text-[#634E40] text-[11px] leading-snug block mt-0.5">
                  Your dioramas are persisted directly in your browser without requiring logins or external tracking.
                </span>
              </div>
            </div>
          </div>

          {/* Credits & Asset Attributions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B85F45] flex items-center gap-1 font-sans">
              <TbHeart className="w-3.5 h-3.5 text-[#B85F45]" />
              Asset Credits & Community Thanks
            </h4>
            <div className="p-3 rounded-xl bg-[#ECE2D5]/70 border border-[#D9C9B4] text-[11px] text-[#634E40] space-y-1.5 leading-relaxed">
              <div>
                <strong className="text-[#2B1E16]">Retroground Texture Pack:</strong> Authored by Binbun3D. Used for crisp retro terrain stone, mud, and brick materials.
              </div>
              <div>
                <strong className="text-[#2B1E16]">Retro PSX Tree & Nature Packs:</strong> Authored by Elegant Crow (CC0 Public Domain). Used for authentic Indian foliage and courtyard plants.
              </div>
              <div>
                <strong className="text-[#2B1E16]">Typography:</strong> Yatra One & Modak (Google Fonts) for authentic Devanagari display typography.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F2EBE1] border-t border-[#D9C9B4] flex items-center justify-between">
          <span className="text-[11px] text-[#8D7666]">
            Made with reverence for Chhatrapati Shivaji Maharaj
          </span>
          <button
            onClick={() => setAboutModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-[#4B382C] hover:bg-[#38281E] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


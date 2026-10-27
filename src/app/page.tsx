'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TopNavBar } from '@/components/hud/TopNavBar';
import { BottomDock } from '@/components/hud/BottomDock';
import { ContextualDock } from '@/components/hud/ContextualDock';
import { useEditorStore } from '@/lib/state/useEditorStore';

const KillaCanvas = dynamic(
  () => import('@/components/3d/KillaCanvas').then((m) => m.KillaCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F9F6F0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#B85F45] border-t-transparent animate-spin mb-4" />
        <span className="font-['Yatra_One'] text-xl text-[#4B382C] tracking-wide">
          किल्ला प्लेग्राउंड सुरू होत आहे...
        </span>
        <span className="text-xs text-[#8D7666] mt-1">Loading 3D Diorama Viewport</span>
      </div>
    ),
  }
);

export default function HomePage() {
  const { nightMode } = useEditorStore();

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden transition-colors duration-700 select-none ${
        nightMode ? 'bg-[#151311]' : 'bg-[#F9F6F0]'
      }`}
    >
      {/* 3D Canvas Viewport (100vw x 100vh) */}
      <div className="absolute inset-0 z-0">
        <KillaCanvas>
          {/* Temporary foundation test mesh for Ticket 01 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial
              color={nightMode ? '#23211E' : '#EADECF'}
              roughness={0.9}
            />
          </mesh>
          <gridHelper args={[12, 24, '#B58B63', '#D9C9B4']} position={[0, 0, 0]} />
        </KillaCanvas>
      </div>

      {/* Floating HUD Layer */}
      <TopNavBar />
      <ContextualDock />
      <BottomDock />
    </main>
  );
}

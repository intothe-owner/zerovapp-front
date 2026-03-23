// components/mobile/SwipeableItem.tsx
"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Archive } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onArchive: () => void;
  isArchive?:boolean;
}

const SwipeableItem = ({ children, onArchive,isArchive }: Props) => {
  const x = useMotionValue(0);

  // 1. 왼쪽으로 밀수록 배경색이 하얀색에서 진한 회색으로 변함
  const backgroundColor = useTransform(
    x,
    [-200, 0],
    [!isArchive?"#4b5563":"#de7a24", "#ffffff"] // gray-600에서 white로
  );

  // 2. 왼쪽으로 밀수록 보관함 아이콘이 선명해짐
  const opacity = useTransform(x, [-100, -20], [1, 0]);
  const scale = useTransform(x, [-200, -100], [1.2, 1]);

  return (
    <div className="relative overflow-hidden border-b border-gray-100">
      {/* 배경 레이어 (보관함 아이콘) */}
      <motion.div 
        style={{ backgroundColor }}
        className="absolute inset-0 flex items-center justify-end px-10 text-white"
      >
        <motion.div style={{ opacity, scale }} className="flex flex-col items-center gap-1">
          <Archive size={28} />
          <span className="text-[10px] font-bold">
            {
                isArchive?'동선 해제':'오늘 작업 동선'
            }
          </span>
        </motion.div>
      </motion.div>

      {/* 리스트 본체 */}
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -300, right: 0 }}
        onDragEnd={(_, info) => {
          // -150px 이상 밀었을 때만 보관함 실행
          if (info.offset.x < -150) {
            onArchive();
          }
        }}
        animate={{ x: 0 }} // 실행 후 또는 놓았을 때 제자리로 (보관 후엔 리스트에서 제거되게 처리 권장)
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
        className="relative z-10 bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableItem;
"use client";

import { useSeniorCenterDetail, useUploadSeniorCenterReportPhoto } from "@/hooks/useSeniorCenter";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Phone, Loader2, Navigation, FileText, Camera } from "lucide-react";
import { openKakaoNavi } from "@/lib/navigation";
import axios from "axios";

// --- Utility Functions ---
function buildImageUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = process.env.NEXT_PUBLIC_S3_BASE_URL ?? "";
  if (!base) return path;

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type ReportCategory = "AIR_CONDITIONER" | "AIR_PURIFIER";

type PhotoFieldKey = 
  | "entranceImage" 
  | "workImage1" 
  | "workImage2" 
  | "beforeImage1" 
  | "afterImage1" 
  | "beforeImage2" 
  | "afterImage2";

const PHOTO_FIELDS: { key: PhotoFieldKey; label: string; fullWidth?: boolean }[] = [
  { key: "entranceImage", label: "입구 전경", fullWidth: true },
  { key: "workImage1", label: "작업 진행 사진 1" },
  { key: "workImage2", label: "작업 진행 사진 2" },
  { key: "beforeImage1", label: "작업 전 (Set 1)" },
  { key: "afterImage1", label: "작업 후 (Set 1)" },
  { key: "beforeImage2", label: "작업 전 (Set 2)" },
  { key: "afterImage2", label: "작업 후 (Set 2)" },
];

const getEmptyFiles = (): Record<PhotoFieldKey, File | null> => ({
  entranceImage: null, workImage1: null, workImage2: null,
  beforeImage1: null, afterImage1: null, beforeImage2: null, afterImage2: null,
});

const getEmptyPreviews = (): Record<PhotoFieldKey, string | null> => ({
  entranceImage: null, workImage1: null, workImage2: null,
  beforeImage1: null, afterImage1: null, beforeImage2: null, afterImage2: null,
});

// 기존 업로드된 이미지 URL 찾기
function getServerImageUrl(item: any, category: ReportCategory, fieldKey: string) {
  if (!item?.reports) return null;
  if (Array.isArray(item.reports)) {
    const report = item.reports.find((r: any) => r.category === category);
    return buildImageUrl(report?.[fieldKey]);
  }
  return buildImageUrl(item.reports[category]?.[fieldKey]);
}

// --- UI Components ---
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function PhoneDetailRow({ label, value, color = "blue" }: { label: string; value: string | null | undefined; color?: "blue" | "green" }) {
  const isGreen = color === "green";
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="mt-1 break-words text-sm font-semibold text-gray-900">{value || "-"}</div>
      </div>
      {value && (
        <a
          href={`tel:${value}`}
          className={`ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 ${
            isGreen ? "bg-green-100 text-green-600 shadow-sm" : "bg-blue-100 text-blue-600 shadow-sm"
          }`}
        >
          <Phone size={18} />
        </a>
      )}
    </div>
  );
}

// 개별 사진 업로드 카드 컴포넌트
function PhotoUploadCard({ label, url, onChange, isNew }: { label: string; url: string | null; onChange: (e: ChangeEvent<HTMLInputElement>) => void; isNew?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <p className="text-xs font-bold text-gray-700">{label}</p>
        {isNew && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">저장 대기</span>}
      </div>
      <div className={`relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all group ${isNew ? 'border-amber-400 bg-amber-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'}`}>
        {url ? (
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-gray-400 gap-1 group-hover:text-blue-500 transition-colors">
            <Camera size={24} />
            <span className="text-[10px] font-bold">사진 선택</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

const SeniorCenterMobileDetailPage = () => {
  const params = useParams();
  const router = useRouter();

  const id = useMemo(() => {
    const raw = Array.isArray(params?.id) ? params.id[0] : params?.id;
    return Number(raw);
  }, [params]);

  const { data: item, isLoading } = useSeniorCenterDetail(id);
  const uploadReportMutation = useUploadSeniorCenterReportPhoto();

  // ✅ 탭 & 2중 파일 상태 관리
  const [activePhotoTab, setActivePhotoTab] = useState<ReportCategory>("AIR_CONDITIONER");
  
  const [files, setFiles] = useState<Record<ReportCategory, Record<PhotoFieldKey, File | null>>>({
    AIR_CONDITIONER: getEmptyFiles(),
    AIR_PURIFIER: getEmptyFiles(),
  });

  const [previewUrls, setPreviewUrls] = useState<Record<ReportCategory, Record<PhotoFieldKey, string | null>>>({
    AIR_CONDITIONER: getEmptyPreviews(),
    AIR_PURIFIER: getEmptyPreviews(),
  });

  const [isSavingPhotos, setIsSavingPhotos] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<Record<ReportCategory, boolean>>({
    AIR_CONDITIONER: false,
    AIR_PURIFIER: false,
  });
  
  // ✅ 새롭게 추가할 상태 (모달 제어, 선택된 기관 및 작업자 이름)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState("노인장애인 복지과");
  const [workName, setWorkName] = useState(""); // 작업자 이름 상태 추가
  // ✅ [추가할 부분] 서버에서 데이터를 성공적으로 불러오면 DB에 저장된 작업자 이름을 입력칸에 채워줍니다.
  useEffect(() => {
    if (item?.workName) {
      setWorkName(item.workName);
    }
  }, [item?.workName]);

  // 메모리 누수 방지 (미리보기 URL 해제)
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(category => {
        Object.values(category).forEach(url => {
          if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        });
      });
    };
  }, [previewUrls]);

  // 사진 선택 핸들러
  const handleFileChange = (category: ReportCategory, field: PhotoFieldKey) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setFiles((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: file },
    }));

    setPreviewUrls((prev) => {
      const oldUrl = prev[category][field];
      if (oldUrl?.startsWith("blob:")) URL.revokeObjectURL(oldUrl);
      return {
        ...prev,
        [category]: { ...prev[category], [field]: file ? URL.createObjectURL(file) : null },
      };
    });
  };

  // 탭별로 수정한 전체 사진 저장
  const handleSavePhotos = async () => {
    if (!item?.id) return;
    setIsSavingPhotos(true);

    try {
      const promises = [];
      const categories: ReportCategory[] = ["AIR_CONDITIONER", "AIR_PURIFIER"];
      
      for (const cat of categories) {
        for (const field of PHOTO_FIELDS) {
          const file = files[cat][field.key];
          if (file) {
            promises.push(
              uploadReportMutation.mutateAsync({
                centerId: item.id,
                category: cat,
                fieldName: field.key,
                file,
              })
            );
          }
        }
      }

      if (promises.length === 0) {
        alert("업로드할 새 이미지가 없습니다.");
        setIsSavingPhotos(false);
        return;
      }

      await Promise.all(promises);
      alert("현장 사진이 성공적으로 저장되었습니다.");
      
      // 초기화
      setFiles({ AIR_CONDITIONER: getEmptyFiles(), AIR_PURIFIER: getEmptyFiles() });
    } catch (error) {
      alert("사진 저장에 실패했습니다.");
    } finally {
      setIsSavingPhotos(false);
    }
  };

  // --- PDF & Android WebView Native Bridge ---
  const isAndroidAppWebView = () => {
    if (typeof window === "undefined") return false;
    return !!(window as any).AndroidBlobDownloader;
  };

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("base64 변환 실패"));
      };
      reader.onerror = () => reject(new Error("파일 읽기 실패"));
      reader.readAsDataURL(blob);
    });

  const downloadBlobFile = async (blob: Blob, fileName: string) => {
    if (isAndroidAppWebView()) {
      try {
        const base64 = await blobToBase64(blob);
        const mimeType = blob.type || "application/pdf";
        (window as any).AndroidBlobDownloader.saveBase64File(base64, mimeType, fileName);
        return;
      } catch (err) {
        alert("앱 내 다운로드 처리에 실패했습니다.");
        return;
      }
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // ✅ PDF 다운로드 핸들러 (organization 및 workName 파라미터 추가)
  const handleGeneratePdf = async (category: ReportCategory, organization?: string, workerName?: string) => {
    if (!item?.id) return;
    try {
      setPdfLoading(prev => ({ ...prev, [category]: true }));
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      
      // ✅ 기관 정보 및 작업자 이름이 있으면 쿼리스트링 조합
      const queryParams = new URLSearchParams();
      if (organization) queryParams.append("org", organization);
      if (workerName) queryParams.append("workName", workerName);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const apiUrl = `${baseUrl}/api/senior-centers/${id}/reports/${category}/pdf${queryString}`;
      
      const response = await axios.get(apiUrl, {
        responseType: 'blob',
      });

      const fileName = `${organization || "기관"}_${item.name}_${category === "AIR_CONDITIONER" ? "에어컨" : "공기청정기"}_보고서.pdf`;
      await downloadBlobFile(response.data, fileName);
      
      setIsModalOpen(false); // ✅ 다운로드 완료 시 모달 닫기
    } catch (err) {
      alert(err instanceof Error ? err.message : "PDF 생성에 실패했습니다.");
    } finally {
      setPdfLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const isCanceled = (item as any)?.isCancel;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-36">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="relative flex h-14 items-center justify-between px-4">
          <button onClick={() => router.back()} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition">
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">상세정보</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-6 space-y-6">
        {isCanceled && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">
            <p className="font-bold text-sm">취소된 작업입니다.</p>
            <p className="text-xs opacity-80 mt-0.5">이 경로당은 대상에서 제외되어 수정할 수 없습니다.</p>
          </div>
        )}

        <section className={`space-y-3 ${isCanceled ? 'opacity-60 grayscale pointer-events-none' : ''}`}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">경로당 정보</h2>
          </div>
          <DetailRow label="경로당명" value={item?.name || "-"} />
          <DetailRow label="행정동 / 연번" value={`${item?.dong || "-"} / NO.${item?.seq || "-"}`} />
          <DetailRow label="도로명 주소" value={item?.roadAddress || "-"} />
          <PhoneDetailRow label="경로당 전화번호" value={item?.centerPhone} color="blue" />
          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="면적" value={item?.area ? `${item.area}㎡` : "-"} />
            <DetailRow label="작업일자" value={item?.workDate || "미정"} />
          </div>
          <DetailRow label="에어컨 기기 수량" value={
            <div className="flex gap-2 flex-wrap mt-1">
              <span className="bg-white border border-gray-200 px-2 py-1.5 rounded-lg text-[11px]">천장형: {item?.acCeilingCount || 0}</span>
              <span className="bg-white border border-gray-200 px-2 py-1.5 rounded-lg text-[11px]">스탠드: {item?.acStandCount || 0}</span>
              <span className="bg-white border border-gray-200 px-2 py-1.5 rounded-lg text-[11px]">벽걸이: {item?.acWallCount || 0}</span>
              <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1.5 rounded-lg text-[11px] font-bold">공기청정기: {item?.airPurifierCount || 0}</span>
            </div>
          } />
          <DetailRow label="담당자 성명" value={item?.managerName || "-"} />
          <PhoneDetailRow label="담당자 연락처" value={item?.managerPhone} color="green" />
          <DetailRow label="특이사항 (비고)" value={item?.remark || "없음"} />
          {/* ✅ 작업자 이름 입력 필드 (특이사항 밑으로 이동) */}
          <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
            <label htmlFor="worker-name" className="text-xs font-bold text-gray-600">작업자 이름 (보고서 출력용)</label>
            <input
              id="worker-name"
              type="text"
              value={workName}
              onChange={(e) => setWorkName(e.target.value)}
              placeholder="예: 홍길동"
              className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </section>

        {/* 3. 현장 사진 업로드 탭 & 그리드 */}
        {!isCanceled && (
          <section className="mt-8 border-t border-gray-100 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">현장 사진</h2>
                <p className="mt-1 text-xs text-gray-500">카테고리별로 현장 사진을 등록하세요.</p>
              </div>
              <button
                type="button"
                onClick={handleSavePhotos}
                disabled={isSavingPhotos}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95 disabled:bg-gray-400"
              >
                {isSavingPhotos && <Loader2 size={14} className="animate-spin" />}
                저장하기
              </button>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
              <button 
                onClick={() => setActivePhotoTab("AIR_CONDITIONER")}
                className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${activePhotoTab === "AIR_CONDITIONER" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                에어컨
              </button>
              <button 
                onClick={() => setActivePhotoTab("AIR_PURIFIER")}
                className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${activePhotoTab === "AIR_PURIFIER" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                공기청정기
              </button>
            </div>

            {/* 사진 업로드 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {PHOTO_FIELDS.map((field) => {
                const serverImg = getServerImageUrl(item, activePhotoTab, field.key);
                const previewUrl = previewUrls[activePhotoTab][field.key];
                const isNew = !!files[activePhotoTab][field.key];

                return (
                  <div key={field.key} className={field.fullWidth ? "col-span-2" : ""}>
                    <PhotoUploadCard
                      label={field.label}
                      url={previewUrl || serverImg}
                      isNew={isNew}
                      onChange={handleFileChange(activePhotoTab, field.key)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* 4. 하단 고정 액션 버튼 */}
      {!isCanceled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 pb-safe backdrop-blur-md">
          <div className="mx-auto flex max-w-md flex-col gap-2 px-4 py-3">
           
            <div className="flex gap-2 w-full">
              {/* ✅ 에어컨 버튼: 클릭 시 모달 오픈으로 변경 */}
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={pdfLoading["AIR_CONDITIONER"]}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition active:scale-95 shadow-sm shadow-blue-200 disabled:bg-gray-300"
              >
                {pdfLoading["AIR_CONDITIONER"] ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                에어컨 보고서
              </button>
              
              <button
                onClick={() => handleGeneratePdf("AIR_PURIFIER", "노인장애인 복지과", workName)} // ✅ 작업자 이름 같이 전송
                disabled={pdfLoading["AIR_PURIFIER"]}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-600 bg-white py-3 text-sm font-bold text-blue-600 transition active:scale-95 shadow-sm disabled:border-gray-300 disabled:text-gray-400"
              >
                {pdfLoading["AIR_PURIFIER"] ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                공기청정기 보고서
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 에어컨 보고서 기관 선택 및 작업자 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">보고서 옵션 선택</h3>
              <p className="text-xs text-gray-500 mt-1">{item?.name} - 에어컨 보고서</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* 기관 선택 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">제출할 기관을 선택해주세요</label>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none"
                >
                  <option value="노인장애인 복지과">노인장애인 복지과</option>
                  <option value="해운대구청">해운대구청</option>
                </select>
              </div>

              
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
              >
                취소
              </button>
              <button
                type="button"
                // ✅ 다운로드 버튼 클릭 시 selectedOrg와 workName을 함께 넘김
                onClick={() => handleGeneratePdf("AIR_CONDITIONER", selectedOrg, workName)}
                disabled={pdfLoading["AIR_CONDITIONER"]}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all disabled:bg-gray-400 active:scale-95"
              >
                {pdfLoading["AIR_CONDITIONER"] ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeniorCenterMobileDetailPage;
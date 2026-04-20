"use client";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Siderbar";
import {
    useSeniorCenterDetail,
    useUpdateSeniorCenter,
    useUploadSeniorCenterReportPhoto,
} from "@/hooks/useSeniorCenter";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useState, useEffect } from "react";
import {
    MapPin,
    User,
    Phone,
    Home,
    Wind,
    Calendar,
    ChevronLeft,
    Camera,
    Loader2,
    CheckCircle2,
    Upload,
    FileText,
    Download
} from "lucide-react";
import axios from "axios";

// 날짜 포맷팅 함수
function formatDateTime(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

type ReportCategory = "AIR_CONDITIONER" | "AIR_PURIFIER";

const SeniorCenterDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    // ---------------------------------------------------------
    // 상태 관리 (Hook 호출 순서 준수)
    // ---------------------------------------------------------
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeReportTab, setActiveReportTab] = useState<ReportCategory>("AIR_CONDITIONER");
    const [pdfLoading, setPdfLoading] = useState<Record<ReportCategory, boolean>>({
        AIR_CONDITIONER: false,
        AIR_PURIFIER: false,
    });
    // ✅ 새롭게 추가할 상태 (모달 제어 및 선택된 기관)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState("노인장애인복지과");
    const [pendingFiles, setPendingFiles] = useState<Record<string, Record<string, File>>>({
        AIR_CONDITIONER: {},
        AIR_PURIFIER: {},
    });

    const [previews, setPreviews] = useState<Record<string, Record<string, string>>>({
        AIR_CONDITIONER: {},
        AIR_PURIFIER: {},
    });

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    // API 연동 훅
    const { data: center, isLoading } = useSeniorCenterDetail(id);
    const updateMutation = useUpdateSeniorCenter();
    const uploadReportPhotoMutation = useUploadSeniorCenterReportPhoto();

    // ✅ 미리보기 URL 메모리 해제 (메모리 누수 방지)
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(categoryPreviews => {
                Object.values(categoryPreviews).forEach(url => URL.revokeObjectURL(url));
            });
        };
    }, [previews]);

    // ---------------------------------------------------------
    // 핸들러 정의
    // ---------------------------------------------------------
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    // ✅ PDF 다운로드 핸들러 (organization 파라미터 추가)
    const handleDownloadPdf = async (category: ReportCategory, organization?: string) => {
        if (!center) return;

        setPdfLoading(prev => ({ ...prev, [category]: true }));
        try {
            // 기관이 선택된 경우 쿼리스트링(?org=...)으로 백엔드에 전달
            const apiUrl = `${BACKEND_URL}/api/senior-centers/${id}/reports/${category}/pdf${organization ? `?org=${encodeURIComponent(organization)}` : ''}`;

            const response = await axios.get(apiUrl, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `${organization}_${center.name}_${category === "AIR_CONDITIONER" ? "에어컨" : "공기청정기"}_보고서.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setIsModalOpen(false); // 다운로드 성공 시 모달 닫기
        } catch (error) {
            console.error(error);
            alert("PDF 생성 중 오류가 발생했습니다.");
        } finally {
            setPdfLoading(prev => ({ ...prev, [category]: false }));
        }
    };

    const handlePhotoSelection = (e: ChangeEvent<HTMLInputElement>, category: ReportCategory, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPendingFiles((prev) => ({
            ...prev,
            [category]: { ...prev[category], [fieldName]: file },
        }));

        const objectUrl = URL.createObjectURL(file);
        setPreviews((prev) => ({
            ...prev,
            [category]: { ...prev[category], [fieldName]: objectUrl },
        }));
    };

    const handleSaveAllPhotos = async () => {
        const currentPending = pendingFiles[activeReportTab];
        const fileKeys = Object.keys(currentPending);

        if (fileKeys.length === 0) {
            alert("변경하거나 새로 선택한 사진이 없습니다.");
            return;
        }

        if (!confirm(`${fileKeys.length}장의 사진을 서버에 저장하시겠습니까?`)) return;

        try {
            for (const fieldName of fileKeys) {
                await uploadReportPhotoMutation.mutateAsync({
                    centerId: id,
                    category: activeReportTab,
                    fieldName,
                    file: currentPending[fieldName],
                });
            }
            alert("성공적으로 저장되었습니다.");
            setPendingFiles(prev => ({ ...prev, [activeReportTab]: {} }));
            setPreviews(prev => ({ ...prev, [activeReportTab]: {} }));
        } catch (error) {
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleToggleComplete = async () => {
        if (!center) return;
        try {
            await updateMutation.mutateAsync({
                id: center.id,
                isComplete: !center.isComplete,
            });
            alert("상태가 변경되었습니다.");
        } catch (error) {
            alert("상태 변경 중 오류 발생");
        }
    };

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );
    if (!center) return <div className="p-10 text-center text-gray-500">데이터를 찾을 수 없습니다.</div>;

    const currentReport = center.reports?.find((r: any) => r.category === activeReportTab);

    return (
        <div className="min-h-screen w-full bg-gray-50 text-gray-900 flex">
            <Sidebar sidebarOpen={sidebarOpen} />

            <div className="flex-1 flex flex-col min-h-screen lg:pl-72">
                <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />

                <main className="p-6">
                    <div className="mx-auto max-w-6xl space-y-6">
                        {/* 상단 액션 바 */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700">
                                <ChevronLeft size={20} /> 리스트로 돌아가기
                            </button>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* ✅ PDF 다운로드 버튼 그룹 */}
                                <button
                                    onClick={() => setIsModalOpen(true)} // 클릭 시 모달 열기
                                    disabled={pdfLoading.AIR_CONDITIONER}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
                                >
                                    {pdfLoading.AIR_CONDITIONER ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} className="text-blue-600" />}
                                    에어컨 보고서
                                </button>
                                <button
                                    onClick={() => handleDownloadPdf("AIR_PURIFIER",'노인장애인복지과')}
                                    disabled={pdfLoading.AIR_PURIFIER}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
                                >
                                    {pdfLoading.AIR_PURIFIER ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} className="text-purple-600" />}
                                    공기청정기 보고서
                                </button>

                                <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />

                                <button
                                    onClick={handleToggleComplete}
                                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${center.isComplete ? "bg-green-100 text-green-700 border border-green-200" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                        }`}
                                >
                                    {center.isComplete ? <><CheckCircle2 size={18} /> 작업 완료</> : "작업 완료 처리"}
                                </button>
                            </div>
                        </div>

                        {/* 기본 정보 및 담당자 정보 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <SectionTitle icon={<Home size={20} />} title="경로당 기본 정보" />
                                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                    <DetailItem label="연번" value={center.seq} />
                                    <DetailItem label="경로당 명" value={center.name} className="text-indigo-600 font-black" />
                                    <DetailItem label="동명" value={center.dong} />
                                    <DetailItem label="시설 유형" value={center.facilityType || "-"} />
                                    <DetailItem label="면적(㎡)" value={center.area ? `${center.area} ㎡` : "-"} />
                                    <DetailItem label="사업 연도" value={`${center.programYear}년`} />
                                </div>
                            </section>

                            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <SectionTitle icon={<User size={20} />} title="담당자 및 연락처 정보" />
                                <div className="space-y-5">
                                    <DetailItem label="도로명 주소" value={center.roadAddress} icon={<MapPin size={14} className="text-gray-400" />} />
                                    <div className="h-px bg-gray-100" />
                                    <div className="grid grid-cols-2 gap-5">
                                        <DetailItem label="담당자" value={center.managerName || "-"} />
                                        <DetailItem label="담당자 연락처" value={center.managerPhone || "-"} />
                                        <DetailItem label="경로당 번호" value={center.centerPhone || "-"} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* 기기 설치 현황 */}
                        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <SectionTitle icon={<Wind size={20} />} title="기기 설치 현황" />
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <CountBox label="천장형 에어컨" count={center.acCeilingCount} />
                                <CountBox label="스탠드 에어컨" count={center.acStandCount} />
                                <CountBox label="벽걸이 에어컨" count={center.acWallCount} />
                                <CountBox label="공기청정기" count={center.airPurifierCount} color="purple" />
                            </div>
                        </section>

                        {/* 사진 보고서 관리 */}
                        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <SectionTitle icon={<Camera size={20} />} title="상세 보고서 사진 관리" />

                                <div className="flex items-center gap-4">
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        {(["AIR_CONDITIONER", "AIR_PURIFIER"] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveReportTab(tab)}
                                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeReportTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"
                                                    }`}
                                            >
                                                {tab === "AIR_CONDITIONER" ? "에어컨" : "공기청정기"}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleSaveAllPhotos}
                                        disabled={uploadReportPhotoMutation.isPending || Object.keys(pendingFiles[activeReportTab]).length === 0}
                                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-gray-300 transition-all shadow-lg shadow-indigo-100"
                                    >
                                        {uploadReportPhotoMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        사진 저장하기
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <PhotoSectionGroup title="1. 경로당 입구">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <PhotoBox
                                            label="입구 전경"
                                            url={previews[activeReportTab].entranceImage || currentReport?.entranceImage}
                                            isNew={!!previews[activeReportTab].entranceImage}
                                            onUpload={(e) => handlePhotoSelection(e, activeReportTab, "entranceImage")}
                                        />
                                    </div>
                                </PhotoSectionGroup>

                                <PhotoSectionGroup title="2. 작업 진행 사진">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <PhotoBox label="작업 사진 1" url={previews[activeReportTab].workImage1 || currentReport?.workImage1} isNew={!!previews[activeReportTab].workImage1} onUpload={(e) => handlePhotoSelection(e, activeReportTab, "workImage1")} />
                                        <PhotoBox label="작업 사진 2" url={previews[activeReportTab].workImage2 || currentReport?.workImage2} isNew={!!previews[activeReportTab].workImage2} onUpload={(e) => handlePhotoSelection(e, activeReportTab, "workImage2")} />
                                    </div>
                                </PhotoSectionGroup>

                                <PhotoSectionGroup title="3. 작업 전/후 비교 (Set 1)">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50/50 rounded-3xl border border-gray-100">
                                        <PhotoBox label="작업 전 1" url={previews[activeReportTab].beforeImage1 || currentReport?.beforeImage1} isNew={!!previews[activeReportTab].beforeImage1} onUpload={(e) => handlePhotoSelection(e, activeReportTab, "beforeImage1")} />
                                        <PhotoBox label="작업 후 1" url={previews[activeReportTab].afterImage1 || currentReport?.afterImage1} isNew={!!previews[activeReportTab].afterImage1} onUpload={(e) => handlePhotoSelection(e, activeReportTab, "afterImage1")} />
                                    </div>
                                </PhotoSectionGroup>

                                <PhotoSectionGroup title="4. 작업 전/후 비교 (Set 2)">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50/50 rounded-3xl border border-gray-100">
                                        <PhotoBox label="작업 전 2" url={previews[activeReportTab].beforeImage2 || currentReport?.beforeImage2} isNew={!!previews[activeReportTab].beforeImage2} onUpload={(e) => handlePhotoSelection(e, activeReportTab, "beforeImage2")} />
                                        <PhotoBox label="작업 후 2" url={previews[activeReportTab].afterImage2 || currentReport?.afterImage2} isNew={!!previews[activeReportTab].afterImage2} onUpload={(e) => handlePhotoSelection(e, activeReportTab, "afterImage2")} />
                                    </div>
                                </PhotoSectionGroup>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
            {/* ✅ 에어컨 보고서 기관 선택 모달창 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">보고서 기관 선택</h3>
                            <p className="text-xs text-gray-500 mt-1">{center.name} - 에어컨 보고서</p>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">제출할 기관을 선택해주세요</label>
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="노인장애인복지과">노인장애인복지과</option>
                                <option value="해운대구청">해운대구청</option>
                                
                            </select>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDownloadPdf("AIR_CONDITIONER", selectedOrg)}
                                disabled={pdfLoading.AIR_CONDITIONER}
                                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all disabled:bg-gray-400"
                            >
                                {pdfLoading.AIR_CONDITIONER ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                                다운로드
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 컴포넌트 헬퍼 ---

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">{icon}</div>
            <h3 className="text-lg font-black text-gray-900">{title}</h3>
        </div>
    );
}

function PhotoSectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span> {title}
            </h4>
            {children}
        </div>
    );
}

function DetailItem({ label, value, className = "", icon }: { label: string; value: string | number; className?: string; icon?: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</p>
            <div className="flex items-center gap-2 px-1">
                {icon}
                <p className={`text-sm font-semibold text-gray-800 ${className}`}>{value}</p>
            </div>
        </div>
    );
}

function CountBox({ label, count, color = "indigo" }: { label: string; count: number; color?: "indigo" | "purple" }) {
    const colorClass = color === "indigo" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-purple-50 text-purple-600 border-purple-100";
    return (
        <div className={`p-4 rounded-2xl border ${colorClass} text-center`}>
            <p className="text-[10px] font-bold opacity-70 mb-1">{label}</p>
            <p className="text-xl font-black">{count}<span className="text-xs ml-0.5 font-bold">대</span></p>
        </div>
    );
}

function PhotoBox({ label, url, onUpload, isNew }: { label: string; url?: string | null; onUpload: (e: ChangeEvent<HTMLInputElement>) => void; isNew?: boolean }) {
    
    // ✅ 이미지 다운로드 핸들러 (탐색기 창 띄우기 지원)
    const handleDownload = async (e: React.MouseEvent, imageUrl: string, filename: string) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            // 1. 파일 데이터(Blob) 가져오기
            let fetchUrl = imageUrl;
            // 외부 URL인 경우 CORS 캐시 방지용 파라미터 추가
            if (!imageUrl.startsWith("blob:")) {
                fetchUrl = `${imageUrl}?t=${new Date().getTime()}`;
            }
            
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error("네트워크 응답이 좋지 않습니다.");
            const blob = await response.blob();

            // 2. 모던 브라우저용 '다른 이름으로 저장' 탐색기 띄우기 (Chrome, Edge 지원)
            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: `${filename}.jpg`,
                        types: [{
                            description: 'JPEG 이미지',
                            accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return; // 성공적으로 저장 완료 시 종료
                } catch (pickerError: any) {
                    // 사용자가 탐색기 창에서 '취소'를 누른 경우 에러가 발생하므로 무시
                    if (pickerError.name === 'AbortError') return;
                    throw pickerError; // 다른 에러는 아래 catch문으로 넘김
                }
            }

            // 3. 구형 브라우저 및 Safari용 폴백 (기본 폴더로 바로 다운로드)
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `${filename}.jpg`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
            
        } catch (error) {
            console.error("이미지 다운로드 실패:", error);
            alert("직접 다운로드가 제한된 환경입니다. 새 창이 열리면 이미지를 길게 눌러 저장해주세요.");
            window.open(imageUrl, "_blank");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <p className="text-xs font-bold text-gray-500">{label}</p>
                {isNew && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">저장 대기</span>}
            </div>
            
            {/* 사진 영역 */}
            <div className={`relative aspect-video rounded-2xl border-2 border-dashed overflow-hidden group transition-all ${isNew ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 bg-gray-50 hover:border-indigo-300'}`}>
                {url ? <img src={url} alt={label} className="h-full w-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-1"><Camera size={28} /><span className="text-[10px] font-bold text-gray-400">사진 선택</span></div>}
                
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs backdrop-blur-sm">
                    <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
                    <div className="flex flex-col items-center gap-2"><Upload size={20} />{url ? "사진 변경" : "사진 선택"}</div>
                </label>
            </div>

            {/* 다운로드 버튼 */}
            {url && (
                <button
                    type="button"
                    onClick={(e) => handleDownload(e, url, label)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                >
                    <Download size={16} />
                    사진 다운로드
                </button>
            )}
        </div>
    );
}

export default SeniorCenterDetailPage;
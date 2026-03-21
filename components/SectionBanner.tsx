"use client";

import { ReactNode, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  Navigation,
  EffectFade,
  EffectCoverflow,
  EffectFlip,
  EffectCards,
  EffectCreative,
} from "swiper/modules";
import { useSiteBanners } from "@/hooks/useSiteBanners";
import { BannerCategory, BannerEffect } from "@/lib/bannersVariable";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-flip";
import "swiper/css/effect-cards";
import "swiper/css/effect-creative";

type SectionBannerProps = {
  category: BannerCategory;
  heightClassName?: string;
  overlayClassName?: string;
  className?: string;
  showNavigation?: boolean;
  showPagination?: boolean;
  fallback?: ReactNode;
};

const SectionBanner = ({
  category,
  heightClassName = "h-screen",
  overlayClassName = "bg-black/30",
  className = "",
  showNavigation = true,
  showPagination = true,
  fallback = null,
}: SectionBannerProps) => {
  const { data, isLoading, isFetching } = useSiteBanners();

  const banner = useMemo(() => {
    if (!data?.success || !data.data) return null;
    return data.data.find((item) => item.category === category) ?? null;
  }, [data, category]);

  const toFullImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("blob:")
    ) {
      return imageUrl;
    }

    return `${process.env.NEXT_PUBLIC_API_BASE_URL}${imageUrl}`;
  };

  const getHorizontalClass = (align: "left" | "center" | "right") => {
    switch (align) {
      case "left":
        return "justify-start text-left";
      case "center":
        return "justify-center text-center";
      case "right":
        return "justify-end text-right";
      default:
        return "justify-center text-center";
    }
  };

  const getVerticalClass = (align: "top" | "center" | "bottom") => {
    switch (align) {
      case "top":
        return "items-start";
      case "center":
        return "items-center";
      case "bottom":
        return "items-end";
      default:
        return "items-center";
    }
  };

  const getSwiperProps = (effect: BannerEffect) => {
    switch (effect) {
      case "fade":
        return {
          effect: "fade" as const,
          fadeEffect: { crossFade: true },
        };
      case "coverflow":
        return {
          effect: "coverflow" as const,
          centeredSlides: true,
          slidesPerView: 1,
          coverflowEffect: {
            rotate: 20,
            stretch: 0,
            depth: 120,
            modifier: 1,
            slideShadows: false,
            scale: 0.95,
          },
        };
      case "flip":
        return {
          effect: "flip" as const,
          flipEffect: {
            slideShadows: false,
            limitRotation: true,
          },
        };
      case "cards":
        return {
          effect: "cards" as const,
          grabCursor: true,
        };
      case "creative":
        return {
          effect: "creative" as const,
          creativeEffect: {
            prev: {
              shadow: false,
              translate: [0, 0, -200],
            },
            next: {
              translate: ["100%", 0, 0],
            },
          },
        };
      default:
        return {
          effect: "slide" as const,
        };
    }
  };

  if (isLoading || isFetching) {
    return (
      <section className={`relative overflow-hidden bg-white ${className}`}>
        <div
          className={`mx-auto flex ${heightClassName} max-w-7xl items-center justify-center px-6 md:px-10`}
        >
          <div className="text-sm text-gray-500">배너를 불러오는 중입니다...</div>
        </div>
      </section>
    );
  }

  if (!banner || !banner.slides || banner.slides.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <section className={`relative overflow-hidden bg-white ${className}`}>
      <Swiper
        modules={[
          Autoplay,
          Pagination,
          Navigation,
          EffectFade,
          EffectCoverflow,
          EffectFlip,
          EffectCards,
          EffectCreative,
        ]}
        loop={banner.slides.length > 1}
        pagination={showPagination ? { clickable: true } : false}
        navigation={showNavigation && banner.slides.length > 1}
        autoplay={{
          delay: banner.slides[0]?.duration
            ? banner.slides[0].duration * 1000
            : 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={700}
        {...getSwiperProps(banner.effect)}
        className={`w-full ${heightClassName}`}
      >
        {banner.slides.map((slide) => {
          const imageUrl = toFullImageUrl(slide.imageUrl);

          return (
            <SwiperSlide
              key={slide.id}
              data-swiper-autoplay={slide.duration * 1000}
            >
              <div className={`relative w-full overflow-hidden ${heightClassName}`}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={slide.title || `${category}-banner`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.07),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.06),transparent_30%),linear-gradient(to_bottom,rgba(249,250,251,0.7),rgba(255,255,255,0))]" />
                )}

                <div className={`absolute inset-0 ${overlayClassName}`} />

                <div className="relative mx-auto flex h-full max-w-7xl px-6 md:px-10">
                  <div
                    className={[
                      "flex h-full w-full",
                      getHorizontalClass(slide.textAlign),
                      getVerticalClass(slide.verticalAlign),
                    ].join(" ")}
                  >
                    <div className="max-w-3xl">
                      {slide.title && (
                        <h1
                          style={{
                            fontSize: `${slide.fontSize}px`,
                            color: slide.fontColor,
                            fontFamily: slide.fontFamily,
                          }}
                          className="whitespace-pre-line font-extrabold leading-tight tracking-tight drop-shadow-md"
                        >
                          {slide.title}
                        </h1>
                      )}

                      {slide.description && (
                        <p
                          style={{
                            fontSize: `${Math.max(slide.fontSize - 20, 16)}px`,
                            color: slide.fontColor,
                            fontFamily: slide.fontFamily,
                          }}
                          className="mt-6 max-w-2xl whitespace-pre-line leading-8 text-white/95 drop-shadow"
                        >
                          {slide.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default SectionBanner;
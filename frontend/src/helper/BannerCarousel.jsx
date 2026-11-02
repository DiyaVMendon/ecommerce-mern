
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./banner_carousel.css"

const banners = [
  { id: 1, image: "/images/signup_1.png" },
  { id: 2, image: "/images/signup_2.png" },
  { id: 3, image: "/images/signup3.png" },
];

export default function BannerCarousel() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      slidesPerView={1}
      loop={true}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      navigation={true}
      className="banner-swiper"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          <img
            src={banner.image}
            alt={`Banner ${banner.id}`}
            className="banner-image"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

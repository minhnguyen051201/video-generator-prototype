import Image from "next/image";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import image1 from "../../public/images/image1.avif";
import image2 from "../../public/images/image2.avif";

import image3 from "../../public/images/image3.avif";
import image4 from "../../public/images/image4.avif";

import { Swiper, SwiperSlide } from "swiper/react";

// import required modules
import { EffectCoverflow, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Slider = () => {
  return (
    <>
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={true}
        modules={[EffectCoverflow, Pagination]}
        className="mySwiper"
      >
        <SwiperSlide className="w-[400px] h-[300px]">
          <Image
            src={image1}
            alt="image1"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide className="w-[400px] h-[300px]">
          <Image
            src={image2}
            alt="image2"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide className="w-[400px] h-[300px]">
          <Image
            src={image3}
            alt="image3"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide className="w-[400px] h-[300px]">
          <Image
            src={image4}
            alt="image4"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
      </Swiper>
    </>
  );
};

export default Slider;
